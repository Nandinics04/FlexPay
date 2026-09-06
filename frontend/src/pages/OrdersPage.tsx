import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cancelOrder, getOrders } from '../api';
import { useAuth } from '../auth/AuthContext';
import { Dialog } from '../components/Dialog';
import { ErrorState, LoadingState } from '../components/LoadingState';
import { ProductImage } from '../components/ProductImage';
import type { Order } from '../types';
import { formatInr } from '../utils/money';

export function OrdersPage() {
  const { setUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingCancel, setPendingCancel] = useState<Order | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelledNotice, setCancelledNotice] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getOrders()
      .then(setOrders)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const onCancel = async () => {
    if (!pendingCancel) {
      return;
    }
    setCancelling(true);
    setError(null);
    try {
      const result = await cancelOrder(pendingCancel.id);
      setOrders((current) =>
        current.map((order) =>
          order.id === pendingCancel.id ? result.order : order,
        ),
      );
      if (result.user) {
        setUser(result.user);
      }
      setPendingCancel(null);
      setCancelledNotice(pendingCancel.productName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to cancel this order');
      setPendingCancel(null);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading orders..." />;
  }

  if (error && orders.length === 0) {
    return <ErrorState message={error} onRetry={load} />;
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold text-slate-900">Your orders</h1>
      {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
      {orders.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
          No orders yet. Choose a product and EMI plan to place one.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {orders.map((order) => {
            const cancelled = order.status === 'cancelled';
            const canCancel = order.status === 'paid';
            return (
              <li
                key={order.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 sm:flex sm:gap-4"
              >
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-50">
                  <ProductImage
                    src={order.imageUrl}
                    alt={order.productName}
                    className="h-full w-full object-contain p-2"
                  />
                </div>
                <div className="mt-3 min-w-0 flex-1 sm:mt-0">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <Link
                      to={`/products/${order.productSlug}`}
                      className="font-semibold text-slate-900 hover:text-teal-700"
                    >
                      {order.productName}
                    </Link>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide ${
                        cancelled
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-teal-50 text-teal-800'
                      }`}
                    >
                      {cancelled ? 'Cancelled' : 'Paid'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">
                    {order.color} · {order.storage} · Qty {order.quantity ?? 1} ·{' '}
                    {order.tenureMonths} months
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {formatInr(order.payableAmount ?? order.sellingPrice)} · EMI{' '}
                    {formatInr(order.monthlyAmount)}/month
                  </p>
                  {cancelled ? (
                    <p className="mt-1 text-sm text-slate-500">
                      Rewards from this order were reversed.
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-teal-800">
                      +{order.creditPointsEarned} points
                      {order.pointsRedeemed
                        ? ` · used ${order.pointsRedeemed} points`
                        : ''}
                      {order.cashbackAmount > 0
                        ? ` · ${formatInr(order.cashbackAmount)} cashback credited`
                        : ''}
                      {order.cashbackRedeemed
                        ? ` · used ${formatInr(order.cashbackRedeemed)} cashback`
                        : ''}
                    </p>
                  )}
                  <p className="mt-2 text-xs uppercase tracking-wide text-slate-400">
                    {new Date(order.createdAt).toLocaleString()}
                    {order.cancelledAt
                      ? ` · cancelled ${new Date(order.cancelledAt).toLocaleString()}`
                      : ''}
                  </p>
                  {canCancel ? (
                    <button
                      type="button"
                      onClick={() => setPendingCancel(order)}
                      className="mt-3 rounded-full border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-50"
                    >
                      Cancel order
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog
        open={Boolean(pendingCancel)}
        tone="danger"
        title="Cancel this order?"
        primaryLabel="Yes, cancel"
        secondaryLabel="Keep order"
        busy={cancelling}
        onPrimary={onCancel}
        onSecondary={() => {
          if (!cancelling) {
            setPendingCancel(null);
          }
        }}
      >
        {pendingCancel ? (
          <p>
            {pendingCancel.productName} will be cancelled. Points and cashback
            from this order will be reversed.
          </p>
        ) : null}
      </Dialog>

      <Dialog
        open={Boolean(cancelledNotice)}
        tone="success"
        title="Order cancelled"
        primaryLabel="OK"
        onPrimary={() => setCancelledNotice(null)}
      >
        {cancelledNotice ? (
          <p>
            Your order for {cancelledNotice} is cancelled. Rewards from this
            order were reversed.
          </p>
        ) : null}
      </Dialog>
    </section>
  );
}
