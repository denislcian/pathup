import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

import { buildProfile, ROUTER_TIMEOUT } from '@/test/test-utils';

const mockMutate = jest.fn();
const mockProfile = {
  data: buildProfile({ onboarding_completed_at: null }) as unknown,
  isPending: false,
  isError: false,
  refetch: jest.fn(),
};

jest.mock('@/features/auth/auth-provider', () => ({
  AuthProvider: ({ children }: { children: unknown }) => children,
  useAuth: () => ({ session: { user: { id: 'user-1', email: 'ana@test.dev' } }, isLoading: false }),
}));

jest.mock('@/features/profile/profile-api', () => ({
  useProfile: () => mockProfile,
  useUpdateProfile: () => ({ mutate: mockMutate, isPending: false, isError: false }),
}));

jest.setTimeout(40_000);

type User = ReturnType<typeof userEvent.setup>;

async function openOnboarding() {
  await renderRouter('./src/app', { initialUrl: '/onboarding' });
  await screen.findByRole('heading', { name: '¿Qué quieres conseguir?' }, ROUTER_TIMEOUT);
}

async function next(user: User) {
  await user.press(screen.getByRole('button', { name: 'Siguiente' }));
}

async function completeFirstSteps(user: User) {
  await user.press(screen.getByRole('radio', { name: 'Ganar músculo' }));
  await next(user);
  await user.press(await screen.findByRole('radio', { name: /^Principiante/ }));
  await next(user);
  await user.press(await screen.findByRole('radio', { name: '3 días' }));
  await next(user);
  await user.press(await screen.findByRole('checkbox', { name: /^Gimnasio completo/ }));
  await next(user);
  await screen.findByRole('heading', { name: 'Antes de empezar' });
}

async function answerScreening(user: User, yesIndex: number | null) {
  const noButtons = screen.getAllByRole('radio', { name: 'No' });
  const yesButtons = screen.getAllByRole('radio', { name: 'Sí' });
  expect(noButtons).toHaveLength(7);
  for (let index = 0; index < noButtons.length; index++) {
    await user.press(index === yesIndex ? yesButtons[index] : noButtons[index]);
  }
}

beforeEach(() => {
  mockMutate.mockReset();
  mockProfile.data = buildProfile({ onboarding_completed_at: null });
});

describe('onboarding', () => {
  it('only lets you continue once the step is answered', async () => {
    const user = userEvent.setup();
    await openOnboarding();

    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled();
    await user.press(screen.getByRole('radio', { name: 'Ganar fuerza' }));
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeEnabled();
  });

  it('hides the fat-loss goal for 16 and 17 year olds', async () => {
    mockProfile.data = buildProfile({ onboarding_completed_at: null, birth_date: '2009-06-01' });
    await openOnboarding();

    expect(screen.queryByRole('radio', { name: 'Perder grasa' })).not.toBeOnTheScreen();
    expect(screen.getByRole('radio', { name: 'Ganar músculo' })).toBeOnTheScreen();
  });

  it('saves every answer when the screening is clear', async () => {
    const user = userEvent.setup();
    await openOnboarding();
    expect(screen.getByRole('radio', { name: 'Perder grasa' })).toBeOnTheScreen();

    await completeFirstSteps(user);
    await answerScreening(user, null);
    await user.press(screen.getByRole('button', { name: 'Empezar' }));

    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        goal: 'muscle',
        experience_level: 'beginner',
        beginner_mode: true,
        training_days_per_week: 3,
        equipment: ['gym'],
        parq_flagged: false,
        onboarding_completed_at: expect.any(String),
      }),
    );
  });

  it('recommends seeing a doctor before saving when any answer is yes', async () => {
    const user = userEvent.setup();
    await openOnboarding();

    await completeFirstSteps(user);
    await answerScreening(user, 1);
    await user.press(screen.getByRole('button', { name: 'Empezar' }));

    expect(
      await screen.findByRole('heading', { name: 'Consulta con tu médico' }),
    ).toBeOnTheScreen();
    expect(mockMutate).not.toHaveBeenCalled();

    await user.press(screen.getByRole('button', { name: 'Entendido' }));
    expect(mockMutate.mock.calls[0][0]).toEqual(expect.objectContaining({ parq_flagged: true }));
  });
});
