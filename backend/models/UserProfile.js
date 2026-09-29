const mongoose = require("mongoose");

const UserProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  age: Number,
  language: { type: String, enum: ["English", "Hindi"], default: "English" },
  emergencyContact: String,
  conditions: String,
  avatar: String, // Base64 or URL
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("UserProfile", UserProfileSchema);
