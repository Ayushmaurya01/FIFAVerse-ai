import { useState, useCallback, useEffect } from 'react';

interface SpeechHookResult {
  isListening: boolean;
  transcript: string;
  speechError: string | null;
  startListening: (callback: (text: string) => void) => void;
  stopListening: () => void;
  speak: (text: string, lang?: string) => void;
  cancelSpeaking: () => void;
}

export function useSpeech(): SpeechHookResult {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<any>(null);

  // Initialize recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      setRecognition(rec);
    }
  }, []);

  const startListening = useCallback((callback: (text: string) => void) => {
    if (!recognition) {
      setSpeechError('Speech Recognition is not supported in this browser.');
      return;
    }

    setTranscript('');
    setSpeechError(null);
    setIsListening(true);

    recognition.onresult = (event: any) => {
      const resultText = event.results[0][0].transcript;
      setTranscript(resultText);
      callback(resultText);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setSpeechError(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (e: any) {
      console.warn('Recognition already started:', e.message);
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition]);

  const speak = useCallback((text: string, lang = 'en-US') => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech Synthesis is not supported in this browser.');
      return;
    }

    // Cancel active speech
    window.speechSynthesis.cancel();

    // Clean text of raw characters before reading
    const cleanText = text.replace(/[*#_`~🚨⚠️]/g, '').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    window.speechSynthesis.speak(utterance);
  }, []);

  const cancelSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    speechError,
    startListening,
    stopListening,
    speak,
    cancelSpeaking,
  };
}
export default useSpeech;
