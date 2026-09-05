import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../api';
import { ErrorState, LoadingState } from '../components/LoadingState';
import { ProductImage } from '../components/ProductImage';
import type { ProductListItem } from '../types';
import { formatInr } from '../utils/money';

export function HomePage() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearchTerm(query.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const load = (term = searchTerm) => {
    setLoading(true);
    setError(null);
    getProducts(term)
      .then(setProducts)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(searchTerm);
  }, [searchTerm]);

  return (
    <section>
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wide text-teal-700">
          Shop electronics on EMI
        </p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-900">
          Phones, laptops and tablets with mutual-fund backed EMI
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Browse phones from MongoDB and pick a color, storage, and EMI plan.
          Search by name, brand, or category.
        </p>
        <label className="mt-6 block max-w-2xl">
          <span className="sr-only">Search products</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search for iPhone, Samsung, laptop, tablet..."
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none ring-teal-600 placeholder:text-slate-400 focus:ring-2"
          />
        </label>
      </div>

      {loading ? <LoadingState label="Loading products..." /> : null}
      {error ? <ErrorState message={error} onRetry={() => load(searchTerm)} /> : null}

      {!loading && !error && products.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
          No products match “{searchTerm}”. Try another brand or category.
        </p>
      ) : null}

      {!loading && !error ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Link
              key={product.slug}
              to={`/products/${product.slug}`}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="aspect-[4/3] bg-white">
                <ProductImage
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-contain p-4"
                />
              </div>
              <div className="p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {product.brand} · {product.category}
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
      ) : null}
    </section>
  );
}
