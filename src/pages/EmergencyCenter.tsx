import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getGeminiResponse } from '../services/gemini';
import { createEmergencyAlert } from '../services/dataService';
import GlassCard from '../components/common/GlassCard';
import { ShieldAlert, Flame, Heart, Search, Users, RefreshCw, PhoneCall, Volume2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type EmergencyType = 'medical' | 'security' | 'fire' | 'lost_child' | 'evacuation';

interface EmergencyProfile {
  type: EmergencyType;
  label: string;
  desc: string;
  icon: any;
  color: string;
}

const EMERGENCY_PROFILES: EmergencyProfile[] = [
  { type: 'medical', label: 'Medical Emergency', desc: 'Heart issue, physical injury, faintness, or shock.', icon: Heart, color: 'from-red-500 to-rose-600 shadow-red-500/10 hover:shadow-red-500/20' },
  { type: 'security', label: 'Security Issue', desc: 'Fights, crowd unrest, vandalism, or suspicious object.', icon: ShieldAlert, color: 'from-orange-500 to-amber-600 shadow-orange-500/10 hover:shadow-orange-500/20' },
  { type: 'fire', label: 'Fire / Smoke', desc: 'Smoke detected, electric fire, or chemical sparks.', icon: Flame, color: 'from-amber-600 to-red-600 shadow-red-600/10 hover:shadow-red-600/20' },
  { type: 'lost_child', label: 'Lost Child Alert', desc: 'Minor child separated from parents or guardians.', icon: Users, color: 'from-purple-500 to-pink-600 shadow-purple-500/10 hover:shadow-purple-500/20' },
  { type: 'evacuation', label: 'Stadium Evacuation', desc: 'Immediate stadium-wide egress safety directive.', icon: ShieldAlert, color: 'from-red-600 to-red-800 shadow-red-800/15 hover:shadow-red-800/30' },
];

const EmergencyCenter: React.FC = () => {
  const { speakText, stopSpeaking } = useApp();
  const [activeEmergency, setActiveEmergency] = useState<EmergencyType | null>(null);
  const [sector, setSector] = useState<string>('Section 108 (East Stand)');
  const [details, setDetails] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [sopResult, setSopResult] = useState<string>('');
  const [resolved, setResolved] = useState<boolean>(false);

  const handleTriggerSOS = async (type: EmergencyType) => {
    setActiveEmergency(type);
    setLoading(true);
    setResolved(false);

    // 1. Create a database record (Firestore or LocalStorage)
    const profile = EMERGENCY_PROFILES.find(p => p.type === type);
    await createEmergencyAlert({
      type,
      location: sector,
      details: details || `SOS Alert triggered: ${profile?.label} in ${sector}.`,
    });

    // 2. Query Gemini for specific SOP instructions
    const prompt = `EMERGENCY ALERT: ${type.toUpperCase()}. Location: ${sector}. Detail description: ${details || 'SOS activated by spectator'}. Calculate the nearest emergency exit, nearest medical kit location, safe evacuation pathway avoiding bottlenecks, and step-by-step instructions.`;

    try {
      const response = await getGeminiResponse(prompt, 'emergency');
      setSopResult(response);
      
      // Speak emergency directions aloud immediately (TTS)
      speakText(`Emergency Warning: ${profile?.label} activated. Please listen carefully to the following instructions. ${response}`);
    } catch (e) {
      setSopResult('Failed to load SOP instructions. Please follow venue signs and look for security officers.');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = () => {
    stopSpeaking();
    setActiveEmergency(null);
    setSopResult('');
    setDetails('');
    setResolved(true);
    setTimeout(() => setResolved(false), 3000);
  };

  // Coordinates mapping to draw emergency paths
  // Center pitch is 250,250
  const getEmergencyRoutePath = (): string => {
    if (!activeEmergency) return '';
    
    switch (activeEmergency) {
      case 'fire':
        // Safe exit towards West Gate D (70, 250) from East Concourse (380, 270)
        return 'M 380 270 Q 250 180 70 250';
      case 'medical':
        // Direct route from East Concourse (380, 250) to Sector 2 Medical Room (380, 270)
        return 'M 370 250 L 380 270';
      case 'lost_child':
        // Pathway to Section 112 Booth (220, 390)
        return 'M 380 250 Q 300 370 220 390';
      case 'evacuation':
        // Outward arrows from gates. We'll return a special multi-line path or a standard escape line
        return 'M 250 130 L 250 60 M 370 250 L 440 250 M 250 370 L 250 440 M 170 200 L 60 250';
      default:
        return '';
    }
  };

  const getRouteColor = () => {
    if (activeEmergency === 'medical') return '#10B981'; // Green
    if (activeEmergency === 'lost_child') return '#EC4899'; // Pink
    return '#EF4444'; // Red for evacuation/fire/security
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-fifa-red text-sm font-bold uppercase tracking-wider">
          <ShieldAlert className="h-4 w-4 text-fifa-red animate-pulse" />
          <span>Module 06</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Emergency Response Center</h1>
        <p className="text-slate-400 text-sm max-w-xl">
          Instantly dispatch first-aid or security teams. Gemini calculates immediate evacuation steps, safe routing channels, and details emergency protocols.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Buttons and details */}
        <div className="lg:col-span-5 space-y-6">
          <GlassCard glowColor="pink" className="space-y-4 bg-red-950/10 border-red-500/10">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
              <ShieldAlert className="h-5 w-5 text-fifa-red" />
              <span>SOS Alert Dispatcher</span>
            </h2>

            {/* Current coordinates input */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Sector Location</label>
                <input
                  type="text"
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full rounded-xl bg-fifa-purple border border-white/10 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-fifa-red"
                  placeholder="e.g. Section 108"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Incident Details (Optional)</label>
                <input
                  type="text"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full rounded-xl bg-fifa-purple border border-white/10 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-fifa-red"
                  placeholder="e.g. Smoke coming from..."
                />
              </div>
            </div>

            {/* Quick dispatch buttons grid */}
            <div className="grid grid-cols-1 gap-2 pt-2">
              {EMERGENCY_PROFILES.map((profile) => {
                const Icon = profile.icon;
                const isActive = activeEmergency === profile.type;
                
                return (
                  <button
                    key={profile.type}
                    onClick={() => handleTriggerSOS(profile.type)}
                    disabled={activeEmergency !== null && !isActive}
                    className={`w-full p-4 rounded-2xl border text-left flex items-start gap-4 transition-all bg-gradient-to-r ${profile.color} ${
                      activeEmergency !== null && !isActive ? 'opacity-30 cursor-not-allowed' : 'hover:scale-[1.01]'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-white/10 text-white shrink-0 mt-0.5">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <span className="font-bold text-white text-sm block">{profile.label}</span>
                      <span className="text-[10px] text-slate-200 leading-normal block mt-0.5">{profile.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Resolve alert */}
            {activeEmergency && (
              <button
                onClick={handleResolve}
                className="w-full py-3 rounded-xl bg-fifa-green text-white font-bold hover:bg-emerald-500 transition-all flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="h-4.5 w-4.5" />
                Mark Incident Resolved / Clear SOS
              </button>
            )}
          </GlassCard>
          
          {/* Resolve indicator */}
          <AnimatePresence>
            {resolved && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="p-4 rounded-2xl bg-fifa-green/10 border border-fifa-green text-fifa-green font-bold text-sm flex items-center justify-center gap-2"
              >
                <ShieldCheck className="h-5 w-5" />
                <span>Incident marked resolved. Central Operations Command updated.</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Map & SOP Instructions */}
        <div className="lg:col-span-7 space-y-6">
          {/* Evacuation Routing Map */}
          <GlassCard hoverEffect={false} className="border-white/5 flex flex-col items-center p-4 bg-fifa-purple/10">
            <h3 className="text-sm font-bold text-slate-300 mb-4 self-start">Evacuation & Hazard Route Mapping</h3>

            <div className="relative w-full aspect-square max-w-[420px] bg-fifa-darker/60 rounded-3xl border border-white/5 p-4 flex items-center justify-center overflow-hidden">
              <svg viewBox="0 0 500 500" className="w-full h-full select-none">
                {/* Stadium Outline */}
                <ellipse cx="250" cy="250" rx="220" ry="200" fill="none" stroke="#2D1B68" strokeWidth="2" />
                <ellipse cx="250" cy="250" rx="190" ry="170" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="6" />

                {/* Pitch */}
                <ellipse cx="250" cy="250" rx="90" ry="60" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />

                {/* Gate Points */}
                <circle cx="250" cy="70" r="10" fill="#120A2A" stroke="#EF4444" strokeWidth="1.5" />
                <text x="250" y="74" textAnchor="middle" fill="#EF4444" fontSize="10" fontWeight="bold">A</text>

                <circle cx="430" cy="250" r="10" fill="#120A2A" stroke="#EF4444" strokeWidth="1.5" />
                <text x="430" y="254" textAnchor="middle" fill="#EF4444" fontSize="10" fontWeight="bold">B</text>

                <circle cx="250" cy="430" r="10" fill="#120A2A" stroke="#EF4444" strokeWidth="1.5" />
                <text x="250" y="434" textAnchor="middle" fill="#EF4444" fontSize="10" fontWeight="bold">C</text>

                <circle cx="70" cy="250" r="10" fill="#120A2A" stroke="#EF4444" strokeWidth="1.5" />
                <text x="70" y="254" textAnchor="middle" fill="#EF4444" fontSize="10" fontWeight="bold">D</text>

                {/* Medical Point Station */}
                <circle cx="380" cy="270" r="6" fill="#120A2A" stroke="#10B981" strokeWidth="1" />
                <path d="M 377 270 L 383 270 M 380 267 L 380 273" stroke="#10B981" strokeWidth="1.5" />
                <text x="380" y="282" textAnchor="middle" fill="#10B981" fontSize="7" fontWeight="bold">Medical</text>

                {/* Lost Child Area */}
                <circle cx="220" cy="390" r="6" fill="#120A2A" stroke="#EC4899" strokeWidth="1" />
                <text x="220" y="403" textAnchor="middle" fill="#EC4899" fontSize="7" fontWeight="bold">Reunion</text>

                {/* Active emergency hazard/route overlays */}
                {activeEmergency && (
                  <>
                    {/* Pulsating hazard source pin */}
                    <circle cx="380" cy="250" r="14" fill="rgba(239, 68, 68, 0.2)" className="animate-pulse" />
                    <circle cx="380" cy="250" r="6" fill="#EF4444" />
                    <circle cx="380" cy="250" r="20" fill="none" stroke="#EF4444" strokeWidth="1" strokeDasharray="3 3" className="animate-spin-slow" />

                    {/* Evacuation/SOS Route line */}
                    {activeEmergency !== 'evacuation' ? (
                      <>
                        <path
                          d={getEmergencyRoutePath()}
                          fill="none"
                          stroke={getRouteColor()}
                          strokeWidth="4"
                          className="route-dash"
                        />
                        <path
                          d={getEmergencyRoutePath()}
                          fill="none"
                          stroke={getRouteColor()}
                          strokeWidth="8"
                          strokeOpacity="0.25"
                        />
                      </>
                    ) : (
                      // Mass egress out lines
                      <g stroke="#EF4444" strokeWidth="3" strokeLinecap="round" className="route-dash" strokeDasharray="6 4">
                        <path d="M 250 160 L 250 85" />
                        <path d="M 350 250 L 415 250" />
                        <path d="M 250 340 L 250 415" />
                        <path d="M 150 250 L 85 250" />
                      </g>
                    )}
                  </>
                )}
              </svg>

              {/* Status banner */}
              {activeEmergency && (
                <div className="absolute top-4 left-4 bg-fifa-red/90 border border-fifa-red text-white font-bold rounded-xl px-3 py-1.5 text-xs pulse-glow-red z-10 uppercase tracking-wider">
                  ⚠️ SOS Active
                </div>
              )}
            </div>
          </GlassCard>

          {/* AI SOP Directions */}
          {activeEmergency && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <GlassCard glowColor="none" className="bg-red-950/5 border-red-500/10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase">
                    <ShieldAlert className="h-5 w-5 text-fifa-red" />
                    <span>Gemini Dispatch & SOP Instructions</span>
                  </h3>
                  <button
                    onClick={() => speakText(sopResult)}
                    className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center gap-2 p-6 text-slate-400 text-sm">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    Analyzing safety files and paths...
                  </div>
                ) : (
                  <div className="text-sm text-slate-200 leading-relaxed font-semibold whitespace-pre-line bg-white/5 p-4 rounded-xl border border-white/5">
                    {sopResult}
                  </div>
                )}

                <div className="flex items-center gap-3 justify-between bg-white/5 rounded-xl p-4">
                  <div className="text-left">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Safety Helpline</span>
                    <span className="text-sm font-black text-white">+1 (800) 2026-911</span>
                  </div>
                  <a
                    href="tel:18002026911"
                    className="px-4 py-2 rounded-xl bg-fifa-red text-white text-xs font-bold hover:bg-red-500 flex items-center gap-1.5"
                  >
                    <PhoneCall className="h-3.5 w-3.5" />
                    Call Command Center
                  </a>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </div>

      </div>
    </div>
  );
};

export default EmergencyCenter;
