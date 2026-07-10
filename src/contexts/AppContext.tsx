import { createContext, useContext } from 'react';
import type { AppLanguage, UserSession, SustainabilityLog } from '../types/data';

export interface AppContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  accessibilityMode: boolean;
  setAccessibilityMode: (mode: boolean) => void;
  user: UserSession | null;
  loginUser: (role: 'volunteer' | 'organizer', name: string) => void;
  logoutUser: () => void;
  speakText: (text: string) => void;
  stopSpeaking: () => void;
  sustainability: SustainabilityLog;
  addSustainabilityPoints: (action: Partial<Omit<SustainabilityLog, 'timestamp'>>) => Promise<void>;
  t: (key: string) => string;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
