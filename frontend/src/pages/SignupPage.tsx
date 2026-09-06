import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { postLoginPath, safeNext } from '../auth/redirect';
import { GoogleSignInButton } from '../components/GoogleSignInButton';

export function SignupPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = safeNext(searchParams.get('next'));
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(postLoginPath(next, user), { replace: true });
    }
  }, [navigate, next, user]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const profile = await register(name, email, password);
      navigate(postLoginPath(next, profile), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold text-slate-900">Create an account</h1>
      <p className="mt-2 text-sm text-slate-600">
        Sign up with email or Google to view EMI plans and product details.
      </p>

      {error ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          Name
          <input
            type="text"
            required
            minLength={2}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-teal-600"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-teal-600"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Password
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-teal-600"
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-teal-600 px-4 py-3 font-semibold text-white hover:bg-teal-700 disabled:bg-slate-300"
        >
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <GoogleSignInButton next={next} />

      <p className="mt-4 text-sm text-slate-600">
        Already have an account?{' '}
        <Link
          to={`/login?next=${encodeURIComponent(next)}`}
          className="font-medium text-teal-700 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
