const cron = require("node-cron");
const mongoose = require("mongoose");
const { User, Medicine, Adherence, UserProfile } = require("../models");
const { sendWhatsAppAlert } = require("./alertService");

let isDailyResetRunning = false;
let isOverdueCheckRunning = false;

const initCronJobs = () => {
  // 1. Reset medicine 'taken' status and store daily adherence every night at midnight
  cron.schedule("0 0 * * *", async () => {
    if (mongoose.connection.readyState !== 1 || isDailyResetRunning) {
      return;
    }
    
    isDailyResetRunning = true;
    console.log("Saving daily adherence and resetting medicine taken status...");
    try {
      const today = new Date();
      today.setDate(today.getDate() - 1); // Stats for the day that just ended
      const dateStr = today.toISOString().split("T")[0];

      const users = await User.find({});
      for (const user of users) {
        const meds = await Medicine.find({ userId: user._id });
        if (meds.length > 0) {
          const taken = meds.filter((m) => m.taken).length;
          const total = meds.length;

          await Adherence.findOneAndUpdate(
            { userId: user._id, date: dateStr },
            { taken, total },
            { upsert: true }
          );
        }
      }

      await Medicine.updateMany({}, { taken: false });
      console.log("Daily reset complete.");
    } catch (error) {
      console.error("Cron Daily Reset Error:", error.message);
    } finally {
      isDailyResetRunning = false;
    }
  });

  // 2. Check for overdue medicines every minute
  cron.schedule("* * * * *", async () => {
    if (mongoose.connection.readyState !== 1 || isOverdueCheckRunning) {
      return;
    }

    isOverdueCheckRunning = true;
    try {
      const now = new Date();
      const cHour = now.getHours();
      const cMin = now.getMinutes();

      // Fetch medicines not yet taken with 4s timeout
      const overdueMeds = await Medicine.find({ taken: false })
        .populate("userId")
        .maxTimeMS(4000);

      for (const med of overdueMeds) {
        if (!med.time || !med.userId) continue;

        const [mHour, mMin] = med.time.split(":").map(Number);
        const diffMins = cHour * 60 + cMin - (mHour * 60 + mMin);

        // If medicine is exactly 30 minutes late
        if (diffMins === 30) {
          const profile = await UserProfile.findOne({ userId: med.userId._id }).maxTimeMS(3000);
          const emergencyPhone = profile?.emergencyContact || "+1234567890";

          await sendWhatsAppAlert(
            emergencyPhone,
            `🚨 URGENT: ${med.userId.name} has not taken their medicine (${med.name}) which was due 30 minutes ago at ${med.time}. Please check on them.`
          );
        }
      }
    } catch (error) {
      // Quietly suppress temporary network connectivity hiccups
      if (!error.message.includes("timed out") && !error.message.includes("ETIMEDOUT") && !error.message.includes("ENOTFOUND")) {
        console.warn("Cron Overdue Medicine Check Warning:", error.message);
      }
    } finally {
      isOverdueCheckRunning = false;
    }
  });


  console.log("⏰ Background cron jobs initialized successfully.");
};

module.exports = {
  initCronJobs,
};

