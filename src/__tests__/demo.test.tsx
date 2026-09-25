import AsyncStorage from '@react-native-async-storage/async-storage';
import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

import { setDemoMode } from '@/lib/demo-mode';
import { ROUTER_TIMEOUT } from '@/test/test-utils';

const mockDatabase = jest.fn();

// A signed-out visitor. Any read or write to the database would go through requireSupabase,
// which the demo must never call.
jest.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => undefined } } }),
      signOut: () => Promise.resolve({ error: null }),
    },
  },
  requireSupabase: () => {
    mockDatabase();
    throw new Error('The demo must not touch the database');
  },
}));

jest.setTimeout(60_000);

beforeEach(async () => {
  mockDatabase.mockReset();
  setDemoMode(false);
  await AsyncStorage.clear();
});

describe('try without an account', () => {
  it('opens the app with sample data and leaves without a trace', async () => {
    const user = userEvent.setup();
    await renderRouter('./src/app', { initialUrl: '/bienvenida' });

    const [tryDemo] = await screen.findAllByRole(
      'button',
      { name: 'Probar sin cuenta' },
      ROUTER_TIMEOUT,
    );
    await user.press(tryDemo);

    expect(
      await screen.findByRole('heading', { name: 'Hola, Marcos' }, ROUTER_TIMEOUT),
    ).toBeOnTheScreen();
    expect(screen.getByRole('heading', { name: 'Estás probando PathUp' })).toBeOnTheScreen();
    // The sample programme is there, with its next session ready to start.
    expect(
      await screen.findByRole('button', { name: /^Empezar la sesión/ }, ROUTER_TIMEOUT),
    ).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Salir de la demo' }));

    expect(
      await screen.findByRole('heading', { name: /Tu camino/ }, ROUTER_TIMEOUT),
    ).toBeOnTheScreen();
    expect(mockDatabase).not.toHaveBeenCalled();
  });
});
