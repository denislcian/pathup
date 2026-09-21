import AsyncStorage from '@react-native-async-storage/async-storage';
import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

import { todayIso } from '@/domain/age';
import { buildProfile, ROUTER_TIMEOUT } from '@/test/test-utils';

const mockRows = jest.fn();
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

jest.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: true,
  requireSupabase: () => ({
    from: () => ({
      select: () => ({ order: () => mockRows() }),
      upsert: (row: unknown, options: unknown) => mockUpsert(row, options),
    }),
  }),
}));

const mockProfileData = buildProfile();

jest.setTimeout(60_000);

function row(measured_on: string, weight_kg: number | null, waist_cm: number | null = null) {
  return {
    measured_on,
    weight_kg,
    body_fat_pct: null,
    waist_cm,
    hips_cm: null,
    chest_cm: null,
    arm_cm: null,
    thigh_cm: null,
    neck_cm: null,
  };
}

beforeEach(async () => {
  mockRows.mockReset();
  mockUpsert.mockReset();
  mockRows.mockResolvedValue({
    data: [row('2026-09-17', 83.2, 88), row('2026-09-10', 84)],
    error: null,
  });
  mockUpsert.mockResolvedValue({ error: null });
  await AsyncStorage.clear();
});

describe('body measurements', () => {
  it('shows the latest values and saves today’s weight', async () => {
    const user = userEvent.setup();
    await renderRouter('./src/app', { initialUrl: '/medidas' });

    expect(await screen.findByText('83,2 kg', {}, ROUTER_TIMEOUT)).toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: /^Editar .*17 sept.*Peso 83,2 kg · Cintura 88 cm$/ }),
    ).toBeOnTheScreen();

    await user.type(screen.getByLabelText('Peso (kg)'), '82,6');
    await user.press(screen.getByRole('button', { name: 'Guardar medidas' }));

    expect(await screen.findByText('Medidas guardadas')).toBeOnTheScreen();
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-1',
        measured_on: todayIso(),
        weight_kg: 82.6,
        waist_cm: null,
      }),
      { onConflict: 'user_id,measured_on' },
    );
  });

  it('catches a weight typed without the decimal separator', async () => {
    const user = userEvent.setup();
    await renderRouter('./src/app', { initialUrl: '/medidas' });

    await user.type(await screen.findByLabelText('Peso (kg)', {}, ROUTER_TIMEOUT), '826');
    await user.press(screen.getByRole('button', { name: 'Guardar medidas' }));

    expect(await screen.findByText('Entre 20 y 400. ¿Falta una coma?')).toBeOnTheScreen();
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it('asks for at least one value', async () => {
    const user = userEvent.setup();
    await renderRouter('./src/app', { initialUrl: '/medidas' });

    await user.press(
      await screen.findByRole('button', { name: 'Guardar medidas' }, ROUTER_TIMEOUT),
    );

    expect(await screen.findByText('Rellena al menos una medida')).toBeOnTheScreen();
    expect(mockUpsert).not.toHaveBeenCalled();
  });
});
