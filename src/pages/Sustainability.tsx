import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getGeminiResponse } from '../services/gemini';
import GlassCard from '../components/common/GlassCard';
import { Leaf, Award, Footprints, Droplet, QrCode, Trash2, Sparkles, RefreshCw, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SustainabilityHub: React.FC = () => {
  const { sustainability, addSustainabilityPoints, speakText } = useApp();
  const [loading, setLoading] = useState<boolean>(false);
  const [greenAdvice, setGreenAdvice] = useState<string>('');
  const [confettiActive, setConfettiActive] = useState<boolean>(false);

  // Compute points
  const pointsFromWalking = Math.round(sustainability.walkingDistance / 100); // 10 pts per km
  const pointsFromTransit = Math.round(sustainability.transitDistance / 500); // 2 pts per km
  const pointsFromRefills = sustainability.bottleRefills * 15;
  const pointsFromTickets = sustainability.digitalTickets * 20;
  const pointsFromWaste = Math.round(sustainability.wasteReduced / 10); // 1 pt per 10g

  const totalPoints = pointsFromWalking + pointsFromTransit + pointsFromRefills + pointsFromTickets + pointsFromWaste;

  const handleAction = async (type: 'refill' | 'ticket' | 'waste') => {
    setConfettiActive(true);
    setTimeout(() => setConfettiActive(false), 2000);

    if (type === 'refill') {
      await addSustainabilityPoints({
        bottleRefills: 1,
        wasteReduced: 120, // 120g of plastic bottle waste saved
        co2Saved: 0.15,
      });
      speakText("Water bottle refill logged. Thank you for cutting down on single-use plastics.");
    } else if (type === 'ticket') {
      await addSustainabilityPoints({
        digitalTickets: 1,
        wasteReduced: 50,
        co2Saved: 0.2,
      });
      speakText("Digital ticket scan logged. 100 percent paperless entry completed.");
    } else if (type === 'waste') {
      await addSustainabilityPoints({
        wasteReduced: 300,
        co2Saved: 0.1,
      });
      speakText("Recycling sorted. Waste logged successfully.");
    }
  };

  const handleGetGreenAdvice = async () => {
    setLoading(true);
    const prompt = `Formulate stadium sustainability guidelines for spectators at the World Cup 2026. Focus on waste recycling procedures, public transit advantages, water bottle reuse, and explain why paperless tickets matter. Provide 3 specific actions fans can take today.`;

    try {
      const response = await getGeminiResponse(prompt, 'sustainability');
      setGreenAdvice(response);
      speakText(response);
    } catch (e) {
      setGreenAdvice('Failed to load green guidelines.');
    } finally {
      setLoading(false);
    }
  };

  const badges = [
    { name: 'Eco-Starter', desc: 'Log your first green stadium action.', unlocked: totalPoints >= 20 },
    { name: 'Transit Champion', desc: 'Cover over 5 kilometers on public transit.', unlocked: sustainability.transitDistance >= 5000 },
    { name: 'Zero-Waste Fan', desc: 'Log 500g of waste reduction.', unlocked: sustainability.wasteReduced >= 500 },
    { name: 'Stad-Hero', desc: 'Achieve a total Green Score of 150 points.', unlocked: totalPoints >= 150 },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-fifa-green text-sm font-bold uppercase tracking-wider">
          <Leaf className="h-4 w-4" />
          <span>Module 09</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Sustainability & Green Impact</h1>
        <p className="text-slate-400 text-sm max-w-xl">
          Track your ecological contributions. Log waste sorting, water refills, and digital scans to unlock official Green Badges.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Score & Actions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Green Score Panel */}
          <GlassCard glowColor="gold" className="text-center p-8 bg-gradient-to-tr from-fifa-purple/40 to-fifa-dark/40 relative overflow-hidden">
            <div className="absolute top-4 right-4 animate-pulse">
              <Award className="h-6 w-6 text-fifa-gold" />
            </div>

            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Your Fan Green Score</span>
            <h2 className="text-5xl font-black text-white mt-2 mb-1 text-neon">{totalPoints}</h2>
            <span className="text-xs text-slate-300 font-semibold block">Level 2 Green Advocate</span>
            
            {/* Total CO2 saved progress */}
            <div className="mt-6 pt-4 border-t border-white/5 space-y-2 text-left">
              <div className="flex justify-between text-xs text-slate-400 font-semibold uppercase">
                <span>Personal CO₂ Saved</span>
                <span className="text-fifa-green font-bold">{sustainability.co2Saved.toFixed(2)} kg</span>
              </div>
              <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-fifa-green rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(100, (sustainability.co2Saved / 10) * 100)}%` }}
                />
              </div>
            </div>
          </GlassCard>

          {/* Quick Actions */}
          <GlassCard hoverEffect={false} className="border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Log Stadium Green Behaviors</h3>
            
            <div className="grid grid-cols-1 gap-3">
              {/* Bottle Refill */}
              <button
                onClick={() => handleAction('refill')}
                className="p-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-left flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-105 transition-transform">
                    <Droplet className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="font-bold text-white text-sm block">Refill Water Bottle</span>
                    <span className="text-[10px] text-slate-400">Sorts plastic bottle footprint (+15 pts)</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-fifa-green">+1 Refill</span>
              </button>

              {/* Digital Tickets */}
              <button
                onClick={() => handleAction('ticket')}
                className="p-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-left flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-pink-500/10 text-pink-400 group-hover:scale-105 transition-transform">
                    <QrCode className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="font-bold text-white text-sm block">Use Digital Ticket</span>
                    <span className="text-[10px] text-slate-400">Zero paper printout scan (+20 pts)</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-fifa-green">+1 Ticket</span>
              </button>

              {/* Sorted Waste */}
              <button
                onClick={() => handleAction('waste')}
                className="p-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-left flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-105 transition-transform">
                    <Trash2 className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="font-bold text-white text-sm block">Recycle Stadium Waste</span>
                    <span className="text-[10px] text-slate-400">Sorted can/cup into recycling box (+30 pts)</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-fifa-green">+300g sorted</span>
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Right Side: Badges & AI advice */}
        <div className="lg:col-span-7 space-y-6">
          {/* Badge shelf */}
          <GlassCard hoverEffect={false} className="border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Your Achieved Green Badges</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {badges.map((badge, idx) => (
                <div 
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    badge.unlocked 
                      ? 'bg-fifa-green/5 border-fifa-green/30 text-slate-200' 
                      : 'border-white/5 bg-white/5 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Award className={`h-5 w-5 ${badge.unlocked ? 'text-fifa-green' : 'text-slate-500'}`} />
                    <span className={`font-bold text-sm ${badge.unlocked ? 'text-white' : 'text-slate-500'}`}>{badge.name}</span>
                  </div>
                  <p className="text-[10px] leading-normal">{badge.desc}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* AI Advice */}
          <GlassCard glowColor="none" className="border-white/5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-fifa-green" />
                <span>Gemini Eco-Coaching Advice</span>
              </h3>
            </div>

            {greenAdvice ? (
              <div className="text-xs sm:text-sm text-slate-300 leading-relaxed font-semibold whitespace-pre-line bg-white/5 p-4 rounded-xl border border-white/5">
                {greenAdvice}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-6 text-slate-500 border border-dashed border-white/10 rounded-2xl">
                <Leaf className="h-8 w-8 mb-2 opacity-50 text-fifa-green" />
                <p className="text-xs font-bold text-slate-300">Eco Advisor Idle</p>
                <p className="text-[10px] max-w-xs mt-1 leading-normal">
                  Ask Gemini to compute localized recycling rules and custom transport carbon comparisons.
                </p>
              </div>
            )}

            <button
              onClick={handleGetGreenAdvice}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-fifa-green text-white font-bold hover:bg-emerald-500 transition-all text-xs uppercase flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating rules...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Green Guidelines
                </>
              )}
            </button>
          </GlassCard>
        </div>

      </div>

      {/* Confetti effect toast overlay */}
      <AnimatePresence>
        {confettiActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
          >
            <div className="bg-fifa-gold text-fifa-dark font-black rounded-full px-8 py-4 shadow-2xl text-lg flex items-center gap-2">
              <Award className="h-6 w-6 animate-bounce" />
              <span>+ Points Logged! Go Green!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SustainabilityHub;
