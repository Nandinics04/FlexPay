import type { ProductDetail, ProductListItem } from './types';

const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

async function request<T>(path: string): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url);
  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.includes('application/json')) {
    throw new Error(
      API_BASE
        ? 'The API did not return JSON. Check VITE_API_URL and redeploy.'
        : 'VITE_API_URL is missing, so the app called this Vercel site instead of Render.',
    );
  }

  if (!response.ok) {
    throw new Error(
      response.status === 404
        ? 'This product could not be found'
        : 'Unable to load data from the server',
    );
  }
  return response.json() as Promise<T>;
}

export function getProducts(query?: string): Promise<ProductListItem[]> {
  const search = query?.trim()
    ? `?q=${encodeURIComponent(query.trim())}`
    : '';
  return request<ProductListItem[]>(`/api/products${search}`);
}

export function getProduct(slug: string, sku?: string): Promise<ProductDetail> {
  const query = sku ? `?sku=${encodeURIComponent(sku)}` : '';
  return request<ProductDetail>(`/api/products/${slug}${query}`);
}
