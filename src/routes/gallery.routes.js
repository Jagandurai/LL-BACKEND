import express from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import pool from "../config/db.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

/**
 * Middleware: Authorize email for upload & delete actions
 */
const authorizeEmail = async (req, res, next) => {
  try {
    const email = req.headers["x-user-email"];
    if (!email) {
      console.warn("❌ Missing email header");
      return res.status(401).json({ error: "Email required" });
    }

    const [rows] = await pool.execute(
      "SELECT * FROM allowed_users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      console.warn(`❌ Unauthorized email: ${email}`);
      return res.status(403).json({ error: "Unauthorized email" });
    }

    req.userEmail = email;
    next();
  } catch (err) {
    console.error("❌ authorizeEmail error:", err);
    res.status(500).json({ error: "Authorization check failed" });
  }
};

/**
 * ✅ Public route → fetch ALL images (or filter by type if query param provided)
 */
router.get("/", async (req, res) => {
  try {
    const { type } = req.query;
    let query = "SELECT * FROM images ORDER BY id DESC";
    let params = [];

    if (type) {
      query = "SELECT * FROM images WHERE type = ? ORDER BY id DESC";
      params = [type];
    }

    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch images error:", err);
    res.status(500).json({ error: "Could not fetch images" });
  }
});

/**
 * 🔒 Upload image (authorized only)
 */
router.post("/", authorizeEmail, upload.single("image"), async (req, res) => {
  try {
    console.log("📩 Upload request received");
    console.log("File:", req.file);
    console.log("User email:", req.userEmail);

    const file = req.file;
    const { type } = req.body;

    if (!file) return res.status(400).json({ error: "No file uploaded" });
    if (!type) return res.status(400).json({ error: "Image type is required" });

    const result = await cloudinary.uploader.upload(file.path, { folder: "gallery" });

    console.log("✅ Cloudinary upload success:", result.secure_url);

    const [dbResult] = await pool.execute(
      "INSERT INTO images (image_url, public_id, type, uploaded_by) VALUES (?, ?, ?, ?)",
      [result.secure_url, result.public_id, type, req.userEmail]
    );

    console.log("✅ DB insert success:", dbResult.insertId);

    res.json({
      id: dbResult.insertId,
      image_url: result.secure_url,
      public_id: result.public_id,
      type,
      uploaded_by: req.userEmail,
    });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ error: "Upload failed", details: err.message });
  }
});

/**
 * 🔒 Delete image (authorized only)
 */
router.delete("/:id", authorizeEmail, async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute("SELECT * FROM images WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Image not found" });

    const image = rows[0];
    await cloudinary.uploader.destroy(image.public_id);
    await pool.execute("DELETE FROM images WHERE id = ?", [id]);

    console.log(`✅ Image ${id} deleted by ${req.userEmail}`);

    res.json({ message: "Image deleted successfully" });
  } catch (err) {
    console.error("❌ Delete error:", err);
    res.status(500).json({ error: "Delete failed" });
  }
});

/**
 * ✅ Route: Check if email is admin
 */
router.post("/check-admin", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: "Email required" });

    const [rows] = await pool.execute("SELECT * FROM allowed_users WHERE email = ?", [email]);

    if (rows.length > 0) {
      return res.json({ success: true });
    } else {
      return res.json({ success: false });
    }
  } catch (err) {
    console.error("❌ check-admin error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

export default router;
