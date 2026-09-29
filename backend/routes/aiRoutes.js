const express = require("express");
const router = express.Router();
const { User, UserProfile } = require("../models");
const { model } = require("../config/gemini");
const { sendWhatsAppAlert } = require("../services/alertService");

// 1. Voice Command AI Parser
router.post("/ai-command", async (req, res) => {
  try {
    const { userId, text } = req.body;
    const cleanText = (text || "").trim();

    let userLanguage = "English";
    try {
      const profile = await UserProfile.findOne({ userId });
      if (profile?.language) userLanguage = profile.language;
    } catch (e) {
      console.warn("Could not find profile for AI command:", e);
    }

    const isHindi = userLanguage === "Hindi";

    const prompt = `
      You are an AI assistant for an elderly care app. 
      The user's preferred language is ${userLanguage}.
      The user said: "${cleanText}"
      
      Determine their intent and extract any relevant data.
      Possible intents: 
      - "add_medicine" (needs name and time, e.g. "14:00")
      - "check_medicine"
      - "emergency" (user needs help, is in distress, or wants to contact emergency contact)
      - "unknown"
 
      IMPORTANT: Your "reply" MUST be in ${userLanguage}. If Hindi, use Hindi script.

      Return ONLY a raw JSON object (no markdown formatting, no code blocks) with this structure:
      {
        "intent": "action_name",
        "data": { "name": "medicine_name", "time": "HH:MM" },
        "reply": "A friendly voice reply to the user confirming the action."
      }
    `;

    const { generateAIResponse } = require("../config/gemini");
    let parsedData = null;

    try {
      const responseText = await generateAIResponse(prompt);
      if (responseText) {
        const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        parsedData = JSON.parse(cleanedText);
      }
    } catch (genError) {
      console.warn("Gemini AI Command Parse Error, using local intent parser:", genError.message);
    }


    // Smart Local Fallback Parser if Gemini is unreachable or returned invalid JSON
    if (!parsedData || !parsedData.reply) {
      const lower = cleanText.toLowerCase();

      if (lower.includes("emergency") || lower.includes("help") || lower.includes("sos") || lower.includes("pain") || lower.includes("dard") || lower.includes("मदद")) {
        parsedData = {
          intent: "emergency",
          data: {},
          reply: isHindi 
            ? "आपातकालीन संपर्क को सूचित किया जा रहा है। कृपया शांत रहें।" 
            : "Emergency contact is being notified. Please stay calm."
        };
      } else if (lower.includes("add") || lower.includes("medicine") || lower.includes("dawai") || lower.includes("दवा") || lower.includes("tablet")) {
        parsedData = {
          intent: "add_medicine",
          data: { name: cleanText.replace(/add|medicine|dawai|दवा/gi, "").trim() || "Prescribed Medicine", time: "09:00" },
          reply: isHindi 
            ? "आपकी दवाई सूची में जोड़ दी गई है।" 
            : "I have added the medicine to your schedule."
        };
      } else if (lower.includes("hello") || lower.includes("hi") || lower.includes("namaste") || lower.includes("नमस्ते")) {
        parsedData = {
          intent: "greeting",
          data: {},
          reply: isHindi 
            ? "नमस्ते! मैं डोज़मेट हूँ। मैं आपकी क्या मदद कर सकती हूँ?" 
            : "Hello! I am DoseMate. How can I assist you today?"
        };
      } else {
        parsedData = {
          intent: "unknown",
          data: {},
          reply: isHindi 
            ? `मैंने सुना: "${cleanText}". मैं आपकी देखभाल के लिए यहाँ हूँ!` 
            : `I heard: "${cleanText}". I am here with you to assist with your daily care!`
        };
      }
    }

    if (parsedData.intent === "emergency" && userId) {
      try {
        const emergencyProfile = await UserProfile.findOne({ userId });
        const emergencyPhone = emergencyProfile?.emergencyContact || "+1234567890";
        const user = await User.findById(userId);

        await sendWhatsAppAlert(
          emergencyPhone,
          `🚨 URGENT: ${user ? user.name : "The user"} has requested emergency assistance via voice command.`
        );
      } catch (err) {
        console.error("Emergency Alert Dispatch Failed:", err);
      }
    }

    return res.json(parsedData);
  } catch (error) {
    console.error("AI Command Error:", error);
    return res.json({
      intent: "unknown",
      reply: "I am here with you. How can I help you today?"
    });
  }
});

// 2. Generate Memory & Cognitive Quiz
router.post("/generate-quiz", async (req, res) => {
  try {
    const { userId } = req.body;
    const profile = await UserProfile.findOne({ userId });
    const userLanguage = profile?.language || "English";

    const prompt = `
      Create a short, engaging 3-question memory and general knowledge quiz suitable for an elderly person.
      Language: ${userLanguage}.
      Return ONLY a raw JSON array of objects (no markdown blocks) formatted as:
      [
        {
          "question": "Question text",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
          "correctAnswer": "Option 1"
        }
      ]
    `;

    if (model) {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text().trim();
      const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const quiz = JSON.parse(cleanedText);
      return res.json(quiz);
    }

    // Default fallback quiz if model not available
    res.json([
      {
        question: "What is the capital of France?",
        options: ["Paris", "Rome", "Madrid", "Berlin"],
        correctAnswer: "Paris"
      }
    ]);
  } catch (error) {
    console.error("Generate Quiz Error:", error);
    res.status(500).json({ error: "Failed to generate quiz" });
  }
});

module.exports = router;
