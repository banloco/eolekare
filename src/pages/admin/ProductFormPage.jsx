import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { getProduct, createProduct, updateProduct, uploadImage, deleteImage } from '../../lib/supabase';

const CATEGORIES = ['Corps', 'Capillaire', 'Mixte', 'Visage'];

const EMPTY = {
  name: '', description: '', category: 'Corps',
  tags: '', price_fcfa: '', price_eur: '',
  stock: '', active: true,
  checkout_url: '', whatsapp: '2290148654200',
  images: [],
};

export default function ProductFormPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const isEdit   = Boolean(id);

  const [form, setForm]       = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  // Image upload
  const [uploadQueue, setUploadQueue] = useState([]); // { file, preview, status }
  const [uploading, setUploading]     = useState(false);
  const fileInputRef = useRef();

  // Charger produit existant
  useEffect(() => {
    if (!isEdit) return;
    getProduct(id)
      .then(p => setForm({
        name: p.name || '',
        description: p.description || '',
        category: p.category || 'Corps',
        tags: (p.tags || []).join(', '),
        price_fcfa: p.price_fcfa ?? '',
        price_eur: p.price_eur ?? '',
        stock: p.stock ?? '',
        active: p.active ?? true,
        checkout_url: p.checkout_url || '',
        whatsapp: p.whatsapp || '2290148654200',
        images: p.images || [],
      }))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  // Sélection fichiers
  const handleFiles = (files) => {
    const newQ = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file),
      status: 'pending',
    }));
    setUploadQueue(q => [...q, ...newQ]);
  };

  // Upload toutes les images en queue
  const uploadAll = async (productId) => {
    setUploading(true);
    const urls = [...form.images];
    for (let i = 0; i < uploadQueue.length; i++) {
      const item = uploadQueue[i];
      if (item.status !== 'pending') continue;
      setUploadQueue(q => q.map((x, j) => j === i ? { ...x, status: 'uploading' } : x));
      try {
        const url = await uploadImage(item.file, productId);
        urls.push(url);
        setUploadQueue(q => q.map((x, j) => j === i ? { ...x, status: 'done' } : x));
      } catch(e) {
        setUploadQueue(q => q.map((x, j) => j === i ? { ...x, status: 'error' } : x));
      }
    }
    setUploading(false);
    return urls;
  };

  const removeExistingImage = async (url) => {
    try {
      await deleteImage(url);
      setForm(f => ({ ...f, images: f.images.filter(u => u !== url) }));
    } catch(e) { console.error(e); }
  };

  const removeQueued = (idx) => {
    setUploadQueue(q => q.filter((_, i) => i !== idx));
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setSaving(true);

    try {
      // Préparer les données
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        price_fcfa: form.price_fcfa !== '' ? Number(form.price_fcfa) : null,
        price_eur: form.price_eur !== '' ? Number(form.price_eur) : null,
        stock: form.stock !== '' ? Number(form.stock) : 0,
        active: form.active,
        checkout_url: form.checkout_url.trim(),
        whatsapp: form.whatsapp.trim(),
        images: form.images,
      };

      let productId = id;

      if (isEdit) {
        // Upload d'abord si nécessaire
        if (uploadQueue.length > 0) {
          const urls = await uploadAll(id);
          payload.images = urls;
        }
        await updateProduct(id, payload);
        setSuccess('Produit mis à jour avec succès.');
      } else {
        // Créer d'abord sans images
        const created = await createProduct({ ...payload, images: [] });
        productId = created.id;
        // Puis uploader les images
        if (uploadQueue.length > 0) {
          const urls = await uploadAll(productId);
          await updateProduct(productId, { images: urls });
        }
        setSuccess('Produit créé avec succès.');
        setTimeout(() => navigate(`/admin/products/${productId}`), 1200);
      }
    } catch(e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const labelStyle = { display: 'block', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#7a4f2d', marginBottom: 6 };
  const inputStyle = { width: '100%', padding: '11px 14px', border: '0.5px solid rgba(59,25,15,0.15)', background: '#fff', fontSize: 13, color: '#3b190f', outline: 'none', fontFamily: 'Jost, sans-serif', boxSizing: 'border-box', transition: 'border-color 0.2s' };

  if (loading) return (
    <AdminLayout>
      <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 22, fontStyle: 'italic', color: 'rgba(59,25,15,0.4)', padding: '4rem 0' }}>Chargement…</p>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <button onClick={() => navigate('/admin/products')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, letterSpacing: '0.18em', color: 'rgba(59,25,15,0.4)', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', padding: 0, marginBottom: 8 }}>
            ← Retour aux produits
          </button>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 38, fontWeight: 300, color: '#3b190f' }}>
            {isEdit ? 'Modifier le produit' : 'Nouveau produit'}
          </h1>
        </div>

        {/* Toggle actif */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 10, letterSpacing: '0.15em', color: '#7a4f2d', textTransform: 'uppercase' }}>
            {form.active ? 'Actif' : 'Inactif'}
          </span>
          <div
            onClick={() => set('active', !form.active)}
            style={{
              width: 46, height: 24, borderRadius: 12, cursor: 'pointer', transition: 'background 0.3s',
              background: form.active ? '#3b190f' : 'rgba(59,25,15,0.15)',
              position: 'relative',
            }}
          >
            <div style={{
              position: 'absolute', top: 3, width: 18, height: 18, borderRadius: '50%', background: '#fff',
              transition: 'left 0.3s',
              left: form.active ? 25 : 3,
            }} />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>

          {/* ── Colonne principale ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Infos générales */}
            <Section title="Informations générales">
              <Field label="Nom du produit *">
                <input required value={form.name} onChange={e => set('name', e.target.value)}
                  placeholder="ex: Beurre Mangue" style={inputStyle}
                  onFocus={e => e.target.style.borderColor='#f8cb78'} onBlur={e => e.target.style.borderColor='rgba(59,25,15,0.15)'}
                />
              </Field>
              <Field label="Description">
                <textarea value={form.description} onChange={e => set('description', e.target.value)}
                  placeholder="Décris les bienfaits, les ingrédients, l'usage…"
                  rows={5} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }}
                  onFocus={e => e.target.style.borderColor='#f8cb78'} onBlur={e => e.target.style.borderColor='rgba(59,25,15,0.15)'}
                />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Field label="Catégorie">
                  <select value={form.category} onChange={e => set('category', e.target.value)} style={inputStyle}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Tags (séparés par virgule)">
                  <input value={form.tags} onChange={e => set('tags', e.target.value)}
                    placeholder="naturel, mangue, corps"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor='#f8cb78'} onBlur={e => e.target.style.borderColor='rgba(59,25,15,0.15)'}
                  />
                </Field>
              </div>
            </Section>

            {/* Prix */}
            <Section title="Tarification">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Field label="Prix Bénin (FCFA)">
                  <input type="number" min="0" value={form.price_fcfa} onChange={e => set('price_fcfa', e.target.value)}
                    placeholder="4000" style={inputStyle}
                    onFocus={e => e.target.style.borderColor='#f8cb78'} onBlur={e => e.target.style.borderColor='rgba(59,25,15,0.15)'}
                  />
                </Field>
                <Field label="Prix Europe (EUR)">
                  <input type="number" min="0" step="0.01" value={form.price_eur} onChange={e => set('price_eur', e.target.value)}
                    placeholder="12.00" style={inputStyle}
                    onFocus={e => e.target.style.borderColor='#f8cb78'} onBlur={e => e.target.style.borderColor='rgba(59,25,15,0.15)'}
                  />
                </Field>
              </div>
            </Section>

            {/* Liens de commande */}
            <Section title="Liens de commande">
              <Field label="Lien paiement Europe (Shopify / Stripe / autre)">
                <input value={form.checkout_url} onChange={e => set('checkout_url', e.target.value)}
                  placeholder="https://eolekare.myshopify.com/cart/..."
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor='#f8cb78'} onBlur={e => e.target.style.borderColor='rgba(59,25,15,0.15)'}
                />
                <p style={{ fontSize: 10, color: 'rgba(59,25,15,0.4)', marginTop: 4, letterSpacing: '0.05em' }}>
                  Ce lien s'ouvre quand un client européen clique sur "Commander".
                </p>
              </Field>
              <Field label="Numéro WhatsApp Bénin (sans + ni espaces)">
                <input value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)}
                  placeholder="2290148654200"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor='#f8cb78'} onBlur={e => e.target.style.borderColor='rgba(59,25,15,0.15)'}
                />
              </Field>
            </Section>

            {/* Images */}
            <Section title="Images">
              {/* Images existantes */}
              {form.images.length > 0 && (
                <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {form.images.map((url, i) => (
                    <div key={i} style={{ position: 'relative', width: 90, height: 90 }}>
                      <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      <button type="button" onClick={() => removeExistingImage(url)}
                        style={{ position: 'absolute', top: 3, right: 3, background: 'rgba(192,57,43,0.85)', border: 'none', color: '#fff', width: 20, height: 20, cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        ✕
                      </button>
                      {i === 0 && (
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(59,25,15,0.7)', padding: '2px 0', textAlign: 'center' }}>
                          <span style={{ fontSize: 8, color: '#f8cb78', letterSpacing: '0.1em' }}>PRINCIPALE</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Upload zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#f8cb78'; }}
                onDragLeave={e => { e.currentTarget.style.borderColor = 'rgba(59,25,15,0.15)'; }}
                onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'rgba(59,25,15,0.15)'; handleFiles(e.dataTransfer.files); }}
                style={{ border: '1px dashed rgba(59,25,15,0.2)', padding: '2rem', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s', background: 'rgba(248,203,120,0.03)' }}
              >
                <p style={{ fontSize: 24, marginBottom: 8 }}>📷</p>
                <p style={{ fontSize: 11, color: '#7a4f2d', letterSpacing: '0.08em' }}>Glisse des images ici ou clique pour sélectionner</p>
                <p style={{ fontSize: 9, color: 'rgba(59,25,15,0.35)', marginTop: 4 }}>JPG, PNG, WEBP · Max 5MB par image</p>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />

              {/* Queue */}
              {uploadQueue.length > 0 && (
                <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                  {uploadQueue.map((item, i) => (
                    <div key={i} style={{ position: 'relative', width: 90, height: 90 }}>
                      <img src={item.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: item.status === 'uploading' ? 0.5 : 1 }} />
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {item.status === 'uploading' && <span style={{ fontSize: 20 }}>⏳</span>}
                        {item.status === 'done'      && <span style={{ fontSize: 20 }}>✅</span>}
                        {item.status === 'error'     && <span style={{ fontSize: 20 }}>❌</span>}
                      </div>
                      {item.status === 'pending' && (
                        <button type="button" onClick={() => removeQueued(i)}
                          style={{ position: 'absolute', top: 3, right: 3, background: 'rgba(192,57,43,0.85)', border: 'none', color: '#fff', width: 20, height: 20, cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </div>

          {/* ── Colonne latérale ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '2rem' }}>

            {/* Stock */}
            <Section title="Stock">
              <Field label="Quantité disponible">
                <input type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)}
                  placeholder="0" style={inputStyle}
                  onFocus={e => e.target.style.borderColor='#f8cb78'} onBlur={e => e.target.style.borderColor='rgba(59,25,15,0.15)'}
                />
              </Field>
              {form.stock !== '' && Number(form.stock) <= 5 && (
                <p style={{ fontSize: 10, color: '#e67e22', letterSpacing: '0.08em', marginTop: 4 }}>
                  ⚠ Stock faible — pense à réapprovisionner
                </p>
              )}
            </Section>

            {/* Feedback */}
            {error && (
              <div style={{ background: 'rgba(192,57,43,0.08)', border: '0.5px solid rgba(192,57,43,0.3)', padding: '12px 16px' }}>
                <p style={{ fontSize: 11, color: '#c0392b' }}>⚠ {error}</p>
              </div>
            )}
            {success && (
              <div style={{ background: 'rgba(45,122,45,0.08)', border: '0.5px solid rgba(45,122,45,0.3)', padding: '12px 16px' }}>
                <p style={{ fontSize: 11, color: '#2d7a2d' }}>✓ {success}</p>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={saving || uploading}
              style={{
                width: '100%', padding: '16px',
                background: saving ? 'rgba(59,25,15,0.5)' : '#3b190f',
                color: '#fdf6ec', border: 'none',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: 10, letterSpacing: '0.28em', fontWeight: 300,
                textTransform: 'uppercase', fontFamily: 'Jost, sans-serif',
                transition: 'background 0.3s',
              }}
              onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#5a2d12'; }}
              onMouseLeave={e => { if (!saving) e.currentTarget.style.background = '#3b190f'; }}
            >
              {saving ? 'Enregistrement…' : isEdit ? 'Enregistrer les modifications' : 'Créer le produit'}
            </button>

            {isEdit && (
              <button type="button" onClick={() => navigate('/admin/products')}
                style={{ width: '100%', padding: '12px', background: 'none', border: '0.5px solid rgba(59,25,15,0.2)', color: '#3b190f', cursor: 'pointer', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif' }}>
                Annuler
              </button>
            )}
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}

/* ── Composants UI internes ── */
function Section({ title, children }) {
  return (
    <div style={{ background: '#fff', border: '0.5px solid rgba(59,25,15,0.08)', padding: '1.8rem 2rem' }}>
      <p style={{ fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#7a4f2d', marginBottom: '1.5rem', borderBottom: '0.5px solid rgba(59,25,15,0.06)', paddingBottom: '0.8rem' }}>
        {title}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7a4f2d', marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}
