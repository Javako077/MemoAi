const { GoogleGenerativeAI } = require("@google/generative-ai");

const getModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ GEMINI_API_KEY is not defined in backend environment variables.");
    return null;
  }
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  } catch (err) {
    console.error("Failed to initialize Google Generative AI model:", err);
    return null;
  }
};

module.exports = {
  get model() {
    return getModel();
  },
  getModel
};


