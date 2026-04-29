import { useCallback, useEffect, useState, useRef } from 'react';

export const useVoice = () => {
  const [voices, setVoices] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback((text, lang = 'hi-IN', onEnd = null) => {
    if (!window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    const availableVoices = window.speechSynthesis.getVoices();
    const langVoices = availableVoices.filter(v => v.lang.startsWith(lang.split('-')[0]));

    // Prefer high-quality system voices (like Google or Microsoft Natural)
    // If no specific voice is found, browser default will be used (which user prefers)
    const bestVoice = langVoices.find(v => v.name.includes('Google') && v.name.includes('Female')) ||
                      langVoices.find(v => v.name.includes('Natural')) ||
                      langVoices.find(v => v.name.includes('Female')) ||
                      langVoices[0];
    
    if (bestVoice && !bestVoice.name.includes('Microsoft David') && !bestVoice.name.includes('Microsoft Zira')) {
      utterance.voice = bestVoice;
    }

    utterance.lang = lang;
    utterance.rate = 0.9; // Slightly slower for elderly
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);


  const listen = useCallback((onResult, lang = 'hi-IN') => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      onResult(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  return { speak, listen, stopListening, isSpeaking, isListening, voices };
};


