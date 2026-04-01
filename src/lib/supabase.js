import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnon = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnon) {
  console.error('❌ Variables Supabase manquantes dans .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,       // session gardée dans localStorage
    detectSessionInUrl: true,
  },
});

// ── PRODUITS ────────────────────────────────────────────

/** Tous les produits actifs (vitrine) */
export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

/** Tous les produits (admin) */
export async function getAllProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

/** Un produit par id */
export async function getProduct(id) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

/** Créer un produit */
export async function createProduct(product) {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Mettre à jour un produit */
export async function updateProduct(id, updates) {
  const { data, error } = await supabase
    .from('products')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Supprimer un produit */
export async function deleteProduct(id) {
  // Supprimer d'abord les images Storage
  const { data: product } = await supabase
    .from('products')
    .select('images')
    .eq('id', id)
    .single();

  if (product?.images?.length) {
    const paths = product.images.map(url => {
      const parts = url.split('/storage/v1/object/public/products/');
      return parts[1] || null;
    }).filter(Boolean);
    if (paths.length) {
      await supabase.storage.from('products').remove(paths);
    }
  }

  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

// ── IMAGES STORAGE ──────────────────────────────────────

/** Upload une image → retourne l'URL publique */
export async function uploadImage(file, productId) {
  const ext  = file.name.split('.').pop();
  const path = `${productId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('products')
    .upload(path, file, { cacheControl: '3600', upsert: false });
  if (error) throw error;

  const { data } = supabase.storage.from('products').getPublicUrl(path);
  return data.publicUrl;
}

/** Supprimer une image du Storage */
export async function deleteImage(url) {
  const parts = url.split('/storage/v1/object/public/products/');
  if (!parts[1]) return;
  const { error } = await supabase.storage.from('products').remove([parts[1]]);
  if (error) throw error;
}

// ── AUTH ────────────────────────────────────────────────

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
