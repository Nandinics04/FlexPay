export function safeNextPath(raw?: string): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) {
    return '/';
  }
  return raw;
}

export function frontendOrigin(raw?: string): string {
  const first = raw?.split(',')[0]?.trim();
  return first || 'http://localhost:5173';
}
