const mongoose = require("mongoose");

const MedicineSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  dosage: String,
  time: { type: String, required: true }, // e.g. "09:00 AM"
  taken: { type: Boolean, default: false },
  lastTakenAt: Date,
  missedCount: { type: Number, default: 0 },
});

module.exports = mongoose.model("Medicine", MedicineSchema);
