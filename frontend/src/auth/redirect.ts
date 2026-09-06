import type { AuthUser } from '../types';

export function safeNext(raw: string | null) {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) {
    return '/';
  }
  return raw;
}

export function postLoginPath(next: string, user: AuthUser | null) {
  if (user?.role === 'admin') {
    return next.startsWith('/admin') ? next : '/admin';
  }
  if (next.startsWith('/admin')) {
    return '/';
  }
  return next;
}
