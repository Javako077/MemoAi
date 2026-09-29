const express = require("express");
const router = express.Router();
const { Routine } = require("../models");

// 1. Get Daily Routine for a User
router.get("/:userId", async (req, res) => {
  try {
    const routine = await Routine.findOne({ userId: req.params.userId });
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
