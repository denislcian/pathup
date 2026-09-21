import { router } from 'expo-router';

import { useEscapeKey } from '@/components/ui/use-escape-key';
import { ExerciseBrowser } from '@/features/exercises/exercise-browser';
import { useRoutineDraft } from '@/features/routines/routine-draft-store';

export default function ChooseRoutineExerciseScreen() {
  const addExercise = useRoutineDraft((state) => state.addExercise);
  useEscapeKey(() => router.back());

  return (
    <ExerciseBrowser
      onSelect={(slug) => {
        addExercise(slug);
        router.back();
      }}
    />
  );
}
