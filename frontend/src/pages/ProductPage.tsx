import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getProduct } from '../api';
import { BackButton } from '../components/BackButton';
import { ErrorState, LoadingState } from '../components/LoadingState';
import { ColorProductShot } from '../components/ColorProductShot';
import type { EmiPlan, ProductDetail, Variant } from '../types';
import { calculateMonthlyAmount } from '../utils/emi';
import { formatInr } from '../utils/money';

function findVariant(
  variants: Variant[],
  color?: string | null,
  storage?: string | null,
): Variant {
  return (
    variants.find(
      (variant) => variant.color === color && variant.storage === storage,
    ) ??
    variants.find((variant) => variant.color === color) ??
    variants.find((variant) => variant.storage === storage) ??
    variants[0]
  );
}

const colorSwatch: Record<string, string> = {
  Silver: 'bg-slate-300',
  'Cosmic Orange': 'bg-orange-500',
  'Titanium Black': 'bg-zinc-800',
  'Titanium Gray': 'bg-zinc-400',
  Midnight: 'bg-slate-900',
  Arctic: 'bg-sky-100',
  Purple: 'bg-violet-400',
  'Space Grey': 'bg-zinc-600',
  Graphite: 'bg-neutral-700',
  Grey: 'bg-zinc-400',
  Black: 'bg-zinc-900',
  White: 'bg-white',
  Natural: 'bg-stone-300',
  Ultramarine: 'bg-blue-700',
  Starlight: 'bg-amber-100',
  Pink: 'bg-pink-400',
  Porcelain: 'bg-stone-100',
};

export function ProductPage() {
  const { slug = '' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedStorage, setSelectedStorage] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getProduct(slug)
      .then((data) => {
        setProduct(data);
        setSelectedPlanId(data.emiPlans[0]?.id ?? null);
        const match = findVariant(
          data.variants,
          searchParams.get('color'),
          searchParams.get('storage'),
        );
        setSelectedColor(match.color);
        setSelectedStorage(match.storage);
        setSearchParams(
          { color: match.color, storage: match.storage },
          { replace: true },
        );
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setSelectedColor(null);
    setSelectedStorage(null);
    load();
    // Reload when the product URL changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const variant = useMemo(() => {
    if (!product) {
      return null;
    }
    return findVariant(product.variants, selectedColor, selectedStorage);
  }, [product, selectedColor, selectedStorage]);

  const colors = useMemo(
    () => [...new Set(product?.variants.map((item) => item.color) ?? [])],
    [product],
  );
  const storages = useMemo(
    () => [...new Set(product?.variants.map((item) => item.storage) ?? [])],
    [product],
  );

  const plans = useMemo(() => {
    if (!product || !variant) {
      return [];
    }
    return product.emiPlans.map((plan) => ({
      ...plan,
      monthlyAmount: calculateMonthlyAmount(
        variant.sellingPrice,
        plan.interestRate,
        plan.tenureMonths,
      ),
    }));
  }, [product, variant]);

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) ?? null;

  const updateVariant = (next: { color?: string; storage?: string }) => {
    if (!product || !variant) {
      return;
    }
    const match = findVariant(
      product.variants,
      next.color ?? selectedColor ?? variant.color,
      next.storage ?? selectedStorage ?? variant.storage,
    );
    setSelectedColor(match.color);
    setSelectedStorage(match.storage);
        setSearchParams(
      { color: match.color, storage: match.storage },
      { replace: true },
    );
  };

  const proceed = () => {
    if (!product || !variant || !selectedPlan) {
      return;
    }
    navigate(
      `/products/${product.slug}/confirm?color=${encodeURIComponent(variant.color)}&storage=${encodeURIComponent(variant.storage)}&plan=${selectedPlan.id}`,
    );
  };

  if (loading) {
    return <LoadingState label="Loading product..." />;
  }

  if (error || !product || !variant) {
    return <ErrorState message={error ?? 'Product not found'} onRetry={load} />;
  }

  return (
    <div>
      <BackButton to="/" />
      <div className="grid min-w-0 grid-cols-1 items-start gap-8 lg:grid-cols-2">
      <div className="min-w-0">
        <ColorProductShot
          imageUrl={variant.imageUrl}
          color={variant.color}
          alt={`${product.name} ${variant.color} ${variant.storage}`}
        />
      </div>

      <div className="min-w-0">
        <p className="text-sm font-medium uppercase tracking-wide text-teal-700">
          {product.brand} · {product.category}
        </p>
        <h1 className="mt-1 break-words text-2xl font-semibold text-slate-900 sm:text-3xl">
          {product.name}
        </h1>
        <p className="mt-1 text-slate-500">
          {variant.storage}, {variant.color}
        </p>

        <div className="mt-4 flex flex-wrap items-end gap-3">
          <span className="text-2xl font-semibold text-slate-900 sm:text-3xl">
            {formatInr(variant.sellingPrice)}
          </span>
          <span className="pb-1 text-base text-slate-400 line-through sm:text-lg">
            {formatInr(variant.mrp)}
          </span>
        </div>
        <p className="mt-1 text-sm text-teal-700">Inclusive of all taxes</p>

        <fieldset className="mt-6">
          <legend className="mb-2 text-sm font-medium text-slate-700">
            Color
          </legend>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const active = variant.color === color;
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => updateVariant({ color })}
                  className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm ${
                    active
                      ? 'border-teal-600 bg-teal-50 text-teal-800'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <span
                    className={`h-3.5 w-3.5 rounded-full border border-black/10 ${colorSwatch[color] ?? 'bg-slate-300'}`}
                  />
                  {color}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="mt-5">
          <legend className="mb-2 text-sm font-medium text-slate-700">
            Storage
          </legend>
          <div className="flex flex-wrap gap-2">
            {storages.map((storage) => {
              const active = variant.storage === storage;
              return (
                <button
                  key={storage}
                  type="button"
                  onClick={() => updateVariant({ storage })}
                  className={`rounded-xl border px-4 py-2 text-sm font-medium ${
                    active
                      ? 'border-teal-600 bg-teal-50 text-teal-800'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  {storage}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">
            Choose an EMI plan
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Each plan is financed against a mutual-fund category. Monthly EMI
            updates when you change color or storage.
          </p>
          <div className="mt-4 grid gap-3">
            {plans.map((plan) => (
              <EmiCard
                key={plan.id}
                plan={plan}
                selected={plan.id === selectedPlanId}
                onSelect={() => setSelectedPlanId(plan.id)}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={proceed}
          disabled={!selectedPlan}
          className="mt-6 w-full rounded-xl bg-teal-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {selectedPlan
            ? `Proceed with ${selectedPlan.tenureMonths}-month plan`
            : 'Select a plan to proceed'}
        </button>

        <div className="mt-8 border-t border-slate-200 pt-6">
          <h3 className="font-semibold text-slate-900">Product details</h3>
          <p className="mt-2 text-sm text-slate-600">{product.description}</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
            {product.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
      </div>
    </div>
  );
}

function EmiCard({
  plan,
  selected,
  onSelect,
}: {
  plan: EmiPlan;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-2xl border p-4 text-left transition ${
        selected
          ? 'border-teal-600 bg-teal-50 shadow-sm'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-xl font-semibold text-slate-900 sm:text-2xl">
            {formatInr(plan.monthlyAmount)}
            <span className="text-sm font-medium text-slate-500"> / month</span>
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {plan.tenureMonths} months · {plan.interestRate}% interest
          </p>
          {plan.backingFund ? (
            <p className="mt-1 text-xs font-medium text-teal-800">
              Backed by {plan.backingFund}
            </p>
          ) : null}
          {plan.cashbackLabel ? (
            <p className="mt-2 inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
              {plan.cashbackLabel}
            </p>
          ) : null}
        </div>
        <span
          className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full border ${
            selected ? 'border-teal-600 bg-teal-600' : 'border-slate-300'
          }`}
        >
          {selected ? (
            <span className="h-2 w-2 rounded-full bg-white" />
          ) : null}
        </span>
      </div>
    </button>
  );
}
