import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: true, // required for TiDB Cloud
  },
});

pool.getConnection()
  .then(() => console.log("✅ MySQL/TiDB pool connected"))
  .catch((err) => console.error("❌ MySQL/TiDB connection failed:", err));

export default pool;
