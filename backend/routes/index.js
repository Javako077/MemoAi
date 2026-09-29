const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const chatRoutes = require("./chatRoutes");
const aiRoutes = require("./aiRoutes");
const statsRoutes = require("./statsRoutes");
const profileRoutes = require("./profileRoutes");
const medicineRoutes = require("./medicineRoutes");
const routineRoutes = require("./routineRoutes");
const reminderRoutes = require("./reminderRoutes");

router.use("/auth", authRoutes);
router.use("/chat", chatRoutes);
router.use("/", aiRoutes); // handles /ai-command and /generate-quiz
router.use("/stats", statsRoutes);
router.use("/profile", profileRoutes);
router.use("/medicine", medicineRoutes);
router.use("/routine", routineRoutes);
router.use("/reminders", reminderRoutes);

module.exports = router;
