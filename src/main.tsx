import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { LittleJetterApp } from './LittleJetterApp';
import './reset.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LittleJetterApp />
  </StrictMode>,
);
