import pool from "./src/config/db.js";


const testDB = async () => {
  try {
    const [rows] = await pool.query("SELECT NOW() AS currentTime");
    console.log("✅ Connected to TiDB:", rows);
  } catch (err) {
    console.error("❌ DB Connection Error:", err.message);
  }
};

testDB();
