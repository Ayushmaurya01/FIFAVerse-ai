import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSustainabilityLogs, logSustainabilityAction } from '../services/dataService';
import type { VolunteerTask, SustainabilityLog } from '../services/dataService';

export type AppLanguage = 'en' | 'es' | 'fr' | 'pt' | 'ar' | 'hi';

export interface UserSession {
  role: 'volunteer' | 'organizer' | 'fan';
  name: string;
  id: string;
}

interface AppContextType {
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

const AppContext = createContext<AppContextType | undefined>(undefined);

// Core translation dictionary for major UI labels
const TRANSLATIONS: Record<AppLanguage, Record<string, string>> = {
  en: {
    appName: 'FIFAVerse AI',
    slogan: 'Smart Stadium & Operations Platform',
    home: 'Home',
    navigation: 'Navigation',
    crowd: 'Crowd Intel',
    transport: 'Transport',
    accessibility: 'Accessibility',
    volunteer: 'Volunteer',
    organizer: 'Organizer',
    sustainability: 'Sustainability',
    emergency: 'Emergency SOS',
    about: 'About',
    contact: 'Contact',
    welcome: 'Welcome to the FIFA World Cup 2026 Operations Center',
    sos_msg: 'EMERGENCY IN PROGRESS - FOLLOW INSTRUCTIONS BELOW',
    route: 'Find Route',
    search: 'Search Facility',
    volunteer_copilot: 'Volunteer Copilot',
  },
  es: {
    appName: 'FIFAVerse AI',
    slogan: 'Plataforma Inteligente de Estadio y Operaciones',
    home: 'Inicio',
    navigation: 'Navegación Inteligente',
    crowd: 'Intel de Multitud',
    transport: 'Transporte',
    accessibility: 'Accesibilidad',
    volunteer: 'Portal de Voluntarios',
    organizer: 'Panel de Organizador',
    sustainability: 'Sostenibilidad',
    emergency: 'S.O.S. Emergencia',
    about: 'Acerca de',
    contact: 'Contacto',
    welcome: 'Bienvenido al Centro de Operaciones de la Copa Mundial FIFA 2026',
    sos_msg: 'EMERGENCIA EN CURSO - SIGA LAS INSTRUCCIONES SIGUIENTES',
    route: 'Buscar Ruta',
    search: 'Buscar Instalación',
    volunteer_copilot: 'Copiloto de Voluntarios',
  },
  fr: {
    appName: 'FIFAVerse AI',
    slogan: 'Plateforme Intelligente de Stade et d\'Opérations',
    home: 'Accueil',
    navigation: 'Navigation Intelligente',
    crowd: 'Intel Foule',
    transport: 'Transport',
    accessibility: 'Accessibilité',
    volunteer: 'Portail Bénévoles',
    organizer: 'Tableau de Bord',
    sustainability: 'Durabilité',
    emergency: 'Urgence SOS',
    about: 'À Propos',
    contact: 'Contact',
    welcome: 'Bienvenue au Centre d\'Opérations de la Coupe du Monde de la FIFA 2026',
    sos_msg: 'URGENCE EN COURS - SUIVEZ LES INSTRUCTIONS CI-DESSOUS',
    route: 'Trouver un Itinéraire',
    search: 'Rechercher un Équipement',
    volunteer_copilot: 'Copilote Bénévole',
  },
  pt: {
    appName: 'FIFAVerse AI',
    slogan: 'Plataforma Inteligente de Operações e Estádio',
    home: 'Início',
    navigation: 'Navegação Inteligente',
    crowd: 'Intel de Público',
    transport: 'Transporte',
    accessibility: 'Acessibilidade',
    volunteer: 'Portal do Voluntário',
    organizer: 'Painel do Organizador',
    sustainability: 'Sustentabilidade',
    emergency: 'SOS Emergência',
    about: 'Sobre',
    contact: 'Contato',
    welcome: 'Bem-vindo ao Centro de Operações da Copa do Mundo FIFA 2026',
    sos_msg: 'EMERGÊNCIA EM ANDAMENTO - SIGA AS INSTRUÇÕES ABAIXO',
    route: 'Achar Rota',
    search: 'Buscar Instalação',
    volunteer_copilot: 'Copiloto do Voluntário',
  },
  ar: {
    appName: 'FIFAVerse AI',
    slogan: 'منصة إدارة العمليات والاستاد الذكية',
    home: 'الرئيسية',
    navigation: 'التنقل الذكي',
    crowd: 'ذكاء الحشود',
    transport: 'النقل والمواصلات',
    accessibility: 'تسهيل الوصول',
    volunteer: 'بوابة المتطوعين',
    organizer: 'لوحة المنظم',
    sustainability: 'الاستدامة البيئية',
    emergency: 'إشارة SOS الطارئة',
    about: 'عن المنصة',
    contact: 'اتصل بنا',
    welcome: 'مرحباً بكم في مركز عمليات كأس العالم 2026 FIFA',
    sos_msg: 'حالة طوارئ قائمة - يرجى اتباع التعليمات الواردة أدناه',
    route: 'ابحث عن مسار',
    search: 'بحث عن مرفق',
    volunteer_copilot: 'مساعد المتطوع',
  },
  hi: {
    appName: 'FIFAVerse AI',
    slogan: 'स्मार्ट स्टेडियम और संचालन मंच',
    home: 'होम',
    navigation: 'स्मार्ट नेविगेशन',
    crowd: 'भीड़ बुद्धिमत्ता',
    transport: 'परिवहन सहायता',
    accessibility: 'अभिगम्यता सहायता',
    volunteer: 'स्वयंसेवक पोर्टल',
    organizer: 'आयोजक डैशबोर्ड',
    sustainability: 'सस्टेनेबिलिटी',
    emergency: 'आपातकालीन एसओएस',
    about: 'विवरण',
    contact: 'संपर्क',
    welcome: 'फीफा विश्व कप 2026 ऑपरेशंस सेंटर में आपका स्वागत है',
    sos_msg: 'आपातकाल सक्रिय है - कृपया नीचे दिए गए निर्देशों का पालन करें',
    route: 'मार्ग खोजें',
    search: 'सुविधा खोजें',
    volunteer_copilot: 'स्वयंसेवक सह-पायलट',
  },
};

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
    getSustainabilityLogs().then(setSustainability);
  }, []);

  // Sync accessibility classes to HTML tag for styling adjustments
  useEffect(() => {
    const htmlElement = document.documentElement;
    if (accessibilityMode) {
      htmlElement.classList.add('accessibility-active');
      // Large text and high contrast configurations
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
  const handleSetLanguage = (lang: AppLanguage) => {
    setLanguage(lang);
    localStorage.setItem('fifa_lang', lang);
  };

  const loginUser = (role: 'volunteer' | 'organizer', name: string) => {
    const session: UserSession = {
      role,
      name,
      id: role === 'volunteer' ? 'vol-' + Math.floor(Math.random() * 1000) : 'org-' + Math.floor(Math.random() * 100),
    };
    setUser(session);
    localStorage.setItem('fifa_user_session', JSON.stringify(session));
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('fifa_user_session');
  };

  // Text-To-Speech Controller
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      const cleanText = text.replace(/[*#`_]/g, ''); // strip markdown syntax
      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      // Select correct voice rate & pitch based on language
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      
      // Attempt to match system voice languages
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
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const addSustainabilityPoints = async (action: Partial<Omit<SustainabilityLog, 'timestamp'>>) => {
    const updated = await logSustainabilityAction(action);
    setSustainability(updated);
  };

  const t = (key: string) => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['en']?.[key] || key;
  };

  return (
    <AppContext.Provider
      value={{
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
