import { useState, type FormEvent } from 'react';
import type { AuthUser, ProfileUpdate } from '../types';
import { LocationMap } from './LocationMap';

export function ProfileForm({
  user,
  submitLabel,
  requireKyc = false,
  onCancel,
  onSubmit,
}: {
  user: AuthUser;
  submitLabel: string;
  requireKyc?: boolean;
  onCancel?: () => void;
  onSubmit: (profile: ProfileUpdate) => Promise<void>;
}) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? '');
  const [address, setAddress] = useState(user.address ?? '');
  const [city, setCity] = useState(user.city ?? '');
  const [state, setState] = useState(user.state ?? '');
  const [pincode, setPincode] = useState(user.pincode ?? '');
  const [latitude, setLatitude] = useState<number | null>(user.latitude);
  const [longitude, setLongitude] = useState<number | null>(user.longitude);
  const [pan, setPan] = useState(user.pan ?? '');
  const [aadhaar, setAadhaar] = useState(user.aadhaar ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        latitude,
        longitude,
        pan: pan.trim().toUpperCase(),
        aadhaar: aadhaar.replace(/\s/g, ''),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save details');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
        <Field label="Name" value={name} onChange={setName} required />
        <label className="block text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            value={user.email}
            readOnly
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500"
          />
        </label>
        <Field
          label="Phone"
          value={phone}
          onChange={setPhone}
          required={requireKyc}
          placeholder="10-digit mobile"
        />
        <Field
          label="Pincode"
          value={pincode}
          onChange={setPincode}
          required={requireKyc}
          placeholder="6 digits"
        />
        <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
          Address
          <textarea
            required={requireKyc}
            rows={3}
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-teal-600"
          />
        </label>
        <Field label="City" value={city} onChange={setCity} required={requireKyc} />
        <Field label="State" value={state} onChange={setState} required={requireKyc} />
        <div className="sm:col-span-2">
          <p className="mb-2 text-sm font-medium text-slate-700">Location</p>
          <LocationMap
            latitude={latitude}
            longitude={longitude}
            onLocated={(lat, lng, parts) => {
              setLatitude(lat);
              setLongitude(lng);
              if (parts.address) setAddress(parts.address);
              if (parts.city) setCity(parts.city);
              if (parts.state) setState(parts.state);
              if (parts.pincode) setPincode(parts.pincode);
            }}
          />
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
        <Field
          label="PAN"
          value={pan}
          onChange={setPan}
          required={requireKyc}
          placeholder="ABCDE1234F"
        />
        <Field
          label="Aadhaar"
          value={aadhaar}
          onChange={setAadhaar}
          required={requireKyc}
          placeholder="12 digits"
        />
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        ) : null}
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-xl bg-teal-600 px-4 py-3 font-semibold text-white hover:bg-teal-700 disabled:bg-slate-300"
        >
          {saving ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <input
        type="text"
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-teal-600"
      />
    </label>
  );
}
