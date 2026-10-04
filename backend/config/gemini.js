const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Verified active Gemini models on Google Generative AI API
 */
const ACTIVE_MODELS = [

  "gemini-3.5-flash-lite",
  "gemini-2.5-flash-lite",
  "gemini-3.8-flash",
  "gemini-3.1-flash-lite"
];

const getValidApiKey = () => {
  return process.env.GEMINI_API_KEY || null;
};

/**
 * Generate AI Response with verified multi-model fallback
 */
const generateAIResponse = async (prompt) => {
  const apiKey = getValidApiKey();
  if (!apiKey) {
    console.warn("⚠️ GEMINI_API_KEY is not defined.");
    return null;
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  for (const modelName of ACTIVE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      if (result && result.response) {
        const text = result.response.text();
        if (text && text.trim()) {
          return text.trim();
        }
      }
    } catch (err) {
      console.warn(`Model ${modelName} attempt: ${err.message}`);
    }
  }

  return null;
};

const generateAIChatResponse = async (systemInstruction, history, userMessage) => {
  const apiKey = getValidApiKey();
  if (!apiKey) {
    console.warn("⚠️ GEMINI_API_KEY is not defined.");
    return null;
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  for (const modelName of ACTIVE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemInstruction
      });

      const chat = model.startChat({ history });
      const result = await chat.sendMessage(userMessage);

      if (result && result.response) {
        const text = result.response.text();
        if (text && text.trim()) {
          return text.trim();
        }
      }
    } catch (err) {
      console.warn(`Model ${modelName} chat attempt: ${err.message}`);
    }
  }

  return null;
};

const getModel = () => {
  const apiKey = getValidApiKey();
  if (!apiKey) return null;
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: "gemini-3.8-flash" });
  } catch (err) {
    return null;
  }
};


module.exports = {
  generateAIResponse,
  generateAIChatResponse,
  getModel,
  get model() {
    return getModel();
  }
};




