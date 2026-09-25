import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

import { ROUTER_TIMEOUT } from '@/test/test-utils';

jest.setTimeout(30_000);

async function openLanding() {
  await renderRouter('./src/app', { initialUrl: '/' });
  await screen.findByRole('heading', { name: /Tu camino/ }, ROUTER_TIMEOUT);
}

describe('landing page', () => {
  it('explains how the app works, section by section', async () => {
    await openLanding();

    for (const heading of [
      'De cero a entrenar con plan, en 4 pasos',
      'Cuéntanos de ti',
      'Recibe tu programa',
      'Entrena y registra',
      'Ajusta y progresa',
      'Lo mejor de cada app, en una sola',
      'Hecha para que la uses, no para venderte nada',
      'Da igual desde dónde empieces',
      'Así avanza PathUp',
      'Preguntas frecuentes',
    ]) {
      expect(screen.getByRole('heading', { name: heading })).toBeOnTheScreen();
    }
  });

  it('is honest about what is available during the beta', async () => {
    await openLanding();

    // Roadmap: September and October are in the app, November and December are not.
    expect(screen.getAllByText('Disponible')).toHaveLength(2);
    // Plus the two features that are not built yet: nutrition and community.
    expect(screen.getAllByText('Próximamente')).toHaveLength(4);
    // Nothing the app cannot do yet is promised as if it could.
    expect(screen.queryByText(/superseries|fotos/i)).not.toBeOnTheScreen();
  });

  it('expands and collapses frequently asked questions', async () => {
    const user = userEvent.setup();
    await openLanding();

    const question = screen.getByRole('button', { name: '¿Necesito ir al gimnasio?' });
    expect(question).toBeCollapsed();
    expect(screen.queryByText(/te mostramos lo que puedes hacer/)).not.toBeOnTheScreen();

    await user.press(question);
    expect(question).toBeExpanded();
    expect(screen.getByText(/te mostramos lo que puedes hacer/)).toBeOnTheScreen();

    await user.press(question);
    expect(screen.queryByText(/te mostramos lo que puedes hacer/)).not.toBeOnTheScreen();
  });

  it('takes visitors to sign-up and sign-in', async () => {
    const user = userEvent.setup();
    await openLanding();

    await user.press(screen.getAllByRole('button', { name: 'Empezar gratis' })[0]);
    expect(
      await screen.findByRole('heading', { name: 'Crea tu cuenta' }, ROUTER_TIMEOUT),
    ).toBeOnTheScreen();
  });
});
