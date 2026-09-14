import { z } from 'zod';

import { isOldEnough, parseBirthDate, todayIso, type IsoDate } from '@/domain/age';

/** Error messages are i18n keys under `auth.errors`. */
export function createSignUpSchema(today: IsoDate = todayIso()) {
  return z.object({
    displayName: z
      .string()
      .trim()
      .min(1, { error: 'nameRequired' })
      .max(50, { error: 'nameTooLong' }),
    email: z
      .string()
      .trim()
      .pipe(z.email({ error: 'emailInvalid' })),
    password: z.string().min(8, { error: 'passwordTooShort' }),
    birthDate: z.string().transform((value, ctx) => {
      const iso = parseBirthDate(value, today);
      if (!iso) {
        ctx.addIssue({ code: 'custom', message: 'birthDateInvalid' });
        return z.NEVER;
      }
      if (!isOldEnough(iso, today)) {
        ctx.addIssue({ code: 'custom', message: 'tooYoung' });
        return z.NEVER;
      }
      return iso;
    }),
    acceptTerms: z.literal(true, { error: 'termsRequired' }),
    healthConsent: z.literal(true, { error: 'healthConsentRequired' }),
  });
}

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .pipe(z.email({ error: 'emailInvalid' })),
  password: z.string().min(1, { error: 'passwordRequired' }),
});

export type SignUpInput = z.input<ReturnType<typeof createSignUpSchema>>;
/** Form state before validation: the consents start unchecked. */
export type SignUpForm = Omit<SignUpInput, 'acceptTerms' | 'healthConsent'> & {
  acceptTerms: boolean;
  healthConsent: boolean;
};
export type SignUpData = z.output<ReturnType<typeof createSignUpSchema>>;
export type SignInData = z.output<typeof signInSchema>;

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

/** First error message (i18n key) per field, or null when the input is valid. */
export function validate<S extends z.ZodType>(
  schema: S,
  input: unknown,
): { data: z.output<S>; errors: null } | { data: null; errors: FieldErrors<z.input<S>> } {
  const result = schema.safeParse(input);
  if (result.success) return { data: result.data, errors: null };

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = String(issue.path[0] ?? '');
    errors[field] ??= issue.message;
  }
  return { data: null, errors: errors as FieldErrors<z.input<S>> };
}
