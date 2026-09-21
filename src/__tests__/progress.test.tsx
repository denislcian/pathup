import AsyncStorage from '@react-native-async-storage/async-storage';
import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

import { DEFAULT_REST_SECONDS } from '@/domain/workout';
import { useActiveWorkout } from '@/features/workout/active-workout-store';
import { buildProfile, ROUTER_TIMEOUT } from '@/test/test-utils';

const mockLimit = jest.fn();
const mockDelete = jest.fn();

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
      select: () => ({ order: () => ({ limit: () => mockLimit() }) }),
      delete: () => ({ eq: (_column: string, id: string) => mockDelete(id) }),
    }),
  }),
}));

const mockProfileData = buildProfile();

jest.setTimeout(60_000);

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(18, 0, 0, 0);
  return date.toISOString();
}

function benchWorkout(id: string, startedAt: string, weight: number) {
  return {
    id,
    name: id === 'w2' ? 'Torso pesado' : 'Torso',
    started_at: startedAt,
    ended_at: new Date(new Date(startedAt).getTime() + 50 * 60 * 1000).toISOString(),
    workout_exercises: [
      {
        id: `${id}-e1`,
        exercise_slug: 'press-banca-barra',
        position: 0,
        workout_sets: [0, 1].map((position) => ({
          id: `${id}-s${position}`,
          position,
          set_type: 'normal',
          weight_kg: weight,
          reps: 8,
          rir: 2,
          completed_at: startedAt,
        })),
      },
    ],
  };
}

beforeEach(async () => {
  mockLimit.mockReset();
  mockDelete.mockReset();
  mockLimit.mockResolvedValue({
    data: [benchWorkout('w2', daysAgo(3), 85), benchWorkout('w1', daysAgo(10), 80)],
    error: null,
  });
  mockDelete.mockResolvedValue({ error: null });
  await AsyncStorage.clear();
  useActiveWorkout.setState({ workout: null, restEndsAt: null, restSeconds: DEFAULT_REST_SECONDS });
});

describe('progress', () => {
  it('shows the history, the streak and the records', async () => {
    await renderRouter('./src/app', { initialUrl: '/progreso' });

    expect(
      await screen.findByRole('heading', { name: 'Tus récords' }, ROUTER_TIMEOUT),
    ).toBeOnTheScreen();
    expect(screen.getByText('En total')).toBeOnTheScreen();
    expect(screen.getByText('2 entrenos')).toBeOnTheScreen();
    expect(screen.getByRole('link', { name: /^Abrir Torso pesado del/ })).toBeOnTheScreen();
    expect(
      screen.getByRole('link', { name: /^Press banca con barra\. 1RM estimado 107,7 kg/ }),
    ).toBeOnTheScreen();
  });

  it('opens a session, shows the record it set and repeats it', async () => {
    const user = userEvent.setup();
    await renderRouter('./src/app', { initialUrl: '/progreso' });

    await user.press(
      await screen.findByRole('link', { name: /^Abrir Torso pesado del/ }, ROUTER_TIMEOUT),
    );

    expect(
      await screen.findByRole('heading', { name: '¡3 récords nuevos!' }, ROUTER_TIMEOUT),
    ).toBeOnTheScreen();
    expect(screen.getByText('680 kg (85 kg × 8) · antes 640 kg')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Repetir entreno' }));

    expect(
      await screen.findByLabelText(
        'Peso en kilos, serie 2 de Press banca con barra',
        {},
        ROUTER_TIMEOUT,
      ),
    ).toHaveDisplayValue('85');
    const planned = useActiveWorkout.getState().workout!;
    expect(planned.name).toBe('Torso pesado');
    expect(planned.exercises[0].sets.every((set) => set.completedAt === null)).toBe(true);
  });

  it('deletes a session after asking', async () => {
    const user = userEvent.setup();
    await renderRouter('./src/app', { initialUrl: '/historial/w1' });

    await user.press(await screen.findByRole('button', { name: 'Borrar' }, ROUTER_TIMEOUT));
    expect(await screen.findByRole('heading', { name: '¿Borrar este entreno?' })).toBeOnTheScreen();
    expect(mockDelete).not.toHaveBeenCalled();

    await user.press(screen.getByRole('button', { name: 'Borrar' }));

    expect(mockDelete).toHaveBeenCalledWith('w1');
    expect(
      await screen.findByRole('heading', { name: 'Tus récords' }, ROUTER_TIMEOUT),
    ).toBeOnTheScreen();
  });

  it('invites you to train when there is no history yet', async () => {
    mockLimit.mockResolvedValue({ data: [], error: null });
    await renderRouter('./src/app', { initialUrl: '/progreso' });

    expect(
      await screen.findByRole('button', { name: 'Empezar un entreno' }, ROUTER_TIMEOUT),
    ).toBeOnTheScreen();
  });
});
