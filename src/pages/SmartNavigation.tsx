import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getGeminiResponse } from '../services/gemini';
import GlassCard from '../components/common/GlassCard';
import { Search, Navigation, AlertCircle, Compass, Accessibility, Activity, Zap, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface DestinationOption {
  id: string;
  name: string;
  category: 'gate' | 'seat' | 'restroom' | 'food' | 'medical' | 'merch' | 'parking';
  location: string;
}

const DESTINATIONS: DestinationOption[] = [
  { id: 'gate-a', name: 'Gate A (North)', category: 'gate', location: 'North Concourse' },
  { id: 'gate-b', name: 'Gate B (East)', category: 'gate', location: 'East Concourse' },
  { id: 'gate-c', name: 'Gate C (South)', category: 'gate', location: 'South Concourse' },
  { id: 'gate-d', name: 'Gate D (West)', category: 'gate', location: 'West Concourse' },
  { id: 'parking-a', name: 'Parking Lot A (VVIP)', category: 'parking', location: 'North Gate Outer' },
  { id: 'parking-b', name: 'Parking Lot B (General)', category: 'parking', location: 'East Gate Outer' },
  { id: 'sec-102', name: 'Section 102 - Row 1-20', category: 'seat', location: 'North Stand Lower' },
  { id: 'sec-108', name: 'Section 108 - Row 1-25', category: 'seat', location: 'East Stand Lower' },
  { id: 'sec-112', name: 'Section 112 - Row 1-30', category: 'seat', location: 'South Stand Lower' },
  { id: 'sec-204', name: 'Section 204 - Row 1-15', category: 'seat', location: 'West Stand Upper' },
  { id: 'restroom-n', name: 'Restroom Area (North)', category: 'restroom', location: 'Section 102' },
  { id: 'restroom-s', name: 'Restroom Area (South)', category: 'restroom', location: 'Section 112' },
  { id: 'food-court-e', name: 'Main Food Concourse', category: 'food', location: 'East Plaza' },
  { id: 'medical-s2', name: 'Medical Station B (AED)', category: 'medical', location: 'Sector 2 (Sec 108)' },
  { id: 'merch-w', name: 'Official FIFA Merch Store', category: 'merch', location: 'West Plaza' },
];

const SmartNavigation: React.FC = () => {
  const { speakText, t } = useApp();
  const [startPoint, setStartPoint] = useState<string>('gate-a');
  const [endPoint, setEndPoint] = useState<string>('sec-108');
  const [routeType, setRouteType] = useState<'best' | 'fastest' | 'wheelchair' | 'low_crowd'>('best');
  const [loading, setLoading] = useState<boolean>(false);
  const [aiAdvice, setAiAdvice] = useState<string>('');
  
  // Custom SVG map coordinates mapping for routes drawing
  // Coordinates are on a 500x500 box representing the stadium
  const getCoordinates = (id: string): { x: number; y: number } => {
    switch (id) {
      case 'gate-a': return { x: 250, y: 70 };
      case 'gate-b': return { x: 430, y: 250 };
      case 'gate-c': return { x: 250, y: 430 };
      case 'gate-d': return { x: 70, y: 250 };
      case 'parking-a': return { x: 250, y: 20 };
      case 'parking-b': return { x: 470, y: 250 };
      case 'sec-102': return { x: 250, y: 130 };
      case 'sec-108': return { x: 370, y: 250 };
      case 'sec-112': return { x: 250, y: 370 };
      case 'sec-204': return { x: 170, y: 200 };
      case 'restroom-n': return { x: 280, y: 110 };
      case 'restroom-s': return { x: 220, y: 390 };
      case 'food-court-e': return { x: 400, y: 200 };
      case 'medical-s2': return { x: 380, y: 270 };
      case 'merch-w': return { x: 110, y: 280 };
      default: return { x: 250, y: 250 };
    }
  };

  const handleGenerateRoute = async () => {
    setLoading(true);
    const startOpt = DESTINATIONS.find(d => d.id === startPoint);
    const endOpt = DESTINATIONS.find(d => d.id === endPoint);
    
    const prompt = `Calculate navigation route from ${startOpt?.name} (${startOpt?.location}) to ${endOpt?.name} (${endOpt?.location}) using routing profile: ${routeType}. Detail turn-by-turn directions, estimated time, safety checkpoints, and accessibility info.`;

    try {
      const response = await getGeminiResponse(prompt, 'navigation');
      setAiAdvice(response);
    } catch (e) {
      setAiAdvice('Error generating path details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const speakDirections = () => {
    if (aiAdvice) {
      speakText(aiAdvice);
    }
  };

  const startCoord = getCoordinates(startPoint);
  const endCoord = getCoordinates(endPoint);

  // SVG control points configuration for beautiful curves
  const getCurvePath = () => {
    const dx = endCoord.x - startCoord.x;
    const dy = endCoord.y - startCoord.y;
    
    // Choose control point offset based on routing profile
    let cx = (startCoord.x + endCoord.x) / 2;
    let cy = (startCoord.y + endCoord.y) / 2;

    if (routeType === 'wheelchair') {
      // Step-free routing has a wider sweep
      cx += dy * 0.35;
      cy -= dx * 0.35;
    } else if (routeType === 'low_crowd') {
      // Low crowd avoids the pitch center entirely (larger radius)
      cx += dy * 0.5;
      cy -= dx * 0.5;
    } else if (routeType === 'fastest') {
      // Direct path (mostly straight line)
      return `M ${startCoord.x} ${startCoord.y} L ${endCoord.x} ${endCoord.y}`;
    } else {
      // Default curved path
      cx += dy * 0.15;
      cy -= dx * 0.15;
    }

    return `M ${startCoord.x} ${startCoord.y} Q ${cx} ${cy} ${endCoord.x} ${endCoord.y}`;
  };

  const getRouteColor = () => {
    switch (routeType) {
      case 'fastest': return '#EC4899'; // Pink
      case 'wheelchair': return '#00E676'; // Accessible Green
      case 'low_crowd': return '#F59E0B'; // Gold
      default: return '#00F2FE'; // Teal
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-fifa-teal text-sm font-bold uppercase tracking-wider">
          <Navigation className="h-4 w-4" />
          <span>Module 01</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Smart Stadium Navigation</h1>
        <p className="text-slate-400 text-sm max-w-xl">
          Search for seating areas or facility points. Receive AI-engineered directions optimized for crowd levels and accessibility.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-4 space-y-6">
          <GlassCard glowColor="teal" className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
              <Compass className="h-5 w-5 text-fifa-teal" />
              <span>Route Parameters</span>
            </h2>

            {/* Start Point Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Starting Point</label>
              <div className="relative">
                <select
                  value={startPoint}
                  onChange={(e) => setStartPoint(e.target.value)}
                  className="w-full rounded-xl bg-fifa-purple border border-white/10 px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-fifa-teal appearance-none cursor-pointer"
                >
                  {DESTINATIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
              </div>
            </div>

            {/* End Point Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Target Facility / Seat</label>
              <div className="relative">
                <select
                  value={endPoint}
                  onChange={(e) => setEndPoint(e.target.value)}
                  className="w-full rounded-xl bg-fifa-purple border border-white/10 px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-fifa-teal appearance-none cursor-pointer"
                >
                  {DESTINATIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
              </div>
            </div>

            {/* Routing Profile Modes */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Routing Profile</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRouteType('best')}
                  className={`flex items-center gap-1.5 justify-center py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    routeType === 'best'
                      ? 'bg-fifa-teal/15 border-fifa-teal text-fifa-teal'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <Compass className="h-3.5 w-3.5" />
                  Best Route
                </button>
                <button
                  type="button"
                  onClick={() => setRouteType('fastest')}
                  className={`flex items-center gap-1.5 justify-center py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    routeType === 'fastest'
                      ? 'bg-fifa-pink/15 border-fifa-pink text-fifa-pink'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <Zap className="h-3.5 w-3.5" />
                  Fastest
                </button>
                <button
                  type="button"
                  onClick={() => setRouteType('wheelchair')}
                  className={`flex items-center gap-1.5 justify-center py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    routeType === 'wheelchair'
                      ? 'bg-green-500/15 border-green-500 text-green-400'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <Accessibility className="h-3.5 w-3.5" />
                  Wheelchair
                </button>
                <button
                  type="button"
                  onClick={() => setRouteType('low_crowd')}
                  className={`flex items-center gap-1.5 justify-center py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    routeType === 'low_crowd'
                      ? 'bg-yellow-500/15 border-yellow-500 text-yellow-400'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <Activity className="h-3.5 w-3.5" />
                  Low Crowd
                </button>
              </div>
            </div>

            {/* Calculate Button */}
            <button
              onClick={handleGenerateRoute}
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-fifa-blue to-fifa-teal text-white font-bold hover:shadow-neon-teal/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Reasoning Route...
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4" />
                  Calculate AI Route
                </>
              )}
            </button>
          </GlassCard>

          {/* AI Result Card */}
          {aiAdvice && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <GlassCard glowColor="none" className="bg-fifa-purple/35 border-white/5">
                <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                    <Zap className="h-4 w-4 text-fifa-teal" />
                    <span>AI Route Advice</span>
                  </div>
                  <button
                    onClick={speakDirections}
                    className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                    title="Speak Directions (TTS)"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line font-medium">
                  {aiAdvice}
                </div>
              </GlassCard>
            </motion.div>
          )}
        </div>

        {/* Stadium Map Column */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <GlassCard glowColor="none" className="w-full border-white/5 flex flex-col items-center p-4">
            <h3 className="text-sm font-bold text-slate-300 mb-4 self-start">Interactive Operations Seat-Map</h3>
            
            {/* SVG Stadium Map */}
            <div className="relative w-full aspect-square max-w-[480px] bg-fifa-darker/60 rounded-3xl border border-white/5 p-4 flex items-center justify-center overflow-hidden">
              <svg viewBox="0 0 500 500" className="w-full h-full select-none">
                {/* Stadium outer wall */}
                <ellipse cx="250" cy="250" rx="230" ry="210" fill="none" stroke="#2D1B68" strokeWidth="6" strokeDasharray="6 3" />
                <ellipse cx="250" cy="250" rx="220" ry="200" fill="none" stroke="#4C1D95" strokeWidth="2" />

                {/* Outer corridor walkways */}
                <ellipse cx="250" cy="250" rx="190" ry="170" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="30" />

                {/* Seating stands - split in quadrants */}
                {/* North Stand */}
                <path d="M 120 120 A 180 160 0 0 1 380 120 L 330 170 A 110 100 0 0 0 170 170 Z" fill="rgba(66, 133, 244, 0.08)" stroke="rgba(66, 133, 244, 0.3)" strokeWidth="1" />
                {/* East Stand */}
                <path d="M 380 120 A 180 160 0 0 1 380 380 L 330 330 A 110 100 0 0 0 330 170 Z" fill="rgba(236, 72, 153, 0.08)" stroke="rgba(236, 72, 153, 0.3)" strokeWidth="1" />
                {/* South Stand */}
                <path d="M 380 380 A 180 160 0 0 1 120 380 L 170 330 A 110 100 0 0 0 330 330 Z" fill="rgba(245, 158, 11, 0.08)" stroke="rgba(245, 158, 11, 0.3)" strokeWidth="1" />
                {/* West Stand */}
                <path d="M 120 380 A 180 160 0 0 1 120 120 L 170 170 A 110 100 0 0 0 170 330 Z" fill="rgba(16, 185, 129, 0.08)" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="1" />

                {/* Center Pitch */}
                <ellipse cx="250" cy="250" rx="90" ry="60" fill="#0D3512" stroke="#10B981" strokeWidth="2" />
                <line x1="250" y1="190" x2="250" y2="310" stroke="#10B981" strokeWidth="1" />
                <ellipse cx="250" cy="250" rx="25" ry="20" fill="none" stroke="#10B981" strokeWidth="1" />
                
                {/* Gates label markers */}
                <circle cx="250" cy="70" r="10" fill="#120A2A" stroke="#00F2FE" strokeWidth="1.5" />
                <text x="250" y="74" textAnchor="middle" fill="#00F2FE" fontSize="10" fontWeight="bold">A</text>

                <circle cx="430" cy="250" r="10" fill="#120A2A" stroke="#00F2FE" strokeWidth="1.5" />
                <text x="430" y="254" textAnchor="middle" fill="#00F2FE" fontSize="10" fontWeight="bold">B</text>

                <circle cx="250" cy="430" r="10" fill="#120A2A" stroke="#00F2FE" strokeWidth="1.5" />
                <text x="250" y="434" textAnchor="middle" fill="#00F2FE" fontSize="10" fontWeight="bold">C</text>

                <circle cx="70" cy="250" r="10" fill="#120A2A" stroke="#00F2FE" strokeWidth="1.5" />
                <text x="70" y="254" textAnchor="middle" fill="#00F2FE" fontSize="10" fontWeight="bold">D</text>

                {/* Facility location marks */}
                {/* Food Court */}
                <circle cx="400" cy="200" r="6" fill="#120A2A" stroke="#F59E0B" strokeWidth="1" />
                <text x="400" y="215" textAnchor="middle" fill="#94A3B8" fontSize="8" fontWeight="semibold">Food</text>
                
                {/* Restroom N */}
                <circle cx="280" cy="110" r="6" fill="#120A2A" stroke="#4285F4" strokeWidth="1" />
                <text x="280" y="103" textAnchor="middle" fill="#94A3B8" fontSize="8" fontWeight="semibold">WC</text>

                {/* Restroom S */}
                <circle cx="220" cy="390" r="6" fill="#120A2A" stroke="#4285F4" strokeWidth="1" />
                <text x="220" y="405" textAnchor="middle" fill="#94A3B8" fontSize="8" fontWeight="semibold">WC</text>

                {/* Merch */}
                <circle cx="110" cy="280" r="6" fill="#120A2A" stroke="#EC4899" strokeWidth="1" />
                <text x="110" y="295" textAnchor="middle" fill="#94A3B8" fontSize="8" fontWeight="semibold">Shop</text>

                {/* Medical */}
                <path d="M 377 270 L 383 270 M 380 267 L 380 273" stroke="#FF1744" strokeWidth="2" />
                <circle cx="380" cy="270" r="6" fill="none" stroke="#FF1744" strokeWidth="1" />
                <text x="380" y="282" textAnchor="middle" fill="#FF1744" fontSize="7" fontWeight="bold">Medical</text>

                {/* Route drawing overlay when points differ */}
                {startPoint !== endPoint && (
                  <>
                    {/* Animated path */}
                    <path
                      d={getCurvePath()}
                      fill="none"
                      stroke={getRouteColor()}
                      strokeWidth="4"
                      className="route-dash"
                      strokeLinecap="round"
                    />

                    {/* Static glow route background */}
                    <path
                      d={getCurvePath()}
                      fill="none"
                      stroke={getRouteColor()}
                      strokeWidth="8"
                      strokeOpacity="0.25"
                      strokeLinecap="round"
                    />

                    {/* Start Marker pin */}
                    <circle cx={startCoord.x} cy={startCoord.y} r="8" fill="#1F1545" stroke="#FFFFFF" strokeWidth="2" />
                    <circle cx={startCoord.x} cy={startCoord.y} r="3" fill="#10B981" />

                    {/* End Marker pin */}
                    <circle cx={endCoord.x} cy={endCoord.y} r="8" fill="#1F1545" stroke={getRouteColor()} strokeWidth="2" />
                    <circle cx={endCoord.x} cy={endCoord.y} r="3.5" fill="#FFFFFF" className="animate-ping" />
                  </>
                )}
              </svg>

              {/* Float Map Legend */}
              <div className="absolute bottom-4 left-4 bg-fifa-darker/90 border border-white/10 rounded-xl p-2.5 flex flex-col gap-1 z-10 text-[9px] font-bold">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <div className="h-2 w-2 rounded-full bg-fifa-teal" />
                  <span>Best Route</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <div className="h-2 w-2 rounded-full bg-fifa-pink" />
                  <span>Fastest Route</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span>Accessible Path</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  <span>Low Crowd Path</span>
                </div>
              </div>
            </div>

            {/* Note bar */}
            <div className="w-full max-w-[480px] mt-4 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-fifa-teal shrink-0 mt-0.5" />
              <span>
                To test custom routes, modify your starting location or target destination in the routing panel. Tap <strong>Calculate AI Route</strong> to query Gemini.
              </span>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default SmartNavigation;
