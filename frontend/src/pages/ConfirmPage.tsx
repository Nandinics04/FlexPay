import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { getProduct } from '../api';
import { BackButton } from '../components/BackButton';
import { ErrorState, LoadingState } from '../components/LoadingState';
import { ColorProductShot } from '../components/ColorProductShot';
import type { ProductDetail } from '../types';
import { calculateMonthlyAmount } from '../utils/emi';
import { formatInr } from '../utils/money';

export function ConfirmPage() {
  const { slug = '' } = useParams();
  const [searchParams] = useSearchParams();
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
    const color = searchParams.get('color');
    const storage = searchParams.get('storage');
    const planId = searchParams.get('plan');
    const variant =
      product.variants.find(
        (item) => item.color === color && item.storage === storage,
      ) ?? product.variants[0];
    const planRule = product.emiPlans.find((item) => item.id === planId);
    if (!variant || !planRule) {
      return null;
    }
    return {
      variant,
      plan: {
        ...planRule,
        monthlyAmount: calculateMonthlyAmount(
          variant.sellingPrice,
          planRule.interestRate,
          planRule.tenureMonths,
        ),
      },
    };
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

  const { variant, plan } = summary;

  return (
    <div className="mx-auto max-w-2xl">
      <BackButton
        to={`/products/${product.slug}?color=${encodeURIComponent(variant.color)}&storage=${encodeURIComponent(variant.storage)}`}
      />
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium uppercase tracking-wide text-teal-700">
          Plan selected
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          You are ready to proceed
        </h1>
        <p className="mt-2 text-slate-600">
          Review the product and EMI details below. This assignment demo does
          not collect payment.
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
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {formatInr(variant.sellingPrice)}
            </p>
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
          <div className="col-span-2 rounded-xl border border-teal-100 bg-teal-50/70 p-3">
            <dt className="text-slate-500">Mutual fund backing</dt>
            <dd className="mt-1 text-lg font-semibold text-teal-900">
              {plan.backingFund ?? 'Mutual funds'}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            to={`/products/${product.slug}?color=${encodeURIComponent(variant.color)}&storage=${encodeURIComponent(variant.storage)}`}
            className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-center font-medium text-slate-700 hover:bg-slate-50"
          >
            Change plan
          </Link>
          <Link
            to="/"
            className="flex-1 rounded-xl bg-teal-600 px-4 py-3 text-center font-semibold text-white hover:bg-teal-700"
          >
            Back to products
          </Link>
        </div>
      </div>
    </div>
  );
}
