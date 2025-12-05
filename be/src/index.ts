import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import billRoutes from "./routes/billRoutes";
import applianceRoutes from "./routes/applianceRoutes";
import { errorHandler } from "./middlewares/errorHandler";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json()); // Built-in body-parser

// Routes
app.use("/api/bills", billRoutes);
app.use("/api/appliances", applianceRoutes);

app.get("/", (req, res) => {
  res.send("Byte Hackathon Backend is running!");
});

// Database Connection
if (MONGODB_URI) {
  mongoose
    .connect(MONGODB_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err: any) => console.error("MongoDB connection error:", err));
} else {
  console.log("MONGODB_URI not provided, running without DB");
}

// Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
