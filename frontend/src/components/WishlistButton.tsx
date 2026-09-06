import { useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useWishlist } from '../auth/WishlistContext';

export function WishlistButton({
  slug,
  label = false,
  className = '',
}: {
  slug: string;
  label?: boolean;
  className?: string;
}) {
  const { user } = useAuth();
  const { isSaved, toggle } = useWishlist();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const saved = isSaved(slug);

  const onClick = async (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!user) {
      navigate(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setBusy(true);
    try {
      await toggle(slug);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`inline-flex items-center gap-2 rounded-full border bg-white/95 px-2.5 py-1.5 text-sm font-medium shadow-sm transition hover:bg-white disabled:opacity-60 ${
        saved
          ? 'border-rose-200 text-rose-600'
          : 'border-slate-200 text-slate-600'
      } ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4 shrink-0"
        fill={saved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
      {label ? (saved ? 'Saved' : 'Save') : null}
    </button>
  );
}
