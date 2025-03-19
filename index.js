const express = require("express");
const multer = require("multer");
const fs = require("fs");
const poppler = require("pdf-poppler");
const { createCanvas, loadImage } = require("canvas");
const jsQR = require("jsqr");

const app = express();
const port = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, 
    fileFilter: (req, file, cb) => {
        if (!file) return cb(new Error("No file uploaded"), false);
        if (file.mimetype !== "application/pdf") {
            return cb(new Error("Only PDF files are allowed"), false);
        }
        cb(null, true);
    }
});


const convertPdfToImage = async (pdfBuffer) => {
    const tempPdfPath = "temp.pdf";
    fs.writeFileSync(tempPdfPath, pdfBuffer);

    const options = {
        format: "png",
        out_dir: "./",
        out_prefix: "output",
        scale: 300
    };

    try {
        await poppler.convert(tempPdfPath, options);
        console.log("PDF successfully converted to image");
        const imageBuffer = fs.readFileSync("output-1.png");
        fs.unlinkSync(tempPdfPath);
        return imageBuffer;
    } catch (error) {
        throw new Error("Error converting PDF: " + error.message);
    }
};


const extractQRCode = async (pdfBuffer) => {
    console.log("Starting QR code extraction process...");
    const imageBuffer = await convertPdfToImage(pdfBuffer);
    
    if (!imageBuffer || imageBuffer.length === 0) {
        throw new Error("Image buffer is empty, failed to convert PDF");
    }
    
    const debugImagePath = "debug.png";
    fs.writeFileSync(debugImagePath, imageBuffer);
    console.log("Image saved for debugging at", debugImagePath);

    const image = await loadImage(debugImagePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0, image.width, image.height);

    console.log("Extracting pixel data for QR code scanning...");
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const qrCode = jsQR(imageData.data, image.width, image.height);

    if (!qrCode) {
        throw new Error("No QR code detected in the image");
    }

    console.log("QR Code successfully extracted:", qrCode.data);
    return qrCode.data;
};

app.post("/api/verify-qr", upload.single("file"), async (req, res) => {
    console.log("Received file for QR verification:", req.file);

    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        if (req.file.size > 10 * 1024 * 1024) {
            return res.status(400).json({ success: false, message: "File size exceeds limit" });
        }

        const qrUrl = await extractQRCode(req.file.buffer);
        res.json({ success: true, qrUrl });
    } catch (error) {
        console.error("Error processing request:", error.message);

        if (error.message.includes("No QR code detected")) {
            return res.status(404).json({ success: false, message: "No QR code found in the PDF" });
        }
        return res.status(500).json({ success: false, message: "Failed to process the PDF" });
    }
});

app.listen(port, () => {
    console.log(`QR Code Verification API is running on http://localhost:${port}`);
});
