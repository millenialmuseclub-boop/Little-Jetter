import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { StudioApp } from './studio/StudioApp';
import { TravelProvider } from './studio/TravelContext';
import './reset.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TravelProvider><StudioApp /></TravelProvider>
  </StrictMode>,
);
