import AsyncStorage from '@react-native-async-storage/async-storage';
import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

import { DEFAULT_REST_SECONDS } from '@/domain/workout';
import { useRoutineDraft } from '@/features/routines/routine-draft-store';
import { useActiveWorkout } from '@/features/workout/active-workout-store';
import { buildProfile, ROUTER_TIMEOUT } from '@/test/test-utils';

const mockRoutineRows = jest.fn();
const mockUpsert = jest.fn();
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

jest.mock('@/lib/supabase', () => {
  const chain = (table: string) => ({
    select: () => ({
      order: () =>
        table === 'routines'
          ? mockRoutineRows()
          : { limit: () => Promise.resolve({ data: [], error: null }) },
    }),
    upsert: (rows: unknown) => mockUpsert(table, rows),
    delete: () => {
      const filter = {
        eq: (column: string, value: string) => {
          mockDelete(table, column, value);
          return filter;
        },
        not: () => filter,
        then: (resolve: (value: { error: null }) => void) => resolve({ error: null }),
      };
      return filter;
    },
  });
  return { isSupabaseConfigured: true, requireSupabase: () => ({ from: chain }) };
});

const mockProfileData = buildProfile();

jest.setTimeout(60_000);

const torso = {
  id: 'r1',
  name: 'Torso A',
  folder: 'Torso / Pierna',
  position: 0,
  routine_exercises: [
    {
      id: 'r1-e1',
      exercise_slug: 'press-banca-barra',
      position: 0,
      target_sets: 3,
      rep_min: 6,
      rep_max: 10,
    },
  ],
};

beforeEach(async () => {
  mockRoutineRows.mockReset();
  mockUpsert.mockReset();
  mockDelete.mockReset();
  mockRoutineRows.mockResolvedValue({ data: [torso], error: null });
  mockUpsert.mockResolvedValue({ error: null });
  await AsyncStorage.clear();
  useActiveWorkout.setState({ workout: null, restEndsAt: null, restSeconds: DEFAULT_REST_SECONDS });
  useRoutineDraft.getState().close();
});

describe('routines', () => {
  it('lists routines by folder and starts one with last time’s weights', async () => {
    const user = userEvent.setup();
    await AsyncStorage.setItem(
      'pathup.workouts.previous.v1',
      JSON.stringify({
        'press-banca-barra': {
          slug: 'press-banca-barra',
          date: '2026-09-14',
          sets: [{ weightKg: 80, reps: 8, type: 'normal' }],
        },
      }),
    );
    await renderRouter('./src/app', { initialUrl: '/entreno' });

    expect(
      await screen.findByRole('heading', { name: 'Torso / Pierna' }, ROUTER_TIMEOUT),
    ).toBeOnTheScreen();
    expect(screen.getByText('3 × 6-10')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Empezar Torso A' }));

    expect(
      await screen.findByLabelText(
        'Peso en kilos, serie 3 de Press banca con barra',
        {},
        ROUTER_TIMEOUT,
      ),
    ).toHaveDisplayValue('80');
    expect(useActiveWorkout.getState().workout!.name).toBe('Torso A');
  });

  it('creates a routine from scratch', async () => {
    const user = userEvent.setup();
    mockRoutineRows.mockResolvedValue({ data: [], error: null });
    await renderRouter('./src/app', { initialUrl: '/entreno' });

    await user.press(await screen.findByRole('button', { name: 'Crear rutina' }, ROUTER_TIMEOUT));
    await user.press(await screen.findByRole('button', { name: 'Guardar rutina' }, ROUTER_TIMEOUT));

    // Nothing is saved until the routine makes sense.
    expect(await screen.findByText('Ponle un nombre a la rutina')).toBeOnTheScreen();
    expect(screen.getByText('Añade al menos un ejercicio')).toBeOnTheScreen();
    expect(mockUpsert).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText('Nombre'), 'Pierna');
    await user.press(screen.getByRole('button', { name: 'Añadir ejercicio' }));
    const search = await screen.findByRole(
      'searchbox',
      { name: 'Buscar ejercicio' },
      ROUTER_TIMEOUT,
    );
    await user.type(search, 'goblet');
    await user.press(await screen.findByRole('button', { name: /^Sentadilla goblet/ }));

    await user.press(
      await screen.findByRole(
        'button',
        { name: 'Una serie más de Sentadilla goblet' },
        ROUTER_TIMEOUT,
      ),
    );
    await user.press(screen.getByRole('button', { name: 'Guardar rutina' }));

    expect(
      await screen.findByRole('heading', { name: 'Mis rutinas' }, ROUTER_TIMEOUT),
    ).toBeOnTheScreen();
    expect(mockUpsert).toHaveBeenCalledWith(
      'routines',
      expect.objectContaining({ user_id: 'user-1', name: 'Pierna', folder: null }),
    );
    expect(mockUpsert).toHaveBeenCalledWith('routine_exercises', [
      expect.objectContaining({
        exercise_slug: 'sentadilla-goblet',
        position: 0,
        target_sets: 4,
        rep_min: 8,
        rep_max: 12,
      }),
    ]);
  });

  it('rejects a rep range that goes backwards', async () => {
    const user = userEvent.setup();
    await renderRouter('./src/app', { initialUrl: '/entreno' });

    await user.press(await screen.findByRole('button', { name: 'Editar' }, ROUTER_TIMEOUT));
    const min = await screen.findByLabelText(
      'Repeticiones mínimas de Press banca con barra',
      {},
      ROUTER_TIMEOUT,
    );
    await user.clear(min);
    await user.type(min, '15');
    await user.press(screen.getByRole('button', { name: 'Guardar rutina' }));

    expect(await screen.findByText(/el mínimo no puede ser mayor que el máximo/)).toBeOnTheScreen();
    expect(mockUpsert).not.toHaveBeenCalled();
  });
});
