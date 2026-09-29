const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { Chat, UserProfile } = require("../models");
const { model } = require("../config/gemini");

const getSmartFallback = (message, language = "English") => {
  const text = (message || "").toLowerCase().trim();
  const isHindi = language === "Hindi";

  if (text.includes("hello") || text.includes("hi") || text.includes("namaste") || text.includes("hey") || text.includes("नमस्ते") || text.includes("kaisa")) {
    return isHindi
      ? "नमस्ते! मैं डोज़मेट हूँ, आपकी देखभाल सहायक। आज आप कैसा महसूस कर रहे हैं? क्या आपने अपनी दवाइयाँ ले ली हैं?"
      : "Hello! I am DoseMate, your care companion. How are you feeling today? Have you taken your scheduled medicines?";
  }

  if (text.includes("medicine") || text.includes("dawai") || text.includes("pill") || text.includes("दवा") || text.includes("tablet") || text.includes("time")) {
    return isHindi
      ? "कृपया अपनी निर्धारित दवाइयाँ समय पर और पर्याप्त पानी के साथ लें। आप 'Medicines' पेज पर अपनी पूरी सूची देख सकते हैं।"
      : "Please make sure to take your prescribed medicines on time with water. You can check your full schedule on the Medicines tab.";
  }

  if (text.includes("help") || text.includes("emergency") || text.includes("pain") || text.includes("sick") || text.includes("dard") || text.includes("मदद") || text.includes("doctor")) {
    return isHindi
      ? "यदि आप अस्वस्थ महसूस कर रहे हैं, तो कृपया शांत रहें। आप Emergency पेज से तुरंत अपने आपातकालीन संपर्क को कॉल कर सकते हैं।"
      : "If you are feeling unwell or need urgent help, please stay calm. You can use the red SOS button on the Emergency page to call your emergency contact immediately.";
  }

  if (text.includes("routine") || text.includes("schedule") || text.includes("task") || text.includes("kaam") || text.includes("काम") || text.includes("walk")) {
    return isHindi
      ? "आपका दैनिक रूटीन और कार्य 'Routine' सेक्शन में उपलब्ध हैं। थोड़ा टहलें और पर्याप्त पानी पिएं।"
      : "Your daily routine and scheduled tasks are available under the Routine section. Remember to stay hydrated and take brief restful walks.";
  }

  return isHindi
    ? `मैंने आपका संदेश समझ लिया: "${message}". मैं आपकी सहायता और देखभाल के लिए हमेशा यहाँ हूँ!`
    : `I received your message: "${message}". I am here with you to assist with your medicines, routines, and daily care!`;
};

// 1. Send/Receive Chat Route (Gemini Integration + Safe Fallback)
router.post("/", async (req, res) => {
  try {
    const { userId, message } = req.body;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Save user message
    const userChat = new Chat({ userId, message: message || "", role: "user" });
    await userChat.save();

    let userLanguage = "English";
    try {
      const profile = await UserProfile.findOne({ userId });
      if (profile?.language) userLanguage = profile.language;
    } catch (profileErr) {
      console.warn("Could not fetch user profile language:", profileErr);
    }

    let assistantMessage = "";
    if (model) {
      try {
        const prompt = `You are DoseMate, a caring and compassionate healthcare AI assistant for elderly users. Preferred language: ${userLanguage}. Please reply concisely (1-3 sentences) in ${userLanguage} with warmth and clarity. User said: ${message}`;
        const result = await model.generateContent(prompt);
        if (result && result.response) {
          assistantMessage = result.response.text();
        }
      } catch (geminiErr) {
        console.warn("Gemini model call failed, falling back to local assistant:", geminiErr.message);
      }
    }

    if (!assistantMessage) {
      assistantMessage = getSmartFallback(message, userLanguage);
    }

    const aiChat = new Chat({ userId, message: assistantMessage, role: "assistant" });
    await aiChat.save();

    return res.json({ userMessage: userChat, aiMessage: aiChat });
  } catch (error) {
    console.error("Chat Error:", error);
    const fallbackAi = new Chat({
      userId: req.body?.userId,
      message: "Hello! I am DoseMate. I am here to help you with your medicines, routines, and daily care.",
      role: "assistant"
    });
    return res.json({
      userMessage: { role: "user", message: req.body?.message || "" },
      aiMessage: fallbackAi
    });
  }
});

// 2. Get Chat History Route
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.json([]);
    }
    const chats = await Chat.find({ userId }).sort({ createdAt: 1 });
    res.json(chats);
  } catch (error) {
    console.error("Chat History Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;

