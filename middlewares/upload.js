const multer = require("multer");
const path = require("path");

// Configuración de multer para almacenar imágenes en el sistema de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    
    cb(null, path.join(__dirname, "../public/images")); 
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); 
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten imágenes .png, .jpg, .jpeg o .webp"));
    }
  },
});

module.exports = upload;
