import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import GlobeCanvas from '../components/common/GlobeCanvas';
import GlassCard from '../components/common/GlassCard';
import { 
  Navigation, 
  Users, 
  Bus, 
  Accessibility, 
  Sparkles, 
  TrendingUp, 
  ShieldAlert, 
  Leaf,
  Layers,
  CheckCircle,
  Database,
  MapPin,
  HeartHandshake,
  Calendar,
  CloudSun
} from 'lucide-react';
import { motion } from 'framer-motion';
import { MATCH_SCHEDULE, WORLD_CUP_WEATHER } from '../constants/stadiumData';

const Home: React.FC = () => {
  const { t } = useApp();
  const [selectedWeatherCity, setSelectedWeatherCity] = useState<number>(0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.03 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 4 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.22 } }
  };

  const operationsMetrics = [
    { title: 'Live Stadium Attendance', value: '68,450', max: ' / 75,000', icon: Users, color: 'text-fifa-teal' },
    { title: 'Active Security SOPs', value: '2', max: ' active incidents', icon: ShieldAlert, color: 'text-fifa-red animate-pulse' },
    { title: 'Active Volunteers', value: '227', max: ' on duty', icon: HeartHandshake, color: 'text-fifa-green' },
    { title: 'Carbon Footprint Savings', value: '8.4T', max: ' CO₂ offset today', icon: Leaf, color: 'text-fifa-gold' },
  ];

  const features = [
    {
      title: 'Smart Navigation',
      desc: 'Find seat sections, restrooms, merch stands, and medical hubs. Get wheelchair and crowd-optimized routes calculated in real time.',
      icon: Navigation,
      path: '/navigation',
      color: 'teal'
    },
    {
      title: 'Crowd Intelligence',
      desc: 'Visualize spectator density via live heatmaps. Gemini predicts gate queue build-ups and suggests alternative pathways.',
      icon: Users,
      path: '/crowd',
      color: 'pink'
    },
    {
      title: 'Transport Assistant',
      desc: 'Compare public transit, taxi, shuttle, and walking times. Check carbon footprints, transit costs, and AI commute choices.',
      icon: Bus,
      path: '/transport',
      color: 'gold'
    },
    {
      title: 'Accessibility Center',
      desc: 'A dedicated WCAG compliant mode featuring high contrast, large text scaling, Speech-to-Text inputs, and vocal directions.',
      icon: Accessibility,
      path: '/accessibility',
      color: 'teal'
    },
    {
      title: 'Volunteer AI Copilot',
      desc: 'Empower field volunteers with quick access to official emergency protocols, crowd safety procedures, and venue facts.',
      icon: HeartHandshake,
      path: '/volunteer',
      color: 'pink'
    },
    {
      title: 'Organizer Dashboard',
      desc: 'Oversee full venue analytics, manage volunteer ticket tasks, monitor energy consumption, and receive Gemini operational suggestions.',
      icon: TrendingUp,
      path: '/organizer',
      color: 'gold'
    }
  ];

  const googleServices = [
    { name: 'Gemini 1.5 Flash API', desc: 'Drives operations reasoning, translations, route suggestions, and crowd predictive analysis.', icon: Sparkles, color: 'text-purple-400 border-purple-500/20' },
    { name: 'Google Maps Platform', desc: 'Renders dynamic seat-maps, security routes, public transit locations, and heatmaps.', icon: MapPin, color: 'text-fifa-blue border-fifa-blue/20' },
    { name: 'Firebase Database & Auth', desc: 'Powers live database operations, syncs active security alerts, and manages volunteer sessions.', icon: Database, color: 'text-orange-400 border-orange-500/20' },
    { name: 'PWA Cloud Architecture', desc: 'Allows off-line capability, direct worker caching, and immediate mobile app-like launch.', icon: Layers, color: 'text-fifa-green border-fifa-green/20' }
  ];

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={containerVariants}
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-16"
    >
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <motion.div variants={itemVariants} className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fifa-purple/60 border border-white/10 text-xs font-semibold text-fifa-teal">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Google AI Ecosystem Collaboration</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Co-piloting the Future of <br className="hidden sm:inline" />
            <span className="text-neon">World Cup Operations</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-xl font-normal leading-relaxed">
            FIFAVerse AI is a production-grade Operations & Spectator platform built for the FIFA World Cup 2026. Empowering fans, venue staff, organizers, and emergency responders with AI reasoning.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link 
              to="/navigation" 
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-fifa-blue to-fifa-teal font-bold text-white hover:shadow-neon-teal/20 transition-all hover:scale-[1.02]"
            >
              Access Smart Map
            </Link>
            <Link 
              to="/volunteer" 
              className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 font-bold text-slate-200 transition-all"
            >
              Volunteer Log In
            </Link>
          </div>
        </motion.div>

        {/* Globe Visualization */}
        <motion.div variants={itemVariants} className="lg:col-span-5 relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-fifa-purple/20 to-transparent blur-2xl rounded-full" />
          <GlobeCanvas />
        </motion.div>
      </section>

      {/* Live Stadium Dashboard Banner */}
      <motion.section variants={itemVariants} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">Live Stadium Operations Center</h2>
            <p className="text-xs sm:text-sm text-slate-400">Real-time stadium statistics compiled by operations nodes</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fifa-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-fifa-green"></span>
            </span>
            <span>Live Sync: Stadium 4 (Los Angeles)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {operationsMetrics.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <GlassCard key={idx} hoverEffect={true} className="border-white/5 relative group overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                  <Icon className="h-24 w-24" />
                </div>
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-white/5 border border-white/10 ${metric.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{metric.title}</p>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-black text-white">{metric.value}</span>
                      <span className="text-xs text-slate-400">{metric.max}</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </motion.section>

      {/* Real-time World Cup Operations Widgets */}
      <motion.section variants={itemVariants} className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-8">
        {/* Live Check-In Capacity Widget */}
        <div className="md:col-span-4 glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
          <h3 className="text-xs font-black tracking-wider uppercase text-slate-400 mb-4 flex items-center gap-1.5">
            <Users className="h-4 w-4 text-fifa-teal" />
            Live Check-In Capacity
          </h3>
          <div className="flex flex-col items-center justify-center flex-grow py-2">
            <div className="relative h-24 w-24 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="transparent" />
                <circle cx="48" cy="48" r="40" stroke="#00F2FE" strokeWidth="6" fill="transparent"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 * (1 - 68450 / 75000)}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-lg font-black text-white">91.2%</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">Checked In</span>
              </div>
            </div>
            <div className="mt-3 text-center text-xs text-slate-300">
              <p className="font-bold">68,450 / 75,000 Spectators</p>
              <p className="text-[9px] text-fifa-teal mt-0.5 font-semibold">Peak attendance expected in 15 mins</p>
            </div>
          </div>
        </div>

        {/* Real-time Weather Widget */}
        <div className="md:col-span-4 glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
                <CloudSun className="h-4 w-4 text-fifa-gold" />
                Stadium Weather
              </h3>
              <span className="text-[9px] rounded bg-fifa-blue/15 border border-fifa-blue/30 px-1.5 py-0.5 text-fifa-blue font-bold">Real-time</span>
            </div>
            <select
              onChange={(e) => setSelectedWeatherCity(Number(e.target.value))}
              value={selectedWeatherCity}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-fifa-teal mb-4"
            >
              {WORLD_CUP_WEATHER.map((w, idx) => (
                <option key={idx} value={idx} className="bg-fifa-dark text-slate-200">
                  {w.city}
                </option>
              ))}
            </select>
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl font-black text-white">{WORLD_CUP_WEATHER[selectedWeatherCity].temp}</span>
              <span className="text-xs font-bold text-fifa-teal bg-fifa-teal/15 px-2.5 py-1 rounded-full border border-fifa-teal/20">
                {WORLD_CUP_WEATHER[selectedWeatherCity].cond}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-3 text-[10px] text-slate-400 font-medium">
            <div>Wind: <span className="text-slate-200 font-bold">{WORLD_CUP_WEATHER[selectedWeatherCity].wind}</span></div>
            <div>Humidity: <span className="text-slate-200 font-bold">{WORLD_CUP_WEATHER[selectedWeatherCity].hum}</span></div>
          </div>
        </div>

        {/* Match Schedule Widget */}
        <div className="md:col-span-4 glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-black tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-fifa-pink" />
              Match Schedule
            </h3>
            <span className="h-2 w-2 rounded-full bg-fifa-red animate-pulse" />
          </div>
          <div className="space-y-2 flex-grow overflow-y-auto max-h-[120px] pr-1">
            {MATCH_SCHEDULE.map((match) => (
              <div key={match.id} className="flex items-center justify-between text-[11px] border-b border-white/5 pb-2 last:border-b-0 last:pb-0">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-200">{match.teams}</span>
                  <span className="text-[9px] text-slate-400">{match.time}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                    match.status === 'live' ? 'bg-fifa-red/10 text-fifa-red border border-fifa-red/30' : 'bg-white/5 text-slate-400'
                  }`}>
                    {match.status}
                  </span>
                  <span className="text-[8px] text-slate-500 font-semibold mt-0.5">{match.gate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Core Platform Capabilities */}
      <motion.section variants={itemVariants} className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-3xl font-black text-white">Platform Modules</h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Intelligent modules specifically designed to tackle high-attendance stadium and safety logistics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <GlassCard 
                key={idx}
                glowColor={feat.color as any}
                className="flex flex-col justify-between h-full group"
              >
                <div className="space-y-4">
                  <div className={`w-fit p-3 rounded-2xl bg-white/5 border border-white/10 text-white group-hover:scale-105 transition-transform duration-300`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-fifa-teal transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/5">
                  <Link 
                    to={feat.path} 
                    className="text-xs font-bold text-fifa-teal hover:underline flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                  >
                    Launch Module &rarr;
                  </Link>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </motion.section>

      {/* Google Tech Integration */}
      <motion.section variants={itemVariants} className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-3xl font-black text-white">Google AI & Cloud Integrations</h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Built using modern, robust enterprise services to guarantee performance, scaling, and intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {googleServices.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <GlassCard key={idx} hoverEffect={false} className={`border ${srv.color}`}>
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 rounded-full bg-white/5">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-md font-bold text-white">{srv.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{srv.desc}</p>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </motion.section>

      {/* How AI Works */}
      <motion.section variants={itemVariants} className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-2xl font-black text-white">How the Operations Copilot Reasoning Works</h2>
          <p className="text-slate-400 text-sm">
            Inside the Gemini Reasoning Loop (connecting data inputs, safety protocols, and real-time paths)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <div className="hidden md:block absolute top-1/2 left-1/3 right-1/3 h-[2px] bg-gradient-to-r from-fifa-blue via-fifa-pink to-fifa-gold -translate-y-1/2 z-0" />
          
          <GlassCard hoverEffect={false} className="relative z-10 text-center space-y-3">
            <div className="mx-auto w-10 h-10 rounded-full bg-fifa-blue/15 border border-fifa-blue/30 flex items-center justify-center font-bold text-fifa-blue">1</div>
            <h4 className="text-base font-bold text-white">Capture Environment Data</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Accepts seat details, language selection, GPS coordinates, volunteer incident reports, and crowd counters.
            </p>
          </GlassCard>

          <GlassCard hoverEffect={false} className="relative z-10 text-center space-y-3">
            <div className="mx-auto w-10 h-10 rounded-full bg-fifa-pink/15 border border-fifa-pink/30 flex items-center justify-center font-bold text-fifa-pink">2</div>
            <h4 className="text-base font-bold text-white">Evaluate Contextual SOPs</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Google Gemini processes inputs against safety guidelines, accessibility databases, and congestion heatmaps.
            </p>
          </GlassCard>

          <GlassCard hoverEffect={false} className="relative z-10 text-center space-y-3">
            <div className="mx-auto w-10 h-10 rounded-full bg-fifa-gold/15 border border-fifa-gold/30 flex items-center justify-center font-bold text-fifa-gold">3</div>
            <h4 className="text-base font-bold text-white">Dispatch Live Operations</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Draws path overlays, issues alerts to volunteers, translates responses, and reads speech guidance to users.
            </p>
          </GlassCard>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section variants={itemVariants}>
        <GlassCard glowColor="teal" className="text-center p-8 md:p-12 relative overflow-hidden bg-gradient-to-r from-fifa-purple/60 to-fifa-dark/60">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(0,242,254,0.15),transparent)] pointer-events-none" />
          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <h2 className="text-3xl font-black text-white">Ensure an Accessible, Safe Tournament Experience</h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Explore accessibility features, voice assistant, and live public transport routes. Learn how AI transforms stadiums into safe, efficient spaces.
            </p>
            <div className="flex justify-center gap-4">
              <Link 
                to="/accessibility" 
                className="px-6 py-3 rounded-xl bg-fifa-teal text-fifa-dark font-bold hover:shadow-neon-teal/20 transition-all hover:scale-[1.02]"
              >
                Accessibility Hub
              </Link>
              <Link 
                to="/emergency" 
                className="px-6 py-3 rounded-xl bg-fifa-red text-white font-bold hover:bg-red-500 transition-all"
              >
                Emergency SOPs
              </Link>
            </div>
          </div>
        </GlassCard>
      </motion.section>
    </motion.div>
  );
};

export default Home;
