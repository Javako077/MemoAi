import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_API_GEMINI;
const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: `You are "DoseMate", a kind, empathetic, and proactive AI assistant for elderly care and memory assistance. 
  Your primary goal is to help users with their daily routines, medications, and provide companionship.
  
  Key behaviors:
  - Introduce yourself briefly only if it's the very first message of the conversation. Otherwise, jump straight to helping the user.
  - Be helpful with medicine reminders, asking if they have taken their pills.
  - If they seem confused or need help, offer support or suggest calling an emergency contact if it sounds serious.
  - Keep responses concise, warm, and easy to understand for elderly people.
  - You can speak in a mix of Hindi and English (Hinglish) as that's often more natural for Indian users.
  - Always be polite and patient.`,
});

export const getGeminiResponse = async (chatHistory, newMessage, language = "English") => {
  try {
    if (!API_KEY) {
      console.warn("VITE_API_GEMINI is missing. Using friendly local assistant response.");
      return language === "Hindi"
        ? "नमस्ते! मैं डोज़मेट हूँ। कृपया अपनी दवाइयां समय पर लें और अपना ध्यान रखें।"
        : "Hello! I am DoseMate, your care assistant. Please make sure to take your scheduled medications and stay well hydrated.";
    }

    // Gemini requires the first message in history to be from the 'user'
    const history = [];
    let firstUserFound = false;

    // Add language instruction to history
    history.push({
      role: 'user',
      parts: [{ text: `SYSTEM INSTRUCTION: From now on, please respond strictly in ${language}. If the language is Hindi, use Hindi script. If English, use English.` }],
    });
    history.push({
      role: 'model',
      parts: [{ text: `Understood. I will now respond in ${language}.` }],
    });

    for (const msg of chatHistory) {
      if (msg.role === 'user') firstUserFound = true;
      if (firstUserFound) {
        history.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.message }],
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
    return response.text();
  } catch (error) {
    console.warn("Gemini API Error (Falling back to local response):", error.message || error);
    return language === "Hindi"
      ? "माफ कीजिये, मुझे आपकी बात समझने में थोड़ी समस्या हो रही है। कृपया सुनिश्चित करें कि आपकी दवाइयाँ समय पर ली गई हैं।"
      : "I'm having a little trouble connecting right now, but please remember to take your scheduled medicines and rest.";
  }
};
