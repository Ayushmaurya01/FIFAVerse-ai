import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getGeminiResponse } from '../services/gemini';
import { addVolunteerTask } from '../services/dataService';
import GlassCard from '../components/common/GlassCard';
import { 
  Accessibility, 
  Volume2, 
  Mic, 
  MicOff, 
  Sparkles, 
  Check, 
  Eye, 
  Type, 
  HelpCircle, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AccessibilityHub: React.FC = () => {
  const { 
    accessibilityMode, 
    setAccessibilityMode, 
    speakText, 
    stopSpeaking, 
    t 
  } = useApp();

  const [largeText, setLargeText] = useState<boolean>(false);
  const [listening, setListening] = useState<boolean>(false);
  const [voiceQuery, setVoiceQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [accessibleInstructions, setAccessibleInstructions] = useState<string>('');
  const [assistanceStatus, setAssistanceStatus] = useState<'idle' | 'loading' | 'dispatched'>('idle');

  // Web Speech API Voice Recognition
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Check for standard Web Speech Recognition API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setListening(true);
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event);
        setListening(false);
      };

      rec.onend = () => {
        setListening(false);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceQuery(transcript);
        handleQuerySubmit(transcript);
      };

      setRecognition(rec);
    }
  }, []);

  const handleStartListening = () => {
    if (recognition) {
      try {
        recognition.start();
      } catch (e) {
        console.error('Failed to start speech recognition:', e);
      }
    } else {
      // Browser doesn't support Web Speech API
      // Simulate by opening a fallback prompt or alerting
      const simulatedText = prompt("Your browser doesn't support the Web Speech API. Type your voice query below to simulate voice command:", "Show me wheelchair elevator path to Section 102");
      if (simulatedText) {
        setVoiceQuery(simulatedText);
        handleQuerySubmit(simulatedText);
      }
    }
  };

  const handleQuerySubmit = async (queryText: string) => {
    if (!queryText.trim()) return;
    setLoading(true);
    const prompt = `Formulate accessibility directions for: "${queryText}". Focus on step-free paths, elevator locations, low-crowd corridors, and voice navigation instructions for visually impaired users.`;

    try {
      const response = await getGeminiResponse(prompt, 'accessibility');
      setAccessibleInstructions(response);
      
      // Auto read aloud the directions for visually impaired support
      speakText(response);
    } catch (e) {
      setAccessibleInstructions('Unable to fetch directions.');
    } finally {
      setLoading(false);
    }
  };

  const triggerSupportRequest = async () => {
    setAssistanceStatus('loading');
    
    // Create a live task for volunteers in the operations log
    await addVolunteerTask({
      title: 'Accessibility Escort Required',
      description: 'Wheelchair fan needs physical guiding from Gate A ticket gates to Section 102 Row 12.',
      status: 'pending',
      priority: 'high',
      location: 'Gate A Entry Lobby',
    });

    setTimeout(() => {
      setAssistanceStatus('dispatched');
      speakText("Assistance requested. A volunteer is heading to Gate A Entry Lobby now.");
    }, 1200);
  };

  // Sync font size scaling class to document body
  const toggleLargeText = () => {
    const nextVal = !largeText;
    setLargeText(nextVal);
    const root = document.documentElement;
    if (nextVal) {
      root.classList.add('text-lg-active');
      root.style.fontSize = '20px';
    } else {
      root.classList.remove('text-lg-active');
      root.style.fontSize = accessibilityMode ? '18px' : '';
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-fifa-teal text-sm font-bold uppercase tracking-wider">
          <Accessibility className="h-4 w-4" />
          <span>Module 04</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Accessibility Assistance Hub</h1>
        <p className="text-slate-400 text-sm max-w-xl">
          Configured for fans with mobility, visual, or hearing impairments. Enable high contrast, speak queries directly, or request volunteer escorts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Controls */}
        <div className="lg:col-span-5 space-y-6">
          <GlassCard glowColor="teal" className="space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-white/5 pb-2">Accessibility Options</h2>

            {/* Toggle Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* High Contrast */}
              <button
                onClick={() => setAccessibilityMode(!accessibilityMode)}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-28 transition-all ${
                  accessibilityMode
                    ? 'bg-fifa-teal/15 border-fifa-teal text-fifa-teal shadow-neon-teal/10'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <Eye className="h-6 w-6" />
                <div>
                  <p className="text-sm font-bold text-white">High Contrast</p>
                  <p className="text-[10px] text-slate-400">Increase visual legibility</p>
                </div>
              </button>

              {/* Large Text */}
              <button
                onClick={toggleLargeText}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-28 transition-all ${
                  largeText
                    ? 'bg-fifa-teal/15 border-fifa-teal text-fifa-teal shadow-neon-teal/10'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <Type className="h-6 w-6" />
                <div>
                  <p className="text-sm font-bold text-white">Large Text</p>
                  <p className="text-[10px] text-slate-400">Scale up paragraph fonts</p>
                </div>
              </button>
            </div>

            {/* Voice Navigator Box */}
            <div className="border-t border-white/5 pt-4 space-y-3">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Voice Command Navigator</span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleStartListening}
                  className={`p-4 rounded-xl border flex items-center justify-center transition-all ${
                    listening
                      ? 'bg-fifa-red/20 border-fifa-red text-fifa-red animate-pulse'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                  title="Speak query (STT)"
                >
                  {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>
                
                <div className="flex-1">
                  <input
                    type="text"
                    value={voiceQuery}
                    onChange={(e) => setVoiceQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleQuerySubmit(voiceQuery)}
                    placeholder={listening ? "Listening to query..." : "Speak or type accessibility route..."}
                    className="w-full rounded-xl bg-fifa-purple border border-white/10 px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-fifa-teal"
                  />
                </div>
              </div>

              {!recognition && (
                <span className="text-[10px] text-slate-500 block">
                  * Browser speech API offline. Click the mic button to run simulated text-voice routing.
                </span>
              )}
            </div>

            {/* Physical volunteer dispatcher */}
            <div className="border-t border-white/5 pt-4 space-y-3">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Physical Assistant Support</span>
              
              {assistanceStatus === 'idle' && (
                <button
                  onClick={triggerSupportRequest}
                  className="w-full py-3 rounded-xl border border-fifa-blue bg-fifa-blue/10 hover:bg-fifa-blue/20 text-fifa-blue font-bold transition-all text-xs uppercase"
                >
                  Request Mobility Escort Volunteer
                </button>
              )}
              {assistanceStatus === 'loading' && (
                <div className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 font-bold text-xs flex items-center justify-center gap-2">
                  <div className="h-4 w-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  Dispatching volunteers...
                </div>
              )}
              {assistanceStatus === 'dispatched' && (
                <div className="w-full py-3 rounded-xl bg-fifa-green/10 border border-fifa-green text-fifa-green font-bold text-xs flex items-center justify-center gap-2">
                  <CheckCircle className="h-4.5 w-4.5" />
                  Escort Dispatched to Gate A Lobby
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Right Side: Instructions & Audio Player */}
        <div className="lg:col-span-7 space-y-6">
          <GlassCard hoverEffect={false} className="border-white/5 space-y-4 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Volume2 className="h-4 w-4 text-fifa-teal" />
                  <span>Accessible Audio Directive</span>
                </h3>
                {accessibleInstructions && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => speakText(accessibleInstructions)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all flex items-center gap-1"
                    >
                      <Volume2 className="h-3 w-3" /> Replay Voice
                    </button>
                    <button
                      onClick={stopSpeaking}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all"
                    >
                      Stop Voice
                    </button>
                  </div>
                )}
              </div>

              {accessibleInstructions ? (
                <div className="text-slate-300 leading-relaxed font-semibold text-md bg-fifa-purple/20 p-4 rounded-2xl border border-white/5 whitespace-pre-line">
                  {accessibleInstructions}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-8 text-slate-500 border border-dashed border-white/10 rounded-2xl">
                  <HelpCircle className="h-10 w-10 mb-2 opacity-50" />
                  <p className="text-sm font-bold">No Voice Query Inputted</p>
                  <p className="text-xs max-w-xs mt-1">
                    Press the microphone button or type inside the input box to calculate elevator pathways and trigger audio playback.
                  </p>
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400 flex items-start gap-2 mt-6">
              <AlertCircle className="h-4 w-4 text-fifa-teal shrink-0 mt-0.5" />
              <span>
                <strong>WCAG Compliance checklist:</strong> This platform supports full screen-reader semantic elements, keyboard focus rings, and high contrast options.
              </span>
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
};

export default AccessibilityHub;
