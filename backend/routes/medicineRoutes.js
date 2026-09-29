const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { Medicine } = require("../models");

// 1. Get Medicines for a User
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.json([]);
    }
    const meds = await Medicine.find({ userId });
    res.json(meds);
  } catch (error) {
    console.error("Get Medicines Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

// 2. Add New Medicine
router.post("/", async (req, res) => {
  try {
    if (!req.body.userId || !mongoose.Types.ObjectId.isValid(req.body.userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    const med = new Medicine(req.body);
    await med.save();
    res.status(201).json(med);
  } catch (error) {
    console.error("Add Medicine Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

// 3. Update Medicine (e.g. mark taken, edit dosage or time)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid medicine ID" });
    }
    const med = await Medicine.findByIdAndUpdate(id, req.body, { new: true });
    if (!med) return res.status(404).json({ error: "Medicine not found" });
    res.json(med);
  } catch (error) {
    console.error("Update Medicine Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

// 4. Delete Medicine
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid medicine ID" });
    }
    const med = await Medicine.findByIdAndDelete(id);
    if (!med) return res.status(404).json({ error: "Medicine not found" });
    res.json({ message: "Deleted" });
  } catch (error) {
    console.error("Delete Medicine Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
