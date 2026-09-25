import AsyncStorage from '@react-native-async-storage/async-storage';
import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

import { DEFAULT_REST_SECONDS } from '@/domain/workout';
import { useActiveWorkout } from '@/features/workout/active-workout-store';
import { useFinishedWorkout } from '@/features/workout/finished-workout-store';
import { buildProfile, ROUTER_TIMEOUT } from '@/test/test-utils';

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
  useUpdateProfile: () => ({ mutate: jest.fn(), isPending: false, isError: false }),
}));

jest.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: true,
  requireSupabase: () => ({
    from: (table: string) => ({ upsert: (rows: unknown) => mockUpsert(table, rows) }),
  }),
}));

const mockProfileData = buildProfile();

jest.setTimeout(60_000);

type User = ReturnType<typeof userEvent.setup>;

async function logOneSet(user: User) {
  await renderRouter('./src/app', { initialUrl: '/entreno' });

  await user.press(
    await screen.findByRole('button', { name: 'Empezar entreno vacío' }, ROUTER_TIMEOUT),
  );
  await user.press(await screen.findByRole('button', { name: 'Añadir ejercicio' }, ROUTER_TIMEOUT));

  const search = await screen.findByRole('searchbox', { name: 'Buscar ejercicio' }, ROUTER_TIMEOUT);
  await user.type(search, 'banca');
  await user.press(await screen.findByRole('button', { name: /^Press banca con barra/ }));

  const weight = await screen.findByLabelText(
    'Peso en kilos, serie 1 de Press banca con barra',
    {},
    ROUTER_TIMEOUT,
  );
  await user.type(weight, '82,5');
  await user.type(screen.getByLabelText('Repeticiones, serie 1 de Press banca con barra'), '8');
  await user.press(
    screen.getByRole('checkbox', { name: 'Marcar como hecha la serie 1 de Press banca con barra' }),
  );
}

beforeEach(async () => {
  mockUpsert.mockReset();
  mockUpsert.mockResolvedValue({ error: null });
  await AsyncStorage.clear();
  useActiveWorkout.setState({ workout: null, restEndsAt: null, restSeconds: DEFAULT_REST_SECONDS });
  useFinishedWorkout.setState({ workout: null, synced: false });
});

describe('logging a workout', () => {
  it('logs a set, rests and saves the session to the account', async () => {
    const user = userEvent.setup();
    await logOneSet(user);

    // The rest timer starts on its own once a working set is ticked off.
    expect(await screen.findByLabelText('Descanso')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Terminar' }));

    expect(
      await screen.findByRole('heading', { name: 'Entreno guardado' }, ROUTER_TIMEOUT),
    ).toBeOnTheScreen();
    expect(screen.getByText('660 kg')).toBeOnTheScreen();
    expect(screen.getByText('1 serie')).toBeOnTheScreen();
    expect(screen.getByText('Guardado en tu cuenta')).toBeOnTheScreen();
    expect(mockUpsert).toHaveBeenCalledWith('workout_sets', [
      expect.objectContaining({ weight_kg: 82.5, reps: 8, set_type: 'normal' }),
    ]);
  });

  it('celebrates the records the session beats, even offline', async () => {
    const user = userEvent.setup();
    mockUpsert.mockRejectedValue(new Error('offline'));
    // Last week's bench press, as downloaded to the phone the last time there was signal.
    await AsyncStorage.setItem(
      'pathup.workouts.history.v1',
      JSON.stringify([
        {
          id: 'last-week',
          name: 'Torso',
          startedAt: '2026-01-05T18:00:00.000Z',
          endedAt: '2026-01-05T19:00:00.000Z',
          exercises: [
            {
              id: 'e1',
              slug: 'press-banca-barra',
              sets: [
                {
                  id: 's1',
                  type: 'normal',
                  weightKg: 80,
                  reps: 8,
                  rir: null,
                  completedAt: '2026-01-05T18:10:00.000Z',
                },
              ],
            },
          ],
        },
      ]),
    );
    await logOneSet(user);

    await user.press(screen.getByRole('button', { name: 'Terminar' }));

    expect(
      await screen.findByRole('heading', { name: '¡3 récords nuevos!' }, ROUTER_TIMEOUT),
    ).toBeOnTheScreen();
    expect(screen.getByText('82,5 kg × 8 · antes 80 kg')).toBeOnTheScreen();
  });

  it('keeps the workout on the phone when there is no connection', async () => {
    const user = userEvent.setup();
    mockUpsert.mockRejectedValue(new Error('offline'));
    await logOneSet(user);

    await user.press(screen.getByRole('button', { name: 'Terminar' }));

    expect(
      await screen.findByText(
        'Guardado en el móvil. Se subirá solo cuando haya conexión',
        {},
        ROUTER_TIMEOUT,
      ),
    ).toBeOnTheScreen();

    const outbox = await AsyncStorage.getItem('pathup.workouts.outbox.v1');
    expect(JSON.parse(outbox!)).toHaveLength(1);
  });

  it('survives closing the app and shows the session as still running', async () => {
    const user = userEvent.setup();
    await logOneSet(user);

    // The session is on disk, so a fresh start of the app finds it again.
    const stored = await AsyncStorage.getItem('pathup.workouts.active.v1');
    expect(JSON.parse(stored!).state.workout.exercises[0].sets[0]).toMatchObject({
      weightKg: 82.5,
      reps: 8,
    });

    await renderRouter('./src/app', { initialUrl: '/entreno' });

    expect(
      await screen.findByRole('heading', { name: 'Entreno en curso' }, ROUTER_TIMEOUT),
    ).toBeOnTheScreen();
    expect(screen.getByText(/1 serie/)).toBeOnTheScreen();
  });

  it('warns instead of ticking a set with no reps, and lets you mark a warm-up', async () => {
    const user = userEvent.setup();
    await logOneSet(user);

    await user.press(screen.getByRole('button', { name: 'Añadir serie' }));
    await user.clear(screen.getByLabelText('Repeticiones, serie 2 de Press banca con barra'));
    await user.press(
      screen.getByRole('checkbox', {
        name: 'Marcar como hecha la serie 2 de Press banca con barra',
      }),
    );
    expect(
      await screen.findByText('Escribe las repeticiones antes de marcar la serie'),
    ).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: /^Serie 1: Normal/ }));
    await user.press(screen.getByRole('radio', { name: 'Calentamiento' }));
    expect(
      await screen.findByRole('button', { name: /^Serie 1: Calentamiento/ }),
    ).toBeOnTheScreen();
    expect(useActiveWorkout.getState().workout!.exercises[0].sets[0].type).toBe('warmup');
  });

  it('says which plates to load on each side of the bar', async () => {
    const user = userEvent.setup();
    await renderRouter('./src/app', { initialUrl: '/entreno' });

    await user.press(
      await screen.findByRole('button', { name: 'Empezar entreno vacío' }, ROUTER_TIMEOUT),
    );
    await user.press(
      await screen.findByRole('button', { name: 'Añadir ejercicio' }, ROUTER_TIMEOUT),
    );
    await user.type(
      await screen.findByRole('searchbox', { name: 'Buscar ejercicio' }, ROUTER_TIMEOUT),
      'banca',
    );
    await user.press(await screen.findByRole('button', { name: /^Press banca con barra/ }));

    const weight = await screen.findByLabelText(
      'Peso en kilos, serie 1 de Press banca con barra',
      {},
      ROUTER_TIMEOUT,
    );
    await user.type(weight, '62,5');

    expect(screen.getByText('Discos por lado para 62,5 kg')).toBeOnTheScreen();
    expect(screen.getByText('20')).toBeOnTheScreen();
    expect(screen.getByText('1,25')).toBeOnTheScreen();
    expect(screen.getByText('Barra de 20 kg')).toBeOnTheScreen();

    await user.clear(weight);
    await user.type(weight, '15');
    expect(screen.getByText('15 kg es menos que la barra de 20 kg')).toBeOnTheScreen();
  });

  it('swaps an exercise for an alternative and keeps a note with the workout', async () => {
    const user = userEvent.setup();
    await renderRouter('./src/app', { initialUrl: '/entreno' });

    await user.press(
      await screen.findByRole('button', { name: 'Empezar entreno vacío' }, ROUTER_TIMEOUT),
    );
    await user.press(
      await screen.findByRole('button', { name: 'Añadir ejercicio' }, ROUTER_TIMEOUT),
    );
    await user.type(
      await screen.findByRole('searchbox', { name: 'Buscar ejercicio' }, ROUTER_TIMEOUT),
      'banca',
    );
    await user.press(await screen.findByRole('button', { name: /^Press banca con barra/ }));

    // The bench is taken: swap it for the machine before logging anything.
    await user.press(
      await screen.findByRole(
        'button',
        { name: 'Opciones de Press banca con barra' },
        ROUTER_TIMEOUT,
      ),
    );
    await user.press(screen.getByRole('button', { name: 'Cambiar ejercicio' }));
    await user.press(screen.getByRole('button', { name: 'Cambiar a Press de pecho en máquina' }));

    await user.press(
      await screen.findByRole('button', { name: 'Opciones de Press de pecho en máquina' }),
    );
    await user.press(screen.getByRole('button', { name: 'Añadir nota' }));
    await user.type(screen.getByLabelText('Nota de Press de pecho en máquina'), 'Asiento en el 4');

    await user.type(
      screen.getByLabelText('Peso en kilos, serie 1 de Press de pecho en máquina'),
      '50',
    );
    await user.type(
      screen.getByLabelText('Repeticiones, serie 1 de Press de pecho en máquina'),
      '10',
    );
    await user.press(
      screen.getByRole('checkbox', {
        name: 'Marcar como hecha la serie 1 de Press de pecho en máquina',
      }),
    );
    await user.press(screen.getByRole('button', { name: 'Terminar' }));

    await screen.findByRole('heading', { name: 'Entreno guardado' }, ROUTER_TIMEOUT);
    expect(mockUpsert).toHaveBeenCalledWith('workout_exercises', [
      expect.objectContaining({ exercise_slug: 'press-pecho-maquina', notes: 'Asiento en el 4' }),
    ]);
  });

  it('discards a session without saving anything', async () => {
    const user = userEvent.setup();
    await logOneSet(user);

    await user.press(screen.getByRole('button', { name: 'Descartar' }));
    expect(
      await screen.findByRole('heading', { name: '¿Descartar el entreno?' }),
    ).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Descartar' }));

    expect(
      await screen.findByRole('button', { name: 'Empezar entreno vacío' }, ROUTER_TIMEOUT),
    ).toBeOnTheScreen();
    expect(mockUpsert).not.toHaveBeenCalled();
    await expect(AsyncStorage.getItem('pathup.workouts.outbox.v1')).resolves.toBeNull();
  });
});
