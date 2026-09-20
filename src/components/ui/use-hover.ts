import { useState } from 'react';
import { Platform } from 'react-native';

/**
 * Pointer hover state for web. On touch devices there is no hover, so the handlers are left out
 * and the flag stays false.
 */
export function useHover() {
  const [hovered, setHovered] = useState(false);

  if (Platform.OS !== 'web') {
    return { hovered: false, hoverProps: {} as const };
  }

  return {
    hovered,
    hoverProps: {
      onPointerEnter: () => setHovered(true),
      onPointerLeave: () => setHovered(false),
    },
  };
}
