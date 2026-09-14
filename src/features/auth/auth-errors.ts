import { SupabaseNotConfiguredError } from '@/lib/supabase';

export type AuthErrorKey =
  | 'emailInUse'
  | 'weakPassword'
  | 'invalidCredentials'
  | 'emailNotConfirmed'
  | 'rateLimited'
  | 'signUpRejected'
  | 'network'
  | 'notConfigured'
  | 'generic';

type ErrorLike = { code?: string; name?: string; message?: string; status?: number };

/** Maps Supabase Auth errors (see auth error codes) to the i18n key under `auth.errors`. */
export function authErrorKey(error: unknown): AuthErrorKey {
  if (error instanceof SupabaseNotConfiguredError) return 'notConfigured';
  if (!error || typeof error !== 'object') return 'generic';

  const { code, name, message = '', status } = error as ErrorLike;

  switch (code) {
    case 'user_already_exists':
    case 'email_exists':
      return 'emailInUse';
    case 'weak_password':
      return 'weakPassword';
    case 'invalid_credentials':
      return 'invalidCredentials';
    case 'email_not_confirmed':
      return 'emailNotConfirmed';
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit':
      return 'rateLimited';
  }

  // A database trigger rejected the sign-up (e.g. the age rule): Auth only reports a generic message.
  if (message.includes('Database error saving new user')) return 'signUpRejected';
  if (name === 'AuthRetryableFetchError' || status === 0) return 'network';
  if (status === 429) return 'rateLimited';

  return 'generic';
}
