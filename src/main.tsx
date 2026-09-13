import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { ThemeProvider } from './context/ThemeContext';
import { WatchlistProvider } from './context/WatchlistContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <WatchlistProvider>
        <App />
      </WatchlistProvider>
    </ThemeProvider>
  </React.StrictMode>,
);

// Register Service Worker for PWA Home Screen Installation & Offline Readiness
if ('serviceWorker' in navigator && (import.meta.env.PROD || window.location.protocol === 'https:')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((err) => {
      console.warn('Service Worker registration failed:', err);
    });
  });
}

