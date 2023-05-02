// Package multer
const multer = require("multer");

// Types media
const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/bmp": "bmp",
  "image/gif": "gif",
  "image/x-icon": "ico",
  "image/svg+xml": "svg",
  "image/tiff": "tiff",
  "image/tif": "tif",
  "image/webp": "webp",
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_");
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + "." + extension);
  },
});

// Export multer
module.exports = multer({ storage: storage }).single("image");