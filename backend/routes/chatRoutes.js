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

// 1. Send/Receive Chat Route (Gemini Multi-Model AI + Safe Fallback)
router.post("/", async (req, res) => {
  try {
    const { userId, message, language } = req.body;
    const userMessageText = (message || "").trim();

    if (!userMessageText) {
      return res.json({
        userMessage: { role: "user", message: "" },
        aiMessage: { role: "assistant", message: "Hello! How can I help you today?" }
      });
    }

    let userLanguage = language || "English";
    const isValidUser = userId && mongoose.Types.ObjectId.isValid(userId);
    let history = [];

    if (isValidUser) {
      try {
        const profile = await UserProfile.findOne({ userId });
        if (profile?.language) userLanguage = profile.language;
        
        // Fetch last 20 chats for conversation history context
        const recentChats = await Chat.find({ userId }).sort({ createdAt: -1 }).limit(20);
        
        let rawHistory = [];
        recentChats.reverse().forEach(c => {
          if (c.message && c.message.trim()) {
            rawHistory.push({
              role: c.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: c.message }]
            });
          }
        });

        // Gemini requires strict 'user' -> 'model' alternation. 
        // Must start with 'user' and end with 'model' (because the new incoming message is 'user').
        for (const msg of rawHistory) {
          if (history.length === 0) {
            if (msg.role === 'user') history.push(msg);
          } else if (history[history.length - 1].role !== msg.role) {
            history.push(msg);
          } else {
            // Merge consecutive messages from the same role
            history[history.length - 1].parts[0].text += "\n" + msg.parts[0].text;
          }
        }
        
        // Ensure the last message in history is from 'model'
        if (history.length > 0 && history[history.length - 1].role === 'user') {
          history.pop();
        }
      } catch (err) {
        console.warn("Could not fetch user profile or history:", err.message);
      }
    }

    let assistantMessage = "";
    try {
      const systemInstruction = `You are DoseMate, a caring, gentle, and highly helpful AI healthcare assistant for elderly care.
User's preferred language: ${userLanguage}.
Please answer the user's questions clearly, warmly, and helpfully in ${userLanguage} (1-3 sentences).`;

      const { generateAIChatResponse } = require("../config/gemini");
      assistantMessage = await generateAIChatResponse(systemInstruction, history, userMessageText);
    } catch (aiErr) {
      console.warn("AI generation failed:", aiErr.message);
    }

    if (!assistantMessage) {
      assistantMessage = getSmartFallback(userMessageText, userLanguage);
    }

    let userChat = { role: "user", message: userMessageText };
    let aiChat = { role: "assistant", message: assistantMessage };

    if (isValidUser) {
      try {
        userChat = await new Chat({ userId, message: userMessageText, role: "user" }).save();
        aiChat = await new Chat({ userId, message: assistantMessage, role: "assistant" }).save();
      } catch (dbErr) {
        console.warn("Could not save chat history:", dbErr.message);
      }
    }

    return res.json({ userMessage: userChat, aiMessage: aiChat });
  } catch (error) {
    console.error("Chat Error:", error);
    return res.json({
      userMessage: { role: "user", message: req.body?.message || "" },
      aiMessage: { role: "assistant", message: "Hello! I am DoseMate. I am here to help you with your health, medicines, and routine." }
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

