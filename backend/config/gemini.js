const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Verified active Gemini models on Google Generative AI API
 */
const ACTIVE_MODELS = [
  "gemini-flash-lite-latest",
  "gemini-flash-latest",
  "gemini-pro-latest",
  "gemini-3.7-flash",
  "gemini-3.5-flash",
  "gemini-2.5-pro",
  "gemini-2.5-flash-lite"
];

/**
 * Generate AI Response with verified multi-model fallback
 */
const generateAIResponse = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ GEMINI_API_KEY is not defined in backend environment variables.");
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
      console.warn(`Model ${modelName} fallback attempt: ${err.message}`);
    }
  }

  return null;
};

const getModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });
  } catch (err) {
    return null;
  }
};

module.exports = {
  generateAIResponse,
  getModel,
  get model() {
    return getModel();
  }
};




