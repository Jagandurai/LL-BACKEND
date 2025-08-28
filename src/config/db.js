import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Create a pool using TiDB connection URL
const pool = mysql.createPool(process.env.DATABASE_URL);

export default pool;
