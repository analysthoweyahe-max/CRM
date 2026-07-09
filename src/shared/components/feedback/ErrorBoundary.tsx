import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { isChunkLoadError, reloadForStaleChunk } from '@/shared/utils/chunkLoad.utils';

interface Props  { children: ReactNode; fallback?: ReactNode; }
interface State  { recovering: boolean; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { recovering: false };

  static getDerivedStateFromError(error: Error): State {
    if (isChunkLoadError(error)) {
      return { recovering: true };
    }
    return { recovering: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);

    if (isChunkLoadError(error)) {
      reloadForStaleChunk();
      return;
    }

    window.location.assign('/auth/login');
  }

  render() {
    if (this.state.recovering) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size={40} />
        </div>
      );
    }

    return this.props.children;
  }
}
