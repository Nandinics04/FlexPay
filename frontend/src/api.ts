import type {
  AuthResponse,
  AuthUser,
  Order,
  ProductDetail,
  ProductDraft,
  ProductListItem,
  ProductReview,
  ProfileUpdate,
} from './types';

export const PRODUCT_LIST_CACHE_KEY = '1fi_product_list';

const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
const TOKEN_KEY = '1fi_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function storeToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function googleAuthUrl(next = '/'): string {
  const search = `?next=${encodeURIComponent(next)}`;
  return `${API_BASE}/api/auth/google${search}`;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = false,
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (auth) {
    const token = getStoredToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.includes('application/json')) {
    throw new Error(
      API_BASE
        ? 'The API did not return JSON. Check VITE_API_URL and redeploy.'
        : 'VITE_API_URL is missing, so the app called this Vercel site instead of Render.',
    );
  }

  const data = (await response.json()) as T & { message?: string | string[] };

  if (!response.ok) {
    const message = Array.isArray(data.message)
      ? data.message[0]
      : data.message;
    if (response.status === 401) {
      throw new Error(message ?? 'Please sign in to continue');
    }
    if (response.status === 403) {
      throw new Error(message ?? 'Admin access is required');
    }
    if (response.status === 404) {
      throw new Error(message ?? 'This product could not be found');
    }
    throw new Error(message ?? 'Unable to load data from the server');
  }

  return data;
}

export function getProducts(query?: string): Promise<ProductListItem[]> {
  const search = query?.trim()
    ? `?q=${encodeURIComponent(query.trim())}`
    : '';
  return request<ProductListItem[]>(`/api/products${search}`);
}

export function getProduct(slug: string, sku?: string): Promise<ProductDetail> {
  const query = sku ? `?sku=${encodeURIComponent(sku)}` : '';
  return request<ProductDetail>(`/api/products/${slug}${query}`, {}, true);
}

export function registerAccount(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  return request<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export function loginAccount(
  email: string,
  password: string,
): Promise<AuthResponse> {
  return request<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function getMe(): Promise<AuthUser> {
  return request<AuthUser>('/api/auth/me', {}, true);
}

export function updateProfile(profile: ProfileUpdate): Promise<AuthUser> {
  return request<AuthUser>(
    '/api/auth/profile',
    { method: 'PATCH', body: JSON.stringify(profile) },
    true,
  );
}

export function getOrders(): Promise<Order[]> {
  return request<Order[]>('/api/orders', {}, true);
}

export function submitReview(
  slug: string,
  rating: number,
  comment: string,
  reviewId?: string,
): Promise<ProductReview> {
  if (reviewId) {
    return request<ProductReview>(
      `/api/products/${slug}/reviews/${reviewId}`,
      { method: 'PATCH', body: JSON.stringify({ rating, comment }) },
      true,
    );
  }
  return request<ProductReview>(
    `/api/products/${slug}/reviews`,
    { method: 'POST', body: JSON.stringify({ rating, comment }) },
    true,
  );
}

export function createOrder(input: {
  slug: string;
  color: string;
  storage: string;
  planId: string;
  redeemPoints?: number;
  redeemCashback?: number;
  quantity?: number;
}): Promise<{ order: Order; user: AuthUser }> {
  return request<{ order: Order; user: AuthUser }>(
    '/api/orders',
    { method: 'POST', body: JSON.stringify(input) },
    true,
  );
}

export function cancelOrder(
  orderId: string,
): Promise<{ order: Order; user: AuthUser }> {
  return request<{ order: Order; user: AuthUser }>(
    `/api/orders/${orderId}/cancel`,
    { method: 'POST' },
    true,
  );
}

export function logoutAccount(): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>('/api/auth/logout', { method: 'POST' });
}

export function getAuthProviders(): Promise<{ google: boolean }> {
  return request<{ google: boolean }>('/api/auth/providers');
}

export function getWishlist(): Promise<ProductListItem[]> {
  return request<ProductListItem[]>('/api/wishlist', {}, true);
}

export function getWishlistSlugs(): Promise<string[]> {
  return request<{ slugs: string[] }>('/api/wishlist/slugs', {}, true).then(
    (data) => data.slugs,
  );
}

export function addToWishlist(slug: string): Promise<string[]> {
  return request<{ slugs: string[] }>(
    `/api/wishlist/${slug}`,
    { method: 'POST' },
    true,
  ).then((data) => data.slugs);
}

export function removeFromWishlist(slug: string): Promise<string[]> {
  return request<{ slugs: string[] }>(
    `/api/wishlist/${slug}`,
    { method: 'DELETE' },
    true,
  ).then((data) => data.slugs);
}

export function clearProductListCache() {
  sessionStorage.removeItem(PRODUCT_LIST_CACHE_KEY);
}

export function createProduct(draft: ProductDraft): Promise<ProductDetail> {
  return request<ProductDetail>(
    '/api/admin/products',
    { method: 'POST', body: JSON.stringify(draft) },
    true,
  ).then((product) => {
    clearProductListCache();
    return product;
  });
}

export function updateProduct(
  slug: string,
  draft: ProductDraft,
): Promise<ProductDetail> {
  return request<ProductDetail>(
    `/api/admin/products/${slug}`,
    { method: 'PATCH', body: JSON.stringify(draft) },
    true,
  ).then((product) => {
    clearProductListCache();
    return product;
  });
}

export type AdminUserDraft = {
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  pan: string;
  aadhaar: string;
  creditPoints?: number;
  cashbackBalance?: number;
};

export function getAdminUsers(): Promise<AuthUser[]> {
  return request<AuthUser[]>('/api/admin/users', {}, true);
}

export function getAdminUser(id: string): Promise<AuthUser> {
  return request<AuthUser>(`/api/admin/users/${id}`, {}, true);
}

export function createAdminUser(draft: AdminUserDraft): Promise<AuthUser> {
  return request<AuthUser>(
    '/api/admin/users',
    { method: 'POST', body: JSON.stringify(draft) },
    true,
  );
}

export function updateAdminUser(
  id: string,
  draft: AdminUserDraft,
): Promise<AuthUser> {
  return request<AuthUser>(
    `/api/admin/users/${id}`,
    { method: 'PATCH', body: JSON.stringify(draft) },
    true,
  );
}

export function deleteAdminUser(id: string): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>(
    `/api/admin/users/${id}`,
    { method: 'DELETE' },
    true,
  );
}

export function deleteProduct(slug: string): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>(
    `/api/admin/products/${slug}`,
    { method: 'DELETE' },
    true,
  ).then((result) => {
    clearProductListCache();
    return result;
  });
}
