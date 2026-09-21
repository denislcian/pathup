import { act, render, screen } from '@testing-library/react-native';
import { Vibration } from 'react-native';

import { RestBar } from '@/features/workout/logger-components';

const vibrate = jest.spyOn(Vibration, 'vibrate').mockImplementation(() => undefined);

beforeEach(() => {
  jest.useFakeTimers({ now: new Date('2026-09-21T18:00:00Z') });
  vibrate.mockClear();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('RestBar', () => {
  it('counts down, buzzes when the rest is over and then goes away', async () => {
    const onSkip = jest.fn();
    await render(<RestBar endsAt={Date.now() + 3000} onExtend={jest.fn()} onSkip={onSkip} />);

    expect(screen.getByText('Descanso 0:03')).toBeOnTheScreen();

    await act(() => jest.advanceTimersByTime(3000));

    expect(screen.getByText('¡Descanso terminado!')).toBeOnTheScreen();
    expect(vibrate).toHaveBeenCalledTimes(1);
    expect(onSkip).not.toHaveBeenCalled();

    await act(() => jest.advanceTimersByTime(5000));

    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  it('closes quietly when the rest ran out while the app was closed', async () => {
    const onSkip = jest.fn();
    await render(<RestBar endsAt={Date.now() - 60_000} onExtend={jest.fn()} onSkip={onSkip} />);

    expect(onSkip).toHaveBeenCalledTimes(1);
    expect(vibrate).not.toHaveBeenCalled();
  });
});
