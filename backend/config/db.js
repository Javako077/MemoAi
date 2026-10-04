const mongoose = require("mongoose");

const connectDB = async () => {
  // Prefer MONGODB_URL (local) over MONGODB_URI to avoid Atlas conflicts
  const mongoUri = process.env.MONGODB_URL || process.env.MONGODB_URI;

  if (!mongoUri) {
    console.warn("MongoDB Connection Warning: No URI provided in environment");
    return null;
  }

  // If already connected, return the connection
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  const opts = {
    serverSelectionTimeoutMS: 3000,
    connectTimeoutMS: 3000,
    bufferCommands: false,
  };

  try {
    // Explicitly await the connection
    const mongooseInstance = await mongoose.connect(mongoUri, opts);
    console.log(`✅ MongoDB Connected Successfully`);
    return mongooseInstance;
  } catch (err) {
    console.warn("MongoDB Connection Warning:", err.message);
    return null;
  }
};

module.exports = connectDB;


