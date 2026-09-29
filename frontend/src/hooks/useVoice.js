import { useCallback, useEffect, useState, useRef } from 'react';

export const useVoice = () => {
  const [voices, setVoices] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const loadVoices = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const availableVoices = window.speechSynthesis.getVoices();
        if (availableVoices && availableVoices.length > 0) {
          setVoices(availableVoices);
        }
      }
    };

    loadVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const speak = useCallback((text, lang = 'hi-IN', onEnd = null) => {
    if (typeof window === 'undefined' || !window.speechSynthesis || !text) {
      if (onEnd) onEnd();
      return;
    }
    
    // Clear any previous speaking timeouts
    if (timerRef.current) clearTimeout(timerRef.current);

    try {
      window.speechSynthesis.cancel();
      // Resume in case browser paused speech synthesis
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch (e) {
      console.warn("Speech synthesis reset warning:", e);
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    const availableVoices = window.speechSynthesis.getVoices() || voices;
    const targetPrefix = (lang || 'hi-IN').split('-')[0].toLowerCase();
    const langVoices = availableVoices.filter(v => v.lang && v.lang.toLowerCase().startsWith(targetPrefix));

    // Choose the most natural sounding voice available
    const bestVoice = langVoices.find(v => (v.name.includes('Google') || v.name.includes('Natural')) && v.name.includes('Female')) ||
                      langVoices.find(v => v.name.includes('Google') || v.name.includes('Natural')) ||
                      langVoices.find(v => v.name.includes('Female') || v.name.includes('Woman')) ||
                      langVoices[0];
    
    if (bestVoice && !bestVoice.name.includes('Microsoft David') && !bestVoice.name.includes('Microsoft Zira')) {
      utterance.voice = bestVoice;
    }

    utterance.lang = lang;
    utterance.rate = 0.95; // Gentle pace for elderly users
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    let hasEnded = false;
    const finish = () => {
      if (hasEnded) return;
      hasEnded = true;
      setIsSpeaking(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (onEnd) onEnd();
    };

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      finish();
    };

    utterance.onerror = (e) => {
      console.warn("Speech synthesis error:", e);
      finish();
    };

    // Safety fallback timer (approx 150 words per min = ~10 chars per second)
    const estimatedMs = Math.max(3000, (text.length / 10) * 1000 + 2000);
    timerRef.current = setTimeout(() => {
      if (!hasEnded) {
        finish();
      }
    }, estimatedMs);

    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Speech synthesis speak call failed:", err);
      finish();
    }
  }, [voices]);

  const listen = useCallback((onResult, lang = 'hi-IN') => {
    const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return null;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event) => {
      setIsListening(false);
      if (event.results && event.results[0] && event.results[0][0]) {
        const transcript = event.results[0][0].transcript;
        if (onResult) onResult(transcript);
      }
    };

    recognition.onerror = (event) => {
      console.warn("Speech recognition error:", event.error);
      setIsListening(false);
      if (event.error === 'no-speech' || event.error === 'network' || event.error === 'not-allowed') {
        // Safe callback with null
        if (onResult) onResult("");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.warn("Speech recognition start failed:", e);
      setIsListening(false);
    }

    return recognition;
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      setIsListening(false);
    }
  }, []);

  return { speak, listen, stopListening, isSpeaking, isListening, voices };
};



