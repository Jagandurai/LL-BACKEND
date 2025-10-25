import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import galleryRoutes from "./routes/gallery.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

// ✅ CORS setup: restrict to your frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5174", 
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true, // allow cookies/sessions if needed
  })
);

// ✅ Body parsers
app.use(express.json({ limit: "10mb" })); // allow bigger payloads for images
app.use(express.urlencoded({ extended: true }));

// ✅ Health check endpoint
app.get("/healthz", (req, res) => res.json({ ok: true }));

// 👇 Lightweight PING endpoint for cron-job.org / keeping Render awake
app.get("/api/ping", (req, res) => {
  res.status(200).send("ok"); // fast response, no DB queries
});

// ✅ Mount gallery routes AFTER ping
app.use("/api/gallery", galleryRoutes);

// ✅ Global error handler
app.use(errorHandler);

export default app;
