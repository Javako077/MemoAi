const express = require("express");
const router = express.Router();
const { User, UserProfile } = require("../models");

// 1. Get User Profile
router.get("/:userId", async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ userId: req.params.userId });
    res.json(profile || {});
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

// 2. Create or Update User Profile
router.post("/", async (req, res) => {
  try {
    const { userId, name, role, ...data } = req.body;

    // Update User model fields if provided
    const updateFields = {};
    if (name) updateFields.name = name;
    if (role) updateFields.role = role;

    if (Object.keys(updateFields).length > 0) {
      await User.findByIdAndUpdate(userId, updateFields);
    }

    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { ...data, updatedAt: Date.now() },
      { upsert: true, new: true }
    );
    res.json(profile);
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
