import { useEffect, useRef } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";

export const useReminders = (user) => {
  // Store the last time each medicine was reminded: { [medId]: timestampMs }
  const lastRemindersRef = useRef({});

  useEffect(() => {
    const userId = user?.id || user?._id;
    if (!userId) return;

    const checkReminders = async () => {
      try {
        const response = await axios.get(`${API_URL}/medicine/${userId}`);
        const medicines = Array.isArray(response.data) ? response.data : [];
        
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5); // HH:MM

        // Find medicines due now OR overdue (up to 2 hours ago) that haven't been taken
        const dueMeds = medicines.filter(med => {
          if (med.taken) return false;
          if (currentTime >= med.time) {
            const [cHour, cMin] = currentTime.split(':').map(Number);
            const [mHour, mMin] = (med.time || "00:00").split(':').map(Number);
            const diffMins = (cHour * 60 + cMin) - (mHour * 60 + mMin);
            return diffMins >= 0 && diffMins <= 120;
          }
          return false;
        });

        if (dueMeds.length > 0) {
          const med = dueMeds[0];
          const lastRemindedAt = lastRemindersRef.current[med._id] || 0;
          
          // Repeat every 5 minutes (300,000 ms)
          const REPEAT_INTERVAL = 5 * 60 * 1000;
          if (now.getTime() - lastRemindedAt < REPEAT_INTERVAL) {
            return;
          }

          lastRemindersRef.current[med._id] = now.getTime();

          // 1. Browser Notification
          if (typeof window !== 'undefined' && "Notification" in window && Notification.permission === "granted") {
            try {
              new Notification("Medicine Reminder! 💊", {
                body: `Time to take: ${med.name} (${med.dosage || "1 dose"})`,
                icon: "/favicon.ico"
              });
            } catch (e) {
              console.warn("Notification error:", e);
            }
          }

          // 2. Voice Alert
          if (typeof window !== 'undefined' && window.speechSynthesis) {
            try {
              const msg = new SpeechSynthesisUtterance(`Reminder: Please take your ${med.name} now.`);
              msg.rate = 0.95;
              window.speechSynthesis.speak(msg);
            } catch (e) {
              console.warn("Speech synthesis reminder warning:", e);
            }
          }
        }
      } catch (error) {
        // Silently handle if backend is starting up or offline
      }
    };

    if (typeof window !== 'undefined' && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }

    const interval = setInterval(checkReminders, 60000);
    checkReminders();

    return () => clearInterval(interval);
  }, [user]);

  return null;
};

