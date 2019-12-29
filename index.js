// Initializing packages
const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { TesseractWorker } = require("tesseract.js");

// Creating app object
const app = express();

// Creating worker object
const worker = new TesseractWorker();

// Set view engine
app.set("view engine", "ejs");

// Static files middleware:
app.use(express.static(path.join(__dirname, "/public")));

// Multer middleware
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "./uploads");
    },
    filename: function(req, file, cb) {
        // cb(null, file.fieldname + "-" + Date.now());
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage }).single("avatar");

// Route to display index page
app.get("/", (req, res) => {
    res.render("index");
});

// Route for uploading file
app.post("/upload", (req, res) => {
    upload(req, res, err => {
        // Check if user tries to upload null file
        if (req.file === undefined) {
            return res.redirect("/");
        }
        // Reading file
        fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
            if (err) {
                return console.log(`Error: ${err}`);
            }
            // Analysing and creating pdf
            worker
                .recognize(data, "eng", { tessjs_create_pdf: "1" })
                .progress(progress => console.log(progress))
                .then(result => {
                    // Deleting the image file
                    fs.unlink(`./uploads/${req.file.originalname}`, err => {
                        if (err) {
                            console.log(err);
                        }
                    });
                    return res.redirect("/download");
                })
                .catch(err => {
                    console.log(err);
                })
                .finally(() => {
                    worker.terminate();
                });
        });
    });
});

// File download route
app.get("/download", (req, res) => {
    const file = `${__dirname}/tesseract.js-ocr-result.pdf`;
    // Checking if file already exists
    fs.access(file, fs.F_OK, err => {
        if (err) {
            return res.redirect("/");
        }
    });

    // Sending download response to user
    res.download(file, err => {
        // Deleting pdf file
        fs.unlink(file, err => {
            if (err) {
                console.log(err);
            }
        });
    });
});

// Setting Port to listen to
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));
