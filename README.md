# QR Code Verification API

This is a Node.js-based API that extracts and verifies QR codes embedded in PDF files. It converts the PDF into an image, scans for QR codes, and returns the decoded information.

## Features
- Accepts PDF file uploads via API.
- Converts the first page of the PDF into an image.
- Extracts and decodes QR codes using `jsQR`.
- Returns the QR code data or an error message if no QR code is found.

## Prerequisites
Make sure you have the following installed before running the project:
- [Node.js](https://nodejs.org/en/) (v14+ recommended)
- npm or yarn package manager

## Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/qr-code-verification-api.git
   cd qr-code-verification-api
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

## Usage

### Start the server
Run the following command to start the API:
```sh
node index.js
```
The server will be running on `http://localhost:5000`.

### API Endpoints
#### `POST /api/verify-qr`
- **Description**: Uploads a PDF file and extracts QR code data.
- **Request**:
  - `file`: A PDF file containing a QR code.
- **Response**:
  - Success: `{ success: true, qrUrl: "decoded_qr_data" }`
  - Failure: `{ success: false, message: "Error message" }`
- **Example (Using cURL)**:
  ```sh
  curl -X POST http://localhost:5000/api/verify-qr \
       -F "file=@path/to/qrcode.pdf"
  ```

## Error Handling
- If no file is uploaded: `400 Bad Request`
- If the file is not a PDF: `400 Bad Request`
- If the file size exceeds 10MB: `400 Bad Request`
- If no QR code is found: `404 Not Found`
- If any other error occurs: `500 Internal Server Error`

## Dependencies
- `express` - Web framework for Node.js
- `multer` - Middleware for handling file uploads
- `pdf-lib` - For handling PDF files
- `pdf-poppler` - For converting PDFs to images
- `canvas` - For image processing
- `jsQR` - For QR code detection

## License
This project is licensed under the MIT License.

## Author
Developed by [Your Name](https://github.com/yourusername).
