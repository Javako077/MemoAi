import { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, Phone, Save, Smartphone, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useVoice } from '../hooks/useVoice';
import { useUser } from '../context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import { translations } from '../utils/translations';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";

export default function Emergency({ user }) {
  const { settings } = useUser();
  const t = translations[settings.language] || translations.English;
  const isLight = settings?.theme === 'light';
  const [contact, setContact] = useState('');
  const [savedContact, setSavedContact] = useState('');
  const [message, setMessage] = useState(null);
  const { speak } = useVoice();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_URL}/profile/${user.id || user._id}`);
        if (res.data.emergencyContact) {
          setContact(res.data.emergencyContact);
          setSavedContact(res.data.emergencyContact);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchProfile();
  }, [user]);

  const saveContact = async () => {
    if (!contact || contact.length < 10) {
      speak("Please enter a valid phone number", "en-US");
      setMessage({ type: 'error', text: "Enter valid 10 digit number" });
      return;
    }

    try {
      await axios.post(`${API_URL}/profile`, {
        userId: user.id || user._id,
        emergencyContact: contact
      });

      setSavedContact(contact);
      setMessage({ type: 'success', text: "Contact saved successfully" });
      speak("Emergency number save ho gaya hai", "hi-IN");
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: "Saving failed" });
      speak("Saving failed, please try again", "en-US");
    }
  };

  const triggerSOS = () => {
    if (!savedContact) {
      const msg = settings?.language === 'Hindi' ? "कृपया पहले आपातकालीन संपर्क सेव करें" : "Please save emergency contact first";
      speak(msg, settings?.language === 'Hindi' ? "hi-IN" : "en-US");
      setMessage({ type: 'error', text: t.noContact || "No contact saved" });
      return;
    }

    const alertMsg = settings?.language === 'Hindi' 
      ? "इमरजेंसी अलर्ट! आपके परिवार को कॉल किया जा रहा है।" 
      : "Emergency Alert! Calling your emergency contact.";
    
    speak(alertMsg, settings?.language === 'Hindi' ? "hi-IN" : "en-US");
    
    // Slight delay to allow the voice to start before the call interface takes over
    setTimeout(() => {
      window.location.href = `tel:${savedContact}`;
    }, 500);
  };

  return (
    <div className={`min-h-[80vh] p-4 md:p-8 flex flex-col items-center justify-center space-y-12 max-w-4xl mx-auto transition-colors duration-500`}>

      {/* Heading */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex p-4 rounded-full bg-rose-500/10 text-rose-500 mb-2">
          <ShieldAlert size={48} />
        </div>
        <h1 className={`text-5xl md:text-7xl font-black tracking-tighter ${isLight ? 'text-slate-900' : 'text-white'}`}>
          {t.emergencyTitle} <span className="text-rose-500">{t.sos}</span>
        </h1>
        <p className="text-slate-500 text-lg md:text-xl font-medium max-w-md mx-auto">
          {t.tapSaveLife}
        </p>
      </motion.div>

      {/* SOS Button */}
      <div className="relative group">
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 bg-rose-500 rounded-full blur-3xl opacity-20"
        />
        <button 
          onClick={triggerSOS}
          className="relative bg-rose-500 hover:bg-rose-600 text-white h-56 w-56 md:h-80 md:w-80 rounded-full flex flex-col items-center justify-center shadow-[0_0_50px_rgba(244,63,94,0.4)] transition-all active:scale-90 border-8 border-rose-400/20"
        >
          <AlertCircle className="w-20 h-20 md:w-32 md:h-32 mb-2" />
          <span className="text-4xl md:text-6xl font-black tracking-widest">{t.sos}</span>
        </button>
      </div>

      {/* Contact Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`w-full max-w-2xl ${isLight ? 'glass-panel-light shadow-2xl' : 'glass-panel shadow-2xl'} p-8 md:p-10 space-y-8`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <h2 className="text-2xl font-black flex items-center gap-3">
            <Smartphone className="text-rose-500" /> {t.emergencyContact}
          </h2>
          {savedContact && (
            <div className="bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-full text-sm font-black flex items-center gap-2">
              <CheckCircle2 size={16} /> 📞 {savedContact}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input
              className={`${isLight ? 'input-field-light' : 'input-field'} pl-12 py-5 text-xl font-bold`}
              placeholder="e.g. 9876543210"
              value={contact}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setContact(value);
              }}
              maxLength={10}
            />
          </div>

          <button 
            onClick={saveContact}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-emerald-500/20"
          >
            <Save size={24} /> {t.saveNumber}
          </button>
        </div>

        <AnimatePresence>
          {message && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`p-4 rounded-xl font-bold text-center ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-sm text-slate-500 text-center font-medium italic">
          This number will be dialed immediately when the SOS button is pressed. Make sure it is correct and reachable.
        </p>
      </motion.div>
    </div>
  );
}