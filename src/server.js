import app from "./app.js";
import dotenv from "dotenv";
import pool from "./config/db.js";

dotenv.config();

const PORT = Number(process.env.PORT || 5000);

(async () => {
  try {
    // Verify DB connection at boot
    await pool.query("SELECT 1");
    console.log("MySQL connected ✅");

    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();
