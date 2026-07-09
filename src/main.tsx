import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import 'react-loading-skeleton/dist/skeleton.css';
import { AppProvider } from './app/providers/AppProvider';
import { AppRouter }   from './app/router/AppRouter';
import { ErrorBoundary } from '@/shared/components/feedback/ErrorBoundary';
import { AuthProvider } from '@/modules/auth/context/AuthProvider';
import { isChunkLoadError, reloadForStaleChunk } from '@/shared/utils/chunkLoad.utils';

window.addEventListener('unhandledrejection', (event) => {
  if (isChunkLoadError(event.reason)) {
    event.preventDefault();
    reloadForStaleChunk();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <AppRouter />
        </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);
