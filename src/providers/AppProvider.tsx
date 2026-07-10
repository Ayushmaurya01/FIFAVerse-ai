import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppContext } from '../contexts/AppContext';
import { TRANSLATIONS } from '../constants/translations';
import { getSustainabilityLogs, logSustainabilityAction } from '../services/dataService';
import type { AppLanguage, UserSession, SustainabilityLog } from '../types/data';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<AppLanguage>('en');
  const [accessibilityMode, setAccessibilityMode] = useState<boolean>(false);
  const [user, setUser] = useState<UserSession | null>(null);
  
  const [sustainability, setSustainability] = useState<SustainabilityLog>({
    walkingDistance: 0,
    transitDistance: 0,
    bottleRefills: 0,
    digitalTickets: 0,
    wasteReduced: 0,
    co2Saved: 0,
    timestamp: new Date().toISOString(),
  });

  // Load state from local storage or defaults on start
  useEffect(() => {
    const cachedUser = localStorage.getItem('fifa_user_session');
    if (cachedUser) {
      setUser(JSON.parse(cachedUser));
    }
    const cachedLang = localStorage.getItem('fifa_lang') as AppLanguage;
    if (cachedLang) {
      setLanguage(cachedLang);
    }
    const cachedAccess = localStorage.getItem('fifa_accessibility') === 'true';
    setAccessibilityMode(cachedAccess);

    // Initial load of sustainability scores
    getSustainabilityLogs().then((log: any) => {
      if (log) setSustainability(log);
    });
  }, []);

  // Sync accessibility classes to HTML tag for styling adjustments
  useEffect(() => {
    const htmlElement = document.documentElement;
    if (accessibilityMode) {
      htmlElement.classList.add('accessibility-active');
      htmlElement.style.fontSize = '18px';
      htmlElement.style.filter = 'contrast(1.15) saturate(1.1)';
      localStorage.setItem('fifa_accessibility', 'true');
    } else {
      htmlElement.classList.remove('accessibility-active');
      htmlElement.style.fontSize = '';
      htmlElement.style.filter = '';
      localStorage.setItem('fifa_accessibility', 'false');
    }
  }, [accessibilityMode]);

  // Sync language selection to localStorage
  const handleSetLanguage = useCallback((lang: AppLanguage) => {
    setLanguage(lang);
    localStorage.setItem('fifa_lang', lang);
  }, []);

  const loginUser = useCallback((role: 'volunteer' | 'organizer', name: string) => {
    const session: UserSession = {
      role,
      name,
      id: role === 'volunteer' ? 'vol-' + Math.floor(Math.random() * 1000) : 'org-' + Math.floor(Math.random() * 100),
    };
    setUser(session);
    localStorage.setItem('fifa_user_session', JSON.stringify(session));
  }, []);

  const logoutUser = useCallback(() => {
    setUser(null);
    localStorage.removeItem('fifa_user_session');
  }, []);

  // Text-To-Speech Controller
  const speakText = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      const cleanText = text.replace(/[*#`_🚨⚠️]/g, '').trim(); // strip markdown and icons
      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      
      // Select correct voice language
      switch (language) {
        case 'es': utterance.lang = 'es-ES'; break;
        case 'fr': utterance.lang = 'fr-FR'; break;
        case 'pt': utterance.lang = 'pt-PT'; break;
        case 'ar': utterance.lang = 'ar-SA'; break;
        case 'hi': utterance.lang = 'hi-IN'; break;
        default: utterance.lang = 'en-US';
      }
      
      window.speechSynthesis.speak(utterance);
    }
  }, [language]);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const addSustainabilityPoints = useCallback(async (action: Partial<Omit<SustainabilityLog, 'timestamp'>>) => {
    const updated = await logSustainabilityAction(action);
    if (updated) {
      setSustainability(updated as any);
    }
  }, []);

  const t = useCallback((key: string) => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['en']?.[key] || key;
  }, [language]);

  const contextValue = useMemo(() => ({
    language,
    setLanguage: handleSetLanguage,
    accessibilityMode,
    setAccessibilityMode,
    user,
    loginUser,
    logoutUser,
    speakText,
    stopSpeaking,
    sustainability,
    addSustainabilityPoints,
    t,
  }), [
    language,
    handleSetLanguage,
    accessibilityMode,
    user,
    loginUser,
    logoutUser,
    speakText,
    stopSpeaking,
    sustainability,
    addSustainabilityPoints,
    t
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
