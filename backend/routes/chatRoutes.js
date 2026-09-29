const express = require("express");
const router = express.Router();
const { Chat, UserProfile } = require("../models");
const { model } = require("../config/gemini");

// 1. Send/Receive Chat Route (Gemini Integration)
router.post("/", async (req, res) => {
  try {
    const { userId, message } = req.body;

    // Save user message
    const userChat = new Chat({ userId, message, role: "user" });
    await userChat.save();

    const profile = await UserProfile.findOne({ userId });
    const userLanguage = profile?.language || "English";

    let assistantMessage = "I am here to help you.";
    if (model) {
      // Get AI response from Gemini
      const prompt = `SYSTEM: The user's preferred language is ${userLanguage}. Please respond in ${userLanguage}. User says: ${message}`;
      const result = await model.generateContent(prompt);
      assistantMessage = result.response.text();
    }

    const aiChat = new Chat({ userId, message: assistantMessage, role: "assistant" });
    await aiChat.save();

    res.json({ userMessage: userChat, aiMessage: aiChat });
  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: "AI Service Error" });
  }
});

// 2. Get Chat History Route
router.get("/:userId", async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.params.userId }).sort({ createdAt: 1 });
    res.json(chats);
  } catch (error) {
    console.error("Chat History Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
