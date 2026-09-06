import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  createAdminUser,
  getAdminUser,
  updateAdminUser,
  type AdminUserDraft,
} from '../api';
import { AdminNav } from '../components/AdminNav';
import { ErrorState, LoadingState } from '../components/LoadingState';

function emptyDraft(): AdminUserDraft {
  return {
    name: '',
    email: '',
    password: '',
    role: 'user',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    pan: '',
    aadhaar: '',
    creditPoints: 0,
    cashbackBalance: 0,
  };
}

export function AdminUserPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';
  const [draft, setDraft] = useState<AdminUserDraft>(emptyDraft);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew || !id) {
      return;
    }
    setLoading(true);
    getAdminUser(id)
      .then((user) => {
        setDraft({
          name: user.name,
          email: user.email,
          password: '',
          role: user.role,
          phone: user.phone ?? '',
          address: user.address ?? '',
          city: user.city ?? '',
          state: user.state ?? '',
          pincode: user.pincode ?? '',
          pan: user.pan ?? '',
          aadhaar: user.aadhaar ?? '',
          creditPoints: user.creditPoints ?? 0,
          cashbackBalance: user.cashbackBalance ?? 0,
        });
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const updateField = <K extends keyof AdminUserDraft>(
    key: K,
    value: AdminUserDraft[K],
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      ...draft,
      password: draft.password?.trim() || undefined,
    };
    try {
      if (isNew) {
        await createAdminUser({ ...payload, password: draft.password });
      } else if (id) {
        await updateAdminUser(id, payload);
      }
      navigate('/admin/users');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save user');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading user..." />;
  }

  if (error && !isNew && !draft.email) {
    return <ErrorState message={error} />;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <AdminNav />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/admin/users" className="text-sm font-medium text-teal-700">
            Back to users
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            {isNew ? 'Add user' : 'Edit user'}
          </h1>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:bg-slate-300"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
        <Field
          label="Name"
          value={draft.name}
          onChange={(value) => updateField('name', value)}
          required
        />
        <Field
          label="Email"
          type="email"
          value={draft.email}
          onChange={(value) => updateField('email', value)}
          required
        />
        <Field
          label={isNew ? 'Password' : 'New password (optional)'}
          type="password"
          value={draft.password ?? ''}
          onChange={(value) => updateField('password', value)}
          required={isNew}
        />
        <label className="block text-sm font-medium text-slate-700">
          Role
          <select
            value={draft.role}
            onChange={(event) =>
              updateField('role', event.target.value as 'user' | 'admin')
            }
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-teal-600"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <Field
          label="Phone"
          value={draft.phone}
          onChange={(value) => updateField('phone', value)}
        />
        <Field
          label="Pincode"
          value={draft.pincode}
          onChange={(value) => updateField('pincode', value)}
        />
        <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
          Address
          <textarea
            rows={2}
            value={draft.address}
            onChange={(event) => updateField('address', event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-teal-600"
          />
        </label>
        <Field
          label="City"
          value={draft.city}
          onChange={(value) => updateField('city', value)}
        />
        <Field
          label="State"
          value={draft.state}
          onChange={(value) => updateField('state', value)}
        />
        <Field
          label="PAN"
          value={draft.pan}
          onChange={(value) => updateField('pan', value)}
        />
        <Field
          label="Aadhaar"
          value={draft.aadhaar}
          onChange={(value) => updateField('aadhaar', value)}
        />
        <Field
          label="Credit points"
          type="number"
          value={String(draft.creditPoints ?? 0)}
          onChange={(value) => updateField('creditPoints', Number(value))}
        />
        <Field
          label="Cashback balance"
          type="number"
          value={String(draft.cashbackBalance ?? 0)}
          onChange={(value) => updateField('cashbackBalance', Number(value))}
        />
      </section>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <input
        type={type}
        required={required}
        min={type === 'number' ? 0 : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-teal-600"
      />
    </label>
  );
}
