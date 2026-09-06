import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteAdminUser, getAdminUsers } from '../api';
import { useAuth } from '../auth/AuthContext';
import { AdminNav } from '../components/AdminNav';
import { ErrorState, LoadingState } from '../components/LoadingState';
import type { AuthUser } from '../types';

export function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getAdminUsers()
      .then(setUsers)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (profile: AuthUser) => {
    if (!window.confirm(`Delete ${profile.name}?`)) {
      return;
    }
    setBusyId(profile.id);
    try {
      await deleteAdminUser(profile.id);
      setUsers((items) => items.filter((item) => item.id !== profile.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete user');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return <LoadingState label="Loading users..." />;
  }

  return (
    <section>
      <AdminNav />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">User profiles</h1>
        <Link
          to="/admin/users/new"
          className="rounded-full bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
        >
          Add user
        </Link>
      </div>

      {error ? (
        <div className="mt-6">
          <ErrorState message={error} onRetry={load} />
        </div>
      ) : null}

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {users.length === 0 ? (
          <p className="p-6 text-slate-600">No users yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {users.map((profile) => (
              <li
                key={profile.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-4"
              >
                <div className="min-w-0">
                  <p className="font-medium text-slate-900">{profile.name}</p>
                  <p className="text-sm text-slate-500">
                    {profile.email} · {profile.role}
                    {profile.phone ? ` · ${profile.phone}` : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/admin/users/${profile.id}`}
                    className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(profile)}
                    disabled={busyId === profile.id || profile.id === user?.id}
                    className="rounded-full border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
