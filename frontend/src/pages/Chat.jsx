import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, Mic, MicOff, Volume2, ArrowLeft, Sparkles, PhoneCall, X, Globe } from 'lucide-react';
import { getGeminiResponse } from '../gemini';
import { useVoice } from '../hooks/useVoice';
import { translations } from '../utils/translations';

import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';


export default function Chat({ user }) {
  const { settings, updateSettings, sidebarCollapsed } = useUser();

  const t = translations[settings.language] || translations.English;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAssistantActive, setIsAssistantActive] = useState(false);
  const [assistantState, setAssistantState] = useState('idle'); // 'idle', 'speaking', 'listening'
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const { speak, listen, stopListening, isListening } = useVoice();
  const location = useLocation();

  // Initial Greeting & Auto-start voice if requested
  useEffect(() => {
    const greeting = "Hello! Main aaj aapki kaise madad kar sakti hoon? Kya aapne apni dawaiyan le li hain?";
    
    // Check for auto-start voice parameter
    const params = new URLSearchParams(location.search);
    if (params.get('startVoice') === 'true') {
      startVoiceAssistant();
    } else {
      setMessages([{ role: 'assistant', message: greeting }]);
      const timer = setTimeout(() => {
        speak(greeting);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [speak, location.search]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      listen((transcript) => {
        setInput(transcript);
      });
    }
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setIsLoading(true);

    const updatedMessages = [...messages, { role: 'user', message: userMsg }];
    setMessages(updatedMessages);

    try {
      const aiResponse = await getGeminiResponse(messages, userMsg, settings.language);
      setMessages(prev => [...prev, { role: 'assistant', message: aiResponse }]);
      speak(aiResponse, settings.language === 'Hindi' ? 'hi-IN' : 'en-US');
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', message: "Maaf kijiye, main abhi thoda thak gayi hoon. Kya hum thodi der baad baat kar sakte hain?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Voice Assistant Flow
  const startVoiceAssistant = () => {
    setIsAssistantActive(true);
    setAssistantState('speaking');
    const greeting = "Hello! Main MemoAi hoon. Main aapki kya madad kar sakti hoon?";
    
    speak(greeting, 'hi-IN', () => {
      startListeningInAssistant();
    });
  };

  const startListeningInAssistant = () => {
    setAssistantState('listening');
    recognitionRef.current = listen(async (transcript) => {
      if (!transcript) {
        setIsAssistantActive(false);
        return;
      }
      
      setAssistantState('speaking');
      // Optimistic UI for overlay context if needed, but for now just process
      try {
        const aiResponse = await getGeminiResponse(messages, transcript, settings.language);
        setMessages(prev => [...prev, { role: 'user', message: transcript }, { role: 'assistant', message: aiResponse }]);
        
        speak(aiResponse, settings.language === 'Hindi' ? 'hi-IN' : 'en-US', () => {
          // You could loop here for continuous conversation
          setIsAssistantActive(false); 
        });
      } catch (err) {
        setIsAssistantActive(false);
      }
    });
  };

  const isLight = settings.theme === 'light';

  return (
    <div className={`min-h-screen ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#0f172a] text-slate-100'} flex flex-col font-sans selection:bg-indigo-500/30 overflow-hidden`}>
      {/* Premium Header */}
      <header className={`fixed top-0 z-40 backdrop-blur-xl ${isLight ? 'bg-white/70 border-slate-200' : 'bg-slate-900/70 border-slate-800/50'} border-b px-4 py-3 flex items-center justify-between transition-all duration-300 ${sidebarCollapsed ? 'left-20' : 'left-0 md:left-64'} right-0`}>


        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></div>
            </div>
            <div>
              <h1 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400'}`}>
                MemoAi
              </h1>

              <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-semibold">{t.careAssistant}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => updateSettings({ language: settings.language === 'English' ? 'Hindi' : 'English' })}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-xl text-xs font-bold text-indigo-400 transition-all border border-indigo-500/20"
          >
            <Globe className="w-4 h-4" /> {settings.language === 'English' ? 'हिन्दी' : 'English'}
          </button>
          <button className={`${isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-800 border-slate-700/50 text-white'} hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all border`}>
             <PhoneCall className="w-4 h-4 text-green-400" /> {t.emergencyCall}
          </button>
        </div>
      </header>


      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 max-w-4xl mx-auto w-full space-y-8 scrollbar-hide pb-32 mt-16">

        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-slate-800 border border-slate-700 text-slate-300' 
                : 'bg-indigo-500 text-white'
            }`}>
              {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>

            <div className={`group relative max-w-[85%] md:max-w-[75%] p-4 rounded-2xl shadow-xl transition-all ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none border border-indigo-400/20' 
                : `${isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-800/80 backdrop-blur-md border-slate-700/50 text-slate-100'} rounded-tl-none border`
            }`}>

              <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                {msg.message}
              </div>
              
              {msg.role === 'assistant' && (
                <button 
                  onClick={() => speak(msg.message)}
                  className="absolute -right-10 top-2 p-2 text-slate-500 hover:text-indigo-400 transition-colors"
                  title="Listen again"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
              
              <div className={`absolute bottom-[-18px] text-[10px] text-slate-500 font-medium ${msg.role === 'user' ? 'right-0' : 'left-0'}`}>
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4 animate-pulse">
            <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className={`${isLight ? 'bg-white border-slate-200' : 'bg-slate-800/50 border-slate-700/50'} p-4 rounded-2xl rounded-tl-none flex items-center gap-3 border`}>

              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
              </div>
              <span className="text-xs text-slate-400 font-medium">{t.thinking}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </main>

      {/* Input Section */}
      <footer className={`px-4 py-6 md:px-8 bg-gradient-to-t ${isLight ? 'from-slate-50 via-slate-50/80' : 'from-slate-950 via-slate-950/80'} to-transparent fixed bottom-0 transition-all duration-300 ${sidebarCollapsed ? 'left-20' : 'left-0 md:left-64'} right-0 z-20`}>
        <div className="max-w-4xl mx-auto">


          <form 
            onSubmit={handleSend}
            className="relative flex items-center gap-4 animate-slide-up"
          >
            <div className="relative flex-1 group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.placeholder}
                className={`w-full ${isLight ? 'bg-white border-slate-200 text-slate-900 shadow-lg' : 'bg-slate-800/40 border-white/10 text-slate-100 shadow-[0_8px_32px_rgba(0,0,0,0.4)]'} backdrop-blur-2xl border px-7 py-5 rounded-[2rem] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all pr-32 placeholder:text-slate-500 group-hover:bg-opacity-80`}
                disabled={isLoading}
              />

              
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button 
                  type="button"
                  onClick={toggleListening}
                  title={isListening ? "Stop listening" : "Voice input"}
                  className={`p-3 rounded-full transition-all duration-300 ${
                    isListening 
                      ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30' 
                      : 'text-slate-400 hover:text-indigo-400 hover:bg-white/5'
                  }`}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                
                <button 
                  type="submit" 
                  disabled={!input.trim() || isLoading}
                  className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-full transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center justify-center"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button 
              type="button"
              onClick={startVoiceAssistant}
              title="Full Voice Mode"
              className="hidden md:flex w-14 h-14 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 rounded-full items-center justify-center transition-all border border-indigo-500/20 hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-6 h-6" />
            </button>
          </form>
        </div>
      </footer>

      {/* Voice Assistant Overlay */}
      {isAssistantActive && (
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${isLight ? 'bg-slate-50/95' : 'bg-slate-950/90'} backdrop-blur-2xl animate-fade-in`}>

          <button 
            onClick={() => {
              setIsAssistantActive(false);
              window.speechSynthesis.cancel();
              recognitionRef.current?.stop();
            }}
            className="absolute top-8 right-8 p-4 bg-slate-800 hover:bg-slate-700 rounded-full text-white transition-colors shadow-xl"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="relative mb-20">
            {/* Pulsating Orb */}
            <div className={`w-40 h-40 rounded-full bg-indigo-500 flex items-center justify-center shadow-[0_0_80px_rgba(79,70,229,0.6)] ${assistantState === 'listening' ? 'animate-pulse' : 'animate-bounce'}`}>
              {assistantState === 'listening' ? <Mic className="w-20 h-20 text-white" /> : <Bot className="w-20 h-20 text-white" />}
            </div>
            {/* Visualizer Rings */}
            <div className="absolute inset-0 -z-10 animate-ping opacity-20 bg-indigo-400 rounded-full"></div>
            <div className="absolute inset-0 -z-10 animate-ping delay-300 opacity-10 bg-indigo-400 rounded-full"></div>
          </div>

          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              {assistantState === 'speaking' ? t.speaking : t.listening}
            </h2>
            <p className="text-indigo-400 font-bold uppercase tracking-widest animate-pulse">
              {assistantState === 'listening' ? t.wait : t.listen}
            </p>
          </div>

          {/* User Transcript Preview */}
          {assistantState === 'listening' && (
            <div className={`mt-12 max-w-lg px-8 py-4 ${isLight ? 'bg-indigo-50 border-indigo-100 text-indigo-900' : 'bg-white/5 border-white/10 text-slate-300'} border rounded-2xl italic animate-slide-up`}>
              "{t.boliye}"
            </div>

          )}
        </div>
      )}
    </div>
  );
}


