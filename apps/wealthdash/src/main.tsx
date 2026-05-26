import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Disable scroll-to-change on number inputs globally
document.addEventListener('wheel', () => {
  const el = document.activeElement as HTMLInputElement;
  if (el?.type === 'number') el.blur();
}, { passive: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
