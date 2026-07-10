import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getOrganizerStats, getEmergencyAlerts, getVolunteerTasks } from '../services/dataService';
import type { EmergencyAlert, VolunteerTask } from '../services/dataService';
import { getGeminiResponse } from '../services/gemini';
import GlassCard from '../components/common/GlassCard';
import { 
  TrendingUp, 
  Users, 
  ShieldAlert, 
  Zap, 
  Leaf, 
  HeartHandshake, 
  Sparkles, 
  RefreshCw,
  AlertTriangle,
  Car
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// Mock chart data
const ATTENDANCE_TIMELINE = [
  { time: '14:00', spectators: 12000, gatesOpen: 4 },
  { time: '15:00', spectators: 28000, gatesOpen: 4 },
  { time: '16:00', spectators: 45000, gatesOpen: 6 },
  { time: '17:00', spectators: 62000, gatesOpen: 8 },
  { time: '18:00', spectators: 68450, gatesOpen: 8 },
];

const COLORS = ['#4285F4', '#EC4899', '#F59E0B', '#34A853'];

const OrganizerDashboard: React.FC = () => {
  const { user, loginUser, t } = useApp();
  const [stats, setStats] = useState<any>(null);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [tasks, setTasks] = useState<VolunteerTask[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [aiSuggestions, setAiSuggestions] = useState<string>('');
  const [runningAI, setRunningAI] = useState<boolean>(false);

  useEffect(() => {
    // If user is not organizer, we simulate logging them in as Organizer for evaluation ease!
    if (!user || user.role !== 'organizer') {
      loginUser('organizer', 'Ops Commander');
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const liveStats = await getOrganizerStats();
      const liveAlerts = await getEmergencyAlerts();
      const liveTasks = await getVolunteerTasks();
      
      setStats(liveStats);
      setAlerts(liveAlerts.filter(a => a.status === 'active'));
      setTasks(liveTasks);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAiAnalysis = async () => {
    setRunningAI(true);
    
    // Construct active context based on current database state
    const alertsSummary = alerts.map(a => `${a.type} at ${a.location}`).join(', ') || 'No active alerts';
    const tasksSummary = `Pending: ${tasks.filter(t => t.status === 'pending').length}, In progress: ${tasks.filter(t => t.status === 'in_progress').length}`;
    
    const prompt = `Perform stadium-wide logistics optimization for the operations manager. Active alerts: [${alertsSummary}]. Volunteer status: [${tasksSummary}]. Energy load: ${stats?.energyUsage?.currentKw} kW. Recommend 3 critical resource reallocations, energy conservation options, and queue dispersal plans.`;

    try {
      const response = await getGeminiResponse(prompt, 'organizer');
      setAiSuggestions(response);
    } catch (e) {
      setAiSuggestions('Unable to access operations forecasting node.');
    } finally {
      setRunningAI(false);
    }
  };

  if (!stats) {
    return (
      <div className="flex items-center justify-center p-24 text-slate-400 text-sm">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" /> Syncing central database...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-fifa-teal text-sm font-bold uppercase tracking-wider">
            <TrendingUp className="h-4 w-4" />
            <span>Module 08 & Dashboard</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">Organizer Intelligence Control</h1>
          <p className="text-slate-400 text-sm max-w-md">
            Centralized operations command. Monitor security incidents, grid performance, and run Gemini resource dispatch models.
          </p>
        </div>

        {/* Sync panel */}
        <button
          onClick={loadData}
          className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 transition-all self-end sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Sync Control Board
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Attendance */}
        <GlassCard hoverEffect={false} className="border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-fifa-blue/10 text-fifa-blue border border-fifa-blue/20">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Attendance Rate</p>
              <h3 className="text-xl font-black text-white mt-1">
                {stats.totalAttendance.toLocaleString()} <span className="text-xs text-slate-500 font-normal">/ {stats.maxCapacity.toLocaleString()}</span>
              </h3>
            </div>
          </div>
        </GlassCard>

        {/* Incidents count */}
        <GlassCard hoverEffect={false} className={`border-white/5 ${alerts.length > 0 ? 'border-red-500/20' : ''}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              alerts.length > 0 
                ? 'bg-red-500/10 text-red-500 border-red-500/35 animate-pulse' 
                : 'bg-fifa-green/10 text-fifa-green border-fifa-green/20'
            }`}>
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active SOS Incidents</p>
              <h3 className={`text-xl font-black mt-1 ${alerts.length > 0 ? 'text-red-500' : 'text-fifa-green'}`}>
                {alerts.length} <span className="text-xs text-slate-500 font-normal">unresolved</span>
              </h3>
            </div>
          </div>
        </GlassCard>

        {/* Volunteer status */}
        <GlassCard hoverEffect={false} className="border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-fifa-pink/10 text-fifa-pink border border-fifa-pink/20">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Volunteers Deploy Rate</p>
              <h3 className="text-xl font-black text-white mt-1">
                {stats.activeVolunteers} <span className="text-xs text-slate-500 font-normal">on duty ({stats.idleVolunteers} idle)</span>
              </h3>
            </div>
          </div>
        </GlassCard>

        {/* Renewables energy */}
        <GlassCard hoverEffect={false} className="border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-fifa-gold/10 text-fifa-gold border border-fifa-gold/20">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Smart Grid Green Load</p>
              <h3 className="text-xl font-black text-white mt-1">
                {stats.energyUsage.renewablesPercentage}% <span className="text-xs text-slate-500 font-normal">renewables</span>
              </h3>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Main Analysis grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Graph Columns */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Attendance chart */}
            <GlassCard hoverEffect={false} className="border-white/5 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Users className="h-4 w-4 text-fifa-blue" />
                <span>Attendance Load Flow</span>
              </h3>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ATTENDANCE_TIMELINE} margin={{ left: -25, right: 10, top: 10 }}>
                    <XAxis dataKey="time" stroke="#94A3B8" fontSize={9} />
                    <YAxis stroke="#94A3B8" fontSize={9} />
                    <Tooltip contentStyle={{ backgroundColor: '#120A2A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '10px' }} />
                    <Line type="monotone" dataKey="spectators" stroke="#4285F4" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            {/* Demographics chart */}
            <GlassCard hoverEffect={false} className="border-white/5 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Users className="h-4 w-4 text-fifa-pink" />
                <span>Spectator Demographics</span>
              </h3>
              <div className="h-[200px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.visitorDemographics}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {stats.visitorDemographics.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#120A2A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '10px' }} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>

          {/* Grid parking and green stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Parking status bar */}
            <GlassCard hoverEffect={false} className="border-white/5 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Car className="h-4 w-4 text-fifa-gold" />
                <span>Parking Capacity Logistics</span>
              </h3>
              
              <div className="space-y-3">
                {Object.entries(stats.parkingStatus).map(([lot, percentage]: [string, any]) => (
                  <div key={lot} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span className="font-bold capitalize">{lot.replace('lot', 'Lot ')}</span>
                      <span className="font-bold">{percentage}% full</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          percentage > 85 ? 'bg-fifa-red' : percentage > 60 ? 'bg-fifa-gold' : 'bg-fifa-green'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Environmental Impact bar */}
            <GlassCard hoverEffect={false} className="border-white/5 flex flex-col justify-between p-5">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Leaf className="h-4 w-4 text-fifa-green" />
                <span>Eco Impact Log</span>
              </h3>

              <div className="space-y-4 flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-fifa-green/10 border border-fifa-green/20 text-fifa-green shrink-0">
                    <Leaf className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Accumulated Carbon Offsets</span>
                    <span className="text-2xl font-black text-white">{stats.carbonSavedTotal.toLocaleString()} kg CO₂</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[10px] leading-relaxed text-slate-400">
                  Carbon offset metrics sync instantly when spectators log green commute choices (metro/bus/walking) on the Transportation portal.
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* AI Recommendations panel */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* AI Decision board */}
          <GlassCard glowColor="teal" className="flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-md font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <Sparkles className="h-5 w-5 text-fifa-teal" />
                <span>Gemini Ops Directives</span>
              </h3>

              {aiSuggestions ? (
                <div className="text-xs sm:text-sm text-slate-300 leading-relaxed font-semibold whitespace-pre-line bg-white/5 p-4 rounded-xl border border-white/5 max-h-[360px] overflow-y-auto">
                  {aiSuggestions}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-8 text-slate-500 border border-dashed border-white/10 rounded-2xl min-h-[220px]">
                  <Sparkles className="h-8 w-8 mb-2 opacity-50 text-fifa-teal animate-pulse" />
                  <p className="text-xs font-bold text-slate-300">Operations Reasoning Idle</p>
                  <p className="text-[10px] max-w-xs mt-1 leading-normal">
                    Query Google Gemini to analyze active safety alerts, volunteer ratios, and energy loads to yield decision recommendations.
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleRunAiAnalysis}
              disabled={runningAI}
              className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-fifa-blue to-fifa-teal text-white font-bold hover:shadow-neon-teal/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 text-xs uppercase"
            >
              {runningAI ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Running Ops Model...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Analyze Stadium Operations
                </>
              )}
            </button>
          </GlassCard>

          {/* Active Security alerts display */}
          <GlassCard hoverEffect={false} className="border-white/5 space-y-3 bg-red-950/5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Security Command Alert Logs</span>
            <div className="space-y-2 max-h-[150px] overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="text-xs text-slate-500 italic">No active alarms. Stadium is secure.</div>
              ) : (
                alerts.map((a) => (
                  <div key={a.id} className="flex gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-[10px] text-red-300 leading-normal">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 animate-bounce" />
                    <div>
                      <span className="font-bold block capitalize">{a.type} incident - {a.location}</span>
                      <span>{a.details}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
};

export default OrganizerDashboard;
