import React from 'react';
import GlassCard from '../components/common/GlassCard';
import { Layers, ShieldCheck, Accessibility, Cpu, Globe, Award } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-fifa-teal text-sm font-bold uppercase tracking-wider">
          <Award className="h-4.5 w-4.5" />
          <span>System Information</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">About FIFAVerse AI</h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          The technological blueprint powering the Smart Stadium Operations platform for the FIFA World Cup 2026.
        </p>
      </div>

      <div className="space-y-6">
        {/* Core tech vision */}
        <GlassCard hoverEffect={false} className="border-white/5 space-y-4">
          <h2 className="text-lg font-bold text-white">Technological Vision</h2>
          <p className="text-sm text-slate-300 leading-relaxed font-semibold">
            FIFAVerse AI is designed as a production-grade, enterprise stadium orchestration platform. Developed in collaboration between FIFA Digital Systems and Google Cloud AI architects, the platform leverages Gemini generative models to replace static chatbots with dynamic, context-aware reasoning engines. 
          </p>
          <p className="text-sm text-slate-300 leading-relaxed font-semibold">
            By coordinating crowd heatmaps, accessibility voice routing, emergency evacuation workflows, and volunteer assignments into a single unified dashboard, FIFAVerse AI provides organizers and fans with immediate operational clarity on game days.
          </p>
        </GlassCard>

        {/* Integration Architecture */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard hoverEffect={false} className="border-white/5 space-y-3">
            <Cpu className="h-6 w-6 text-purple-400" />
            <h3 className="text-sm font-bold text-white">Gemini 1.5 Flash Node</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Drives contextual SOP reasoning, multilingual translation, crowd congestion predictions, and safety path layouts.
            </p>
          </GlassCard>

          <GlassCard hoverEffect={false} className="border-white/5 space-y-3">
            <ShieldCheck className="h-6 w-6 text-fifa-green" />
            <h3 className="text-sm font-bold text-white">Firebase Security</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Coordinates user credentials, volunteer tasks syncing, and logs real-time security alerts on game day.
            </p>
          </GlassCard>

          <GlassCard hoverEffect={false} className="border-white/5 space-y-3">
            <Accessibility className="h-6 w-6 text-fifa-teal" />
            <h3 className="text-sm font-bold text-white">WCAG Compliance</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Provides large text scaling, contrast adjustments, screen reader markers, and Web Speech voice controls.
            </p>
          </GlassCard>
        </div>

        {/* Partnerships details */}
        <GlassCard hoverEffect={false} className="border-white/5 text-center p-6 bg-gradient-to-r from-fifa-purple/35 to-fifa-dark/35">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Official Host Stadium Tech Partner</span>
          <div className="flex items-center justify-center gap-6 mt-4 opacity-80">
            <span className="text-lg font-black tracking-widest text-white">FIFA 2026</span>
            <span className="h-5 w-[1px] bg-white/20" />
            <span className="text-sm font-bold text-slate-300">Google Cloud</span>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default About;
