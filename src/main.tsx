import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import 'react-loading-skeleton/dist/skeleton.css';
import { AppProvider } from './app/providers/AppProvider';
import { AppRouter }   from './app/router/AppRouter';
import { ErrorBoundary } from '@/shared/components/feedback/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AppProvider>
        <AppRouter />
      </AppProvider>
    </ErrorBoundary>
  </StrictMode>,
);
