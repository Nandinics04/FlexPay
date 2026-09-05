import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../api';
import { ErrorState, LoadingState } from '../components/LoadingState';
import type { ProductListItem } from '../types';
import { formatInr } from '../utils/money';

export function HomePage() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    setError(null);
    getProducts()
      .then(setProducts)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return <LoadingState label="Loading products..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }

  if (products.length === 0) {
    return (
      <ErrorState message="No products found. Seed the database and refresh." />
    );
  }

  return (
    <section>
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wide text-teal-700">
          Shop on EMI
        </p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-900">
          Smartphones with mutual-fund backed EMI
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Choose a phone, pick a variant, and select a monthly plan. Prices and
          EMI plans are loaded live from the database.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Link
            key={product.slug}
            to={`/products/${product.slug}`}
            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="aspect-[4/3] bg-slate-50">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {product.brand}
              </p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900 group-hover:text-teal-700">
                {product.name}
              </h2>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-xl font-semibold text-slate-900">
                  {formatInr(product.startingPrice)}
                </span>
                <span className="text-sm text-slate-400 line-through">
                  {formatInr(product.mrp)}
                </span>
              </div>
              <p className="mt-3 text-sm font-medium text-teal-700">
                View EMI plans
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
