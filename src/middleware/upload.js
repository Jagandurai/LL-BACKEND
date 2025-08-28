import multer from "multer";

// Store file temporarily in memory (buffer) before sending to Cloudinary
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});
