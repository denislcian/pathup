import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage that also works while the web build is pre-rendered in Node, where there is no window
 * and therefore no localStorage. On the server nothing is stored; the browser takes over on hydration.
 */
const noopStorage = {
  getItem: async () => null,
  setItem: async () => undefined,
  removeItem: async () => undefined,
};

export const isServerRender = typeof window === 'undefined';

export const appStorage = isServerRender ? noopStorage : AsyncStorage;
