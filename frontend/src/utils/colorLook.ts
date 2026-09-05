export const colorAccent: Record<string, string> = {
  Midnight: '#0f172a',
  Black: '#171717',
  Graphite: '#3f3f46',
  'Space Grey': '#52525b',
  Grey: '#a1a1aa',
  Silver: '#cbd5e1',
  White: '#f8fafc',
  Starlight: '#fde68a',
  Arctic: '#bae6fd',
  Purple: '#a78bfa',
  'Cosmic Orange': '#fb923c',
  'Titanium Black': '#18181b',
  'Titanium Gray': '#71717a',
  Natural: '#d6d3d1',
  Ultramarine: '#1d4ed8',
  Porcelain: '#f5f5f4',
};

export function accentForColor(color: string): string {
  return colorAccent[color] ?? '#94a3b8';
}

export function frontImageUrl(imageUrl: string): string {
  return imageUrl
    .replace(/\/thumbnail\.webp\/\d+\.webp$/, '/thumbnail.webp')
    .replace(/\/\d+\.webp$/, '/thumbnail.webp');
}

export function imageForColor(imageUrl: string, colorIndex: number): string {
  const base = imageUrl
    .replace(/\/thumbnail\.webp\/\d+\.webp$/, '')
    .replace(/\/(thumbnail|\d+)\.webp$/, '');
  return `${base}/${colorIndex + 1}.webp`;
}
