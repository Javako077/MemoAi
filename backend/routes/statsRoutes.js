const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { Medicine, Adherence } = require("../models");

// 1. Get User Stats (Medicine Adherence History & Today's Progress)
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.json({
        adherenceData: [],
        totalMeds: 0,
        takenToday: 0,
      });
    }

    // Get historical data for the last 6 days
    const history = await Adherence.find({ userId })
      .sort({ date: -1 })
      .limit(6);

    // Get today's live data
    const todayMeds = await Medicine.find({ userId });
    const todayStats = {
      day: new Date().toLocaleDateString("en-US", { weekday: "short" }),
      taken: todayMeds.filter((m) => m.taken).length,
      total: todayMeds.length,
    };

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const formattedHistory = history
      .map((h) => {
        const d = new Date(h.date);
        return {
          day: days[d.getDay()],
          taken: h.taken,
          total: h.total,
        };
      })
      .reverse();

    res.json({
      adherenceData: [...formattedHistory, todayStats],
      totalMeds: todayMeds.length,
      takenToday: todayStats.taken,
    });
  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
