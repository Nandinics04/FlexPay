import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNotification } from '../auth/NotificationContext';
import { Avatar } from '../components/Avatar';
import { ProfileForm } from '../components/ProfileForm';

function maskPan(value: string) {
  if (!value) return 'Not added';
  return value.length > 4 ? `${value.slice(0, 2)}******${value.slice(-2)}` : value;
}

function maskAadhaar(value: string) {
  if (!value) return 'Not added';
  return value.length >= 4 ? `xxxx xxxx ${value.slice(-4)}` : value;
}

export function ProfilePage() {
  const { user, saveProfile } = useAuth();
  const { notify } = useNotification();
  const [editing, setEditing] = useState(false);

  if (!user) {
    return null;
  }

  if (editing) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold text-slate-900">Edit profile</h1>
        <div className="mt-6">
          <ProfileForm
            key={`${user.id}-edit`}
            user={user}
            submitLabel="Save changes"
            onCancel={() => setEditing(false)}
            onSubmit={async (profile) => {
              await saveProfile(profile);
              notify('Profile details saved.');
              setEditing(false);
            }}
          />
        </div>
      </div>
    );
  }

  const location = [user.city, user.state, user.pincode].filter(Boolean).join(', ');

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">Profile</h1>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-full bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
        >
          Edit
        </button>
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-4">
          <Avatar
            name={user.name}
            email={user.email}
            src={user.avatarUrl}
            size="lg"
          />
          <div>
            <p className="text-xl font-semibold text-slate-900">{user.name}</p>
            <p className="text-sm text-slate-500">{user.email}</p>
            <p className="mt-1 text-sm font-medium text-teal-800">
              Cashback wallet: ₹{user.cashbackBalance ?? 0}
            </p>
            <p className="mt-0.5 text-sm font-medium text-amber-800">
              {user.creditPoints ?? 0} credit points · 1 point = ₹0.20 · by order value
            </p>
          </div>
        </div>

        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <Item label="Phone" value={user.phone || 'Not added'} />
          <Item label="Pincode" value={user.pincode || 'Not added'} />
          <Item
            label="Address"
            value={user.address || 'Not added'}
            wide
          />
          <Item label="City / State" value={location || 'Not added'} wide />
          <Item label="PAN" value={maskPan(user.pan)} />
          <Item label="Aadhaar" value={maskAadhaar(user.aadhaar)} />
        </dl>
      </div>
    </div>
  );
}

function Item({
  label,
  value,
  wide,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={`rounded-xl bg-slate-50 p-3 ${wide ? 'sm:col-span-2' : ''}`}>
      <dt className="text-slate-500">{label}</dt>
      <dd className="mt-1 font-medium text-slate-900">{value}</dd>
    </div>
  );
}
