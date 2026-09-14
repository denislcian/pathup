import { render, screen, userEvent } from '@testing-library/react-native';
import { Dumbbell } from 'lucide-react-native';

import { EmptyState } from '@/components/ui/empty-state';

describe('EmptyState', () => {
  it('shows the title as a heading and the description', async () => {
    await render(
      <EmptyState icon={Dumbbell} title="Aún no hay entrenos" description="Empieza uno vacío." />,
    );

    expect(screen.getByRole('heading', { name: 'Aún no hay entrenos' })).toBeOnTheScreen();
    expect(screen.getByText('Empieza uno vacío.')).toBeOnTheScreen();
    expect(screen.queryByRole('button')).not.toBeOnTheScreen();
  });

  it('renders the action only when both label and handler are provided', async () => {
    const user = userEvent.setup();
    const onAction = jest.fn();

    await render(
      <EmptyState
        icon={Dumbbell}
        title="Sin rutinas"
        description="Crea tu primera rutina."
        actionLabel="Crear rutina"
        onAction={onAction}
      />,
    );
    await user.press(screen.getByRole('button', { name: 'Crear rutina' }));

    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
