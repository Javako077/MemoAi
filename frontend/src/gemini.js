import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";

/**
 * Intelligent contextual assistant when offline or backend unavailable
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
    ? `मैंने आपका संदेश समझ लिया: "${message}". मैं आपकी सहायता और देखभाल के लिए यहाँ हूँ!`
    : `I received your message: "${message}". I am here with you to assist with your medicines, routines, and daily care!`;
};

export const getGeminiResponse = async (chatHistory, newMessage, language = "English") => {
  // 1. Route through Backend AI Proxy (Secure & avoids CORS/Client-side 404s)
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
    // Fallback to local assistant
  }

  // 2. Immediate Smart Contextual Response
  return getContextualFallback(newMessage, language);
};
