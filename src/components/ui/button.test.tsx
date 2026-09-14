import { render, screen, userEvent } from '@testing-library/react-native';

import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('exposes its label as an accessible button and handles presses', async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();

    await render(<Button label="Empezar entreno" onPress={onPress} />);
    await user.press(screen.getByRole('button', { name: 'Empezar entreno' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('is announced as disabled and ignores presses when disabled', async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();

    await render(<Button label="Guardar" onPress={onPress} disabled />);
    const button = screen.getByRole('button', { name: 'Guardar' });
    await user.press(button);

    expect(button).toBeDisabled();
    expect(onPress).not.toHaveBeenCalled();
  });
});
