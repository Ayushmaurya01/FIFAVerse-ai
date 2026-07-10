import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import type { AppLanguage } from '../context/AppContext';
import { getGeminiResponse } from '../services/gemini';
import GlassCard from '../components/common/GlassCard';
import { Sparkles, Send, Volume2, Mic, MicOff, Globe, ArrowDown, User, Bot, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

const SAMPLE_QUESTIONS: Record<AppLanguage, string[]> = {
  en: [
    'Where is the nearest medical station?',
    'What is the quickest way to Parking Lot B?',
    'Show me the bus schedule to Downtown Hub',
    'How do volunteers handle a lost child incident?'
  ],
  es: [
    '¿Dónde está la estación médica más cercana?',
    '¿Cuál es la ruta más rápida al Estacionamiento B?',
    'Muestra el horario de autobús al centro',
    '¿Cómo manejan los voluntarios un caso de niño perdido?'
  ],
  fr: [
    'Où se trouve le poste médical le plus proche?',
    'Quel est le chemin le plus rapide vers le parking B?',
    'Horaires de bus pour le centre-ville',
    'Comment gérer la perte d\'un enfant?'
  ],
  pt: [
    'Onde fica o posto médico mais próximo?',
    'Qual é o caminho mais rápido para o Estacionamento B?',
    'Mostrar horários de ônibus para o Centro',
    'Como voluntários lidam com crianças perdidas?'
  ],
  ar: [
    'أين تقع أقرب محطة إسعافات أولية؟',
    'ما هو أسرع طريق لموقف السيارات B؟',
    'أظهر لي جدول مواصلات الحافلات إلى وسط المدينة',
    'كيف يتعامل المتطوعون مع حالة طفل مفقود؟'
  ],
  hi: [
    'निकटतम चिकित्सा केंद्र कहाँ है?',
    'पार्किंग स्थल B का सबसे तेज़ मार्ग क्या है?',
    'डाउनटाउन हब के लिए बस कार्यक्रम दिखाएं',
    'स्वयंसेवक खोए हुए बच्चे की घटना को कैसे संभालते हैं?'
  ]
};

const INITIAL_GREETINGS: Record<AppLanguage, string> = {
  en: "Hello! I am your FIFAVerse AI assistant. How can I assist you with stadium navigation, crowd alerts, transit schedules, or emergency SOPs today?",
  es: "¡Hola! Soy tu asistente FIFAVerse AI. ¿En qué puedo ayudarte hoy con la navegación del estadio, alertas de multitudes, horarios de transporte o SOP de emergencia?",
  fr: "Bonjour! Je suis votre assistant FIFAVerse AI. Comment puis-je vous aider aujourd'hui pour la navigation dans le stade, les alertes de foule, les transports ou la sécurité?",
  pt: "Olá! Eu sou o seu assistente FIFAVerse AI. Como posso ajudar você hoje com navegação, alertas de público, horários de transporte ou emergências?",
  ar: "مرحباً! أنا مساعد FIFAVerse AI الخاص بك. كيف يمكنني مساعدتك اليوم في التنقل، أو تنبيهات الحشود، أو جداول النقل، أو بروتوكولات الطوارئ؟",
  hi: "नमस्ते! मैं आपका FIFAVerse AI सहायक हूँ। आज मैं स्टेडियम नेविगेशन, भीड़ अलर्ट, पारगमन कार्यक्रम या आपातकालीन एसओपी में आपकी क्या सहायता कर सकता हूँ?"
};

const MultilingualAI: React.FC = () => {
  const { language, setLanguage, speakText, stopSpeaking, t } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [listening, setListening] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Web Speech API setup
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Seed initial greeting on start or language change
    setMessages([
      {
        id: 'msg-init',
        sender: 'ai',
        text: INITIAL_GREETINGS[language],
        timestamp: new Date()
      }
    ]);
  }, [language]);

  useEffect(() => {
    // Scroll to bottom of chat
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      
      // Match locale parameters
      const getLangCode = () => {
        if (language === 'es') return 'es-ES';
        if (language === 'fr') return 'fr-FR';
        if (language === 'pt') return 'pt-PT';
        if (language === 'ar') return 'ar-SA';
        if (language === 'hi') return 'hi-IN';
        return 'en-US';
      };
      
      rec.lang = getLangCode();

      rec.onstart = () => {
        setListening(true);
      };
      
      rec.onend = () => {
        setListening(false);
      };
      
      rec.onerror = () => {
        setListening(false);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
      };

      setRecognition(rec);
    }
  }, [language]);

  const handleStartListening = () => {
    if (recognition) {
      try {
        recognition.start();
      } catch (e) {
        console.error(e);
      }
    } else {
      const txt = prompt("Speech Recognition API offline. Type simulated voice query:");
      if (txt) setInputValue(txt);
    }
  };

  const handleSendMessage = async (text: string = inputValue) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    // Prompt containing instructions to output in selected language
    const prompt = `System Instructions: You must write your output entirely in the language corresponding to code: ${language}. Under no circumstances output in English if the code is not "en". Query: ${text}`;

    try {
      const response = await getGeminiResponse(prompt, 'translation');
      
      const aiMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'ai',
        text: response,
        timestamp: new Date()
      };
      
      setMessages((prev) => [...prev, aiMsg]);
      
      // Auto speak response
      speakText(response);
    } catch (e) {
      const errMsg: ChatMessage = {
        id: 'msg-err',
        sender: 'ai',
        text: 'Error communication with translation nodes.',
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-fifa-teal text-sm font-bold uppercase tracking-wider">
            <Globe className="h-4 w-4" />
            <span>Module 05 & Assistant</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">Multilingual AI Assistant</h1>
          <p className="text-slate-400 text-sm max-w-md">
            Query the operations intelligence model in six tournament languages. Tap the microphone icon for voice inputs.
          </p>
        </div>

        {/* Quick Language Selector */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-1.5 w-fit">
          {(['en', 'es', 'fr', 'pt', 'ar', 'hi'] as AppLanguage[]).map((lang) => (
            <button
              key={lang}
              onClick={() => {
                setLanguage(lang);
                stopSpeaking();
              }}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold uppercase transition-all ${
                language === lang 
                  ? 'bg-fifa-teal text-fifa-dark shadow-neon-teal/20 scale-105' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[600px]">
        {/* Left Suggestions Pane */}
        <div className="lg:col-span-4 flex flex-col justify-between">
          <GlassCard hoverEffect={false} className="border-white/5 h-full space-y-4 flex flex-col justify-start">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
              <HelpCircle className="h-4.5 w-4.5 text-fifa-teal" />
              <span>Suggested Queries</span>
            </h3>
            
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[480px]">
              {SAMPLE_QUESTIONS[language].map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="p-3 text-left rounded-xl border border-white/5 bg-white/5 text-xs text-slate-300 font-semibold hover:bg-white/10 hover:border-white/15 transition-all leading-relaxed"
                >
                  {q}
                </button>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Chat Pane */}
        <div className="lg:col-span-8 flex flex-col h-full bg-fifa-purple/10 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md">
          {/* Header */}
          <div className="bg-white/5 border-b border-white/5 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gradient-to-tr from-fifa-teal to-fifa-pink p-[1.5px] shrink-0">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-fifa-dark text-white font-bold text-sm">
                  AI
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Gemini Ops Node</h4>
                <p className="text-[10px] text-fifa-teal font-semibold flex items-center gap-1">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fifa-teal opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-fifa-teal"></span>
                  </span>
                  Context Sync: Active
                </p>
              </div>
            </div>

            <button
              onClick={stopSpeaking}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 hover:bg-white/10 font-bold"
            >
              Stop Voice
            </button>
          </div>

          {/* Conversation Bubbles */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((msg) => {
              const isAI = msg.sender === 'ai';
              return (
                <div
                  key={msg.id}
                  className={`flex ${isAI ? 'justify-start' : 'justify-end'} gap-3 items-start`}
                >
                  {isAI && (
                    <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 shrink-0">
                      <Bot className="h-4.5 w-4.5" />
                    </div>
                  )}
                  
                  <div className="relative group max-w-[80%]">
                    <div
                      className={`rounded-2xl p-4 text-sm leading-relaxed font-medium whitespace-pre-line ${
                        isAI
                          ? 'bg-fifa-purple/40 border border-white/5 text-slate-200'
                          : 'bg-fifa-blue text-white rounded-tr-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                    
                    {/* TTS Play Button for AI Messages */}
                    {isAI && (
                      <button
                        onClick={() => speakText(msg.text)}
                        className="absolute -right-7 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all"
                        title="Read aloud (TTS)"
                      >
                        <Volume2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  {!isAI && (
                    <div className="h-8 w-8 rounded-full bg-fifa-blue flex items-center justify-center text-white shrink-0 font-bold text-xs uppercase">
                      U
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing Indicator */}
            {loading && (
              <div className="flex justify-start gap-3 items-start">
                <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 shrink-0 animate-pulse">
                  <Bot className="h-4.5 w-4.5" />
                </div>
                <div className="rounded-2xl p-4 bg-fifa-purple/20 border border-white/5 flex gap-1.5 items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
                  <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
                  <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" />
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Form Input Box */}
          <div className="p-4 bg-white/5 border-t border-white/5 flex gap-3 items-center">
            {/* Mic trigger */}
            <button
              onClick={handleStartListening}
              className={`p-3.5 rounded-xl border flex items-center justify-center transition-all shrink-0 ${
                listening
                  ? 'bg-fifa-red/20 border-fifa-red text-fifa-red animate-pulse'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
              title="Voice Input"
            >
              {listening ? <MicOff className="h-4.5 w-4.5" /> : <Mic className="h-4.5 w-4.5" />}
            </button>

            {/* Input field */}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={t('search') + "..."}
              className="flex-1 rounded-xl bg-fifa-purple border border-white/10 px-4 py-3.5 text-sm text-slate-200 focus:outline-none focus:border-fifa-teal"
            />

            {/* Send trigger */}
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || loading}
              className="p-3.5 rounded-xl bg-fifa-blue text-white hover:bg-fifa-blue/80 hover:shadow-neon-teal/10 transition-all shrink-0 flex items-center justify-center disabled:opacity-50 disabled:hover:bg-fifa-blue"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultilingualAI;
