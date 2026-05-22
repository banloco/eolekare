const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

function getToken() {
  return localStorage.getItem('auth_token');
}

async function request(method, path, body = null, retries = 2) {
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000); // 15s timeout

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || res.statusText);
    }

    if (res.status === 204) return null;
    return res.json();
  } catch (err) {
    clearTimeout(timer);
    if (retries > 0 && (err.name === 'AbortError' || err.message === 'Failed to fetch')) {
      await new Promise(r => setTimeout(r, 1500));
      return request(method, path, body, retries - 1);
    }
    throw err;
  }
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

// ── COMMANDES ADMIN ──────────────────────────────────────

export async function getAdminOrders(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return request('GET', `/admin/orders${qs ? '?' + qs : ''}`);
}

export async function getAdminOrder(id) {
  return request('GET', `/admin/orders/${id}`);
}

export async function updateOrderStatus(id, status) {
  return request('PATCH', `/admin/orders/${id}/status`, { status });
}

export async function exportAdminOrders(params = {}) {
  const token = getToken();
  const qs = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/admin/orders/export${qs ? '?' + qs : ''}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'text/csv' },
  });
  if (!res.ok) throw new Error('Erreur lors de l\'export');
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `commandes-eolekare-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export async function getAdminStats() {
  return request('GET', '/admin/stats');
}

// ── UTILISATEURS ADMIN ───────────────────────────────────

export async function getAdminUsers() {
  return request('GET', '/admin/users');
}

export async function createAdminUser(data) {
  return request('POST', '/admin/users', data);
}

export async function updateAdminUser(id, data) {
  return request('PUT', `/admin/users/${id}`, data);
}

export async function deleteAdminUser(id) {
  return request('DELETE', `/admin/users/${id}`);
}

// ── DÉPENSES ─────────────────────────────────────────────

export async function getAdminExpenses(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return request('GET', `/admin/expenses${qs ? '?' + qs : ''}`);
}

export async function getAdminExpenseStats() {
  return request('GET', '/admin/expenses/stats');
}

export async function exportAdminExpenses(params = {}) {
  const token = getToken();
  const qs = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/admin/expenses/export${qs ? '?' + qs : ''}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'text/csv' },
  });
  if (!res.ok) throw new Error('Erreur lors de l\'export');
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `depenses-eolekare-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export async function createExpense(data) {
  return request('POST', '/admin/expenses', data);
}

export async function updateExpense(id, data) {
  return request('PUT', `/admin/expenses/${id}`, data);
}

export async function deleteExpense(id) {
  return request('DELETE', `/admin/expenses/${id}`);
}

// ── PAIEMENTS ────────────────────────────────────────────

export async function fedapayCreateTransaction(orderId) {
  return request('POST', '/payments/fedapay/transaction', { order_id: orderId });
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
