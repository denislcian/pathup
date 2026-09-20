import { router } from 'expo-router';

import { ExerciseBrowser } from '@/features/exercises/exercise-browser';
import { useActiveWorkout } from '@/features/workout/active-workout-store';

export default function ChooseExerciseScreen() {
  const addExercise = useActiveWorkout((state) => state.addExercise);

  return (
    <ExerciseBrowser
      onSelect={(slug) => {
        addExercise(slug);
        router.back();
      }}
    />
  );
}
