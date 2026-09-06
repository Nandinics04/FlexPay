import { useEffect, type ReactNode } from 'react';

type DialogProps = {
  open: boolean;
  title: string;
  children?: ReactNode;
  tone?: 'success' | 'danger' | 'default';
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  busy?: boolean;
};

export function Dialog({
  open,
  title,
  children,
  tone = 'default',
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  busy = false,
}: DialogProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) {
        (onSecondary ?? onPrimary)();
      }
    };

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, busy, onPrimary, onSecondary]);

  if (!open) {
    return null;
  }

  const iconClass =
    tone === 'success'
      ? 'bg-teal-100 text-teal-700'
      : tone === 'danger'
        ? 'bg-rose-100 text-rose-700'
        : 'bg-slate-100 text-slate-700';
  const primaryClass =
    tone === 'danger'
      ? 'bg-rose-600 hover:bg-rose-700'
      : 'bg-teal-600 hover:bg-teal-700';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-slate-900/50"
        disabled={busy}
        onClick={() => {
          if (!busy) {
            (onSecondary ?? onPrimary)();
          }
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-dialog-title"
        className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
      >
        <div
          className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full text-xl font-semibold ${iconClass}`}
        >
          {tone === 'success' ? '✓' : tone === 'danger' ? '!' : 'i'}
        </div>
        <h2
          id="app-dialog-title"
          className="mt-4 text-center text-xl font-semibold text-slate-900"
        >
          {title}
        </h2>
        {children ? (
          <div className="mt-2 text-center text-sm text-slate-600">
            {children}
          </div>
        ) : null}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
          {secondaryLabel && onSecondary ? (
            <button
              type="button"
              disabled={busy}
              onClick={onSecondary}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {secondaryLabel}
            </button>
          ) : null}
          <button
            type="button"
            disabled={busy}
            onClick={onPrimary}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:bg-slate-300 ${primaryClass}`}
          >
            {busy ? 'Please wait...' : primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
