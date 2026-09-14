import { renderRouter, screen } from 'expo-router/testing-library';
import { userEvent } from '@testing-library/react-native';

const TABS = ['Hoy', 'Entreno', 'Progreso', 'Bienestar', 'Perfil'];

describe('tab navigation', () => {
  it('opens on the Today screen with the five main tabs', async () => {
    await renderRouter('./src/app', { initialUrl: '/' });

    expect(await screen.findByRole('heading', { name: 'Hoy' })).toBeOnTheScreen();
    TABS.forEach((tab, index) => {
      const label = `${tab}, tab, ${index + 1} of ${TABS.length}`;
      expect(screen.getByRole('button', { name: label })).toBeOnTheScreen();
    });
  });

  it('navigates to the profile screen from the tab bar', async () => {
    const user = userEvent.setup();
    await renderRouter('./src/app', { initialUrl: '/' });

    await user.press(await screen.findByRole('button', { name: /^Perfil, tab/ }));

    expect(await screen.findByRole('heading', { name: 'Perfil' })).toBeOnTheScreen();
  });
});
