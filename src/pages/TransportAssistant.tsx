import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getGeminiResponse } from '../services/gemini';
import GlassCard from '../components/common/GlassCard';
import { Bus, Train, Compass, Car, Sparkles, Leaf, DollarSign, Clock, Users, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TransportOption {
  id: string;
  name: string;
  type: 'metro' | 'bus' | 'rideshare' | 'taxi' | 'walking' | 'shuttle';
  etaMinutes: number;
  trafficDelay: 'low' | 'medium' | 'high' | 'none';
  cost: number;
  crowdLevel: 'low' | 'medium' | 'high';
  co2Emissions: number; // kg of CO2
  co2Saved: number; // kg saved vs single occupant vehicle
  distanceKm: number;
}

const TRANSPORT_OPTIONS: TransportOption[] = [
  { id: 'metro-1', name: 'Metro Line 1 (Metropolitan Station)', type: 'metro', etaMinutes: 22, trafficDelay: 'low', cost: 3.00, crowdLevel: 'medium', co2Emissions: 0.3, co2Saved: 2.1, distanceKm: 12 },
  { id: 'bus-12', name: 'North Plaza Shuttle (Bus Line 12)', type: 'bus', etaMinutes: 28, trafficDelay: 'low', cost: 2.50, crowdLevel: 'low', co2Emissions: 0.4, co2Saved: 2.0, distanceKm: 10 },
  { id: 'rideshare', name: 'Rideshare (Lot G Pickup Point)', type: 'rideshare', etaMinutes: 32, trafficDelay: 'medium', cost: 42.00, crowdLevel: 'high', co2Emissions: 2.4, co2Saved: 0.0, distanceKm: 12 },
  { id: 'taxi-cab', name: 'City Yellow Taxi Cab Stand', type: 'taxi', etaMinutes: 38, trafficDelay: 'high', cost: 48.00, crowdLevel: 'high', co2Emissions: 2.4, co2Saved: 0.0, distanceKm: 12 },
  { id: 'walking', name: 'Walk to West Fan Zone', type: 'walking', etaMinutes: 12, trafficDelay: 'none', cost: 0.00, crowdLevel: 'low', co2Emissions: 0.0, co2Saved: 0.8, distanceKm: 1 },
  { id: 'shuttle-p', name: 'Outer Parking Lot C Shuttle', type: 'shuttle', etaMinutes: 15, trafficDelay: 'low', cost: 0.00, crowdLevel: 'medium', co2Emissions: 0.1, co2Saved: 0.9, distanceKm: 3 },
];

const TransportAssistant: React.FC = () => {
  const { addSustainabilityPoints, t } = useApp();
  const [destination, setDestination] = useState<string>('Downtown Hub');
  const [loading, setLoading] = useState<boolean>(false);
  const [aiRecommendation, setAiRecommendation] = useState<string>('');
  const [loggedOption, setLoggedOption] = useState<string | null>(null);

  const handleGetRecommendation = async () => {
    setLoading(true);
    const prompt = `Formulate a commuting recommendation from the Stadium Operations Hub to ${destination} for a fan departing right after the match. Analyze Metro, Bus, Rideshare, Taxi, Walking, and Shuttles. Factor in current 88% overall concourse exiting congestion, rainy weather simulation, and carbon footprint reduction targets.`;

    try {
      const response = await getGeminiResponse(prompt, 'transport');
      setAiRecommendation(response);
    } catch (e) {
      setAiRecommendation('Failed to generate transit recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogTransit = async (option: TransportOption) => {
    // Log transit distance and CO2 saved to sustainability context
    await addSustainabilityPoints({
      walkingDistance: option.type === 'walking' ? option.distanceKm * 1000 : 0,
      transitDistance: option.type !== 'walking' ? option.distanceKm * 1000 : 0,
      co2Saved: option.co2Saved,
    });
    
    setLoggedOption(option.id);
    setTimeout(() => {
      setLoggedOption(null);
    }, 3000);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'metro': return Train;
      case 'bus': return Bus;
      case 'rideshare':
      case 'taxi': return Car;
      case 'walking': return Compass;
      default: return Bus;
    }
  };

  const getTrafficColor = (delay: string) => {
    if (delay === 'high') return 'text-fifa-red';
    if (delay === 'medium') return 'text-fifa-gold';
    return 'text-fifa-green';
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-fifa-gold text-sm font-bold uppercase tracking-wider">
          <Bus className="h-4 w-4" />
          <span>Module 03</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Real-time Transportation Assistant</h1>
        <p className="text-slate-400 text-sm max-w-xl">
          Review transit schedules, environmental footprints, and traffic delays. Query Gemini to calculate the most efficient commute.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Parameters & AI */}
        <div className="lg:col-span-4 space-y-6">
          <GlassCard glowColor="gold" className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
              <Compass className="h-5 w-5 text-fifa-gold" />
              <span>Travel Details</span>
            </h2>

            {/* Destination */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Where to?</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full rounded-xl bg-fifa-purple border border-white/10 px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-fifa-gold"
                placeholder="Enter destination address..."
              />
            </div>

            {/* Advice button */}
            <button
              onClick={handleGetRecommendation}
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-fifa-gold to-yellow-600 text-white font-bold hover:shadow-neon-gold/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Reasoning commute...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Ask AI Best Commute
                </>
              )}
            </button>
          </GlassCard>

          {/* AI Recommendation Output */}
          {aiRecommendation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <GlassCard glowColor="none" className="bg-fifa-purple/35 border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200 border-b border-white/5 pb-2">
                  <Sparkles className="h-4 w-4 text-fifa-gold" />
                  <span>Gemini Commute Directive</span>
                </div>
                <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line font-medium">
                  {aiRecommendation}
                </div>
              </GlassCard>
            </motion.div>
          )}
        </div>

        {/* Right Side: Options Comparison */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Transit Comparison Matrix</h3>
            <span className="text-xs text-slate-500 font-semibold">Updated 1 min ago</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {TRANSPORT_OPTIONS.map((opt) => {
              const Icon = getIcon(opt.type);
              const isLogged = loggedOption === opt.id;
              
              return (
                <GlassCard 
                  key={opt.id}
                  hoverEffect={true}
                  className="border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-md font-bold text-white flex items-center gap-2">
                        {opt.name}
                        {opt.co2Saved > 1.5 && (
                          <span className="flex items-center gap-0.5 rounded-full bg-fifa-green/10 px-2 py-0.5 text-[9px] font-bold text-fifa-green border border-fifa-green/20">
                            <Leaf className="h-2.5 w-2.5" /> High Green
                          </span>
                        )}
                      </h4>
                      
                      {/* Metric Line */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {opt.etaMinutes} mins
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" /> {opt.cost === 0 ? 'Free' : `$${opt.cost.toFixed(2)}`}
                        </span>
                        <span className="flex items-center gap-1">
                          Traffic: <span className={`font-bold capitalize ${getTrafficColor(opt.trafficDelay)}`}>{opt.trafficDelay}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> Crowd: <span className="font-bold text-slate-300 capitalize">{opt.crowdLevel}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions / Carbon display */}
                  <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-white/5">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] text-slate-500 font-semibold uppercase">CO₂ Offsets</p>
                      <p className="text-sm font-black text-fifa-green">
                        {opt.co2Saved > 0 ? `+${opt.co2Saved} kg saved` : '0.0 kg (Baseline)'}
                      </p>
                    </div>

                    <button
                      onClick={() => handleLogTransit(opt)}
                      disabled={isLogged}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border ${
                        isLogged
                          ? 'bg-fifa-green/20 border-fifa-green text-fifa-green cursor-default'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {isLogged ? (
                        <>Saved & Verify!</>
                      ) : (
                        <>
                          Log Trip <ArrowRight className="h-3 w-3" />
                        </>
                      )}
                    </button>
                  </div>
                </GlassCard>
              );
            })}
          </div>
          
          <AnimatePresence>
            {loggedOption && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="fixed bottom-6 right-6 bg-fifa-green/90 border border-fifa-green text-white font-bold rounded-xl px-5 py-3 shadow-lg backdrop-blur-xl z-50 flex items-center gap-2"
              >
                <Leaf className="h-5 w-5 text-white animate-bounce" />
                <span>Green Trip Logged! Environmental Score Increased.</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default TransportAssistant;
