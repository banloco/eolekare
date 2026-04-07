import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { getProduct, createProduct, updateProduct, uploadImage, deleteImage } from '../../lib/shopify';

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
  const [uploadQueue, setUploadQueue] = useState([]);
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
    const urls = [];
    for (let i = 0; i < uploadQueue.length; i++) {
      const item = uploadQueue[i];
      if (item.status !== 'pending') continue;
      setUploadQueue(q => q.map((x, j) => j === i ? { ...x, status: 'uploading' } : x));
      try {
        const result = await uploadImage(productId, item.file);
        urls.push(result.url);
        setUploadQueue(q => q.map((x, j) => j === i ? { ...x, status: 'done' } : x));
      } catch(e) {
        console.error('Upload failed:', e);
        setUploadQueue(q => q.map((x, j) => j === i ? { ...x, status: 'error' } : x));
      }
    }
    setUploading(false);
    return urls;
  };

  const removeExistingImage = async (imageUrl) => {
    try {
      await deleteImage(imageUrl);
      setForm(f => ({ ...f, images: f.images.filter(u => u !== imageUrl) }));
    } catch(e) { 
      console.error('Failed to delete image:', e);
      setError('Impossible de supprimer l\'image');
    }
  };

  const removeQueued = (idx) => {
    setUploadQueue(q => q.filter((_, i) => i !== idx));
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 
    setSuccess('');
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
      };

      if (isEdit) {
        // Upload d'abord si nécessaire
        let allImages = [...form.images];
        if (uploadQueue.length > 0) {
          const newUrls = await uploadAll(id);
          allImages = [...allImages, ...newUrls];
        }
        await updateProduct(id, { ...payload, images: allImages });
        setSuccess('Produit mis à jour avec succès.');
        setTimeout(() => navigate('/admin/products'), 1500);
      } else {
        // Créer d'abord sans images
        const created = await createProduct({ ...payload, images: [] });
        const productId = created.id;
        
        // Puis uploader les images si nécessaire
        if (uploadQueue.length > 0) {
          const newUrls = await uploadAll(productId);
          await updateProduct(productId, { ...payload, images: newUrls });
        }
        setSuccess('Produit créé avec succès.');
        setTimeout(() => navigate('/admin/products'), 1500);
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

          {/* Colonne principale */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* ... (le reste du formulaire reste identique) ... */}
            
            {/* Je reprends la suite du formulaire mais gardez votre structure existante */}
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

            {/* Ajoutez les autres sections identiques à votre code original */}
            {/* Section Tarification, Liens de commande, Images... */}
            
          </div>

          {/* Colonne latérale */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '2rem' }}>
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
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}

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