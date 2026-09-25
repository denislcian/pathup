import AsyncStorage from '@react-native-async-storage/async-storage';
import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

import { todayIso } from '@/domain/age';
import { buildProfile, ROUTER_TIMEOUT } from '@/test/test-utils';

const mockHabits = jest.fn();
const mockLogs = jest.fn();
const mockUpsert = jest.fn();

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
}));

jest.mock('@/lib/supabase', () => {
  const empty = () => Promise.resolve({ data: [], error: null });
  const chain = (table: string) => ({
    select: () => ({
      order: () => (table === 'habits' ? mockHabits() : { limit: empty }),
      gte: () => mockLogs(),
    }),
    upsert: (row: unknown, options?: unknown) => mockUpsert(table, row, options),
  });
  return { isSupabaseConfigured: true, requireSupabase: () => ({ from: chain }) };
});

const mockProfileData = buildProfile();

jest.setTimeout(60_000);

beforeEach(async () => {
  mockHabits.mockReset();
  mockLogs.mockReset();
  mockUpsert.mockReset();
  mockHabits.mockResolvedValue({ data: [], error: null });
  mockLogs.mockResolvedValue({ data: [], error: null });
  mockUpsert.mockResolvedValue({ error: null });
  await AsyncStorage.clear();
});

describe('habits', () => {
  it('starts from a suggestion in one tap', async () => {
    const user = userEvent.setup();
    await renderRouter('./src/app', { initialUrl: '/bienestar' });

    await user.press(await screen.findByRole('button', { name: 'Beber agua' }, ROUTER_TIMEOUT));

    expect(mockUpsert).toHaveBeenCalledWith(
      'habits',
      expect.objectContaining({ user_id: 'user-1', name: 'Beber agua', target: 8, unit: 'vasos' }),
      undefined,
    );
  });

  it('counts glasses of water and ticks habits off for today', async () => {
    const user = userEvent.setup();
    mockHabits.mockResolvedValue({
      data: [
        { id: 'h-water', name: 'Beber agua', target: 8, unit: 'vasos', position: 0 },
        { id: 'h-stretch', name: 'Estirar', target: 1, unit: null, position: 1 },
      ],
      error: null,
    });
    mockLogs.mockResolvedValue({
      data: [{ habit_id: 'h-water', day: todayIso(), count: 3 }],
      error: null,
    });
    await renderRouter('./src/app', { initialUrl: '/bienestar' });

    await user.press(
      await screen.findByRole('button', { name: 'Beber agua: 3 de 8. Sumar uno' }, ROUTER_TIMEOUT),
    );
    expect(mockUpsert).toHaveBeenCalledWith(
      'habit_logs',
      { habit_id: 'h-water', user_id: 'user-1', day: todayIso(), count: 4 },
      { onConflict: 'habit_id,day' },
    );

    await user.press(screen.getByRole('checkbox', { name: 'Estirar: marcar como hecho hoy' }));
    expect(mockUpsert).toHaveBeenCalledWith(
      'habit_logs',
      { habit_id: 'h-stretch', user_id: 'user-1', day: todayIso(), count: 1 },
      { onConflict: 'habit_id,day' },
    );
  });
});
