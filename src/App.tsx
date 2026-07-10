import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages Import
import Home from './pages/Home';
import SmartNavigation from './pages/SmartNavigation';
import CrowdIntelligence from './pages/CrowdIntelligence';
import TransportAssistant from './pages/TransportAssistant';
import AccessibilityHub from './pages/Accessibility';
import MultilingualAI from './pages/MultilingualAI';
import EmergencyCenter from './pages/EmergencyCenter';
import VolunteerPortal from './pages/VolunteerPortal';
import OrganizerDashboard from './pages/OrganizerDashboard';
import SustainabilityHub from './pages/Sustainability';
import About from './pages/About';
import Contact from './pages/Contact';

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <div className="flex flex-col min-h-screen relative bg-fifa-gradient">
          {/* Decorative glowing gradient dots in background */}
          <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-fifa-teal/10 blur-[120px] pointer-events-none z-0" />
          <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-fifa-pink/5 blur-[120px] pointer-events-none z-0" />
          
          <Navbar />
          
          <main className="flex-grow z-10">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/navigation" element={<SmartNavigation />} />
              <Route path="/crowd" element={<CrowdIntelligence />} />
              <Route path="/transport" element={<TransportAssistant />} />
              <Route path="/accessibility" element={<AccessibilityHub />} />
              <Route path="/ai-assistant" element={<MultilingualAI />} />
              {/* Fallback mapping both Module 5 & AI Assistant */}
              <Route path="/multilingual-ai" element={<MultilingualAI />} />
              <Route path="/emergency" element={<EmergencyCenter />} />
              <Route path="/volunteer" element={<VolunteerPortal />} />
              <Route path="/organizer" element={<OrganizerDashboard />} />
              <Route path="/sustainability" element={<SustainabilityHub />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          
          <Footer />
        </div>
      </Router>
    </AppProvider>
  );
};

export default App;
