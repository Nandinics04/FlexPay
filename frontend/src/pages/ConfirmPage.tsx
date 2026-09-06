import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { getProduct } from '../api';
import { BackButton } from '../components/BackButton';
import { DiscountBadge } from '../components/DiscountBadge';
import { ErrorState, LoadingState } from '../components/LoadingState';
import { ColorProductShot } from '../components/ColorProductShot';
import { QuantityStepper } from '../components/QuantityStepper';
import type { ProductDetail } from '../types';
import { checkoutQuery, checkoutSummary } from '../utils/checkout';
import { discountPercent, formatInr } from '../utils/money';

export function ConfirmPage() {
  const { slug = '' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProduct(slug)
      .then(setProduct)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  const summary = useMemo(() => {
    if (!product) {
      return null;
    }
    return checkoutSummary(
      product,
      searchParams.get('color'),
      searchParams.get('storage'),
      searchParams.get('plan'),
      searchParams.get('qty'),
    );
  }, [product, searchParams]);

  if (loading) {
    return <LoadingState label="Preparing your plan..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!product || !summary) {
    return (
      <ErrorState message="That plan could not be confirmed. Go back and select a product variant and EMI plan." />
    );
  }

  const { variant, plan, quantity, lineTotal } = summary;
  const query = checkoutQuery(variant.color, variant.storage, plan.id, quantity);
  const off = discountPercent(variant.mrp, variant.sellingPrice);

  return (
    <div className="mx-auto max-w-2xl">
      <BackButton
        to={`/products/${product.slug}?color=${encodeURIComponent(variant.color)}&storage=${encodeURIComponent(variant.storage)}&qty=${quantity}`}
      />
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium uppercase tracking-wide text-teal-700">
          Plan selected
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          You are ready to proceed
        </h1>
        <p className="mt-2 text-slate-600">
          Review the product, quantity and EMI details, then continue with your
          details and payment.
        </p>

        <div className="mt-6 flex gap-4 rounded-2xl bg-slate-50 p-4">
          <ColorProductShot
            imageUrl={variant.imageUrl}
            color={variant.color}
            alt={product.name}
            compact
          />
          <div>
            <p className="font-semibold text-slate-900">{product.name}</p>
            <p className="text-sm text-slate-500">
              {variant.color} · {variant.storage}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <p className="text-lg font-semibold text-slate-900">
                {formatInr(lineTotal)}
              </p>
              <DiscountBadge percent={off} />
            </div>
            <div className="mt-3 flex items-center gap-3">
              <p className="text-xs font-medium text-slate-500">Quantity</p>
              <QuantityStepper
                value={quantity}
                onChange={(next) => {
                  setSearchParams(
                    {
                      color: variant.color,
                      storage: variant.storage,
                      plan: plan.id,
                      qty: String(next),
                    },
                    { replace: true },
                  );
                }}
              />
            </div>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div className="rounded-xl border border-slate-200 p-3">
            <dt className="text-slate-500">Monthly EMI</dt>
            <dd className="mt-1 text-lg font-semibold text-slate-900">
              {formatInr(plan.monthlyAmount)}
            </dd>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <dt className="text-slate-500">Tenure</dt>
            <dd className="mt-1 text-lg font-semibold text-slate-900">
              {plan.tenureMonths} months
            </dd>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <dt className="text-slate-500">Interest</dt>
            <dd className="mt-1 text-lg font-semibold text-slate-900">
              {plan.interestRate}%
            </dd>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <dt className="text-slate-500">Cashback</dt>
            <dd className="mt-1 text-lg font-semibold text-slate-900">
              {plan.cashbackAmount > 0
                ? formatInr(plan.cashbackAmount)
                : 'None'}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            to={`/products/${product.slug}?color=${encodeURIComponent(variant.color)}&storage=${encodeURIComponent(variant.storage)}&qty=${quantity}`}
            className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-center font-medium text-slate-700 hover:bg-slate-50"
          >
            Change plan
          </Link>
          <Link
            to={`/products/${product.slug}/details?${query}`}
            className="flex-1 rounded-xl bg-teal-600 px-4 py-3 text-center font-semibold text-white hover:bg-teal-700"
          >
            Continue
          </Link>
        </div>
      </div>
    </div>
  );
}
