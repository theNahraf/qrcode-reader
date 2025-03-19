
const express = require("express");
const multer = require("multer");
const { PDFDocument } = require("pdf-lib");
const Jimp = require("jimp");
const QRCodeReader = require("qrcode-reader");
const fs = require("fs");


const app = express();
const port = 5000;

app.use(express.json()); // Handle JSON data
app.use(express.urlencoded({ extended: true })); // Handle form data


const storage  = multer.memoryStorage();

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (!file) {
            return cb(new Error("No file uploaded"), false);
        }
        if (file.mimetype !== "application/pdf") {
            return cb(new Error("Only PDF files are allowed"), false);
        }
        cb(null, true);
    }
});


//extract qrcode

const extractQRCode = async (pdfBuffer) => {
    try {
        // Load the PDF
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        const pages = pdfDoc.getPages();

        if (pages.length === 0) {
            throw new Error("No pages found in the PDF");
        }

        // Convert first page to an image
        const pageImage = await pages[0].render();
        const imageBuffer = pageImage.items[0].image; 

        const image = await Jimp.read(imageBuffer);
        const qr = new QRCodeReader();

        return new Promise((resolve, reject) => {
            qr.callback = (err, value) => {
                if (err || !value) {
                    return reject(new Error("No QR code found"));
                }
                resolve(value.result);
            };
            qr.decode(image.bitmap);
        });
    } catch (error) {
        throw new Error("Failed to extract QR code: " + error.message);
    }
};
app.post("/api/verify-qr", upload.single("file"), async (req, res) => {
    console.log("Request received");
    console.log("Files received:", req.file); // Log file details

    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const pdfBuffer = req.file.buffer;
        const qrUrl = await extractQRCode(pdfBuffer);

        res.json({ success: true, qrUrl });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});


app.listen(port, () => {
console.log(`QR Code Verification API running on http://localhost:${port}`);
});
