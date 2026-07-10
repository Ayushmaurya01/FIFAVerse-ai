import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register PWA Service Worker only in production to avoid dev-server caching issues
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('⚡ PWA Service Worker: Registration success. Scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('⚡ PWA Service Worker: Registration failed:', err);
      });
  });
}
