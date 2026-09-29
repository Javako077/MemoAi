import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

const API_KEY = import.meta.env.VITE_API_GEMINI;
const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";

const SYSTEM_INSTRUCTION = `You are "DoseMate", a kind, empathetic, and proactive AI assistant for elderly care and memory assistance. 
Your primary goal is to help users with their daily routines, medications, and provide companionship.
Key behaviors:
- Keep responses concise, warm, polite, and easy to understand for elderly people.
- Help with medicine reminders, hydration, and daily tasks.
- If they need urgent help or feel sick, gently guide them to emergency assistance.
- Respond in the requested language.`;

/**
 * Intelligent contextual fallback when API key is unconfigured, expired or quota-limited
 */
const getContextualFallback = (message, language = "English") => {
  const text = (message || "").toLowerCase().trim();
  const isHindi = language === "Hindi";

  // 1. Greetings
  if (text.includes("hello") || text.includes("hi") || text.includes("namaste") || text.includes("hey") || text.includes("नमस्ते")) {
    return isHindi
      ? "नमस्ते! मैं डोज़मेट हूँ, आपकी देखभाल सहायक। आज आप कैसा महसूस कर रहे हैं? क्या आपने अपनी दवाइयाँ ले ली हैं?"
      : "Hello! I am DoseMate, your care companion. How are you feeling today? Have you taken your scheduled medicines?";
  }

  // 2. Medicines / Dawai
  if (text.includes("medicine") || text.includes("dawai") || text.includes("pill") || text.includes("दवा") || text.includes("tablet")) {
    return isHindi
      ? "कृपया अपनी निर्धारित दवाइयाँ समय पर और पानी के साथ लें। आप 'Medicines' पेज पर अपनी पूरी सूची देख सकते हैं।"
      : "Please make sure to take your prescribed medicines on time with water. You can check your full schedule on the Medicines tab.";
  }

  // 3. Emergency / Distress / Help
  if (text.includes("help") || text.includes("emergency") || text.includes("pain") || text.includes("sick") || text.includes("dard") || text.includes("मदद")) {
    return isHindi
      ? "यदि आप अस्वस्थ महसूस कर रहे हैं, तो कृपया शांत रहें। आप Emergency पेज से तुरंत अपने आपातकालीन संपर्क को कॉल कर सकते हैं।"
      : "If you are feeling unwell or need urgent help, please stay calm. You can use the red SOS button on the Emergency page to call your emergency contact immediately.";
  }

  // 4. Routine / Tasks
  if (text.includes("routine") || text.includes("schedule") || text.includes("task") || text.includes("kaam") || text.includes("काम")) {
    return isHindi
      ? "आपका दैनिक रूटीन और कार्य 'Routine' सेक्शन में उपलब्ध हैं। थोड़ा टहलें और पर्याप्त पानी पिएं।"
      : "Your daily routine and scheduled tasks are available under the Routine section. Remember to stay hydrated and take brief restful walks.";
  }

  // 5. Default Warm Response
  return isHindi
    ? `मैंने आपका संदेश प्राप्त कर लिया: "${message}". मैं आपकी हर समय सहायता और देखभाल के लिए यहाँ हूँ!`
    : `I received your message: "${message}". I am here with you to assist with your medicines, routines, and daily care!`;
};

export const getGeminiResponse = async (chatHistory, newMessage, language = "English") => {
  // 1. Try Client-side Gemini if API key is present
  if (API_KEY && API_KEY.startsWith("AIzaSy")) {
    const candidateModels = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-2.5-flash"];
    for (const modelName of candidateModels) {
      try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: SYSTEM_INSTRUCTION,
        });

        const history = [];
        let firstUserFound = false;

        history.push({
          role: "user",
          parts: [{ text: `SYSTEM INSTRUCTION: Please respond strictly in ${language}. If Hindi, use Hindi script. If English, use English.` }],
        });
        history.push({
          role: "model",
          parts: [{ text: `Understood. I will respond in ${language}.` }],
        });

        for (const msg of chatHistory) {
          if (msg.role === "user") firstUserFound = true;
          if (firstUserFound) {
            history.push({
              role: msg.role === "user" ? "user" : "model",
              parts: [{ text: msg.message || "" }],
            });
          }
        }

        const chat = model.startChat({
          history,
          generationConfig: {
            maxOutputTokens: 500,
          },
        });

        const result = await chat.sendMessage(newMessage);
        const response = await result.response;
        const text = response.text();
        if (text) return text;
      } catch (err) {
        // Continue to try next candidate or fallback
      }
    }
  }

  // 2. Try Backend AI Route Fallback
  try {
    const userStored = localStorage.getItem("user");
    const userId = userStored ? (JSON.parse(userStored).id || JSON.parse(userStored)._id) : null;
    if (userId) {
      const res = await axios.post(`${BACKEND_URL}/chat`, {
        userId,
        message: newMessage,
      });
      if (res.data?.aiMessage?.message) {
        return res.data.aiMessage.message;
      }
    }
  } catch (backendErr) {
    // Backend offline or in mock mode
  }

  // 3. Graceful Contextual Local Assistant Fallback
  return getContextualFallback(newMessage, language);
};
