import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * False while the web build is pre-rendered and during the first client render, true afterwards.
 *
 * Responsive layouts must match the pre-rendered HTML or React throws away the hydration, so the
 * server and the first paint use the narrow layout and the real width is applied right after.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
