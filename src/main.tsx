import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BRAND_LOGO_SRC } from './constants/brandLogo';

// Ensure browser tab favicon is always set with authentic brand logo
(function setFavicon() {
  try {
    const existing = document.querySelectorAll("link[rel*='icon']");
    existing.forEach((el) => el.remove());

    const iconLink = document.createElement('link');
    iconLink.rel = 'icon';
    iconLink.type = 'image/png';
    iconLink.href = BRAND_LOGO_SRC;
    document.head.appendChild(iconLink);

    const shortcutLink = document.createElement('link');
    shortcutLink.rel = 'shortcut icon';
    shortcutLink.href = BRAND_LOGO_SRC;
    document.head.appendChild(shortcutLink);

    const appleIcon = document.createElement('link');
    appleIcon.rel = 'apple-touch-icon';
    appleIcon.href = BRAND_LOGO_SRC;
    document.head.appendChild(appleIcon);
  } catch (e) {
    console.warn('Favicon injection notice:', e);
  }
})();

// Suppress benign Firebase GrpcConnection idle stream warnings
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  const msg = args.map(a => typeof a === 'string' ? a : (a instanceof Error ? a.message : String(a))).join(' ');
  if (
    msg.includes('GrpcConnection RPC') ||
    msg.includes('Disconnecting idle stream') ||
    msg.includes('CANCELLED: Disconnecting idle stream') ||
    msg.includes('Timed out waiting for new targets')
  ) {
    return;
  }
  originalConsoleError(...args);
};

const originalConsoleWarn = console.warn;
console.warn = (...args: any[]) => {
  const msg = args.map(a => typeof a === 'string' ? a : (a instanceof Error ? a.message : String(a))).join(' ');
  if (
    msg.includes('GrpcConnection RPC') ||
    msg.includes('Disconnecting idle stream') ||
    msg.includes('CANCELLED: Disconnecting idle stream') ||
    msg.includes('Timed out waiting for new targets')
  ) {
    return;
  }
  originalConsoleWarn(...args);
};

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const msg = reason?.message || String(reason || '');
  if (
    msg.includes('The play() request was interrupted') ||
    msg.includes('Failed to fetch') ||
    msg.includes('Load failed') ||
    msg.includes('NetworkError') ||
    msg.includes('Database is closing') ||
    msg.includes('closing') ||
    msg.includes('IndexedDB') ||
    msg.includes('client is offline') || msg.includes('GrpcConnection RPC') || msg.includes('Disconnecting idle stream')
  ) {
    event.preventDefault();
  }
});

window.addEventListener('error', (event) => {
  const msg = event.message || '';
  if (
    msg.includes('The play() request was interrupted') ||
    msg.includes('Failed to fetch') ||
    msg.includes('Load failed') ||
    msg.includes('NetworkError') ||
    msg.includes('Database is closing') ||
    msg.includes('closing') ||
    msg.includes('IndexedDB') ||
    msg.includes('client is offline') || msg.includes('GrpcConnection RPC') || msg.includes('Disconnecting idle stream')
  ) {
    event.preventDefault();
  }
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      console.log('SW registered');
    }).catch(err => {
      console.log('SW reg failed', err);
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
