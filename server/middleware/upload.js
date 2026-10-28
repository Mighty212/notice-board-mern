const multer = require("multer");
const path = require("path");

// Memory storage: keeps incoming file as a Buffer in memory to persist directly into MongoDB
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);

  if (ext || mime) {
    cb(null, true);
  } else {
    cb(new Error("Only document (PDF, DOC) and image (JPG, PNG) files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter,
});

module.exports = upload;
