import AsyncStorage from '@react-native-async-storage/async-storage';
import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

import { DEFAULT_REST_SECONDS } from '@/domain/workout';
import { useActiveWorkout } from '@/features/workout/active-workout-store';
import { buildProfile, ROUTER_TIMEOUT } from '@/test/test-utils';

const mockWorkoutRows = jest.fn();
const mockEnrollment = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();

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
      order: () => ({ limit: () => mockWorkoutRows() }),
      eq: () => ({ maybeSingle: () => mockEnrollment() }),
    }),
    insert: (row: unknown) => mockInsert(table, row),
    update: (patch: unknown) => ({ eq: () => mockUpdate(table, patch) }),
  });
  return { isSupabaseConfigured: true, requireSupabase: () => ({ from: chain }) };
});

const mockProfileData = buildProfile({
  experience_level: 'beginner',
  training_days_per_week: 3,
  equipment: ['gym'],
  goal: 'muscle',
});

jest.setTimeout(60_000);

function benchSession(id: string, sessionKey: string, weight: number) {
  const startedAt = new Date(Date.now() - 2 * 86400000).toISOString();
  return {
    id,
    name: 'Día A · Cuerpo completo',
    started_at: startedAt,
    ended_at: startedAt,
    program_slug: 'primeros-pasos',
    program_session: sessionKey,
    workout_exercises: [
      {
        id: `${id}-e1`,
        exercise_slug: 'press-banca-barra',
        position: 0,
        workout_sets: [0, 1, 2].map((position) => ({
          id: `${id}-s${position}`,
          position,
          set_type: 'normal',
          weight_kg: weight,
          reps: 10,
          rir: 2,
          completed_at: startedAt,
        })),
      },
    ],
  };
}

beforeEach(async () => {
  mockWorkoutRows.mockReset();
  mockEnrollment.mockReset();
  mockInsert.mockReset();
  mockUpdate.mockReset();
  mockWorkoutRows.mockResolvedValue({ data: [], error: null });
  mockEnrollment.mockResolvedValue({ data: null, error: null });
  mockInsert.mockResolvedValue({ error: null });
  mockUpdate.mockResolvedValue({ error: null });
  await AsyncStorage.clear();
  useActiveWorkout.setState({ workout: null, restEndsAt: null, restSeconds: DEFAULT_REST_SECONDS });
});

describe('guided programmes', () => {
  it('invites you to choose a programme and starts the one you pick', async () => {
    const user = userEvent.setup();
    await renderRouter('./src/app', { initialUrl: '/' });

    await user.press(await screen.findByRole('button', { name: 'Ver programas' }, ROUTER_TIMEOUT));

    // The catalogue puts the beginner full body first for a beginner with three days.
    const card = await screen.findByRole(
      'link',
      { name: 'Ver el programa Primeros pasos · cuerpo completo' },
      ROUTER_TIMEOUT,
    );
    expect(screen.getByText('Recomendado para ti')).toBeOnTheScreen();

    await user.press(card);
    await user.press(
      await screen.findByRole('button', { name: 'Empezar este programa' }, ROUTER_TIMEOUT),
    );

    expect(mockInsert).toHaveBeenCalledWith(
      'program_enrollments',
      expect.objectContaining({ user_id: 'user-1', program_slug: 'primeros-pasos' }),
    );
  });

  it('offers the next session and starts it with the weight the progression suggests', async () => {
    const user = userEvent.setup();
    mockEnrollment.mockResolvedValue({
      data: {
        id: 'enr-1',
        program_slug: 'primeros-pasos',
        started_on: '2026-09-01',
        status: 'active',
      },
      error: null,
    });
    // Week 1 session A is done, with the bench at the top of its 6-10 range.
    mockWorkoutRows.mockResolvedValue({ data: [benchSession('w1', 'w1-a', 60)], error: null });

    await renderRouter('./src/app', { initialUrl: '/' });

    expect(
      await screen.findByRole('heading', { name: 'Día B · Cuerpo completo' }, ROUTER_TIMEOUT),
    ).toBeOnTheScreen();
    expect(screen.getByText('1 de 24 sesiones · vas por la semana 1')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Empezar la sesión' }));

    const workout = useActiveWorkout.getState().workout!;
    expect(workout.programSlug).toBe('primeros-pasos');
    expect(workout.programSession).toBe('w1-b');
    expect(workout.exercises.map((exercise) => exercise.slug)).toContain('prensa-piernas');
  });

  it('repeats the session you missed instead of losing the week', async () => {
    mockEnrollment.mockResolvedValue({
      data: {
        id: 'enr-1',
        program_slug: 'primeros-pasos',
        started_on: '2026-09-01',
        status: 'active',
      },
      error: null,
    });
    // B and C are done, A never happened.
    mockWorkoutRows.mockResolvedValue({
      data: [benchSession('w2', 'w1-b', 60), benchSession('w3', 'w1-c', 60)],
      error: null,
    });

    await renderRouter('./src/app', { initialUrl: '/' });

    expect(
      await screen.findByRole('heading', { name: 'Día A · Cuerpo completo' }, ROUTER_TIMEOUT),
    ).toBeOnTheScreen();
  });

  it('suggests more weight in the logger once every set hit the top of the range', async () => {
    const user = userEvent.setup();
    mockEnrollment.mockResolvedValue({
      data: {
        id: 'enr-1',
        program_slug: 'primeros-pasos',
        started_on: '2026-09-01',
        status: 'active',
      },
      error: null,
    });
    mockWorkoutRows.mockResolvedValue({ data: [benchSession('w1', 'w1-b', 60)], error: null });

    await renderRouter('./src/app', { initialUrl: '/' });
    await user.press(
      await screen.findByRole('button', { name: 'Empezar la sesión' }, ROUTER_TIMEOUT),
    );

    // 60 kg x 10 hit the top of 6-10 three times, so the next session starts at 62,5 kg x 6.
    expect(
      await screen.findByLabelText(
        'Peso en kilos, serie 1 de Press banca con barra',
        {},
        ROUTER_TIMEOUT,
      ),
    ).toHaveDisplayValue('62,5');
    expect(
      screen.getByLabelText('Repeticiones, serie 1 de Press banca con barra'),
    ).toHaveDisplayValue('6');
  });
});
