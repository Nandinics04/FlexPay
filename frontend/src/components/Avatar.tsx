import { useEffect, useState } from 'react';

function initials(name: string, email: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  if (parts[0]?.[0]) {
    return parts[0][0].toUpperCase();
  }
  return (email[0] ?? 'U').toUpperCase();
}

export function Avatar({
  name,
  email,
  src,
  size = 'md',
}: {
  name: string;
  email: string;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg';
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [src]);
  const box =
    size === 'lg' ? 'h-20 w-20 text-xl' : size === 'sm' ? 'h-9 w-9 text-sm' : 'h-12 w-12 text-base';

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setFailed(true)}
        className={`${box} rounded-full object-cover ring-2 ring-white`}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={`inline-flex ${box} items-center justify-center rounded-full bg-teal-600 font-semibold text-white`}
    >
      {initials(name, email)}
    </span>
  );
}
