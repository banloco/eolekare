import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { getProduct, createProduct, updateProduct, uploadImage, deleteImage } from '../../lib/api';

const EMPTY = {
  name: '',
  name_en: '',
  format: '',
  weight_grams: '',
  sku: '',
  description_short: '',
  description_short_en: '',
  description_long: '',
  description_long_en: '',
  ingredients: '',
  ingredients_en: '',
  price_fcfa: '',
  price_eur: '',
  stock: '',
  stock_alert: '5',
  active: true,
  benin_available: true,
  intl_available: true,
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
        name:                 p.name || '',
        name_en:              p.name_en || '',
        format:               p.format || '',
        weight_grams:         p.weight_grams ?? '',
        sku:                  p.sku || '',
        description_short:    p.description_short || '',
        description_short_en: p.description_short_en || '',
        description_long:     p.description_long || '',
        description_long_en:  p.description_long_en || '',
        ingredients:          p.ingredients || '',
        ingredients_en:       p.ingredients_en || '',
        price_fcfa:           p.price_fcfa ?? '',
        price_eur:            p.price_eur ?? '',
        stock:                p.stock ?? '',
        stock_alert:          p.stock_alert ?? '5',
        active:               p.active ?? true,
        benin_available:      p.benin_available ?? true,
        intl_available:       p.intl_available ?? true,
        images:               p.images || [],
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
    const errors = [];
    for (let i = 0; i < uploadQueue.length; i++) {
      const item = uploadQueue[i];
      if (item.status !== 'pending') continue;
      setUploadQueue(q => q.map((x, j) => j === i ? { ...x, status: 'uploading' } : x));
      try {
        const url = await uploadImage(item.file, productId);
        urls.push(url);
        setUploadQueue(q => q.map((x, j) => j === i ? { ...x, status: 'done' } : x));
      } catch(e) {
        errors.push(`${item.file.name} : ${e.message}`);
        setUploadQueue(q => q.map((x, j) => j === i ? { ...x, status: 'error' } : x));
      }
    }
    setUploading(false);
    return { urls, errors };
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
      const payload = {
        name:                 form.name.trim(),
        name_en:              form.name_en.trim(),
        format:               form.format.trim(),
        weight_grams:      form.weight_grams !== '' ? Number(form.weight_grams) : null,
        sku:                  form.sku.trim(),
        description_short:    form.description_short.trim(),
        description_short_en: form.description_short_en.trim(),
        description_long:     form.description_long.trim(),
        description_long_en:  form.description_long_en.trim(),
        ingredients:          form.ingredients.trim(),
        ingredients_en:       form.ingredients_en.trim(),
        price_fcfa:        form.price_fcfa !== '' ? Number(form.price_fcfa) : 0,
        price_eur:         form.price_eur  !== '' ? Number(form.price_eur)  : 0,
        stock:             form.stock      !== '' ? Number(form.stock)      : 0,
        stock_alert:       form.stock_alert !== '' ? Number(form.stock_alert) : null,
        active:            form.active,
        benin_available:   form.benin_available,
        intl_available:    form.intl_available,
        images:            form.images,
      };

      let productId = id;
      let imageErrors = [];

      if (isEdit) {
        // Upload d'abord si nécessaire
        if (uploadQueue.length > 0) {
          const { urls, errors } = await uploadAll(id);
          payload.images = urls;
          imageErrors = errors;
        }
        await updateProduct(id, payload);
        setSuccess('Produit mis à jour avec succès.');
      } else {
        // Créer d'abord sans images
        const created = await createProduct({ ...payload, images: [] });
        productId = created.id;
        // Puis uploader les images
        if (uploadQueue.length > 0) {
          const { urls, errors } = await uploadAll(productId);
          await updateProduct(productId, { images: urls });
          imageErrors = errors;
        }
        setSuccess('Produit créé avec succès.');
        // Ne pas rediriger tant que l'utilisateur n'a pas vu l'erreur d'upload
        if (imageErrors.length === 0) {
          setTimeout(() => navigate(`/admin/products/${productId}`), 1200);
        }
      }

      if (imageErrors.length > 0) {
        setError(`${imageErrors.length > 1 ? 'Certaines images n\'ont' : 'Une image n\'a'} pas pu être envoyée : ${imageErrors.join(' · ')}`);
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
              <Field label="Nom du produit (anglais)">
                <input value={form.name_en} onChange={e => set('name_en', e.target.value)}
                  placeholder="ex: Mango Butter (laisse vide pour reprendre le nom FR)" style={inputStyle}
                  onFocus={e => e.target.style.borderColor='#f8cb78'} onBlur={e => e.target.style.borderColor='rgba(59,25,15,0.15)'}
                />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Field label="Format / Contenance *">
                  <input required value={form.format} onChange={e => set('format', e.target.value)}
                    placeholder="ex: 200ml, 100g, 50ml"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor='#f8cb78'} onBlur={e => e.target.style.borderColor='rgba(59,25,15,0.15)'}
                  />
                </Field>
                <Field label="SKU (référence unique) *">
                  <input required value={form.sku} onChange={e => set('sku', e.target.value)}
                    placeholder="ex: BM-200-NAT"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor='#f8cb78'} onBlur={e => e.target.style.borderColor='rgba(59,25,15,0.15)'}
                  />
                </Field>
              </div>
              <Field label="Poids emballé (g)">
                <input type="number" min="1" value={form.weight_grams} onChange={e => set('weight_grams', e.target.value)}
                  placeholder="ex: 220 (pot + produit)"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor='#f8cb78'} onBlur={e => e.target.style.borderColor='rgba(59,25,15,0.15)'}
                />
                <p style={{ fontSize: 10, color: 'rgba(59,25,15,0.4)', marginTop: 4 }}>
                  Utilisé pour calculer les frais de livraison Mondial Relay. Laissé vide, une estimation est faite à partir du format.
                </p>
              </Field>
              {/* ── Textes FR ── */}
              <p style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#f8cb78', background: '#3b190f', display: 'inline-block', padding: '3px 10px', marginBottom: 2 }}>🇫🇷 Français</p>
              <Field label="Description courte FR (vitrine)">
                <textarea value={form.description_short} onChange={e => set('description_short', e.target.value)}
                  placeholder="2-3 phrases percutantes pour la carte produit…"
                  rows={3} style={{ ...inputStyle, resize: 'vertical', fontSize: 12, fontWeight: 300, color: '#7a4f2d', lineHeight: 1.85 }}
                  onFocus={e => e.target.style.borderColor='#f8cb78'} onBlur={e => e.target.style.borderColor='rgba(59,25,15,0.15)'}
                />
              </Field>
              <Field label="Description longue FR (détail produit)">
                <textarea value={form.description_long} onChange={e => set('description_long', e.target.value)}
                  placeholder="Description complète : bienfaits, texture, usage, résultats…"
                  rows={6} style={{ ...inputStyle, resize: 'vertical', fontSize: 13, fontWeight: 300, color: 'rgba(59,25,15,0.72)', lineHeight: 1.9 }}
                  onFocus={e => e.target.style.borderColor='#f8cb78'} onBlur={e => e.target.style.borderColor='rgba(59,25,15,0.15)'}
                />
              </Field>
              <Field label="Ingrédients FR">
                <textarea value={form.ingredients} onChange={e => set('ingredients', e.target.value)}
                  placeholder="ex: Beurre de Mangue, Huile de Coco, Vitamine E…"
                  rows={3} style={{ ...inputStyle, resize: 'vertical', fontSize: 10, fontWeight: 300, color: 'rgba(59,25,15,0.6)', lineHeight: 1.7, letterSpacing: '0.04em' }}
                  onFocus={e => e.target.style.borderColor='#f8cb78'} onBlur={e => e.target.style.borderColor='rgba(59,25,15,0.15)'}
                />
              </Field>

              {/* ── Textes EN ── */}
              <p style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#1a3a6b', background: '#dce9ff', display: 'inline-block', padding: '3px 10px', marginBottom: 2, marginTop: 8 }}>🇬🇧 English</p>
              <Field label="Short description EN (product card)">
                <textarea value={form.description_short_en} onChange={e => set('description_short_en', e.target.value)}
                  placeholder="2-3 catchy sentences for the product card…"
                  rows={3} style={{ ...inputStyle, resize: 'vertical', fontSize: 12, fontWeight: 300, color: '#7a4f2d', lineHeight: 1.85 }}
                  onFocus={e => e.target.style.borderColor='#7aadff'} onBlur={e => e.target.style.borderColor='rgba(59,25,15,0.15)'}
                />
              </Field>
              <Field label="Long description EN (product detail)">
                <textarea value={form.description_long_en} onChange={e => set('description_long_en', e.target.value)}
                  placeholder="Full description: benefits, texture, use, results…"
                  rows={6} style={{ ...inputStyle, resize: 'vertical', fontSize: 13, fontWeight: 300, color: 'rgba(59,25,15,0.72)', lineHeight: 1.9 }}
                  onFocus={e => e.target.style.borderColor='#7aadff'} onBlur={e => e.target.style.borderColor='rgba(59,25,15,0.15)'}
                />
              </Field>
              <Field label="Ingredients EN">
                <textarea value={form.ingredients_en} onChange={e => set('ingredients_en', e.target.value)}
                  placeholder="e.g. Mango Butter, Coconut Oil, Vitamin E…"
                  rows={3} style={{ ...inputStyle, resize: 'vertical', fontSize: 10, fontWeight: 300, color: 'rgba(59,25,15,0.6)', lineHeight: 1.7, letterSpacing: '0.04em' }}
                  onFocus={e => e.target.style.borderColor='#7aadff'} onBlur={e => e.target.style.borderColor='rgba(59,25,15,0.15)'}
                />
              </Field>
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
              <Field label="Seuil alerte stock bas">
                <input type="number" min="0" value={form.stock_alert} onChange={e => set('stock_alert', e.target.value)}
                  placeholder="5" style={inputStyle}
                  onFocus={e => e.target.style.borderColor='#f8cb78'} onBlur={e => e.target.style.borderColor='rgba(59,25,15,0.15)'}
                />
              </Field>
              {form.stock !== '' && form.stock_alert !== '' && Number(form.stock) <= Number(form.stock_alert) && (
                <p style={{ fontSize: 10, color: '#e67e22', letterSpacing: '0.08em', marginTop: 4 }}>
                  ⚠ Stock faible — pense à réapprovisionner
                </p>
              )}
            </Section>

            {/* Disponibilité marchés */}
            <Section title="Disponibilité marchés">
              <Toggle
                label="Disponible au Bénin"
                value={form.benin_available}
                onChange={v => set('benin_available', v)}
              />
              <Toggle
                label="Disponible en Europe"
                value={form.intl_available}
                onChange={v => set('intl_available', v)}
              />
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

function Toggle({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 11, color: '#3b190f', letterSpacing: '0.05em' }}>{label}</span>
      <div
        onClick={() => onChange(!value)}
        style={{
          width: 46, height: 24, borderRadius: 12, cursor: 'pointer', transition: 'background 0.3s',
          background: value ? '#3b190f' : 'rgba(59,25,15,0.15)',
          position: 'relative', flexShrink: 0,
        }}
      >
        <div style={{
          position: 'absolute', top: 3, width: 18, height: 18, borderRadius: '50%', background: '#fff',
          transition: 'left 0.3s', left: value ? 25 : 3,
        }} />
      </div>
    </div>
  );
}
