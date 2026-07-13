import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { isChunkLoadError, reloadForStaleChunk } from '@/shared/utils/chunkLoad.utils';
import { LANG_KEY } from '@/app/config/constants';

interface Props  { children: ReactNode; fallback?: ReactNode; }
interface State  { status: 'ok' | 'reloading' | 'crashed'; error: Error | null; }

/** A render crash used to force `window.location.assign('/auth/login')` for
 *  ANY uncaught error — indistinguishable from a real session expiry, which
 *  masked unrelated bugs (e.g. a bad API response shape) as "logged out".
 *  Only a genuine stale-chunk error reloads/redirects now; anything else
 *  shows an in-page fallback instead. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { status: 'ok', error: null };

  static getDerivedStateFromError(error: Error): State {
    if (isChunkLoadError(error)) {
      return { status: 'reloading', error };
    }
    return { status: 'crashed', error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);

    if (isChunkLoadError(error)) {
      reloadForStaleChunk();
    }
  }

  render() {
    if (this.state.status === 'reloading') {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size={40} />
        </div>
      );
    }

    if (this.state.status === 'crashed') {
      const isAr = (localStorage.getItem(LANG_KEY) ?? 'ar') === 'ar';
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {isAr ? 'حدث خطأ غير متوقع' : 'Something went wrong'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isAr
                  ? 'حاول إعادة تحميل الصفحة. إذا استمرت المشكلة، تواصل مع الدعم الفني.'
                  : 'Try reloading the page. If the problem persists, contact support.'}
              </p>
              {this.state.error && (
                <p className="text-xs font-mono text-gray-400 dark:text-gray-500 break-all">
                  {this.state.error.message}
                </p>
              )}
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                           bg-[#A0CD39] text-gray-900 hover:bg-[#8fb832] transition-colors"
              >
                {isAr ? 'إعادة تحميل الصفحة' : 'Reload page'}
              </button>
              <button
                type="button"
                onClick={() => window.location.assign('/')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                           border border-gray-200 dark:border-gray-700
                           text-gray-700 dark:text-gray-300
                           hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {isAr ? 'الرئيسية' : 'Home'}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
