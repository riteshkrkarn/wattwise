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

// Enhanced Global Request Logger
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log('\n' + '='.repeat(80));
  console.log(`🔵 [${timestamp}] ${req.method} ${req.url}`);
  
  if (Object.keys(req.params).length > 0) {
    console.log('📋 Params:', JSON.stringify(req.params, null, 2));
  }
  
  if (Object.keys(req.query).length > 0) {
    console.log('🔍 Query:', JSON.stringify(req.query, null, 2));
  }
  
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📦 Body:', JSON.stringify(req.body, null, 2));
  }
  
  // Log response
  const originalSend = res.send;
  res.send = function (data) {
    console.log(`✅ Response Status: ${res.statusCode}`);
    console.log('='.repeat(80) + '\n');
    return originalSend.call(this, data);
  };
  
  next();
});

// Routes - Log when routes are registered
console.log('\n📍 Registering routes...');
app.use("/api/v1/bills", billRoutes);
console.log('   ✓ Bills routes registered at /api/v1/bills');

app.use("/api/v1/appliances", applianceRoutes);
console.log('   ✓ Appliances routes registered at /api/v1/appliances');

app.use("/api/v1/ai", aiRoutes);
console.log('   ✓ AI routes registered at /api/v1/ai');

app.use("/api/v1/users", userRoutes);
console.log('   ✓ User routes registered at /api/v1/users');
console.log('📍 All routes registered successfully\n');

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
