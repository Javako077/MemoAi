const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetOtp: { type: String },
  resetOtpExpiry: { type: Date },
  role: { type: String, enum: ["elder", "caregiver"], default: "elder" }
});

module.exports = mongoose.model("User", UserSchema);
