import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, PRODUCT_LIST_CACHE_KEY } from '../api';
import { WishlistButton } from '../components/WishlistButton';
import { ErrorState, LoadingState } from '../components/LoadingState';
import { ProductImage } from '../components/ProductImage';
import type { ProductListItem } from '../types';
import { CATEGORIES, categoryLabel } from '../utils/categories';
import { DiscountBadge } from '../components/DiscountBadge';
import { StarRating } from '../components/StarRating';
import { discountPercent, formatInr } from '../utils/money';

const LIST_CACHE_KEY = PRODUCT_LIST_CACHE_KEY;

function listImageUrl(url: string) {
  if (url.includes('images.unsplash.com')) {
    return url
      .replace(/([?&])w=\d+/, '$1w=480')
      .replace(/([?&])q=\d+/, '$1q=70');
  }
  return url;
}

function readCachedProducts(): ProductListItem[] {
  try {
    const raw = sessionStorage.getItem(LIST_CACHE_KEY);
    return raw ? (JSON.parse(raw) as ProductListItem[]) : [];
  } catch {
    return [];
  }
}

export function HomePage() {
  const [products, setProducts] = useState<ProductListItem[]>(readCachedProducts);
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(products.length === 0);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearchTerm(query.trim()), 200);
    return () => window.clearTimeout(timer);
  }, [query]);

  const load = (term = searchTerm) => {
    const showSpinner = products.length === 0;
    if (showSpinner) {
      setLoading(true);
    }
    setError(null);
    getProducts(term)
      .then((items) => {
        setProducts(items);
        if (!term) {
          sessionStorage.setItem(LIST_CACHE_KEY, JSON.stringify(items));
        }
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(searchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const visible =
    category === 'all'
      ? products
      : products.filter((product) => product.category === category);

  return (
    <section>
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setCategory('all')}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium ${
              category === 'all'
                ? 'border-teal-600 bg-teal-50 text-teal-800'
                : 'border-slate-200 bg-white text-slate-700'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCategory(item.id)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium ${
                category === item.id
                  ? 'border-teal-600 bg-teal-50 text-teal-800'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
          </div>
          <label className="relative shrink-0">
            <span className="sr-only">Search products</span>
            <svg
              viewBox="0 0 24 24"
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3-3" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              className="w-36 rounded-full border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-teal-600 sm:w-44"
            />
          </label>
        </div>
      </div>

      {loading ? <LoadingState label="Loading products..." /> : null}
      {error ? <ErrorState message={error} onRetry={() => load(searchTerm)} /> : null}

      {!loading && !error && visible.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
          No products match this filter. Try another brand or category.
        </p>
      ) : null}

      {!loading && !error ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((product) => (
            <article
              key={product.slug}
              className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <WishlistButton
                slug={product.slug}
                className="absolute right-3 top-3 z-10"
              />
              <Link to={`/products/${product.slug}`} className="group block">
                <div className="aspect-[4/3] bg-white">
                  <ProductImage
                    src={listImageUrl(product.imageUrl)}
                    alt={product.name}
                    className="h-full w-full object-contain p-4"
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {product.brand} · {categoryLabel(product.category)}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900 group-hover:text-teal-700">
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
                    <span className="text-xl font-semibold text-slate-900">
                      {formatInr(product.startingPrice)}
                    </span>
                    <span className="text-sm text-slate-400 line-through">
                      {formatInr(product.mrp)}
                    </span>
                    <DiscountBadge
                      percent={
                        product.discountPercent ??
                        discountPercent(product.mrp, product.startingPrice)
                      }
                    />
                  </div>
                  <p className="mt-3 text-sm font-medium text-teal-700">
                    View EMI plans
                  </p>
                </div>
              </Link>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
