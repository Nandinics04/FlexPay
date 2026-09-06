import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteProduct, getProducts } from '../api';
import { AdminNav } from '../components/AdminNav';
import { ErrorState, LoadingState } from '../components/LoadingState';
import type { ProductListItem } from '../types';
import { categoryLabel } from '../utils/categories';
import { formatInr } from '../utils/money';

export function AdminPage() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busySlug, setBusySlug] = useState<string | null>(null);

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

  const remove = async (product: ProductListItem) => {
    if (!window.confirm(`Delete ${product.name}?`)) {
      return;
    }
    setBusySlug(product.slug);
    try {
      await deleteProduct(product.slug);
      setProducts((items) => items.filter((item) => item.slug !== product.slug));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete product');
    } finally {
      setBusySlug(null);
    }
  };

  if (loading) {
    return <LoadingState label="Loading catalog..." />;
  }

  return (
    <section>
      <AdminNav />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">Products</h1>
        <Link
          to="/admin/products/new"
          className="rounded-full bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
        >
          Add product
        </Link>
      </div>

      {error ? (
        <div className="mt-6">
          <ErrorState message={error} onRetry={load} />
        </div>
      ) : null}

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {products.length === 0 ? (
          <p className="p-6 text-slate-600">No products yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {products.map((product) => (
              <li
                key={product.slug}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-4"
              >
                <div className="min-w-0">
                  <p className="font-medium text-slate-900">{product.name}</p>
                  <p className="text-sm text-slate-500">
                    {product.brand} · {categoryLabel(product.category)} ·{' '}
                    {formatInr(product.startingPrice)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/admin/products/${product.slug}`}
                    className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(product)}
                    disabled={busySlug === product.slug}
                    className="rounded-full border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
