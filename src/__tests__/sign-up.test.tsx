import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

import { birthDateYearsAgo, ROUTER_TIMEOUT } from '@/test/test-utils';

const mockSignUp = jest.fn();

jest.mock('@/lib/supabase', () => {
  class SupabaseNotConfiguredError extends Error {}
  return {
    supabase: null,
    isSupabaseConfigured: true,
    SupabaseNotConfiguredError,
    requireSupabase: () => ({ auth: { signUp: mockSignUp } }),
  };
});

jest.setTimeout(30_000);

async function openSignUp() {
  await renderRouter('./src/app', { initialUrl: '/registro' });
  await screen.findByRole('heading', { name: 'Crea tu cuenta' }, ROUTER_TIMEOUT);
}

async function fillForm(user: ReturnType<typeof userEvent.setup>, birthDate: string) {
  await user.type(screen.getByLabelText('Nombre'), 'Ana');
  await user.type(screen.getByLabelText('Email'), 'ana@example.com');
  await user.type(screen.getByLabelText('Contraseña'), 'correct-horse');
  await user.type(screen.getByLabelText('Fecha de nacimiento'), birthDate.replaceAll('/', ''));
  await user.press(screen.getByRole('checkbox', { name: /política de privacidad/ }));
  await user.press(screen.getByRole('checkbox', { name: /consentimiento explícito/ }));
}

beforeEach(() => {
  mockSignUp.mockReset();
});

describe('sign-up screen', () => {
  it('explains every missing field instead of calling the server', async () => {
    const user = userEvent.setup();
    await openSignUp();

    await user.press(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(await screen.findByText('Escribe tu nombre')).toBeOnTheScreen();
    expect(screen.getByText('Escribe un email válido')).toBeOnTheScreen();
    expect(screen.getByText('Necesitas aceptar la política de privacidad')).toBeOnTheScreen();
    expect(
      screen.getByText('Sin este consentimiento no podemos guardar tus entrenos'),
    ).toBeOnTheScreen();
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('blocks people under 16 before reaching the server', async () => {
    const user = userEvent.setup();
    await openSignUp();

    await fillForm(user, birthDateYearsAgo(15));
    await user.press(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(await screen.findByText('PathUp es para mayores de 16 años')).toBeOnTheScreen();
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('creates the account with the birth date and health consent as metadata', async () => {
    const user = userEvent.setup();
    mockSignUp.mockResolvedValue({ data: { session: null }, error: null });
    await openSignUp();

    await fillForm(user, '01/03/1995');
    expect(screen.getByLabelText('Fecha de nacimiento')).toHaveDisplayValue('01/03/1995');
    await user.press(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(await screen.findByText('Revisa tu email')).toBeOnTheScreen();
    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'ana@example.com',
      password: 'correct-horse',
      options: {
        data: { display_name: 'Ana', birth_date: '1995-03-01', health_data_consent: true },
      },
    });
  });

  it('shows a clear message when the email is already registered', async () => {
    const user = userEvent.setup();
    mockSignUp.mockResolvedValue({
      data: { session: null },
      error: { code: 'user_already_exists' },
    });
    await openSignUp();

    await fillForm(user, '01/03/1995');
    await user.press(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(await screen.findByText('Ya existe una cuenta con ese email')).toBeOnTheScreen();
  });
});
