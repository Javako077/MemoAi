import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, X, MessageSquare, Loader2 } from 'lucide-react';
import { useVoice } from '../hooks/useVoice';
import { getGeminiResponse } from '../gemini';

export default function VoiceAssistant({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastUserSpeech, setLastUserSpeech] = useState('');
  const { speak, listen, stopListening, isSpeaking, isListening } = useVoice();
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleOpen = () => {
    setIsOpen(true);
    const greeting = `Namaste ${user?.name || ''}, Main aapki kaise madad kar sakti hu?, Aap Mujhse Puchh sakte hai`;
    speak(greeting);
    setHistory([{ role: 'model', message: greeting }]);
  };

  const handleClose = () => {
    setIsOpen(false);
    stopListening();
    window.speechSynthesis.cancel();
  };

  const handleListen = () => {
    if (isListening) {
      stopListening();
      return;
    }

    listen(async (transcript) => {
      setLastUserSpeech(transcript);
      const newUserMsg = { role: 'user', message: transcript };
      setHistory(prev => [...prev, newUserMsg]);

      setIsProcessing(true);
      const aiResponse = await getGeminiResponse([...history, newUserMsg], transcript);
      setIsProcessing(false);

      setHistory(prev => [...prev, { role: 'model', message: aiResponse }]);
      speak(aiResponse);
    });
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={handleOpen}
        className="fixed bottom-8 right-8 w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all z-40 group overflow-hidden"
        title="Voice Assistant"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Volume2 className="w-8 h-8 text-white relative z-10" />
        {isSpeaking && (
          <span className="absolute inset-0 rounded-full border-4 border-indigo-400 animate-ping opacity-75" />
        )}
      </button>

      {/* Voice Assistant Popup */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-md overflow-hidden flex flex-col animate-slide-up max-h-[80vh] shadow-[0_0_50px_rgba(79,70,229,0.3)]">

            {/* Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-indigo-600/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">MemoAi Assistant</h3>
                  <p className="text-xs text-indigo-300">Always here to help</p>
                </div>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Chat History */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[300px] scrollbar-hide"
            >
              {history.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-white/10 text-slate-200 border border-white/10 rounded-tl-none'
                    }`}>
                    <p className="text-lg leading-relaxed">{msg.message}</p>
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-white/10 p-4 rounded-2xl rounded-tl-none border border-white/10">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                  </div>
                </div>
              )}
            </div>

            {/* Voice Control Area */}
            <div className="p-8 border-t border-white/10 flex flex-col items-center gap-6 bg-slate-900/50">
              {isListening ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-[-10px] bg-indigo-500/20 rounded-full animate-ping" />
                    <div className="absolute inset-[-20px] bg-indigo-500/10 rounded-full animate-ping [animation-delay:0.2s]" />
                    <button
                      onClick={stopListening}
                      className="w-20 h-20 bg-rose-500 rounded-full flex items-center justify-center relative z-10 shadow-lg shadow-rose-500/40"
                    >
                      <MicOff className="w-10 h-10 text-white" />
                    </button>
                  </div>
                  <p className="text-indigo-300 font-medium animate-pulse">Main sun rahi hu... Boliye</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 w-full">
                  <button
                    onClick={handleListen}
                    disabled={isProcessing || isSpeaking}
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl ${isProcessing || isSpeaking
                      ? 'bg-slate-700 cursor-not-allowed opacity-50'
                      : 'bg-indigo-600 hover:bg-indigo-500 hover:scale-110 active:scale-95 shadow-indigo-500/40'
                      }`}
                  >
                    <Mic className="w-10 h-10 text-white" />
                  </button>
                  <p className="text-slate-400 font-medium">Tap to Speak</p>
                </div>
              )}

              {lastUserSpeech && !isListening && !isProcessing && (
                <p className="text-sm text-slate-500 italic">" {lastUserSpeech} "</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
