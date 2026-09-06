import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { createOrder, getProduct } from '../api';
import { useAuth } from '../auth/AuthContext';
import { BackButton } from '../components/BackButton';
import { Dialog } from '../components/Dialog';
import { ErrorState, LoadingState } from '../components/LoadingState';
import type { ProductDetail } from '../types';
import { checkoutQuery, checkoutSummary } from '../utils/checkout';
import { calculateMonthlyAmount } from '../utils/emi';
import { formatInr } from '../utils/money';
import {
  maxRedeemablePoints,
  pointsEarned,
  redeemDiscount,
} from '../utils/points';

export function PaymentPage() {
  const { slug = '' } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [redeem, setRedeem] = useState(false);
  const [useCashback, setUseCashback] = useState(false);
  const [success, setSuccess] = useState<{
    productName: string;
    amount: number;
    monthlyAmount: number;
    points: number;
    cashback: number;
  } | null>(null);

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
    return <LoadingState label="Preparing payment..." />;
  }

  if (!product || !summary || !user) {
    return <ErrorState message={error ?? 'Unable to open payment'} />;
  }

  const query = checkoutQuery(
    summary.variant.color,
    summary.variant.storage,
    summary.plan.id,
    summary.quantity,
  );
  const availableCashback = user.cashbackBalance ?? 0;
  const cashbackRedeemed = useCashback
    ? Math.min(availableCashback, summary.lineTotal)
    : 0;
  const afterCashback = summary.lineTotal - cashbackRedeemed;
  const availablePoints = user.creditPoints ?? 0;
  const maxRedeem = maxRedeemablePoints(availablePoints, afterCashback);
  const redeemPoints = redeem ? maxRedeem : 0;
  const discount = redeemDiscount(redeemPoints);
  const payableAmount = Math.max(0, afterCashback - discount);
  const monthlyAmount = calculateMonthlyAmount(
    payableAmount,
    summary.plan.interestRate,
    summary.plan.tenureMonths,
  );
  const pointsPreview = pointsEarned(payableAmount);

  const pay = async () => {
    setPaying(true);
    setError(null);
    try {
      const result = await createOrder({
        slug: product.slug,
        color: summary.variant.color,
        storage: summary.variant.storage,
        planId: summary.plan.id,
        redeemPoints,
        redeemCashback: cashbackRedeemed,
        quantity: summary.quantity,
      });
      if (result.user) {
        setUser(result.user);
      }
      setSuccess({
        productName: product.name,
        amount: result.order.payableAmount ?? payableAmount,
        monthlyAmount: result.order.monthlyAmount,
        points: result.order.creditPointsEarned,
        cashback: result.order.cashbackAmount,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <BackButton to={`/products/${product.slug}/details?${query}`} />
      <h1 className="text-2xl font-semibold text-slate-900">Payment</h1>
      <p className="mt-2 text-sm text-slate-600">
        Confirm EMI and delivery details, then pay to place the order.
      </p>

      <div className="mt-6 space-y-4 rounded-3xl border border-slate-200 bg-white p-6">
        <div>
          <p className="font-semibold text-slate-900">{product.name}</p>
          <p className="text-sm text-slate-500">
            {summary.variant.color} · {summary.variant.storage} · Qty{' '}
            {summary.quantity}
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="text-slate-500">Amount</dt>
            <dd className="mt-1 font-semibold">{formatInr(payableAmount)}</dd>
            {payableAmount < summary.lineTotal ? (
              <p className="mt-1 text-xs text-slate-400 line-through">
                {formatInr(summary.lineTotal)}
              </p>
            ) : null}
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="text-slate-500">Monthly EMI</dt>
            <dd className="mt-1 font-semibold">{formatInr(monthlyAmount)}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="text-slate-500">Cashback you get</dt>
            <dd className="mt-1 font-semibold">
              {summary.plan.cashbackAmount > 0
                ? formatInr(summary.plan.cashbackAmount)
                : 'None'}
            </dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="text-slate-500">Points you will earn</dt>
            <dd className="mt-1 font-semibold">{pointsPreview}</dd>
          </div>
        </dl>
        <div className="rounded-xl border border-slate-200 p-3 text-sm text-slate-600">
          <p className="font-medium text-slate-900">{user.name}</p>
          <p>{user.phone}</p>
          <p>
            {user.address}
            {user.city ? `, ${user.city}` : ''}
            {user.pincode ? ` ${user.pincode}` : ''}
          </p>
        </div>
        {availableCashback > 0 ? (
          <label className="flex items-start gap-3 rounded-xl border border-teal-200 bg-teal-50 p-3 text-sm text-teal-900">
            <input
              type="checkbox"
              checked={useCashback}
              onChange={(event) => setUseCashback(event.target.checked)}
              className="mt-0.5"
            />
            <span>
              Use {formatInr(Math.min(availableCashback, summary.lineTotal))} cashback.
            </span>
          </label>
        ) : null}
        {maxRedeem > 0 ? (
          <label className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <input
              type="checkbox"
              checked={redeem}
              onChange={(event) => setRedeem(event.target.checked)}
              className="mt-0.5"
            />
            <span>
              Redeem {maxRedeem} points ({formatInr(redeemDiscount(maxRedeem))} off).
            </span>
          </label>
        ) : (
          <p className="text-sm text-slate-500">
            You will earn {pointsPreview} credit points on this order.
          </p>
        )}
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <button
          type="button"
          onClick={pay}
          disabled={paying}
          className="w-full rounded-xl bg-teal-600 px-4 py-3 font-semibold text-white hover:bg-teal-700 disabled:bg-slate-300"
        >
          {paying ? 'Processing...' : 'Pay now'}
        </button>
      </div>

      <Dialog
        open={Boolean(success)}
        tone="success"
        title="Payment successful"
        primaryLabel="View orders"
        onPrimary={() => navigate('/orders')}
      >
        {success ? (
          <div className="space-y-1">
            <p>
              Your order for <span className="font-medium">{success.productName}</span>{' '}
              is confirmed.
            </p>
            <p>
              Paid {formatInr(success.amount)} · EMI {formatInr(success.monthlyAmount)}
              /month
            </p>
            {success.points > 0 ? <p>+{success.points} credit points added.</p> : null}
            {success.cashback > 0 ? (
              <p>{formatInr(success.cashback)} cashback added to your wallet.</p>
            ) : null}
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}
