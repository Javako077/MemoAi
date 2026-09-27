import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_API_GEMINI;
const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite", // Using Gemini 2.5 Flash Lite as requested // Use 1.5 Flash for better stability and quota availability
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
    console.error("Gemini API Error:", error);
    return "Maaf kijiye, main abhi thoda confuse hu. Kya aap phir se bol sakte hain?";
  }
};
