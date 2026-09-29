const express = require("express");
const router = express.Router();
const { User, UserProfile } = require("../models");
const { model } = require("../config/gemini");
const { sendWhatsAppAlert } = require("../services/alertService");

// 1. Voice Command AI Parser
router.post("/ai-command", async (req, res) => {
  try {
    const { userId, text } = req.body;

    const profile = await UserProfile.findOne({ userId });
    const userLanguage = profile?.language || "English";

    const prompt = `
      You are an AI assistant for an elderly care app. 
      The user's preferred language is ${userLanguage}.
      The user said: "${text}"
      
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

    let responseText = "";
    if (model) {
      try {
        const result = await model.generateContent(prompt);
        responseText = result.response.text().trim();
      } catch (genError) {
        console.error("Gemini Generation Error:", genError);
        return res.json({ intent: "unknown", reply: "I'm having trouble processing your request. Please try again." });
      }
    } else {
      return res.json({ intent: "unknown", reply: "AI model is not currently configured." });
    }

    // Parse JSON safely
    let parsedData = {};
    try {
      const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      parsedData = JSON.parse(cleanedText);
    } catch (e) {
      console.error("Failed to parse Gemini response as JSON:", responseText);
      return res.json({ intent: "unknown", reply: "I didn't quite catch that. Can you repeat?" });
    }

    if (parsedData.intent === "emergency") {
      const emergencyProfile = await UserProfile.findOne({ userId });
      const emergencyPhone = emergencyProfile?.emergencyContact || "+1234567890";
      const user = await User.findById(userId);

      await sendWhatsAppAlert(
        emergencyPhone,
        `🚨 URGENT: ${user ? user.name : "The user"} has requested emergency assistance via voice command.`
      );
      parsedData.reply = "I have notified your emergency contact. Please stay calm.";
    }

    res.json(parsedData);
  } catch (error) {
    console.error("AI Command Error:", error);
    res.status(500).json({ error: "AI Service Error" });
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
