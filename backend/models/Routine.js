const mongoose = require("mongoose");

const RoutineSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tasks: [{
    title: { type: String, required: true },
    time: String,
    completed: { type: Boolean, default: false }
  }],
  // Legacy fields for routine overview
  wakeUp: String,
  breakfast: String,
  lunch: String,
  walk: String,
  dinner: String,
  sleep: String,
});

module.exports = mongoose.model("Routine", RoutineSchema);
