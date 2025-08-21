import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import notesRoutes from "./routes/notesRoutes.js";
import { connectDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

(async () => {
  try {
    await connectDB();

    // ✅ CORS first - so even error responses get headers
    app.use(cors({
      origin: "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    }));

    app.use(express.json());

    // ✅ Rate limiting only in production
    if (process.env.NODE_ENV === "production") {
      app.use(rateLimiter);
    }

    // Debug log middleware
    app.use((req, res, next) => {
      console.log(`${req.method} ${req.url}`);
      next();
    });

    // ✅ Routes
    app.use("/api/notes", notesRoutes);

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
})();
