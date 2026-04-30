require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const { GoogleGenerativeAI } = require("@google/generative-ai");
const cron = require("node-cron");

const app = express();
app.use(cors());
app.use(express.json());

// Google Gemini Setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// MailerSend Setup
const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");
const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY,
});
const sentFrom = new Sender(process.env.MAILERSEND_SENDER_EMAIL, process.env.MAILERSEND_SENDER_NAME);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.log("MongoDB Connection Error: ", err));

// Mongoose Models
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetOtp: { type: String },
  resetOtpExpiry: { type: Date }
});
const User = mongoose.model("User", UserSchema);

const ChatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  role: { type: String, enum: ["user", "assistant"], required: true },
  createdAt: { type: Date, default: Date.now },
});
const Chat = mongoose.model("Chat", ChatSchema);


const UserProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  age: Number,
  language: { type: String, enum: ["English", "Hindi"], default: "English" },
  emergencyContact: String,
  conditions: String,
  updatedAt: { type: Date, default: Date.now },
});
const UserProfile = mongoose.model("UserProfile", UserProfileSchema);

const MedicineSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  dosage: String,
  time: { type: String, required: true }, // e.g. "09:00 AM"
  taken: { type: Boolean, default: false },
  lastTakenAt: Date,
  missedCount: { type: Number, default: 0 },
});
const Medicine = mongoose.model("Medicine", MedicineSchema);

const RoutineSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  wakeUp: String,
  breakfast: String,
  lunch: String,
  walk: String,
  dinner: String,
  sleep: String,
});
const Routine = mongoose.model("Routine", RoutineSchema);

// Routes
// 1. Register Route
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: "User already exists" });

    user = new User({ name, email, password });
    await user.save();
    res.status(201).json({ message: "Registration successful", user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: error.message || "Server Error" });
  }
});

// 2. Login Route
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || user.password !== password) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    res.json({ message: "Login successful", user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

// Forgot Password Route
app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry to 10 mins from now
    user.resetOtp = otp;
    user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Send actual email using MailerSend
    const recipients = [new Recipient(email, user.name)];
    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject("Your Password Reset OTP - MemoAi")
      .setHtml(`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #4A90E2;">Password Reset Request</h2>
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>We received a request to reset your password. Use the following OTP to complete the process:</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333; border-radius: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This OTP is valid for <strong>10 minutes</strong>. If you did not request this, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #888;">This is an automated message from MemoAi Support.</p>
        </div>
      `)
      .setText(`Your Password Reset OTP is: ${otp}. It is valid for 10 minutes.`);

    try {
      await mailerSend.email.send(emailParams);
      console.log(`Email sent successfully to ${email}`);
    } catch (emailError) {
      console.error("MailerSend Error:", emailError);
      // We still return success to the user so they check their email, 
      // but we log the error for debugging.
    }

    res.json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

// Reset Password Route
app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.resetOtp || user.resetOtp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }
    if (user.resetOtpExpiry < new Date()) {
      return res.status(400).json({ error: "OTP has expired" });
    }

    user.password = newPassword;
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

// 3. Send/Receive Chat Route (Gemini Integration)
app.post("/api/chat", async (req, res) => {
  try {
    const { userId, message } = req.body;
    
    // Save user message
    const userChat = new Chat({ userId, message, role: "user" });
    await userChat.save();

    const profile = await UserProfile.findOne({ userId });
    const userLanguage = profile?.language || "English";

    // Get real AI response from Gemini
    const prompt = `SYSTEM: The user's preferred language is ${userLanguage}. Please respond in ${userLanguage}. User says: ${message}`;
    const result = await model.generateContent(prompt);
    const assistantMessage = result.response.text();

    const aiChat = new Chat({ userId, message: assistantMessage, role: "assistant" });
    await aiChat.save();

    res.json({ userMessage: userChat, aiMessage: aiChat });
  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: "AI Service Error" });
  }
});

// 4. Get Chat History Route
app.get("/api/chat/:userId", async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.params.userId }).sort({ createdAt: 1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

// 5. Voice Command AI Parser
app.post("/api/ai-command", async (req, res) => {
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
    try {
      const result = await model.generateContent(prompt);
      responseText = result.response.text().trim();
    } catch (genError) {
      console.error("Gemini Generation Error:", genError);
      return res.json({ intent: "unknown", reply: "I'm having trouble processing your request. Please try again." });
    }
    
    // Attempt to parse JSON safely
    let parsedData = {};
    try {
      // Remove any potential markdown block markers if the AI includes them despite instructions
      const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanedText);
    } catch (e) {
      console.error("Failed to parse Gemini response as JSON:", responseText);
      return res.json({ intent: "unknown", reply: "I didn't quite catch that. Can you repeat?" });
    }

    if (parsedData.intent === "emergency") {
      const profile = await UserProfile.findOne({ userId });
      const emergencyPhone = profile?.emergencyContact || "+1234567890";
      const user = await User.findById(userId);
      await sendWhatsAppAlert(
        emergencyPhone, 
        `🚨 URGENT: ${user ? user.name : 'The user'} has requested emergency assistance via voice command.`
      );
      parsedData.reply = "I have notified your emergency contact. Please stay calm.";
    }

    res.json(parsedData);
  } catch (error) {
    console.error("AI Command Error:", error);
    res.status(500).json({ error: "AI Service Error" });
  }
});

// 6. Get User Stats Route
app.get("/api/stats/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const chatCount = await Chat.countDocuments({ userId, role: "user" });
    const quizCount = await Quiz.countDocuments({ userId });
    
    // Mocking some progress data for the chart
    const progressData = [
      { name: 'Mon', score: 40 },
      { name: 'Tue', score: 30 },
      { name: 'Wed', score: 60 },
      { name: 'Thu', score: 45 },
      { name: 'Fri', score: 70 },
      { name: 'Sat', score: 85 },
      { name: 'Sun', score: 90 },
    ];

    res.json({
      chatCount,
      quizCount,
      accuracy: "85%", // Static for now
      studyTime: "4h 20m", // Static for now
      progressData
    });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});


// 7. Profile Routes

// 7. Profile Routes
app.get("/api/profile/:userId", async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ userId: req.params.userId });
    res.json(profile || {});
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

app.post("/api/profile", async (req, res) => {
  try {
    const { userId, ...data } = req.body;
    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { ...data, updatedAt: Date.now() },
      { upsert: true, new: true }
    );
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

// 8. Medicine Routes
app.get("/api/medicine/:userId", async (req, res) => {
  try {
    const meds = await Medicine.find({ userId: req.params.userId });
    res.json(meds);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

app.post("/api/medicine", async (req, res) => {
  try {
    const med = new Medicine(req.body);
    await med.save();
    res.json(med);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

app.put("/api/medicine/:id", async (req, res) => {
  try {
    const med = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(med);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

app.delete("/api/medicine/:id", async (req, res) => {
  try {
    await Medicine.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

// 9. Routine Routes
app.get("/api/routine/:userId", async (req, res) => {
  try {
    const routine = await Routine.findOne({ userId: req.params.userId });
    res.json(routine || {});
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

app.post("/api/routine", async (req, res) => {
  try {
    const { userId, ...data } = req.body;
    const routine = await Routine.findOneAndUpdate({ userId }, data, { upsert: true, new: true });
    res.json(routine);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

// 10. Reminder Polling Route
app.get("/api/reminders/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const now = new Date();
    const currentTimeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    // Find medicines due now (simple string match for now)
    const dueMeds = await Medicine.find({ 
      userId, 
      time: currentTimeStr,
      taken: false 
    });

    res.json(dueMeds);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

// Reset medicine 'taken' status every night at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("Resetting medicine taken status for the day...");
  await Medicine.updateMany({}, { taken: false });
});

// WhatsApp Alert Integration (Placeholder)
const sendWhatsAppAlert = async (phone, message) => {
  console.log(`\n[WHATSAPP ALERT to ${phone}]: ${message}\n`);
  // TODO: Integrate Twilio API or similar WhatsApp Webhook here
  // Example Twilio code:
  // client.messages.create({
  //   body: message,
  //   from: 'whatsapp:+14155238886',
  //   to: `whatsapp:${phone}`
  // });
};

// Background cron job checking for overdue medicines (runs every minute)
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    const cHour = now.getHours();
    const cMin = now.getMinutes();

    // Fetch medicines not taken
    const overdueMeds = await Medicine.find({ taken: false }).populate('userId');

    for (const med of overdueMeds) {
      if (!med.time) continue;
      
      const [mHour, mMin] = med.time.split(':').map(Number);
      const diffMins = (cHour * 60 + cMin) - (mHour * 60 + mMin);
      
      // If medicine is exactly 30 minutes late (or between 30 and 31 minutes late)
      if (diffMins === 30) {
        // Fetch user profile to get emergency contact
        const profile = await UserProfile.findOne({ userId: med.userId._id });
        const emergencyPhone = profile?.emergencyContact || "+1234567890"; // Fallback phone
        
        await sendWhatsAppAlert(
          emergencyPhone, 
          `🚨 URGENT: ${med.userId.name} has not taken their medicine (${med.name}) which was due 30 minutes ago at ${med.time}. Please check on them.`
        );
      }
    }
  } catch (error) {
    console.error("Cron Job Error:", error);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

module.exports = app;
