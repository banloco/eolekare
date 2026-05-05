const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

function getToken() {
  return localStorage.getItem('auth_token');
}

async function request(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || res.statusText);
  }

  if (res.status === 204) return null;
  return res.json();
}

// ── PRODUITS ────────────────────────────────────────────

export async function getProducts(market = null) {
  const qs = market ? `?market=${market}` : '';
  return request('GET', `/products${qs}`);
}

export async function getAllProducts() {
  return request('GET', '/admin/products');
}

export async function getProduct(id) {
  return request('GET', `/admin/products/${id}`);
}

export async function createProduct(product) {
  return request('POST', '/admin/products', product);
}

export async function updateProduct(id, updates) {
  return request('PUT', `/admin/products/${id}`, updates);
}

export async function deleteProduct(id) {
  return request('DELETE', `/admin/products/${id}`);
}

// ── IMAGES ──────────────────────────────────────────────

export async function uploadImage(file, productId) {
  const token = getToken();
  const formData = new FormData();
  formData.append('image', file);
  formData.append('product_id', productId);

  const res = await fetch(`${BASE_URL}/admin/products/upload-image`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || res.statusText);
  }

  const data = await res.json();
  return data.url;
}

export async function deleteImage(url) {
  return request('DELETE', '/admin/products/delete-image', { url });
}

// ── COMMANDES ────────────────────────────────────────────

export async function createOrder(payload) {
  return request('POST', '/orders', payload);
}

// ── PAIEMENTS ────────────────────────────────────────────

export async function stripeCreateIntent(orderId) {
  return request('POST', '/payments/stripe/intent', { order_id: orderId });
}

export async function paypalCreateOrder(orderId) {
  return request('POST', '/payments/paypal/create-order', { order_id: orderId });
}

export async function paypalCaptureOrder(paypalOrderId, orderId) {
  return request('POST', '/payments/paypal/capture-order', {
    paypal_order_id: paypalOrderId,
    order_id: orderId,
  });
}

// ── AUTH ────────────────────────────────────────────────

export async function signIn(email, password) {
  const data = await request('POST', '/login', { email, password });
  if (data.token) localStorage.setItem('auth_token', data.token);
  return data;
}

export async function signOut() {
  await request('POST', '/logout');
  localStorage.removeItem('auth_token');
}

export async function getSession() {
  const token = getToken();
  if (!token) return null;
  try {
    const user = await request('GET', '/user');
    return { user };
  } catch {
    localStorage.removeItem('auth_token');
    return null;
  }
}
