import { renderRouter, screen } from 'expo-router/testing-library';
import { userEvent } from '@testing-library/react-native';

const TABS = ['Hoy', 'Entreno', 'Progreso', 'Bienestar', 'Perfil'];

// Loading the whole route tree is slow on a busy runner (parallel suites, CI), so give it room.
const ROUTER_TIMEOUT = { timeout: 10_000 };
jest.setTimeout(30_000);

describe('tab navigation', () => {
  it('opens on the Today screen with the five main tabs', async () => {
    await renderRouter('./src/app', { initialUrl: '/' });

    expect(await screen.findByRole('heading', { name: 'Hoy' }, ROUTER_TIMEOUT)).toBeOnTheScreen();
    TABS.forEach((tab, index) => {
      const label = `${tab}, tab, ${index + 1} of ${TABS.length}`;
      expect(screen.getByRole('button', { name: label })).toBeOnTheScreen();
    });
  });

  it('navigates to the profile screen from the tab bar', async () => {
    const user = userEvent.setup();
    await renderRouter('./src/app', { initialUrl: '/' });

    await user.press(await screen.findByRole('button', { name: /^Perfil, tab/ }, ROUTER_TIMEOUT));

    expect(
      await screen.findByRole('heading', { name: 'Perfil' }, ROUTER_TIMEOUT),
    ).toBeOnTheScreen();
  });
});
