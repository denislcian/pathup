import AsyncStorage from '@react-native-async-storage/async-storage';
import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

import { todayIso } from '@/domain/age';
import { DEFAULT_REST_SECONDS } from '@/domain/workout';
import { useActiveWorkout } from '@/features/workout/active-workout-store';
import { buildProfile, ROUTER_TIMEOUT } from '@/test/test-utils';

const mockCheckins = jest.fn();
const mockWorkouts = jest.fn();
const mockEnrollment = jest.fn();
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
  const chain = (table: string) => ({
    select: () => ({
      order: () =>
        table === 'wellness_checkins'
          ? { limit: () => mockCheckins() }
          : { limit: () => mockWorkouts() },
      eq: () => ({ maybeSingle: () => mockEnrollment() }),
    }),
    upsert: (row: unknown, options: unknown) => mockUpsert(table, row, options),
  });
  return { isSupabaseConfigured: true, requireSupabase: () => ({ from: chain }) };
});

const mockProfileData = buildProfile();

jest.setTimeout(60_000);

const enrollment = {
  data: {
    id: 'enr-1',
    program_slug: 'primeros-pasos',
    started_on: '2026-09-01',
    status: 'active',
  },
  error: null,
};

function checkinRow(day: string, overrides: Record<string, number> = {}) {
  return {
    day,
    sleep_hours: 7.5,
    sleep_quality: 4,
    energy: 4,
    stress: 2,
    soreness: 2,
    mood: 4,
    note: null,
    ...overrides,
  };
}

beforeEach(async () => {
  mockCheckins.mockReset();
  mockWorkouts.mockReset();
  mockEnrollment.mockReset();
  mockUpsert.mockReset();
  mockCheckins.mockResolvedValue({ data: [], error: null });
  mockWorkouts.mockResolvedValue({ data: [], error: null });
  mockEnrollment.mockResolvedValue({ data: null, error: null });
  mockUpsert.mockResolvedValue({ error: null });
  await AsyncStorage.clear();
  useActiveWorkout.setState({ workout: null, restEndsAt: null, restSeconds: DEFAULT_REST_SECONDS });
});

describe('wellness check-in', () => {
  it('saves the answers and shows the readiness it produces', async () => {
    const user = userEvent.setup();
    await renderRouter('./src/app', { initialUrl: '/bienestar' });

    expect(
      await screen.findByRole('heading', { name: 'Check-in de hoy' }, ROUTER_TIMEOUT),
    ).toBeOnTheScreen();

    // Slept badly: two taps down from 7,5 h and the lowest answers on sleep and energy.
    await user.press(screen.getByRole('button', { name: 'Media hora menos de sueño' }));
    await user.press(screen.getByRole('button', { name: 'Media hora menos de sueño' }));
    await user.press(screen.getByRole('radio', { name: /^¿Qué tal has dormido\?: 1/ }));
    await user.press(screen.getByRole('radio', { name: /^¿Cómo andas de energía\?: 1/ }));
    await user.press(screen.getByRole('button', { name: 'Guardar check-in' }));

    expect(mockUpsert).toHaveBeenCalledWith(
      'wellness_checkins',
      expect.objectContaining({
        user_id: 'user-1',
        day: todayIso(),
        sleep_hours: 6.5,
        sleep_quality: 1,
        energy: 1,
        readiness: expect.any(Number),
      }),
      { onConflict: 'user_id,day' },
    );

    const saved = mockUpsert.mock.calls[0][1] as { readiness: number };
    expect(saved.readiness).toBeLessThan(50);
  });

  it('adapts today’s session when the check-in says it was a bad day', async () => {
    const user = userEvent.setup();
    mockEnrollment.mockResolvedValue(enrollment);
    mockCheckins.mockResolvedValue({
      data: [
        checkinRow(todayIso(), {
          sleep_hours: 4.5,
          sleep_quality: 1,
          energy: 1,
          stress: 5,
          soreness: 5,
        }),
      ],
      error: null,
    });

    await renderRouter('./src/app', { initialUrl: '/' });

    const start = await screen.findByRole(
      'button',
      { name: 'Empezar la sesión ajustada' },
      ROUTER_TIMEOUT,
    );
    // The readiness card explains the day before the session is started.
    expect(screen.getAllByText('Día para cuidarse').length).toBeGreaterThan(0);

    await user.press(start);

    // Week 1 of the beginner programme plans 3 sets of squats; a bad day leaves 2.
    const workout = useActiveWorkout.getState().workout!;
    expect(workout.exercises[0].sets).toHaveLength(2);
  });

  it('starts the session as planned when you ignore the advice', async () => {
    const user = userEvent.setup();
    mockEnrollment.mockResolvedValue(enrollment);
    mockCheckins.mockResolvedValue({
      data: [checkinRow(todayIso(), { sleep_hours: 5, sleep_quality: 2, energy: 2 })],
      error: null,
    });

    await renderRouter('./src/app', { initialUrl: '/' });
    await user.press(
      await screen.findByRole('button', { name: 'Empezar sin ajustar' }, ROUTER_TIMEOUT),
    );

    expect(useActiveWorkout.getState().workout!.exercises[0].sets).toHaveLength(3);
  });

  it('leaves a good day alone', async () => {
    mockEnrollment.mockResolvedValue(enrollment);
    mockCheckins.mockResolvedValue({
      data: [
        checkinRow(todayIso(), {
          sleep_hours: 8,
          sleep_quality: 5,
          energy: 5,
          stress: 1,
          soreness: 1,
        }),
      ],
      error: null,
    });

    await renderRouter('./src/app', { initialUrl: '/' });

    expect(
      await screen.findByRole('button', { name: 'Empezar la sesión' }, ROUTER_TIMEOUT),
    ).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Empezar sin ajustar' })).not.toBeOnTheScreen();
    expect(screen.getByText('Gran día')).toBeOnTheScreen();
  });
});
