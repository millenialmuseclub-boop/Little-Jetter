import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { LittleJetterApp } from './LittleJetterApp';
import { StudioApp } from './studio/StudioApp';
import { TravelProvider } from './studio/TravelContext';
import './reset.css';

const studioRoutes = ['/studio', '/style', '/explore', '/journal', '/shop'];
const isStudio = studioRoutes.some((route) => location.pathname === route || location.pathname.startsWith(`${route}/`));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isStudio ? <TravelProvider><StudioApp /></TravelProvider> : <LittleJetterApp />}
  </StrictMode>,
);
