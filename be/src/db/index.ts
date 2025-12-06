import mongoose from "mongoose";

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URL || process.env.MONGODB_URI;
  
  // If no MongoDB URI is provided, run without database
  if (!mongoUri || mongoUri === 'undefined' || mongoUri === '') {
    console.log("\n ⚠️  MongoDB URI not configured - running without database");
    console.log("   Data will not be persisted. Configure MONGODB_URI in .env for full functionality.\n");
    return;
  }

  try {
    const connectionInstance = await mongoose.connect(mongoUri);
    console.log(`\n ✅ MongoDB connected successfully!`);
  } catch (error) {
    console.log("❌ MONGODB connection FAILED ", error);
    console.log("   Continuing without database - data will not be persisted.\n");
  }
};

export default connectDB;
