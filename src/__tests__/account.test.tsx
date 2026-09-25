import AsyncStorage from '@react-native-async-storage/async-storage';
import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

import { buildProfile, ROUTER_TIMEOUT } from '@/test/test-utils';

const mockRpc = jest.fn();
const mockSignOut = jest.fn();
const mockSaveTextFile = jest.fn();

jest.mock('@/features/auth/auth-provider', () => ({
  AuthProvider: ({ children }: { children: unknown }) => children,
  useAuth: () => ({ session: { user: { id: 'user-1', email: 'ana@test.dev' } }, isLoading: false }),
}));

jest.mock('@/features/profile/profile-api', () => ({
  useProfile: () => ({
    data: mockProfileData,
    isPending: false,
    isError: false,
    refetch: jest.fn(),
  }),
  useUpdateProfile: () => ({ mutate: jest.fn(), isPending: false, isError: false }),
  fetchProfile: () => Promise.resolve(mockProfileData),
}));

jest.mock('@/lib/save-file', () => ({
  saveTextFile: (name: string, contents: string) => mockSaveTextFile(name, contents),
}));

jest.mock('@/lib/supabase', () => {
  const empty = () => Promise.resolve({ data: [], error: null });
  const chain = () => ({
    select: () => ({
      order: () => ({
        limit: empty,
        then: (resolve: (value: unknown) => void) => resolve({ data: [], error: null }),
      }),
      eq: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: null }) }),
      gte: empty,
    }),
  });
  return {
    isSupabaseConfigured: true,
    supabase: { auth: { signOut: () => mockSignOut() } },
    requireSupabase: () => ({ from: chain, rpc: (name: string) => mockRpc(name) }),
  };
});

const mockProfileData = buildProfile();

jest.setTimeout(60_000);

beforeEach(async () => {
  mockRpc.mockReset();
  mockSignOut.mockReset();
  mockSaveTextFile.mockReset();
  mockRpc.mockResolvedValue({ error: null });
  mockSignOut.mockResolvedValue({ error: null });
  mockSaveTextFile.mockResolvedValue(true);
  await AsyncStorage.clear();
});

describe('your data and your account', () => {
  it('downloads everything as one JSON file', async () => {
    const user = userEvent.setup();
    await renderRouter('./src/app', { initialUrl: '/cuenta' });

    await user.press(
      await screen.findByRole('button', { name: 'Descargar mis datos' }, ROUTER_TIMEOUT),
    );

    expect(await screen.findByText('Archivo preparado.')).toBeOnTheScreen();
    const [name, contents] = mockSaveTextFile.mock.calls[0] as [string, string];
    expect(name).toMatch(/^pathup-mis-datos-\d{4}-\d{2}-\d{2}\.json$/);
    const data = JSON.parse(contents);
    expect(data).toMatchObject({ app: 'PathUp', profile: { display_name: 'Ana' } });
    expect(data).toHaveProperty('workouts');
    expect(data).toHaveProperty('wellnessCheckins');
  });

  it('only deletes the account after typing the confirmation word', async () => {
    const user = userEvent.setup();
    await AsyncStorage.setItem('pathup.workouts.history.v1', '[]');
    await renderRouter('./src/app', { initialUrl: '/cuenta' });

    const remove = await screen.findByRole(
      'button',
      { name: 'Borrar mi cuenta para siempre' },
      ROUTER_TIMEOUT,
    );
    await user.press(remove);
    expect(mockRpc).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText('Escribe BORRAR para confirmar'), 'borrar');
    await user.press(remove);

    expect(mockRpc).toHaveBeenCalledWith('delete_my_account');
    expect(mockSignOut).toHaveBeenCalled();
    // Nothing of the account stays on the device.
    await expect(AsyncStorage.getItem('pathup.workouts.history.v1')).resolves.toBeNull();
  });
});
