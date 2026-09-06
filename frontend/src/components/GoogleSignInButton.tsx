import { useEffect, useState } from 'react';
import { getAuthProviders, googleAuthUrl } from '../api';
import { GoogleIcon } from './GoogleIcon';

export function GoogleSignInButton({ next }: { next: string }) {
  const [googleReady, setGoogleReady] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAuthProviders()
      .then((providers) => setGoogleReady(providers.google))
      .catch(() => setGoogleReady(false));
  }, []);

  const onClick = () => {
    if (googleReady === false) {
      setError(
        'Google sign-in is not set up yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend/.env, then restart the API.',
      );
      return;
    }
    window.location.href = googleAuthUrl(next);
  };

  return (
    <div className="mt-3">
      {error ? (
        <p className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-800 hover:bg-slate-50"
      >
        <GoogleIcon />
        Continue with Google
      </button>
    </div>
  );
}
