import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Menu, X, Globe, ShieldAlert, Accessibility, LogOut, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar: React.FC = () => {
  const { 
    language, 
    setLanguage, 
    accessibilityMode, 
    setAccessibilityMode, 
    user, 
    logoutUser, 
    t 
  } = useApp();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: t('navigation'), path: '/navigation' },
    { name: t('crowd'), path: '/crowd' },
    { name: t('transport'), path: '/transport' },
    { name: t('sustainability'), path: '/sustainability' },
    { name: t('volunteer'), path: '/volunteer' },
    { name: t('organizer'), path: '/organizer' },
  ];

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'pt', label: 'Português' },
    { code: 'ar', label: 'العربية' },
    { code: 'hi', label: 'हिन्दी' },
  ];

  const handleLangChange = (code: string) => {
    setLanguage(code as any);
    setShowLangMenu(false);
  };

  const currentLangLabel = languages.find(l => l.code === language)?.label || 'English';

  return (
    <header className="sticky top-0 z-50 w-full bg-fifa-purple/35 border-b border-white/5 backdrop-blur-xl shadow-lg shadow-black/15">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative h-8 w-8 overflow-hidden rounded-lg bg-gradient-to-tr from-fifa-blue via-fifa-pink to-fifa-gold p-[2px]">
                <div className="flex h-full w-full items-center justify-center rounded-md bg-fifa-dark text-xs font-bold text-white group-hover:scale-95 transition-transform">
                  FWC
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-md font-black tracking-wider text-white flex items-center">
                  FIFA<span className="text-fifa-teal">Verse</span>
                  <span className="ml-1 rounded bg-fifa-blue/20 px-1 py-[1px] text-[9px] font-bold text-fifa-blue border border-fifa-blue/30">AI</span>
                </span>
                <span className="text-[8px] text-slate-400 font-medium tracking-tight -mt-[3px]">
                  26 Stadium Operations
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold tracking-tight whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-white/10 text-white border-b-2 border-fifa-teal rounded-b-none'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Quick Utility Operations */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Accessibility Toggle */}
            <button
              onClick={() => setAccessibilityMode(!accessibilityMode)}
              className={`rounded-full p-1.5 transition-all border ${
                accessibilityMode
                  ? 'bg-fifa-teal text-fifa-dark border-fifa-teal shadow-neon-teal/30 scale-105'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
              title="Toggle Accessibility Mode"
              aria-label="Toggle Accessibility Mode"
            >
              <Accessibility className="h-3.5 w-3.5" />
            </button>

            {/* Language Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1 rounded-lg bg-white/5 border border-white/10 px-2 py-1 text-[10px] font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all"
              >
                <Globe className="h-3 w-3" />
                <span>{currentLangLabel}</span>
              </button>


              <AnimatePresence>
                {showLangMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowLangMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-40 origin-top-right rounded-xl border border-white/15 bg-fifa-purple/90 p-1 shadow-lg backdrop-blur-xl z-20"
                    >
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => handleLangChange(lang.code)}
                          className={`w-full rounded-lg px-3 py-1.5 text-left text-xs font-medium hover:bg-white/10 hover:text-white transition-colors ${
                            language === lang.code ? 'text-fifa-teal bg-white/5' : 'text-slate-300'
                          }`}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* User Indicator */}
            {user ? (
              <div className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-1 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className={`h-2 w-2 rounded-full ${user.role === 'organizer' ? 'bg-fifa-gold animate-pulse' : 'bg-fifa-green'}`} />
                  <span className="font-semibold text-slate-200 capitalize">{user.name} ({user.role})</span>
                </div>
                <button
                  onClick={logoutUser}
                  className="ml-2 text-slate-400 hover:text-fifa-red transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <Link
                to="/volunteer"
                className="flex items-center gap-1.5 rounded-lg bg-fifa-blue border border-fifa-blue/50 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-fifa-blue/80 hover:shadow-neon-teal/10 transition-all"
              >
                <User className="h-3.5 w-3.5" />
                <span>Portal Log</span>
              </Link>
            )}

            {/* SOS Emergency button */}
            <Link
              to="/emergency"
              className="flex items-center gap-1.5 rounded-lg bg-fifa-red px-3.5 py-1.5 text-xs font-black tracking-wide text-white hover:bg-red-500 pulse-glow-red transition-all"
            >
              <ShieldAlert className="h-4 w-4" />
              <span>SOS Emergency</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setAccessibilityMode(!accessibilityMode)}
              className={`rounded-full p-2 transition-all ${
                accessibilityMode ? 'bg-fifa-teal text-fifa-dark' : 'bg-white/5 text-slate-300'
              }`}
            >
              <Accessibility className="h-4 w-4" />
            </button>
            <Link
              to="/emergency"
              className="rounded-lg bg-fifa-red p-2 text-white pulse-glow-red"
            >
              <ShieldAlert className="h-4 w-4" />
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-lg bg-white/5 p-2 text-slate-300 hover:bg-white/10 hover:text-white"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-white/5 bg-fifa-purple/95 backdrop-blur-xl"
          >
            <div className="space-y-1 px-4 py-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-base font-semibold text-slate-200 hover:bg-white/5 hover:text-white"
                >
                  {item.name}
                </Link>
              ))}

              <div className="border-t border-white/10 my-3 pt-3">
                {/* Language Select mobile */}
                <div className="flex flex-wrap gap-2 px-3 pb-3">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        handleLangChange(lang.code);
                        setIsOpen(false);
                      }}
                      className={`rounded px-2.5 py-1 text-xs font-semibold ${
                        language === lang.code ? 'bg-fifa-teal text-fifa-dark' : 'bg-white/5 text-slate-300'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>

                {user ? (
                  <div className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg mx-3">
                    <span className="text-sm font-semibold text-slate-300 capitalize">{user.name} ({user.role})</span>
                    <button
                      onClick={() => {
                        logoutUser();
                        setIsOpen(false);
                      }}
                      className="text-fifa-red text-sm flex items-center gap-1 font-semibold"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/volunteer"
                    onClick={() => setIsOpen(false)}
                    className="block text-center rounded-lg bg-fifa-blue py-2.5 mx-3 text-base font-bold text-white"
                  >
                    Portal Login
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
