import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './registerSW';

window.addEventListener('error', (e) => {
  if (e.message && (e.message.includes('Invalid hook call') || e.message.includes('useState') || e.message.includes('useContext'))) {
    console.warn('React state corrupted, forcing reload...');
    window.location.reload();
  }
});

registerServiceWorker();

const savedTheme = localStorage.getItem('raqm_theme') || 'default';
document.documentElement.setAttribute('data-theme', savedTheme);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
