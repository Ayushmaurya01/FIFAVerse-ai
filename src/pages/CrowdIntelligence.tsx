import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getGeminiResponse } from '../services/gemini';
import GlassCard from '../components/common/GlassCard';
import { Users, AlertTriangle, Play, Sparkles, Clock, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

type MatchPhase = 'pre_match' | 'halftime' | 'post_match';

interface HeatmapZone {
  id: string;
  name: string;
  density: 'low' | 'medium' | 'high';
  percentage: number;
  cx: number;
  cy: number;
  r: number;
}

const HEATMAP_DATA: Record<MatchPhase, HeatmapZone[]> = {
  pre_match: [
    { id: 'gate-a', name: 'Gate A (North Entrance)', density: 'high', percentage: 94, cx: 250, cy: 70, r: 40 },
    { id: 'gate-b', name: 'Gate B (East Entrance)', density: 'medium', percentage: 65, cx: 430, cy: 250, r: 35 },
    { id: 'gate-c', name: 'Gate C (South Entrance)', density: 'high', percentage: 88, cx: 250, cy: 430, r: 40 },
    { id: 'gate-d', name: 'Gate D (West Entrance)', density: 'low', percentage: 32, cx: 70, cy: 250, r: 25 },
    { id: 'concourse', name: 'Main Concourse', density: 'low', percentage: 25, cx: 250, cy: 250, r: 120 },
  ],
  halftime: [
    { id: 'gate-a', name: 'Gate A (North Entrance)', density: 'low', percentage: 10, cx: 250, cy: 70, r: 20 },
    { id: 'gate-b', name: 'Gate B (East Entrance)', density: 'low', percentage: 8, cx: 430, cy: 250, r: 20 },
    { id: 'gate-c', name: 'Gate C (South Entrance)', density: 'low', percentage: 12, cx: 250, cy: 430, r: 20 },
    { id: 'gate-d', name: 'Gate D (West Entrance)', density: 'low', percentage: 5, cx: 70, cy: 250, r: 15 },
    { id: 'concourse-n', name: 'North Concourse (Restrooms)', density: 'high', percentage: 92, cx: 280, cy: 110, r: 45 },
    { id: 'concourse-s', name: 'South Concourse (Restrooms)', density: 'high', percentage: 95, cx: 220, cy: 390, r: 45 },
    { id: 'food-e', name: 'Food Court (East)', density: 'high', percentage: 87, cx: 400, cy: 200, r: 40 },
    { id: 'merch-w', name: 'Merch Store (West)', density: 'medium', percentage: 58, cx: 110, cy: 280, r: 30 },
  ],
  post_match: [
    { id: 'gate-a', name: 'Gate A (North Exit)', density: 'high', percentage: 86, cx: 250, cy: 70, r: 35 },
    { id: 'gate-b', name: 'Gate B (East Exit)', density: 'high', percentage: 92, cx: 430, cy: 250, r: 45 },
    { id: 'gate-c', name: 'Gate C (South Exit)', density: 'high', percentage: 96, cx: 250, cy: 430, r: 45 },
    { id: 'gate-d', name: 'Gate D (West Exit)', density: 'medium', percentage: 60, cx: 70, cy: 250, r: 30 },
    { id: 'concourse', name: 'Main Concourse', density: 'high', percentage: 89, cx: 250, cy: 250, r: 130 },
  ]
};

const GATE_WAIT_TIMES = {
  pre_match: [
    { name: 'Gate A', minutes: 16, status: 'High' },
    { name: 'Gate B', minutes: 8, status: 'Normal' },
    { name: 'Gate C', minutes: 14, status: 'High' },
    { name: 'Gate D', minutes: 3, status: 'Low' },
  ],
  halftime: [
    { name: 'Gate A', minutes: 1, status: 'Low' },
    { name: 'Gate B', minutes: 1, status: 'Low' },
    { name: 'Gate C', minutes: 1, status: 'Low' },
    { name: 'Gate D', minutes: 1, status: 'Low' },
  ],
  post_match: [
    { name: 'Gate A', minutes: 12, status: 'High' },
    { name: 'Gate B', minutes: 18, status: 'Critical' },
    { name: 'Gate C', minutes: 22, status: 'Critical' },
    { name: 'Gate D', minutes: 7, status: 'Normal' },
  ]
};

const CrowdIntelligence: React.FC = () => {
  const { t } = useApp();
  const [phase, setPhase] = useState<MatchPhase>('pre_match');
  const [loading, setLoading] = useState<boolean>(false);
  const [prediction, setPrediction] = useState<string>('');

  const handleRunForecasting = async () => {
    setLoading(true);
    let promptPhaseText = '';
    if (phase === 'pre_match') promptPhaseText = 'Pre-Match spectator entry inflow (gates crowded)';
    if (phase === 'halftime') promptPhaseText = 'Halftime interval (stadium restrooms and food concourses packed)';
    if (phase === 'post_match') promptPhaseText = 'Post-Match spectator exit outflow (gates and transit links packed)';

    const prompt = `Perform congestion forecasting and queue predictions for stadium operations during: ${promptPhaseText}. List which areas are red zones, predict queue buildups over the next 15-45 minutes, recommend alternate pathways/gates, and give instructions for volunteer deployment.`;

    try {
      const response = await getGeminiResponse(prompt, 'crowd');
      setPrediction(response);
    } catch (e) {
      setPrediction('Failed to compile crowd forecasts. Connection nodes unresponsive.');
    } finally {
      setLoading(false);
    }
  };

  const getDensityColor = (density: 'low' | 'medium' | 'high') => {
    switch (density) {
      case 'high': return 'rgba(225, 29, 72, 0.5)'; // Red
      case 'medium': return 'rgba(245, 158, 11, 0.45)'; // Yellow/Gold
      default: return 'rgba(16, 185, 129, 0.35)'; // Green
    }
  };

  const getBadgeClass = (density: 'low' | 'medium' | 'high') => {
    switch (density) {
      case 'high': return 'bg-fifa-red/10 text-fifa-red border-fifa-red/20';
      case 'medium': return 'bg-fifa-gold/10 text-fifa-gold border-fifa-gold/20';
      default: return 'bg-fifa-green/10 text-fifa-green border-fifa-green/20';
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-fifa-pink text-sm font-bold uppercase tracking-wider">
          <Users className="h-4 w-4" />
          <span>Module 02</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Crowd Intelligence & Prediction</h1>
        <p className="text-slate-400 text-sm max-w-xl">
          Visualizes real-time stadium congestion density. Toggle match phases to simulate load distributions and run Gemini forecasting models.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side Controls & Wait times */}
        <div className="lg:col-span-4 space-y-6">
          {/* Controls */}
          <GlassCard glowColor="pink" className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
              <Clock className="h-5 w-5 text-fifa-pink" />
              <span>Simulation Controls</span>
            </h2>

            {/* Stage Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Match Timeline Phase</label>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => { setPhase('pre_match'); setPrediction(''); }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border text-left flex items-center justify-between transition-all ${
                    phase === 'pre_match'
                      ? 'bg-fifa-pink/15 border-fifa-pink text-fifa-pink shadow-neon-pink/10'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <span>1. Pre-Match Inflow</span>
                  <span className="text-[10px] opacity-75 font-normal">Gates Busy</span>
                </button>
                <button
                  onClick={() => { setPhase('halftime'); setPrediction(''); }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border text-left flex items-center justify-between transition-all ${
                    phase === 'halftime'
                      ? 'bg-fifa-pink/15 border-fifa-pink text-fifa-pink shadow-neon-pink/10'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <span>2. Halftime Interval</span>
                  <span className="text-[10px] opacity-75 font-normal">Concourses Packed</span>
                </button>
                <button
                  onClick={() => { setPhase('post_match'); setPrediction(''); }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border text-left flex items-center justify-between transition-all ${
                    phase === 'post_match'
                      ? 'bg-fifa-pink/15 border-fifa-pink text-fifa-pink shadow-neon-pink/10'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <span>3. Post-Match Outflow</span>
                  <span className="text-[10px] opacity-75 font-normal">Exits Overloaded</span>
                </button>
              </div>
            </div>

            {/* Run Forecast */}
            <button
              onClick={handleRunForecasting}
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-fifa-pink to-fifa-red text-white font-bold hover:shadow-neon-pink/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Running AI Models...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Run AI Forecasting
                </>
              )}
            </button>
          </GlassCard>

          {/* Wait Times Graph */}
          <GlassCard hoverEffect={false} className="border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Gate Checkpoint Wait Times</h3>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={GATE_WAIT_TIMES[phase]} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#120A2A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}
                    labelStyle={{ color: '#FFF', fontWeight: 'bold', fontSize: '12px' }}
                    itemStyle={{ color: '#00F2FE', fontSize: '11px' }}
                  />
                  <Bar dataKey="minutes" fill="#EC4899" radius={[4, 4, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold uppercase">
              <span>Avg Delay: {GATE_WAIT_TIMES[phase].reduce((acc, curr) => acc + curr.minutes, 0) / 4} mins</span>
              <span>Metric: Scan Wait times</span>
            </div>
          </GlassCard>
        </div>

        {/* Center/Right Map Heatmap */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* The Heatmap SVG */}
          <GlassCard hoverEffect={false} className="w-full border-white/5 flex flex-col items-center p-4">
            <div className="w-full flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-300">Live Congestion Density Heatmap Overlay</h3>
              <div className="flex gap-2">
                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" /> Red (High)
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" /> Yellow (Med)
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" /> Green (Low)
                </span>
              </div>
            </div>

            <div className="relative w-full aspect-square max-w-[480px] bg-fifa-darker/60 rounded-3xl border border-white/5 p-4 flex items-center justify-center overflow-hidden">
              <svg viewBox="0 0 500 500" className="w-full h-full select-none">
                {/* Stadium outer lines */}
                <ellipse cx="250" cy="250" rx="220" ry="200" fill="none" stroke="#2D1B68" strokeWidth="2" />
                <ellipse cx="250" cy="250" rx="190" ry="170" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="8" />

                {/* Seating stands quadrants */}
                <path d="M 120 120 A 180 160 0 0 1 380 120 L 330 170 A 110 100 0 0 0 170 170 Z" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
                <path d="M 380 120 A 180 160 0 0 1 380 380 L 330 330 A 110 100 0 0 0 330 170 Z" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
                <path d="M 380 380 A 180 160 0 0 1 120 380 L 170 330 A 110 100 0 0 0 330 330 Z" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
                <path d="M 120 380 A 180 160 0 0 1 120 120 L 170 170 A 110 100 0 0 0 170 330 Z" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />

                {/* Center Pitch */}
                <ellipse cx="250" cy="250" rx="90" ry="60" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1.5" />
                
                {/* Gate Points */}
                <circle cx="250" cy="70" r="4" fill="#94A3B8" />
                <text x="250" y="60" textAnchor="middle" fill="#94A3B8" fontSize="8" fontWeight="bold">Gate A</text>

                <circle cx="430" cy="250" r="4" fill="#94A3B8" />
                <text x="445" y="253" textAnchor="middle" fill="#94A3B8" fontSize="8" fontWeight="bold">Gate B</text>

                <circle cx="250" cy="430" r="4" fill="#94A3B8" />
                <text x="250" y="445" textAnchor="middle" fill="#94A3B8" fontSize="8" fontWeight="bold">Gate C</text>

                <circle cx="70" cy="250" r="4" fill="#94A3B8" />
                <text x="50" y="253" textAnchor="middle" fill="#94A3B8" fontSize="8" fontWeight="bold">Gate D</text>

                {/* Heatmap Overlays (Radial Gradients representation) */}
                {HEATMAP_DATA[phase].map((zone) => (
                  <g key={zone.id}>
                    {/* Glowing heatmap circle */}
                    <circle
                      cx={zone.cx}
                      cy={zone.cy}
                      r={zone.r}
                      fill={getDensityColor(zone.density)}
                      filter="blur(1px)"
                      className="transition-all duration-500"
                    />
                    {/* Inner core ping */}
                    <circle
                      cx={zone.cx}
                      cy={zone.cy}
                      r="4"
                      fill="#FFFFFF"
                      opacity="0.3"
                      className="animate-ping"
                    />
                  </g>
                ))}
              </svg>

              {/* Status List on the side overlay */}
              <div className="absolute top-4 right-4 flex flex-col gap-2 z-10 max-w-[150px]">
                {HEATMAP_DATA[phase].map((zone) => (
                  <div 
                    key={zone.id}
                    className="flex flex-col p-1.5 rounded-lg bg-fifa-darker/95 border border-white/5 text-[9px] leading-tight"
                  >
                    <span className="font-semibold text-slate-300 truncate">{zone.name}</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`px-1 rounded border text-[8px] font-bold capitalize ${getBadgeClass(zone.density)}`}>
                        {zone.density}
                      </span>
                      <span className="font-bold text-white text-[9px]">{zone.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* AI Prediction Box */}
          {prediction && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <GlassCard glowColor="none" className="bg-fifa-purple/35 border-white/5 space-y-4">
                <h3 className="text-md font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                  <Sparkles className="h-5 w-5 text-fifa-teal" />
                  <span>Gemini Crowd Forecast Analysis</span>
                </h3>
                <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line font-medium">
                  {prediction}
                </div>
                <div className="flex gap-3 bg-fifa-red/10 border border-fifa-red/20 rounded-xl p-3 text-xs text-fifa-red">
                  <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Operator Alert Checklist:</span>
                    Deploy volunteers to high-density zones immediately. Update route signs on the North Concourse to bypass crowded restrooms.
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CrowdIntelligence;
