const mongoose = require("mongoose");

const AdherenceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  taken: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
});

module.exports = mongoose.model("Adherence", AdherenceSchema);
