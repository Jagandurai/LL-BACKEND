import pool from "../config/db.js";
import cloudinary from "../config/cloudinary.js";

// 📌 GET all images (with optional type filter)
export const getAllImages = async (req, res, next) => {
  try {
    const { type } = req.query;
    let query = "SELECT id, image_url, public_id, type, created_at FROM images ORDER BY created_at DESC";
    let params = [];

    if (type) {
      query = "SELECT id, image_url, public_id, type, created_at FROM images WHERE type = ? ORDER BY created_at DESC";
      params = [type];
    }

    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

// 📌 UPLOAD image
export const createImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const { type } = req.body;
    if (!type || !["makeup", "hairstyle"].includes(type)) {
      return res.status(400).json({ success: false, message: "Invalid or missing type" });
    }

    // Upload file buffer to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "gallery_uploads" },
      async (error, uploaded) => {
        if (error) return next(error);

        try {
          // Save to MySQL
          const [dbResult] = await pool.query(
            "INSERT INTO images (image_url, public_id, type) VALUES (?, ?, ?)",
            [uploaded.secure_url, uploaded.public_id, type]
          );

          const [rows] = await pool.query(
            "SELECT id, image_url, public_id, type, created_at FROM images WHERE id = ?",
            [dbResult.insertId]
          );

          res.status(201).json({ success: true, data: rows[0] });
        } catch (dbError) {
          next(dbError);
        }
      }
    );

    // Pipe the buffer into Cloudinary upload
    uploadStream.end(req.file.buffer);
  } catch (err) {
    next(err);
  }
};

// 📌 DELETE image
export const deleteImage = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid id" });

    // Find image first
    const [rows] = await pool.query("SELECT public_id FROM images WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }

    const publicId = rows[0].public_id;

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // Delete from DB
    await pool.query("DELETE FROM images WHERE id = ?", [id]);

    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    next(err);
  }
};
