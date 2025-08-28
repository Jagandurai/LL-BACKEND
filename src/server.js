import app from "./app.js";
import dotenv from "dotenv";
import pool from "./config/db.js";

dotenv.config();

const PORT = Number(process.env.PORT || 5000);

// ✅ Add test route to verify DB connectivity on Render
app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT NOW() AS currentTime");
    res.json({ success: true, time: rows[0].currentTime });
  } catch (error) {
    console.error("DB test failed:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

(async () => {
  try {
    // Verify DB connection at boot
    await pool.query("SELECT 1");
    console.log("MySQL connected ✅");

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();
