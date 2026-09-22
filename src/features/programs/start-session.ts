import { router } from 'expo-router';

import { getExercise } from '@/data/exercises';
import { plannedSessionToTemplate, type PlannedSession, type Program } from '@/domain/programs';
import { applyAdjustment, type SessionAdjustment } from '@/domain/wellness';
import { useActiveWorkout } from '@/features/workout/active-workout-store';
import { readPreviousPerformance } from '@/features/workout/workout-storage';

/**
 * Starts a session of a programme: every set is planned with the weight the double progression
 * suggests, and the workout remembers which session it was so the programme advances on its own.
 */
export async function startProgramSession(
  program: Program,
  planned: PlannedSession,
  adjustment?: SessionAdjustment | null,
): Promise<void> {
  const previous = await readPreviousPerformance();
  const planTemplate = plannedSessionToTemplate(
    planned,
    previous,
    (slug) => getExercise(slug)?.equipment ?? [],
  );
  // On a bad day the check-in can take a set off and hold the weights back a little.
  const template = adjustment ? applyAdjustment(planTemplate, adjustment) : planTemplate;
  useActiveWorkout.getState().startFrom({
    ...template,
    programSlug: program.slug,
    programSession: planned.key,
  });
  router.push('/entreno/activo');
}
