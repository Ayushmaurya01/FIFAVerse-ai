import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getVolunteerTasks, updateTaskStatus } from '../services/dataService';
import type { VolunteerTask } from '../services/dataService';
import { getGeminiResponse } from '../services/gemini';
import GlassCard from '../components/common/GlassCard';
import { HeartHandshake, Key, Sparkles, Send, CheckCircle, RefreshCw, AlertCircle, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VolunteerPortal: React.FC = () => {
  const { user, loginUser, logoutUser, speakText } = useApp();
  const [tasks, setTasks] = useState<VolunteerTask[]>([]);
  const [username, setUsername] = useState<string>('');
  const [sector, setSector] = useState<string>('East Concourse');
  const [loadingTasks, setLoadingTasks] = useState<boolean>(false);

  // Copilot Chat
  const [copilotInput, setCopilotInput] = useState<string>('');
  const [copilotResponse, setCopilotResponse] = useState<string>('');
  const [loadingCopilot, setLoadingCopilot] = useState<boolean>(false);

  useEffect(() => {
    if (user && user.role === 'volunteer') {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    setLoadingTasks(true);
    try {
      const data = await getVolunteerTasks();
      setTasks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      loginUser('volunteer', username);
    }
  };

  const handleUpdateStatus = async (taskId: string, nextStatus: 'in_progress' | 'completed') => {
    await updateTaskStatus(taskId, nextStatus);
    fetchTasks();
    
    if (nextStatus === 'completed') {
      speakText("Task marked complete. Excellent work supporting stadium safety.");
    }
  };

  const handleCopilotQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    setLoadingCopilot(true);
    setCopilotResponse('');

    const prompt = `VOLUNTEER COPILOT QUERY: "${queryText}". You are talking to a stadium field volunteer. Detail the exact official standard operating procedure (SOP), safety checklist, and supervisor notification steps.`;

    try {
      const response = await getGeminiResponse(prompt, 'volunteer');
      setCopilotResponse(response);
      speakText(response);
    } catch (e) {
      setCopilotResponse('Connection to Copilot service disrupted.');
    } finally {
      setLoadingCopilot(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'critical') return 'bg-red-500/25 border-red-500 text-red-400';
    if (priority === 'high') return 'bg-orange-500/25 border-orange-500 text-orange-400';
    if (priority === 'medium') return 'bg-yellow-500/25 border-yellow-500 text-yellow-400';
    return 'bg-blue-500/25 border-blue-500 text-blue-400';
  };

  const getStatusColor = (status: string) => {
    if (status === 'completed') return 'text-fifa-green border-fifa-green bg-fifa-green/5';
    if (status === 'in_progress') return 'text-fifa-blue border-fifa-blue bg-fifa-blue/5';
    return 'text-slate-400 border-white/10 bg-white/5';
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-fifa-pink text-sm font-bold uppercase tracking-wider">
          <HeartHandshake className="h-4 w-4" />
          <span>Module 07 & Portal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Volunteer Operations Portal</h1>
        <p className="text-slate-400 text-sm max-w-xl">
          Coordinate guest assistance, claim active safety tasks, and query the Volunteer AI Copilot for official stadium SOP protocols.
        </p>
      </div>

      {/* Auth Gate check */}
      {(!user || user.role !== 'volunteer') ? (
        <div className="max-w-md mx-auto py-12">
          <GlassCard glowColor="pink" className="space-y-6">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-3.5 rounded-full bg-fifa-pink/10 border border-fifa-pink/20 text-fifa-pink">
                <Key className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-white">Volunteer Authentication</h2>
              <p className="text-xs text-slate-400">Log in to sync assigned tasks and access safety SOPs.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Volunteer Name</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl bg-fifa-purple border border-white/10 px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-fifa-pink"
                  placeholder="e.g. Ayush Kumar"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Sector</label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full rounded-xl bg-fifa-purple border border-white/10 px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-fifa-pink cursor-pointer"
                >
                  <option value="East Concourse">East Concourse</option>
                  <option value="West Concourse">West Concourse</option>
                  <option value="North Entrance Lobby">North Entrance Lobby</option>
                  <option value="South Security Gate">South Security Gate</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-fifa-pink to-fifa-red text-white font-bold hover:shadow-neon-pink/20 transition-all text-sm uppercase"
              >
                Authenticate Portal
              </button>
            </form>
          </GlassCard>
        </div>
      ) : (
        /* Authenticated Volunteer Dashboard */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Active Tasks Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Bookmark className="h-5 w-5 text-fifa-pink" />
                <span>Assigned Tasks Board</span>
              </h2>

              <button
                onClick={fetchTasks}
                disabled={loadingTasks}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors"
                title="Sync Tasks"
              >
                <RefreshCw className={`h-4 w-4 ${loadingTasks ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loadingTasks ? (
              <div className="flex items-center justify-center p-12 text-slate-400 text-sm">
                <RefreshCw className="h-5 w-5 animate-spin mr-2" /> Loading operations logs...
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {tasks.length === 0 ? (
                  <div className="text-center p-8 text-slate-500 border border-dashed border-white/10 rounded-2xl">
                    No active tasks assigned in your sector.
                  </div>
                ) : (
                  tasks.map((task) => (
                    <GlassCard 
                      key={task.id}
                      hoverEffect={false}
                      className="border-white/5 space-y-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${getPriorityColor(task.priority)}`}>
                            {task.priority} Priority
                          </span>
                          <h4 className="text-base font-bold text-white pt-1">{task.title}</h4>
                          <span className="text-[10px] text-slate-400 block">Location: {task.location}</span>
                        </div>

                        <span className={`px-2 py-1 rounded-lg border text-[10px] font-bold capitalize ${getStatusColor(task.status)}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-semibold">
                        {task.description}
                      </p>

                      {/* Action buttons */}
                      {task.status !== 'completed' && (
                        <div className="flex gap-2 pt-2 border-t border-white/5">
                          {task.status === 'pending' && (
                            <button
                              onClick={() => handleUpdateStatus(task.id, 'in_progress')}
                              className="px-4 py-2 rounded-xl bg-fifa-blue hover:bg-fifa-blue/80 text-white text-xs font-bold transition-all"
                            >
                              Claim Task
                            </button>
                          )}
                          {task.status === 'in_progress' && (
                            <button
                              onClick={() => handleUpdateStatus(task.id, 'completed')}
                              className="px-4 py-2 rounded-xl bg-fifa-green hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              Mark Completed
                            </button>
                          )}
                        </div>
                      )}
                    </GlassCard>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Volunteer AI Copilot Console */}
          <div className="lg:col-span-6 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-fifa-pink" />
              <span>Volunteer AI Copilot</span>
            </h2>

            <GlassCard glowColor="pink" className="space-y-4">
              {/* Quick SOP templates */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Quick SOP Access Guides</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCopilotQuery('Lost child procedure and reunion SOP')}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all"
                  >
                    Lost Child SOP
                  </button>
                  <button
                    onClick={() => handleCopilotQuery('Medical emergency response and AED instructions')}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all"
                  >
                    AED Medical SOP
                  </button>
                  <button
                    onClick={() => handleCopilotQuery('Gate 4 overcrowding and queue redirect procedure')}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all"
                  >
                    Crowd Overload SOP
                  </button>
                </div>
              </div>

              {/* Chat area */}
              <div className="space-y-3 border-t border-white/5 pt-4">
                <div className="relative">
                  <input
                    type="text"
                    value={copilotInput}
                    onChange={(e) => setCopilotInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCopilotQuery(copilotInput)}
                    className="w-full rounded-xl bg-fifa-purple border border-white/10 px-4 py-3.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-fifa-pink pr-12"
                    placeholder="Ask Copilot for emergency rules or location SOPs..."
                  />
                  <button
                    onClick={() => handleCopilotQuery(copilotInput)}
                    disabled={!copilotInput.trim() || loadingCopilot}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-fifa-pink text-white hover:bg-fifa-red transition-all disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>

                <AnimatePresence>
                  {loadingCopilot && (
                    <div className="flex items-center gap-2 text-xs text-slate-400 py-3">
                      <RefreshCw className="h-4 w-4 animate-spin" /> Querying central operations database...
                    </div>
                  )}
                  {copilotResponse && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/5 border border-white/5 p-4 rounded-xl text-xs sm:text-sm text-slate-300 leading-relaxed font-semibold whitespace-pre-line relative"
                    >
                      {copilotResponse}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-400 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-fifa-pink shrink-0 mt-0.5" />
                <span>
                  Always prioritize guest physical safety. In case of fire or active threat, immediately direct crowds to designated exits and notify Sector Supervisor.
                </span>
              </div>
            </GlassCard>

            <button
              onClick={logoutUser}
              className="w-full py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white transition-all text-xs font-bold"
            >
              Sign Out of Volunteer Portal
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default VolunteerPortal;
