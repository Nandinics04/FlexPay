import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getProduct } from '../api';
import { useAuth } from '../auth/AuthContext';
import { BackButton } from '../components/BackButton';
import { ErrorState, LoadingState } from '../components/LoadingState';
import { ProfileForm } from '../components/ProfileForm';
import type { ProductDetail } from '../types';
import { checkoutQuery, checkoutSummary } from '../utils/checkout';

export function CheckoutDetailsPage() {
  const { slug = '' } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, saveProfile } = useAuth();
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
    return <LoadingState label="Loading your details..." />;
  }

  if (error || !product || !summary || !user) {
    return <ErrorState message={error ?? 'Unable to continue checkout'} />;
  }

  const query = checkoutQuery(
    summary.variant.color,
    summary.variant.storage,
    summary.plan.id,
    summary.quantity,
  );

  return (
    <div className="mx-auto max-w-2xl">
      <BackButton to={`/products/${product.slug}/confirm?${query}`} />
      <h1 className="text-2xl font-semibold text-slate-900">Your details</h1>
      <p className="mt-2 text-sm text-slate-600">
        Name and email come from your account. Add phone, address and KYC to
        continue to payment.
      </p>
      <p className="mt-3 text-sm text-slate-500">
        {product.name} · {summary.variant.color} · {summary.variant.storage} ·
        Qty {summary.quantity}
      </p>
      <div className="mt-6">
        <ProfileForm
          key={user.id}
          user={user}
          requireKyc
          submitLabel="Continue to payment"
          onSubmit={async (profile) => {
            await saveProfile(profile);
            navigate(`/products/${product.slug}/pay?${query}`);
          }}
        />
      </div>
    </div>
  );
}
