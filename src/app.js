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

// ✅ Routes
app.use("/api/gallery", galleryRoutes);

// ✅ Global error handler
app.use(errorHandler);

export default app;
