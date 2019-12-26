// Initializing packages
const express = require("express");
const fs = require("fs");
const multer = require("multer");
const { TesseractWorker } = require("tesseract.js");

// Creating app object
const app = express();

// Creating worker object
const worker = new TesseractWorker();

// Set view engine
app.set("view engine", "ejs");

// Multer middleware
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "./uploads");
    },
    filename: function(req, file, cb) {
        // cb(null, file.fieldname + "-" + Date.now());
        cb(null, req.file);
    }
});

const upload = multer({ storage: storage }).single("avatar");

// Route to display index page
app.get("/", (req, res) => {
    res.render("index");
});

// Setting Port to listen to
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));
