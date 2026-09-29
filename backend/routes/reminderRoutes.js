const express = require("express");
const router = express.Router();
const { Medicine } = require("../models");

// 1. Reminder Polling Route (Fetch medicines currently due)
router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const now = new Date();
    const currentTimeStr = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const dueMeds = await Medicine.find({
      userId,
      time: currentTimeStr,
      taken: false,
    });

    res.json(dueMeds);
  } catch (error) {
    console.error("Reminder Polling Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
