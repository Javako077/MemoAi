import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mic, MicOff, Loader2, Square, AudioLines } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useVoice } from '../hooks/useVoice';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";

export default function AIVoiceAssistant() {
  const { user } = useUser();
  const { speak } = useVoice();
  const location = useLocation();
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => setIsListening(true);
      
      rec.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        await processCommand(transcript);
      };

      rec.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, [user]);

  const toggleListen = () => {
    // Use navigate instead of window.location.href to prevent page reload & logout
    navigate('/chat?startVoice=true');
  };

  const processCommand = async (text) => {
    setIsProcessing(true);
    try {
      const response = await axios.post(`${API_URL}/ai-command`, { 
        userId: user.id || user._id, 
        text 
      });
      const data = response.data;

      if (data.intent === 'add_medicine' && data.data) {
        await axios.post(`${API_URL}/medicine`, {
          userId: user.id || user._id,
          name: data.data.name || "Unknown Medicine",
          time: data.data.time || "09:00",
          dosage: data.data.dosage || "1 pill"
        });
      }

      if (data.reply) {
        speak(data.reply);
      } else {
        speak("Command executed successfully.");
      }

    } catch (error) {
      console.error("Command processing failed:", error);
      speak("Sorry, I could not process your command right now.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user || location.pathname === '/chat') return null;

  return (
    <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[100] flex flex-col items-center gap-4">
      <AnimatePresence>
        {(isListening || isProcessing) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="glass-panel px-4 py-2 md:px-6 md:py-3 text-xs md:text-sm font-bold flex items-center gap-3 shadow-2xl border-white/20 bg-slate-900/90 backdrop-blur-2xl"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span className="text-slate-200">AI is thinking...</span>
              </>
            ) : (
              <>
                <div className="flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [8, 16, 8] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                      className="w-1 bg-indigo-400 rounded-full"
                    />
                  ))}
                </div>
                <span className="text-slate-200 uppercase tracking-widest">Listening</span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="relative">
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.5, opacity: [0, 0.5, 0] }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute inset-0 bg-indigo-500 rounded-full blur-xl"
            />
          )}
        </AnimatePresence>

        <button
          onClick={toggleListen}
          disabled={isProcessing}
          className={`relative w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 group ${
            isListening 
              ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 scale-110 shadow-indigo-500/50' 
              : 'bg-slate-900 hover:bg-slate-800 shadow-black/40 border border-white/5'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
        >
          <div className="absolute inset-0 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          {isProcessing ? (
            <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-white animate-spin" />
          ) : isListening ? (
            <Square className="w-6 h-6 md:w-8 md:h-8 text-white fill-white/20" />
          ) : (
            <Mic className="w-8 h-8 md:w-10 md:h-10 text-white transition-transform group-hover:scale-110" />
          )}
        </button>
      </div>
    </div>
  );
}

