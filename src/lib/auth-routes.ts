export type AuthView =
  | 'login'
  | 'signup'
  | 'verify-email'
  | 'forgot-password'
  | 'reset-password';

export const AUTH_VIEWS: readonly AuthView[] = [
  'login',
  'signup',
  'verify-email',
  'forgot-password',
  'reset-password',
];

export function isAuthView(value: string | null | undefined): value is AuthView {
  return typeof value === 'string' && (AUTH_VIEWS as readonly string[]).includes(value);
}

export function authHref(view: AuthView, params?: Record<string, string>): string {
  const search = new URLSearchParams({ view, ...params });
  return `/auth?${search.toString()}`;
}
