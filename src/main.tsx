import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import 'react-loading-skeleton/dist/skeleton.css';
import { AppProvider } from './app/providers/AppProvider';
import { AppRouter }   from './app/router/AppRouter';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <AppRouter />
    </AppProvider>
  </StrictMode>,
);
