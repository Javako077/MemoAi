const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { Routine } = require("../models");

// 1. Get Daily Routine for a User
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.json({});
    }
    const routine = await Routine.findOne({ userId });
    res.json(routine || {});
  } catch (error) {
    console.error("Get Routine Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

// 2. Create or Update Routine
router.post("/", async (req, res) => {
  try {
    const { userId, ...data } = req.body;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    const routine = await Routine.findOneAndUpdate(
      { userId },
      data,
      { upsert: true, new: true }
    );
    res.json(routine);
  } catch (error) {
    console.error("Update Routine Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
