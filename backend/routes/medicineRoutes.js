const express = require("express");
const router = express.Router();
const { Medicine } = require("../models");

// 1. Get Medicines for a User
router.get("/:userId", async (req, res) => {
  try {
    const meds = await Medicine.find({ userId: req.params.userId });
    res.json(meds);
  } catch (error) {
    console.error("Get Medicines Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

// 2. Add New Medicine
router.post("/", async (req, res) => {
  try {
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
    const med = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
    const med = await Medicine.findByIdAndDelete(req.params.id);
    if (!med) return res.status(404).json({ error: "Medicine not found" });
    res.json({ message: "Deleted" });
  } catch (error) {
    console.error("Delete Medicine Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
