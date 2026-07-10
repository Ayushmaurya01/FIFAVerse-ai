import React, { lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './providers/AppProvider';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './utils/errorBoundary';

// Lazy load all pages to optimize bundle splits and initial loading efficiency
const Home = lazy(() => import('./pages/Home'));
const SmartNavigation = lazy(() => import('./pages/SmartNavigation'));
const CrowdIntelligence = lazy(() => import('./pages/CrowdIntelligence'));
const TransportAssistant = lazy(() => import('./pages/TransportAssistant'));
const AccessibilityHub = lazy(() => import('./pages/Accessibility'));
const MultilingualAI = lazy(() => import('./pages/MultilingualAI'));
const EmergencyCenter = lazy(() => import('./pages/EmergencyCenter'));
const VolunteerPortal = lazy(() => import('./pages/VolunteerPortal'));
const OrganizerDashboard = lazy(() => import('./pages/OrganizerDashboard'));
const SustainabilityHub = lazy(() => import('./pages/Sustainability'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Router>
          <div className="flex flex-col min-h-screen relative bg-fifa-gradient">
            {/* Decorative glowing gradient dots in background */}
            <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-fifa-teal/10 blur-[120px] pointer-events-none z-0" />
            <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-fifa-pink/5 blur-[120px] pointer-events-none z-0" />
            
            <Navbar />
            
            <main className="flex-grow z-10">
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/navigation" element={<SmartNavigation />} />
                  <Route path="/crowd" element={<CrowdIntelligence />} />
                  <Route path="/transport" element={<TransportAssistant />} />
                  <Route path="/accessibility" element={<AccessibilityHub />} />
                  <Route path="/ai-assistant" element={<MultilingualAI />} />
                  <Route path="/multilingual-ai" element={<MultilingualAI />} />
                  <Route path="/emergency" element={<EmergencyCenter />} />
                  <Route path="/volunteer" element={<VolunteerPortal />} />
                  <Route path="/organizer" element={<OrganizerDashboard />} />
                  <Route path="/sustainability" element={<SustainabilityHub />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </main>
            
            <Footer />
          </div>
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
};

export default App;
