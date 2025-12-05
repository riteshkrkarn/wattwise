import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import billRoutes from "./routes/billRoutes";
import applianceRoutes from "./routes/applianceRoutes";
import aiRoutes from "./routes/aiRoutes";
import userRoutes from "./routes/userRoutes";
import { errorHandler } from "./middlewares/errorHandler";
import connectDB from "./db/index";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json()); // Built-in body-parser
app.use(express.urlencoded({ extended: true })); // Handle URL-encoded data
app.use(require("cookie-parser")()); // Parse cookies

// Global Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/v1/bills", billRoutes);
app.use("/api/v1/appliances", applianceRoutes);
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Byte Hackathon Backend is running!");
});

// Database Connection

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });

// Global Error Handler
app.use(errorHandler);

// Start Server
