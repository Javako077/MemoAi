import { useEffect, useRef } from 'react';
import axios from 'axios';
import { useVoice } from './useVoice';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";

export const useReminders = (user) => {
  const { speak } = useVoice();
  // Store the last time each medicine was reminded: { [medId]: timestampMs }
  const lastRemindersRef = useRef({});

  useEffect(() => {
    if (!user) return;

    const checkReminders = async () => {
      try {
        const response = await axios.get(`${API_URL}/medicine/${user.id || user._id}`);
        const medicines = response.data;
        
        const now = new Date();
        const currentTime = now.toTimeString().slice(0,5); // HH:MM

        // Find medicines due now OR overdue (up to 2 hours ago) that haven't been taken
        const dueMeds = medicines.filter(med => {
          if (med.taken) return false;
          // Compare strings "HH:MM". If current time is greater/equal, it's overdue
          if (currentTime >= med.time) {
            // Optional: don't alert if it's more than 2 hours late 
            // (assume they missed it entirely to avoid annoying them all day)
            const [cHour, cMin] = currentTime.split(':').map(Number);
            const [mHour, mMin] = med.time.split(':').map(Number);
            const diffMins = (cHour * 60 + cMin) - (mHour * 60 + mMin);
            return diffMins >= 0 && diffMins <= 120;
          }
          return false;
        });

        if (dueMeds.length > 0) {
          // Process the most overdue one first, or just the first one
          const med = dueMeds[0];
          const lastRemindedAt = lastRemindersRef.current[med._id] || 0;
          
          // Repeat every 5 minutes (300,000 ms)
          const REPEAT_INTERVAL = 5 * 60 * 1000;
          if (now.getTime() - lastRemindedAt < REPEAT_INTERVAL) {
            return; // Too soon to remind again
          }

          // Update the ref
          lastRemindersRef.current[med._id] = now.getTime();

          // 1. Browser Notification
          if (Notification.permission === "granted") {
            new Notification("Medicine Reminder!", {
              body: `Please take your medicine 💊: ${med.name} (${med.dosage})`,
              icon: "/favicon.ico"
            });
          }

          // 2. Voice Alert
          const msg = new SpeechSynthesisUtterance(`Reminder: Please take your ${med.name} now.`);
          window.speechSynthesis.speak(msg);
        }
      } catch (error) {
        console.error("Reminder check failed:", error);
      }
    };

    if (Notification.permission === "default") {
      Notification.requestPermission().catch(err => console.warn("Notification prompt ignored or blocked.", err));
    }

    const interval = setInterval(checkReminders, 60000);
    checkReminders();

    return () => clearInterval(interval);
  }, [user, speak]);

  return null;
};
