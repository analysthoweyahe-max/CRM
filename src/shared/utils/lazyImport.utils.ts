import { lazy, type ComponentType } from 'react';
import { isChunkLoadError, reloadForStaleChunk } from './chunkLoad.utils';

type ModuleWithDefault<T> = { default: T };

export function lazyImport<T extends ComponentType<any>>(
  factory: () => Promise<ModuleWithDefault<T>>,
) {
  return lazy(async () => {
    try {
      return await factory();
    } catch (error) {
      if (isChunkLoadError(error)) {
        reloadForStaleChunk();
        return new Promise<ModuleWithDefault<T>>(() => {});
      }
      throw error;
    }
  });
}
