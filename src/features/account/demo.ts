import type { QueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

import { forgetThisDevice } from '@/features/account/sign-out';
import { demoBackend } from '@/lib/demo-backend';
import { setDemoMode } from '@/lib/demo-mode';

/**
 * "Probar sin cuenta": opens the app as Marcos, with eight weeks of sample training. It always
 * starts clean, whatever a previous visit left on this device.
 */
export async function startDemo(queryClient: QueryClient): Promise<void> {
  await forgetThisDevice(queryClient);
  demoBackend.reset();
  setDemoMode(true);
  router.replace('/');
}

/** Leaves the demo without a trace; `next` is where to go afterwards (the landing or sign-up). */
export async function exitDemo(
  queryClient: QueryClient,
  next: '/bienvenida' | '/registro' = '/bienvenida',
): Promise<void> {
  setDemoMode(false);
  await forgetThisDevice(queryClient);
  demoBackend.reset();
  router.replace(next);
}
