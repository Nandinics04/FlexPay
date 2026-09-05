import type { ProductDetail, ProductListItem } from './types';

const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(
      response.status === 404
        ? 'This product could not be found'
        : 'Unable to load data from the server',
    );
  }
  return response.json() as Promise<T>;
}

export function getProducts(): Promise<ProductListItem[]> {
  return request<ProductListItem[]>('/api/products');
}

export function getProduct(slug: string, sku?: string): Promise<ProductDetail> {
  const query = sku ? `?sku=${encodeURIComponent(sku)}` : '';
  return request<ProductDetail>(`/api/products/${slug}${query}`);
}
