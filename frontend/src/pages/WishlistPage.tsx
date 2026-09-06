import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getWishlist } from '../api';
import { useWishlist } from '../auth/WishlistContext';
import { ErrorState, LoadingState } from '../components/LoadingState';
import { ProductImage } from '../components/ProductImage';
import { WishlistButton } from '../components/WishlistButton';
import type { ProductListItem } from '../types';
import { categoryLabel } from '../utils/categories';
import { DiscountBadge } from '../components/DiscountBadge';
import { StarRating } from '../components/StarRating';
import { discountPercent, formatInr } from '../utils/money';

export function WishlistPage() {
  const { slugs } = useWishlist();
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    setError(null);
    getWishlist()
      .then(setProducts)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slugs.join('|')]);

  if (loading) {
    return <LoadingState label="Loading wishlist..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold text-slate-900">Wishlist</h1>
      {products.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
          No saved products yet. Tap the heart on a product to add it here.
        </p>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.slug}
              className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <WishlistButton
                slug={product.slug}
                className="absolute right-3 top-3 z-10"
              />
              <Link to={`/products/${product.slug}`} className="block">
                <div className="aspect-[4/3] bg-white">
                  <ProductImage
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-contain p-4"
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {product.brand} · {categoryLabel(product.category)}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900">
                    {product.name}
                  </h2>
                  {product.reviewCount > 0 ? (
                    <div className="mt-1 flex items-center gap-1.5">
                      <StarRating value={product.avgRating} size="sm" />
                      <span className="text-xs text-slate-500">
                        {product.avgRating} ({product.reviewCount})
                      </span>
                    </div>
                  ) : null}
                  <div className="mt-3 flex flex-wrap items-baseline gap-2">
                    <p className="text-xl font-semibold text-slate-900">
                      {formatInr(product.startingPrice)}
                    </p>
                    <DiscountBadge
                      percent={
                        product.discountPercent ??
                        discountPercent(product.mrp, product.startingPrice)
                      }
                    />
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
