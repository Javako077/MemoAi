import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";

/**
 * Intelligent contextual assistant when offline or backend unavailable
 */
const getContextualFallback = (message, language = "English") => {
  const text = (message || "").toLowerCase().trim();
  const isHindi = language === "Hindi";

  // 1. Greetings & Well-being
  if (text.includes("hello") || text.includes("hi") || text.includes("namaste") || text.includes("hey") || text.includes("नमस्ते") || text.includes("kaise ho") || text.includes("kaisa")) {
    return isHindi
      ? "नमस्ते! मैं डोज़मेट हूँ, आपकी निजी देखभाल सहायक। मैं बहुत अच्छी हूँ, आप कैसे हैं? क्या आपने आज का नाश्ता और दवाइयाँ ले ली हैं?"
      : "Hello! I am DoseMate, your caring health assistant. I am doing great, how are you feeling today? Have you taken your scheduled medicines?";
  }

  // 2. Who are you / Introduction
  if (text.includes("who are you") || text.includes("tum kaun ho") || text.includes("aap kaun") || text.includes("कौन हो")) {
    return isHindi
      ? "मैं डोज़मेट हूँ—आपकी स्वास्थ्य और दिनचर्या की सहायक। मैं आपको समय पर दवाई लेने, दिनचर्या का पालन करने और आपातकाल में मदद करती हूँ।"
      : "I am DoseMate—your smart eldercare companion! I help remind you about medicines, track daily routines, and assist in emergencies.";
  }

  // 3. Medicines / Dawai / Tablet
  if (text.includes("medicine") || text.includes("dawai") || text.includes("pill") || text.includes("दवा") || text.includes("tablet") || text.includes("goli")) {
    return isHindi
      ? "कृपया अपनी दवाइयाँ समय पर और एक गिलास पानी के साथ लें। आप 'Medicines' टैब में जाकर अपनी सभी दवाइयों का समय देख सकते हैं।"
      : "Please take your prescribed medicines on time with water. You can see your full medicine list and timetable on the Medicines page.";
  }

  // 4. Emergency / Distress / Pain / Doctor
  if (text.includes("help") || text.includes("emergency") || text.includes("pain") || text.includes("sick") || text.includes("dard") || text.includes("मदद") || text.includes("doctor") || text.includes("chakkar")) {
    return isHindi
      ? "यदि आपको कोई दर्द या परेशानी हो रही है, तो शांत रहें और आराम से बैठें। आपातकालीन मदद के लिए Emergency पेज पर लाल SOS बटन दबाएं।"
      : "If you feel unwell or have any pain, please sit comfortably and breathe slowly. Use the Emergency SOS button to immediately call your family contact.";
  }

  // 5. Water / Hydration / Food
  if (text.includes("water") || text.includes("pani") || text.includes("पानी") || text.includes("khana") || text.includes("food") || text.includes("diet")) {
    return isHindi
      ? "दिन भर में पर्याप्त पानी पीना स्वास्थ्य के लिए बहुत आवश्यक है। हल्का और पौष्टिक भोजन करें।"
      : "Staying hydrated is essential for your health! Please drink a glass of fresh water and enjoy balanced meals.";
  }

  // 6. Routine / Tasks / Walk
  if (text.includes("routine") || text.includes("schedule") || text.includes("task") || text.includes("kaam") || text.includes("काम") || text.includes("walk") || text.includes("exercise")) {
    return isHindi
      ? "आपका दैनिक रूटीन और कार्य 'Routine' सेक्शन में सूचीबद्ध हैं। सुबह की हल्की सैर और योग मन को तरोताजा रखते हैं।"
      : "Your routine tasks are ready under the Routine section. A short gentle walk and light breathing exercises keep you healthy!";
  }

  // 7. Thank you / Appreciation
  if (text.includes("thank") || text.includes("shukriya") || text.includes("dhanyawad") || text.includes("धन्यवाद")) {
    return isHindi
      ? "आपका बहुत-बहुत स्वागत है! आपका स्वास्थ्य ही मेरी सबसे बड़ी प्राथमिकता है। खुश रहिए!"
      : "You are most welcome! Your health and happiness are my top priority. Have a wonderful day!";
  }

  // 8. Default Caring Response
  return isHindi
    ? `मैंने आपका संदेश समझ लिया: "${message}". मैं आपकी सहायता और देखभाल के लिए हमेशा यहाँ हूँ!`
    : `I received your message: "${message}". I am here with you to assist with your medicines, routines, and daily care!`;
};

const GEMINI_DIRECT_KEY = "AIzaSyAMtlRy6Fnm8BSmCpZBdD077EipPKdZvBk";

export const getGeminiResponse = async (chatHistory, newMessage, language = "English") => {
  const cleanMsg = (newMessage || "").trim();
  if (!cleanMsg) return "";

  // 1. Try Backend Chat Endpoint First
  try {
    const userStored = localStorage.getItem("user");
    let userId = null;
    if (userStored) {
      try {
        const parsed = JSON.parse(userStored);
        userId = parsed.id || parsed._id;
      } catch (e) {}
    }
    
    const res = await axios.post(`${BACKEND_URL}/chat`, {
      userId,
      message: cleanMsg,
      language: language || "English",
    }, { timeout: 12000 });

    if (res.data?.aiMessage?.message) {
      return res.data.aiMessage.message;
    }
  } catch (backendErr) {
    console.warn("Backend chat unavailable, trying direct Gemini API:", backendErr?.message);
  }

  // 2. Direct Gemini REST API Call
  try {
    const prompt = `You are DoseMate, a caring, gentle, and helpful healthcare AI companion for elderly care.
Language: ${language}.
Answer the user's question directly, warmly, and concisely (1-3 sentences) in ${language}.
User says: "${cleanMsg}"`;

    const directRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_DIRECT_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      },
      { timeout: 10000 }
    );

    const generatedText = directRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (generatedText && generatedText.trim()) {
      return generatedText.trim();
    }
  } catch (directErr) {
    console.warn("Direct Gemini API error:", directErr?.message);
  }

  // 3. Immediate Caring Contextual Response (Offline fallback)
  return getContextualFallback(cleanMsg, language);
};



