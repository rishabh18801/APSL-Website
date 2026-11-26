export interface Spec {
  label: string;
  value: string;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  brand: string;
  short_description: string;
  description: string;
  specs: Spec[];
  price_inr: number | null;
  price_unit: string;
  featured: boolean;
  images: string[];
  category_id: number | null;
  category_slug: string | null;
  category_name: string | null;
  created_at: string;
  updated_at: string;
  related?: Product[];
}

export interface Category {
  id: number;
  slug: string;
  name: string;
  description: string;
  sort_order: number;
  product_count: number;
}

export interface Enquiry {
  id: number;
  name: string;
  phone: string;
  email: string;
  message: string;
  product_id: number | null;
  product_name: string | null;
  product_slug: string | null;
  handled: boolean;
  created_at: string;
}

export interface Post {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  cover_image: string;
  author: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  related?: Post[];
}

export interface HeroSlide {
  id: number;
  image: string;
  lead: string;
  accent: string;
  label: string;
  alt: string;
  sort_order: number;
  active: boolean;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  const isForm = init.body instanceof FormData;
  const res = await fetch(url, {
    credentials: 'same-origin',
    ...init,
    headers: isForm || !init.body ? init.headers : { 'Content-Type': 'application/json', ...init.headers },
  });
  const data = res.headers.get('content-type')?.includes('json') ? await res.json() : null;
  if (!res.ok) throw new ApiError(res.status, data?.error || `Request failed (${res.status})`);
  return data as T;
}

const json = (body: unknown) => JSON.stringify(body);

export const api = {
  products: (params: { category?: string; q?: string; featured?: boolean } = {}) => {
    const qs = new URLSearchParams();
    if (params.category) qs.set('category', params.category);
    if (params.q) qs.set('q', params.q);
    if (params.featured) qs.set('featured', 'true');
    return request<Product[]>(`/api/products${qs.size ? `?${qs}` : ''}`);
  },
  product: (slug: string) => request<Product>(`/api/products/${encodeURIComponent(slug)}`),
  categories: () => request<Category[]>('/api/categories'),
  sendEnquiry: (body: { name: string; phone: string; email: string; message: string; product_id?: number | null; website?: string }) =>
    request<{ ok: true }>('/api/enquiries', { method: 'POST', body: json(body) }),

  posts: () => request<Post[]>('/api/posts'),
  post: (slug: string) => request<Post>(`/api/posts/${encodeURIComponent(slug)}`),
  heroSlides: () => request<HeroSlide[]>('/api/hero-slides'),

  // admin
  me: () => request<{ email: string }>('/api/auth/me'),
  login: (email: string, password: string) => request<{ email: string }>('/api/auth/login', { method: 'POST', body: json({ email, password }) }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  adminProducts: () => request<Product[]>('/api/products/admin/all'),
  adminProduct: (id: number) => request<Product>(`/api/products/admin/${id}`),
  saveProduct: (id: number | null, form: FormData) =>
    request<{ id: number; slug: string }>(id ? `/api/products/${id}` : '/api/products', { method: id ? 'PUT' : 'POST', body: form }),
  deleteProduct: (id: number) => request(`/api/products/${id}`, { method: 'DELETE' }),
  createCategory: (name: string) => request<Category>('/api/categories', { method: 'POST', body: json({ name }) }),
  enquiries: () => request<Enquiry[]>('/api/enquiries'),
  setEnquiryHandled: (id: number, handled: boolean) => request(`/api/enquiries/${id}`, { method: 'PATCH', body: json({ handled }) }),
  deleteEnquiry: (id: number) => request(`/api/enquiries/${id}`, { method: 'DELETE' }),

  adminPosts: () => request<Post[]>('/api/posts/admin/all'),
  adminPost: (id: number) => request<Post>(`/api/posts/admin/${id}`),
  savePost: (id: number | null, form: FormData) =>
    request<{ id: number; slug: string }>(id ? `/api/posts/${id}` : '/api/posts', { method: id ? 'PUT' : 'POST', body: form }),
  deletePost: (id: number) => request(`/api/posts/${id}`, { method: 'DELETE' }),

  adminHeroSlides: () => request<HeroSlide[]>('/api/hero-slides/admin/all'),
  saveHeroSlide: (id: number | null, form: FormData) =>
    request<{ id: number }>(id ? `/api/hero-slides/${id}` : '/api/hero-slides', { method: id ? 'PUT' : 'POST', body: form }),
  deleteHeroSlide: (id: number) => request(`/api/hero-slides/${id}`, { method: 'DELETE' }),
};
