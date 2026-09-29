import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, Mic, MicOff, Volume2, ArrowLeft, Sparkles, PhoneCall, X, Globe, MessageSquare } from 'lucide-react';
import { getGeminiResponse } from '../gemini';
import { useVoice } from '../hooks/useVoice';
import { translations } from '../utils/translations';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function Chat({ user }) {
  const { settings, updateSettings, sidebarCollapsed } = useUser();

  const t = translations[settings.language] || translations.English;
  const isHindi = settings.language === 'Hindi';
  const langCode = isHindi ? 'hi-IN' : 'en-US';

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAssistantActive, setIsAssistantActive] = useState(false);
  const [assistantState, setAssistantState] = useState('idle'); // 'idle', 'speaking', 'listening'
  const [lastSpokenText, setLastSpokenText] = useState('');

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const { speak, listen, stopListening, isListening } = useVoice();
  const location = useLocation();

  const quickSuggestions = isHindi ? [
    "मेरी दवाइयाँ बताओ",
    "आज का रूटीन क्या है?",
    "मुझे थोड़ा अस्वस्थ लग रहा है",
    "नमस्ते डोज़मेट!",
  ] : [
    "What are my medicines?",
    "Check my daily routine",
    "I am feeling unwell",
    "Hello DoseMate!",
  ];

  // Initial Greeting & Auto-start voice if requested
  useEffect(() => {
    const greeting = t.chatGreeting;
    
    // Check for auto-start voice parameter
    const params = new URLSearchParams(location.search);
    if (params.get('startVoice') === 'true') {
      startVoiceAssistant();
    } else {
      setMessages([{ role: 'assistant', message: greeting }]);
    }
  }, [location.search, settings.language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (messageToSend = null) => {
    const textToSend = typeof messageToSend === 'string' ? messageToSend : input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg = textToSend.trim();
    setInput('');
    setIsLoading(true);

    const updatedMessages = [...messages, { role: 'user', message: userMsg }];
    setMessages(updatedMessages);

    try {
      const aiResponse = await getGeminiResponse(updatedMessages, userMsg, settings.language);
      setMessages(prev => [...prev, { role: 'assistant', message: aiResponse }]);
      speak(aiResponse, langCode);
    } catch (error) {
      console.error("Chat Error:", error);
      const fallback = isHindi 
        ? "नमस्ते! मैं आपकी सहायता के लिए यहाँ हूँ। कृपया अपना प्रश्न दोबारा पूछें।" 
        : "Hello! I am here to help you. Please ask your question again.";
      setMessages(prev => [...prev, { role: 'assistant', message: fallback }]);
      speak(fallback, langCode);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      listen((transcript) => {
        if (transcript && transcript.trim()) {
          setInput(transcript);
          handleSend(transcript);
        }
      }, langCode);
    }
  };

  // Full Voice Assistant Flow
  const startVoiceAssistant = () => {
    setIsAssistantActive(true);
    setAssistantState('speaking');
    const greeting = t.welcomeVoice;
    setLastSpokenText(greeting);
    
    speak(greeting, langCode, () => {
      startListeningInAssistant();
    });
  };

  const startListeningInAssistant = () => {
    setAssistantState('listening');
    recognitionRef.current = listen(async (transcript) => {
      if (!transcript || !transcript.trim()) {
        setAssistantState('idle');
        return;
      }
      
      setAssistantState('speaking');
      setLastSpokenText(`You said: "${transcript}"`);

      try {
        const aiResponse = await getGeminiResponse(messages, transcript, settings.language);
        setMessages(prev => [...prev, { role: 'user', message: transcript }, { role: 'assistant', message: aiResponse }]);
        setLastSpokenText(aiResponse);
        
        speak(aiResponse, langCode, () => {
          setAssistantState('idle');
        });
      } catch (err) {
        setAssistantState('idle');
      }
    }, langCode);
  };

  const isLight = settings.theme === 'light';

  return (
    <div className={`min-h-screen ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#0f172a] text-slate-100'} flex flex-col font-sans selection:bg-[#22396F]/30 overflow-hidden`}>
      {/* Premium Header */}
      <header className={`fixed top-0 z-40 backdrop-blur-xl ${isLight ? 'bg-white/80 border-slate-200' : 'bg-slate-900/80 border-slate-800/60'} border-b px-4 py-3 flex items-center justify-between transition-all duration-300 ${sidebarCollapsed ? 'left-0 lg:left-20' : 'left-0 lg:left-64'} right-0`}>
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 hover:bg-slate-800/40 rounded-full transition-colors text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <img src="/dosemateLogo.png" alt="DoseMate" className="w-full h-full object-contain p-1" />
            </div>
            <div>
              <h1 className="text-lg font-black leading-tight">Dose<span className="text-sky-400">Mate</span></h1>
              <p className="text-[10px] uppercase tracking-widest text-sky-400 font-semibold">{t.careAssistant}</p>
            </div>
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => updateSettings({ language: settings.language === 'English' ? 'Hindi' : 'English' })}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#22396F]/20 hover:bg-[#22396F]/40 rounded-xl text-xs font-bold text-sky-300 transition-all border border-sky-400/20"
          >
            <Globe className="w-4 h-4" /> {settings.language === 'English' ? 'हिन्दी' : 'English'}
          </button>
          <Link to="/emergency" className={`${isLight ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-rose-950/40 border-rose-800/50 text-rose-300'} flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-sm`}>
            <PhoneCall className="w-4 h-4 text-rose-400" /> {t.emergencyTitle || "SOS"}
          </Link>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 max-w-4xl mx-auto w-full space-y-6 scrollbar-hide pb-48 mt-16">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex gap-3.5 items-end animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
              msg.role === 'user' 
                ? 'bg-slate-800 border border-slate-700 text-slate-300' 
                : 'bg-[#22396F] text-white shadow-sky-900/30'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-sky-300" />}
            </div>

            <div className={`group relative max-w-[85%] md:max-w-[75%] px-5 py-3.5 rounded-2xl shadow-lg transition-all ${
              msg.role === 'user' 
                ? 'bg-[#22396F] text-white rounded-br-none border border-sky-400/20' 
                : `${isLight ? 'bg-white border-slate-200 text-slate-800 shadow-slate-200/50' : 'bg-slate-800/90 backdrop-blur-md border-slate-700/60 text-slate-100 shadow-black/30'} rounded-bl-none border`
            }`}>
              <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">
                {msg.message}
              </div>
              
              {msg.role === 'assistant' && (
                <button 
                  onClick={() => speak(msg.message, langCode)}
                  className="absolute -right-9 top-2 p-1.5 text-slate-400 hover:text-sky-400 transition-colors rounded-lg"
                  title="Listen"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3.5 items-end animate-pulse">
            <div className="w-9 h-9 rounded-xl bg-[#22396F] flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-sky-300" />
            </div>
            <div className={`${isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-800/80 border-slate-700/50 text-slate-300'} px-5 py-3.5 rounded-2xl rounded-bl-none flex items-center gap-3 border`}>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce delay-200"></div>
              </div>
              <span className="text-xs font-semibold text-sky-400">{t.thinking}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </main>

      {/* Footer & Input Controls */}
      <footer className={`px-4 py-4 md:px-8 bg-gradient-to-t ${isLight ? 'from-slate-50 via-slate-50/95' : 'from-[#0f172a] via-[#0f172a]/95'} to-transparent fixed bottom-0 transition-all duration-300 ${sidebarCollapsed ? 'left-0 lg:left-20' : 'left-0 lg:left-64'} right-0 z-20`}>
        <div className="max-w-4xl mx-auto space-y-3">
          
          {/* Quick Suggestions */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" /> Quick:
            </span>
            {quickSuggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(suggestion)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all border shrink-0 ${
                  isLight 
                    ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-sm' 
                    : 'bg-slate-800/80 hover:bg-[#22396F]/40 border-slate-700/60 text-slate-300 hover:text-sky-300'
                }`}
              >
                {suggestion}
              </button>
            ))}
          </div>

          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="relative flex items-center gap-3"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.placeholder}
                className={`w-full ${isLight ? 'bg-white border-slate-300 text-slate-900 shadow-md' : 'bg-slate-800/80 border-slate-700/80 text-slate-100 shadow-xl'} backdrop-blur-xl border px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500/40 transition-all pr-28 placeholder:text-slate-400`}
                disabled={isLoading}
              />
              
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <button 
                  type="button"
                  onClick={toggleListening}
                  title={isListening ? "Listening..." : "Voice input"}
                  className={`p-2.5 rounded-xl transition-all duration-300 ${
                    isListening 
                      ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/40' 
                      : 'text-slate-400 hover:text-sky-400 hover:bg-slate-700/30'
                  }`}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                
                <button 
                  type="submit" 
                  disabled={!input.trim() || isLoading}
                  className="p-2.5 bg-[#22396F] hover:bg-[#2a4585] disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button 
              type="button"
              onClick={startVoiceAssistant}
              title="Full Voice Mode"
              className="w-12 h-12 bg-[#22396F] hover:bg-[#2a4585] text-sky-300 rounded-2xl flex items-center justify-center transition-all shadow-lg hover:scale-105 active:scale-95 shrink-0 border border-sky-400/20"
            >
              <Sparkles className="w-6 h-6" />
            </button>
          </form>
        </div>
      </footer>

      {/* Voice Assistant Overlay */}
      {isAssistantActive && (
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${isLight ? 'bg-slate-900/95' : 'bg-slate-950/95'} backdrop-blur-2xl animate-fade-in text-white p-6`}>
          <button 
            onClick={() => {
              setIsAssistantActive(false);
              window.speechSynthesis.cancel();
              recognitionRef.current?.stop();
            }}
            className="absolute top-6 right-6 p-3.5 bg-slate-800 hover:bg-slate-700 rounded-full text-white transition-colors shadow-2xl border border-white/10"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative mb-12">
            {/* Interactive Glowing Orb */}
            <button
              onClick={() => {
                if (assistantState === 'listening') {
                  recognitionRef.current?.stop();
                  setAssistantState('idle');
                } else {
                  startListeningInAssistant();
                }
              }}
              className={`w-36 h-36 rounded-full bg-gradient-to-tr from-[#22396F] to-sky-500 flex items-center justify-center shadow-[0_0_60px_rgba(34,57,111,0.8)] transition-all cursor-pointer ${assistantState === 'listening' ? 'scale-110 ring-8 ring-sky-400/30 animate-pulse' : 'hover:scale-105'}`}
            >
              {assistantState === 'listening' ? (
                <Mic className="w-16 h-16 text-white animate-bounce" />
              ) : (
                <Bot className="w-16 h-16 text-white" />
              )}
            </button>
          </div>

          <div className="text-center space-y-3 max-w-md">
            <h2 className="text-3xl font-black tracking-tight text-white">
              {assistantState === 'speaking' ? t.speaking : assistantState === 'listening' ? t.listening : (isHindi ? "बोलने के लिए माइक दबाएं" : "Tap Orb to Speak")}
            </h2>
            <p className="text-sky-300 font-semibold text-sm">
              {assistantState === 'listening' ? (isHindi ? "मैं आपकी आवाज़ सुन रही हूँ..." : "I am listening to your voice...") : (isHindi ? "डोज़मेट आपकी देखभाल सहायक" : "DoseMate is ready")}
            </p>
          </div>

          {/* Subtitle / Feedback Box */}
          {lastSpokenText && (
            <div className="mt-8 max-w-lg w-full px-6 py-4 bg-white/10 border border-white/15 rounded-2xl text-center text-slate-200 text-sm md:text-base leading-relaxed backdrop-blur-md shadow-2xl">
              "{lastSpokenText}"
            </div>
          )}

          <div className="mt-8 flex gap-3">
            <button
              onClick={() => startListeningInAssistant()}
              className="px-6 py-2.5 bg-[#22396F] hover:bg-[#2a4585] text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg border border-sky-400/30"
            >
              <Mic className="w-4 h-4" /> {isHindi ? "फिर से बोलें" : "Speak Again"}
            </button>
            <button
              onClick={() => {
                setIsAssistantActive(false);
                window.speechSynthesis.cancel();
              }}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-sm"
            >
              {isHindi ? "चैट में वापस जाएं" : "Back to Chat"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}



