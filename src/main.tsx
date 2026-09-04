import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BRAND_LOGO_SRC } from './constants/brandLogo';


// Suppress benign Firebase GrpcConnection and IndexedDB lifecycle stream warnings
const isBenignFirestoreLog = (args: any[]): boolean => {
  const msg = args.map(a => {
    if (typeof a === 'string') return a;
    if (a instanceof Error) return a.message + ' ' + (a.stack || '');
    try { return JSON.stringify(a); } catch { return String(a); }
  }).join(' ');
  return (
    msg.includes('GrpcConnection RPC') ||
    msg.includes('Disconnecting idle stream') ||
    msg.includes('CANCELLED: Disconnecting idle stream') ||
    msg.includes('Timed out waiting for new targets') ||
    msg.includes('code=resource-exhausted') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('@firebase/firestore') ||
    msg.includes('Database is closing') ||
    msg.includes('Database is closed') ||
    msg.includes('The database connection is closing') ||
    msg.includes('InvalidStateError') ||
    msg.includes('IDBDatabase') ||
    msg.includes('IndexedDB') ||
    msg.includes('indexedDb') ||
    msg.includes('closing/hidden')
  );
};

const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  if (isBenignFirestoreLog(args)) return;
  originalConsoleError(...args);
};

const originalConsoleWarn = console.warn;
console.warn = (...args: any[]) => {
  if (isBenignFirestoreLog(args)) return;
  originalConsoleWarn(...args);
};

const originalConsoleInfo = console.info;
console.info = (...args: any[]) => {
  if (isBenignFirestoreLog(args)) return;
  originalConsoleInfo(...args);
};

const originalConsoleLog = console.log;
console.log = (...args: any[]) => {
  if (isBenignFirestoreLog(args)) return;
  originalConsoleLog(...args);
};

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const msg = (reason instanceof Error ? reason.message : '') + ' ' + String(reason?.message || reason || '');
  if (
    msg.includes('The play() request was interrupted') ||
    msg.includes('Failed to fetch') ||
    msg.includes('Load failed') ||
    msg.includes('NetworkError') ||
    msg.includes('Database is closing') ||
    msg.includes('Database is closed') ||
    msg.includes('The database connection is closing') ||
    msg.includes('InvalidStateError') ||
    msg.includes('IDBDatabase') ||
    msg.includes('closing/hidden') ||
    msg.includes('closing') ||
    msg.includes('IndexedDB') ||
    msg.includes('indexedDb') ||
    msg.includes('client is offline') ||
    msg.includes('GrpcConnection RPC') ||
    msg.includes('Disconnecting idle stream')
  ) {
    event.preventDefault();
    try { event.stopImmediatePropagation(); } catch (e) {}
  }
}, true);

window.addEventListener('error', (event) => {
  const msg = (event.message || '') + ' ' + (event.error?.message || '') + ' ' + String(event.error || '');
  if (
    msg.includes('The play() request was interrupted') ||
    msg.includes('Failed to fetch') ||
    msg.includes('Load failed') ||
    msg.includes('NetworkError') ||
    msg.includes('Database is closing') ||
    msg.includes('Database is closed') ||
    msg.includes('The database connection is closing') ||
    msg.includes('InvalidStateError') ||
    msg.includes('IDBDatabase') ||
    msg.includes('closing/hidden') ||
    msg.includes('closing') ||
    msg.includes('IndexedDB') ||
    msg.includes('indexedDb') ||
    msg.includes('client is offline') ||
    msg.includes('GrpcConnection RPC') ||
    msg.includes('Disconnecting idle stream')
  ) {
    event.preventDefault();
    try { event.stopImmediatePropagation(); } catch (e) {}
  }
}, true);

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
