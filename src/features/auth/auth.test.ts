import { authErrorKey } from '@/features/auth/auth-errors';
import { createSignUpSchema, signInSchema, validate } from '@/features/auth/auth-schemas';
import { maskBirthDate } from '@/features/auth/birth-date-mask';
import { SupabaseNotConfiguredError } from '@/lib/supabase';

const TODAY = '2026-09-14';

const validSignUp = {
  displayName: ' Ana ',
  email: 'ana@example.com ',
  password: 'correct-horse',
  birthDate: '01/03/1995',
  acceptTerms: true,
  healthConsent: true,
};

describe('sign-up validation', () => {
  const schema = createSignUpSchema(TODAY);

  it('returns clean data with an ISO birth date', () => {
    expect(validate(schema, validSignUp)).toEqual({
      data: {
        displayName: 'Ana',
        email: 'ana@example.com',
        password: 'correct-horse',
        birthDate: '1995-03-01',
        acceptTerms: true,
        healthConsent: true,
      },
      errors: null,
    });
  });

  it('reports one i18n key per invalid field', () => {
    const result = validate(schema, {
      displayName: '',
      email: 'not-an-email',
      password: 'short',
      birthDate: '31/02/2000',
      acceptTerms: false,
      healthConsent: false,
    });
    expect(result.errors).toEqual({
      displayName: 'nameRequired',
      email: 'emailInvalid',
      password: 'passwordTooShort',
      birthDate: 'birthDateInvalid',
      acceptTerms: 'termsRequired',
      healthConsent: 'healthConsentRequired',
    });
  });

  it('rejects people under 16 and accepts them on their 16th birthday', () => {
    expect(validate(schema, { ...validSignUp, birthDate: '15/09/2010' }).errors).toEqual({
      birthDate: 'tooYoung',
    });
    expect(validate(schema, { ...validSignUp, birthDate: '14/09/2010' }).errors).toBeNull();
  });
});

describe('sign-in validation', () => {
  it('requires a valid email and a password', () => {
    expect(validate(signInSchema, { email: 'x', password: '' }).errors).toEqual({
      email: 'emailInvalid',
      password: 'passwordRequired',
    });
  });
});

describe('maskBirthDate', () => {
  it.each([
    ['1', '1'],
    ['010', '01/0'],
    ['0103', '01/03'],
    ['01031995', '01/03/1995'],
    ['01/03/19955', '01/03/1995'],
    ['ab01c03', '01/03'],
  ])('%p -> %p', (input, expected) => {
    expect(maskBirthDate(input)).toBe(expected);
  });
});

describe('authErrorKey', () => {
  it.each([
    [{ code: 'user_already_exists' }, 'emailInUse'],
    [{ code: 'email_exists' }, 'emailInUse'],
    [{ code: 'weak_password' }, 'weakPassword'],
    [{ code: 'invalid_credentials' }, 'invalidCredentials'],
    [{ code: 'email_not_confirmed' }, 'emailNotConfirmed'],
    [{ code: 'over_email_send_rate_limit' }, 'rateLimited'],
    [{ status: 429 }, 'rateLimited'],
    [{ code: 'unexpected_failure', message: 'Database error saving new user' }, 'signUpRejected'],
    [{ name: 'AuthRetryableFetchError', status: 0 }, 'network'],
    [new SupabaseNotConfiguredError(), 'notConfigured'],
    [{ code: 'something_new' }, 'generic'],
    ['boom', 'generic'],
  ])('%p -> %s', (error, expected) => {
    expect(authErrorKey(error)).toBe(expected);
  });
});
