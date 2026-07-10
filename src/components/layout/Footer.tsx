import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Cpu, Cloud, Globe } from 'lucide-react';

const Footer: React.FC = () => {
  const { t } = useApp();

  return (
    <footer className="mt-auto border-t border-white/5 bg-fifa-darker/60 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-gradient-to-tr from-fifa-teal to-fifa-pink p-[1px]">
                <div className="h-full w-full rounded bg-fifa-dark flex items-center justify-center text-[10px] font-black text-white">
                  26
                </div>
              </div>
              <span className="text-base font-black tracking-wider text-white">
                FIFA<span className="text-fifa-teal">Verse</span> AI
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-slate-400">
              The official next-generation Stadium Operations & Spectator Co-pilot platform powered by Google Cloud and Gemini AI for the FIFA World Cup 2026.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Resources</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#about" className="text-sm text-slate-400 hover:text-white transition-colors">About FIFAVerse</a>
              </li>
              <li>
                <a href="#help" className="text-sm text-slate-400 hover:text-white transition-colors">Spectator Guideline</a>
              </li>
              <li>
                <a href="#safety" className="text-sm text-slate-400 hover:text-white transition-colors">Stadium Safety Rules</a>
              </li>
            </ul>
          </div>

          {/* Platform Node Statuses */}
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Operations Nodes</h3>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-center gap-2 text-xs text-slate-400">
                <Cloud className="h-3.5 w-3.5 text-fifa-blue" />
                <span>Google Cloud Run:</span>
                <span className="font-semibold text-fifa-green">Operational</span>
              </li>
              <li className="flex items-center gap-2 text-xs text-slate-400">
                <Cpu className="h-3.5 w-3.5 text-fifa-pink" />
                <span>Gemini API Node:</span>
                <span className="font-semibold text-fifa-green">Active (1.5 Flash)</span>
              </li>
              <li className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5 text-fifa-teal" />
                <span>Firebase Services:</span>
                <span className="font-semibold text-fifa-green">Connected</span>
              </li>
              <li className="flex items-center gap-2 text-xs text-slate-400">
                <Globe className="h-3.5 w-3.5 text-fifa-gold" />
                <span>Maps SDK Engine:</span>
                <span className="font-semibold text-fifa-green">Sync Active</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} FIFA & Google Cloud Partner Project. For demonstration and evaluation purposes.
          </p>
          <div className="flex gap-4 text-xs text-slate-500">
            <span>Powered by Gemini & Firebase</span>
            <span>|</span>
            <span>WCAG 2.1 AA Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
