import { useEffect } from 'react';
import { Platform } from 'react-native';

/** Runs `onEscape` when the Escape key is pressed. Web only; does nothing on native. */
export function useEscapeKey(onEscape: () => void, enabled = true) {
  useEffect(() => {
    if (Platform.OS !== 'web' || !enabled || typeof document === 'undefined') return;

    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onEscape();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onEscape, enabled]);
}
