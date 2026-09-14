import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

import { buildProfile, fakeSession, ROUTER_TIMEOUT } from '@/test/test-utils';

const mockAuth: { session: unknown; isLoading: boolean } = { session: null, isLoading: false };
const mockProfile: { data: unknown; isPending: boolean; isError: boolean; refetch: jest.Mock } = {
  data: undefined,
  isPending: false,
  isError: false,
  refetch: jest.fn(),
};

jest.mock('@/features/auth/auth-provider', () => ({
  AuthProvider: ({ children }: { children: unknown }) => children,
  useAuth: () => mockAuth,
}));

jest.mock('@/features/profile/profile-api', () => ({
  useProfile: () => mockProfile,
  useUpdateProfile: () => ({ mutate: jest.fn(), isPending: false, isError: false }),
}));

jest.setTimeout(30_000);

function signIn(profile: ReturnType<typeof buildProfile>) {
  mockAuth.session = fakeSession;
  mockProfile.data = profile;
}

beforeEach(() => {
  mockAuth.session = null;
  mockProfile.data = undefined;
  mockProfile.isError = false;
});

describe('route guards', () => {
  it('sends signed-out visitors to the welcome screen', async () => {
    await renderRouter('./src/app', { initialUrl: '/' });

    expect(
      await screen.findByRole('button', { name: 'Crear cuenta' }, ROUTER_TIMEOUT),
    ).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Ya tengo cuenta' })).toBeOnTheScreen();
  });

  it('sends signed-in users without onboarding to the onboarding flow', async () => {
    signIn(buildProfile({ onboarding_completed_at: null }));
    await renderRouter('./src/app', { initialUrl: '/' });

    expect(
      await screen.findByRole('heading', { name: '¿Qué quieres conseguir?' }, ROUTER_TIMEOUT),
    ).toBeOnTheScreen();
  });

  it('opens the tabs for onboarded users and greets them by name', async () => {
    const user = userEvent.setup();
    signIn(buildProfile());
    await renderRouter('./src/app', { initialUrl: '/' });

    expect(
      await screen.findByRole('heading', { name: 'Hola, Ana' }, ROUTER_TIMEOUT),
    ).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: /^Perfil, tab/ }));
    expect(await screen.findByText('ana@test.dev', {}, ROUTER_TIMEOUT)).toBeOnTheScreen();
    expect(screen.getByText('Ganar músculo')).toBeOnTheScreen();
  });

  it('keeps the exercise library behind sign-in', async () => {
    await renderRouter('./src/app', { initialUrl: '/ejercicios' });

    expect(
      await screen.findByRole('button', { name: 'Crear cuenta' }, ROUTER_TIMEOUT),
    ).toBeOnTheScreen();
    expect(screen.queryByRole('searchbox')).not.toBeOnTheScreen();
  });
});

describe('exercise library', () => {
  it('searches, opens an exercise and shows its technique', async () => {
    const user = userEvent.setup();
    signIn(buildProfile());
    await renderRouter('./src/app', { initialUrl: '/ejercicios' });

    const search = await screen.findByRole(
      'searchbox',
      { name: 'Buscar ejercicio' },
      ROUTER_TIMEOUT,
    );
    await user.type(search, 'banca');

    const result = await screen.findByRole('link', { name: /^Press banca con barra/ });
    expect(screen.queryByRole('link', { name: /^Sentadilla goblet/ })).not.toBeOnTheScreen();

    await user.press(result);
    expect(
      await screen.findByRole('heading', { name: 'Claves de técnica' }, ROUTER_TIMEOUT),
    ).toBeOnTheScreen();
    expect(screen.getByText('Imagen en preparación')).toBeOnTheScreen();
  });

  it('filters by what the user can train with', async () => {
    const user = userEvent.setup();
    signIn(buildProfile({ equipment: ['bodyweight'] }));
    await renderRouter('./src/app', { initialUrl: '/ejercicios' });

    await user.press(
      await screen.findByRole('checkbox', { name: 'Solo con mi material' }, ROUTER_TIMEOUT),
    );

    expect(await screen.findByText('2 ejercicios')).toBeOnTheScreen();
    expect(screen.getByRole('link', { name: /^Flexiones/ })).toBeOnTheScreen();
    expect(screen.getByRole('link', { name: /^Plancha/ })).toBeOnTheScreen();
  });
});
