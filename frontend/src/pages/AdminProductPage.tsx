import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createProduct, getProduct, updateProduct } from '../api';
import { AdminNav } from '../components/AdminNav';
import { ErrorState, LoadingState } from '../components/LoadingState';
import type {
  ProductDraft,
  ProductDraftEmiPlan,
  ProductDraftVariant,
} from '../types';
import { CATEGORIES, variantLabels } from '../utils/categories';

const emptyVariant = (): ProductDraftVariant => ({
  sku: '',
  color: '',
  storage: '',
  mrp: 0,
  sellingPrice: 0,
  imageUrl: '',
});

const defaultPlans = (): ProductDraftEmiPlan[] => [
  {
    id: 'emi-3m-0',
    tenureMonths: 3,
    interestRate: 0,
    cashbackAmount: 0,
    cashbackLabel: '',
    backingFund: 'Liquid mutual funds',
  },
  {
    id: 'emi-6m-0-cb',
    tenureMonths: 6,
    interestRate: 0,
    cashbackAmount: 1500,
    cashbackLabel: '₹1,500 cashback on first EMI',
    backingFund: 'Short-duration debt funds',
  },
  {
    id: 'emi-12m-10',
    tenureMonths: 12,
    interestRate: 10.5,
    cashbackAmount: 0,
    cashbackLabel: '',
    backingFund: 'Hybrid mutual funds',
  },
];

function emptyDraft(): ProductDraft {
  return {
    name: '',
    brand: '',
    category: 'smartphones',
    description: '',
    highlights: [],
    media: [],
    variants: [emptyVariant()],
    emiPlans: defaultPlans(),
  };
}

export function AdminProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const isNew = !slug || slug === 'new';
  const [draft, setDraft] = useState<ProductDraft>(emptyDraft);
  const [highlights, setHighlights] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) {
      return;
    }
    setLoading(true);
    getProduct(slug)
      .then((product) => {
        setDraft({
          name: product.name,
          brand: product.brand,
          category: product.category,
          description: product.description,
          highlights: product.highlights,
          media: product.media ?? [],
          variants: product.variants,
          emiPlans: product.emiPlans.map((plan) => ({
            id: plan.id,
            tenureMonths: plan.tenureMonths,
            interestRate: plan.interestRate,
            cashbackAmount: plan.cashbackAmount,
            cashbackLabel: plan.cashbackLabel ?? '',
            backingFund: plan.backingFund ?? '',
          })),
        });
        setHighlights(product.highlights.join('\n'));
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [isNew, slug]);

  const updateField = <K extends keyof ProductDraft>(
    key: K,
    value: ProductDraft[K],
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const updateVariant = (
    index: number,
    key: keyof ProductDraftVariant,
    value: string | number,
  ) => {
    setDraft((current) => ({
      ...current,
      variants: current.variants.map((variant, i) =>
        i === index ? { ...variant, [key]: value } : variant,
      ),
    }));
  };

  const updatePlan = (
    index: number,
    key: keyof ProductDraftEmiPlan,
    value: string | number,
  ) => {
    setDraft((current) => ({
      ...current,
      emiPlans: current.emiPlans.map((plan, i) =>
        i === index ? { ...plan, [key]: value } : plan,
      ),
    }));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const payload: ProductDraft = {
      ...draft,
      highlights: highlights
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean),
      media: draft.media
        .map((item) => ({ ...item, url: item.url.trim() }))
        .filter((item) => item.url),
      variants: draft.variants.map((variant) => ({
        ...variant,
        sku:
          variant.sku.trim() ||
          `${(isNew ? draft.name : slug) ?? 'product'}-${variant.color}-${variant.storage}`
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, ''),
      })),
      emiPlans: draft.emiPlans.map((plan) => ({
        ...plan,
        cashbackLabel: plan.cashbackLabel || null,
        backingFund: plan.backingFund || null,
      })),
    };

    try {
      if (isNew) {
        await createProduct(payload);
      } else if (slug) {
        await updateProduct(slug, payload);
      }
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading product..." />;
  }

  if (error && !isNew && !draft.name) {
    return <ErrorState message={error} />;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <AdminNav />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/admin" className="text-sm font-medium text-teal-700">
            Back to catalog
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            {isNew ? 'Add product' : 'Edit product'}
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
          label="Brand"
          value={draft.brand}
          onChange={(value) => updateField('brand', value)}
          required
        />
        <label className="block text-sm font-medium text-slate-700">
          Category
          <select
            required
            value={draft.category}
            onChange={(event) => updateField('category', event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-teal-600"
          >
            {CATEGORIES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
          Description
          <textarea
            required
            rows={3}
            value={draft.description}
            onChange={(event) => updateField('description', event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-teal-600"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
          Highlights (one per line)
          <textarea
            rows={4}
            value={highlights}
            onChange={(event) => setHighlights(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-teal-600"
          />
        </label>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Gallery images & videos
          </h2>
          <button
            type="button"
            onClick={() =>
              setDraft((current) => ({
                ...current,
                media: [...current.media, { type: 'image', url: '' }],
              }))
            }
            className="text-sm font-medium text-teal-700"
          >
            Add media
          </button>
        </div>
        <p className="mb-3 text-sm text-slate-500">
          Add extra image or video URLs. Shoppers can swipe through them on the
          product page. The variant image is always the first slide.
        </p>
        {draft.media.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
            No extra gallery items yet. Use Add media for more photos or clips.
          </p>
        ) : (
          <div className="space-y-3">
            {draft.media.map((item, index) => (
              <div
                key={index}
                className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-[8rem_1fr_auto]"
              >
                <label className="block text-sm font-medium text-slate-700">
                  Type
                  <select
                    value={item.type}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        media: current.media.map((media, i) =>
                          i === index
                            ? {
                                ...media,
                                type: event.target.value as 'image' | 'video',
                              }
                            : media,
                        ),
                      }))
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </label>
                <Field
                  label="URL"
                  value={item.url}
                  onChange={(value) =>
                    setDraft((current) => ({
                      ...current,
                      media: current.media.map((media, i) =>
                        i === index ? { ...media, url: value } : media,
                      ),
                    }))
                  }
                />
                <button
                  type="button"
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      media: current.media.filter((_, i) => i !== index),
                    }))
                  }
                  className="self-end text-left text-sm font-medium text-rose-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Variants</h2>
          <button
            type="button"
            onClick={() =>
              setDraft((current) => ({
                ...current,
                variants: [...current.variants, emptyVariant()],
              }))
            }
            className="text-sm font-medium text-teal-700"
          >
            Add variant
          </button>
        </div>
        <div className="space-y-4">
          {draft.variants.map((variant, index) => (
            <div
              key={index}
              className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2"
            >
              <Field
                label={variantLabels(draft.category).color}
                value={variant.color}
                onChange={(value) => updateVariant(index, 'color', value)}
                required
              />
              <Field
                label={variantLabels(draft.category).storage}
                value={variant.storage}
                onChange={(value) => updateVariant(index, 'storage', value)}
                required
              />
              <Field
                label="MRP"
                type="number"
                value={String(variant.mrp)}
                onChange={(value) => updateVariant(index, 'mrp', Number(value))}
                required
              />
              <Field
                label="Selling price"
                type="number"
                value={String(variant.sellingPrice)}
                onChange={(value) =>
                  updateVariant(index, 'sellingPrice', Number(value))
                }
                required
              />
              <Field
                label="Image URL"
                value={variant.imageUrl}
                onChange={(value) => updateVariant(index, 'imageUrl', value)}
                required
                className="sm:col-span-2"
              />
              {draft.variants.length > 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      variants: current.variants.filter((_, i) => i !== index),
                    }))
                  }
                  className="text-left text-sm font-medium text-rose-700"
                >
                  Remove variant
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">EMI plans</h2>
          <button
            type="button"
            onClick={() =>
              setDraft((current) => ({
                ...current,
                emiPlans: [
                  ...current.emiPlans,
                  {
                    tenureMonths: 9,
                    interestRate: 0,
                    cashbackAmount: 0,
                    cashbackLabel: '',
                    backingFund: '',
                  },
                ],
              }))
            }
            className="text-sm font-medium text-teal-700"
          >
            Add EMI plan
          </button>
        </div>
        <div className="space-y-4">
          {draft.emiPlans.map((plan, index) => (
            <div
              key={plan.id ?? index}
              className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2"
            >
              <Field
                label="Tenure (months)"
                type="number"
                value={String(plan.tenureMonths)}
                onChange={(value) =>
                  updatePlan(index, 'tenureMonths', Number(value))
                }
                required
              />
              <Field
                label="Interest rate %"
                type="number"
                value={String(plan.interestRate)}
                onChange={(value) =>
                  updatePlan(index, 'interestRate', Number(value))
                }
                required
              />
              <Field
                label="Cashback amount"
                type="number"
                value={String(plan.cashbackAmount)}
                onChange={(value) =>
                  updatePlan(index, 'cashbackAmount', Number(value))
                }
              />
              <Field
                label="Cashback label"
                value={plan.cashbackLabel ?? ''}
                onChange={(value) => updatePlan(index, 'cashbackLabel', value)}
              />
              <Field
                label="Backing fund"
                value={plan.backingFund ?? ''}
                onChange={(value) => updatePlan(index, 'backingFund', value)}
                className="sm:col-span-2"
              />
              <button
                type="button"
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    emiPlans: current.emiPlans.filter((_, i) => i !== index),
                  }))
                }
                className="text-left text-sm font-medium text-rose-700"
              >
                Remove plan
              </button>
            </div>
          ))}
        </div>
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
  className = '',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={`block text-sm font-medium text-slate-700 ${className}`}>
      {label}
      <input
        type={type}
        required={required}
        min={type === 'number' ? 0 : undefined}
        step={type === 'number' ? 'any' : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-teal-600"
      />
    </label>
  );
}
