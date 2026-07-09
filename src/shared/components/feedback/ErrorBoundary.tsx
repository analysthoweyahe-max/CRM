import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { clearChunkReloadFlag, isChunkLoadError, reloadForStaleChunk } from '@/shared/utils/chunkLoad.utils';

interface Props  { children: ReactNode; fallback?: ReactNode; }
interface State  { hasError: boolean; message: string; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
    if (isChunkLoadError(error)) {
      reloadForStaleChunk();
    }
  }

  reset = () => {
    if (isChunkLoadError({ message: this.state.message })) {
      clearChunkReloadFlag();
      window.location.reload();
      return;
    }
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <AlertTriangle size={28} className="text-red-500" />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">
            Something went wrong
          </h2>
          {this.state.message && (
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 max-w-sm font-mono">
              {this.state.message}
            </p>
          )}
        </div>
        <button
          onClick={this.reset}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                     bg-[#A0CD39] hover:bg-[#709028] text-white transition-colors"
        >
          <RefreshCw size={14} />
          Try again
        </button>
      </div>
    );
  }
}
