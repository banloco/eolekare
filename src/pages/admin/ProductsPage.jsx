import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { getAllProducts, updateProduct, deleteProduct } from '../../lib/supabase';

const CATEGORIES = ['Tous', 'Corps', 'Capillaire', 'Mixte', 'Visage'];

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [catFilter, setCatFilter] = useState('Tous');
  const [statusFilter, setStatusFilter] = useState('tous');
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setProducts(await getAllProducts()); }
    catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Filtres
  useEffect(() => {
    let list = [...products];
    if (search.trim()) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase()));
    if (catFilter !== 'Tous') list = list.filter(p => p.category === catFilter);
    if (statusFilter === 'actif') list = list.filter(p => p.active);
    if (statusFilter === 'inactif') list = list.filter(p => !p.active);
    if (statusFilter === 'stock') list = list.filter(p => p.stock <= 5);
    setFiltered(list);
  }, [products, search, catFilter, statusFilter]);

  const toggleActive = async (id, current) => {
    try {
      await updateProduct(id, { active: !current });
      setProducts(ps => ps.map(p => p.id === id ? { ...p, active: !current } : p));
    } catch(e) { console.error(e); }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteId);
      setProducts(ps => ps.filter(p => p.id !== deleteId));
      setDeleteId(null);
    } catch(e) { console.error(e); }
    finally { setDeleting(false); }
  };

  const inputStyle = {
    padding: '9px 14px', border: '0.5px solid rgba(59,25,15,0.15)',
    background: '#fff', fontSize: 12, color: '#3b190f',
    outline: 'none', fontFamily: 'Jost, sans-serif',
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 38, fontWeight: 300, color: '#3b190f' }}>
          Produits
        </h1>
        <Link to="/admin/products/new"
          style={{ fontSize: 10, letterSpacing: '0.22em', fontWeight: 300, textTransform: 'uppercase', color: '#fdf6ec', background: '#3b190f', padding: '12px 28px', textDecoration: 'none', transition: 'background 0.3s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#5a2d12'}
          onMouseLeave={e => e.currentTarget.style.background = '#3b190f'}
        >+ Nouveau produit</Link>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          placeholder="Rechercher un produit…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, minWidth: 220 }}
        />
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={inputStyle}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={inputStyle}>
          <option value="tous">Tous les statuts</option>
          <option value="actif">Actifs</option>
          <option value="inactif">Inactifs</option>
          <option value="stock">Stock faible (≤5)</option>
        </select>
        <span style={{ fontSize: 10, letterSpacing: '0.12em', color: 'rgba(59,25,15,0.4)', marginLeft: 'auto' }}>
          {filtered.length} produit{filtered.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '0.5px solid rgba(59,25,15,0.08)' }}>
        {loading ? (
          <p style={{ padding: '3rem', textAlign: 'center', fontFamily: '"Cormorant Garamond", serif', fontSize: 18, fontStyle: 'italic', color: 'rgba(59,25,15,0.4)' }}>Chargement…</p>
        ) : filtered.length === 0 ? (
          <p style={{ padding: '3rem', textAlign: 'center', fontSize: 12, color: 'rgba(59,25,15,0.4)' }}>Aucun produit trouvé.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '0.5px solid rgba(59,25,15,0.08)' }}>
                {['Produit', 'Catégorie', 'Prix Bénin', 'Prix Europe', 'Stock', 'Statut', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 1.5rem', textAlign: 'left', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(59,25,15,0.4)', fontWeight: 300 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}
                  style={{ borderBottom: '0.5px solid rgba(59,25,15,0.04)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,203,120,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  {/* Produit */}
                  <td style={{ padding: '12px 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 44, height: 44, flexShrink: 0, background: '#f8cb78', overflow: 'hidden' }}>
                        {p.images?.[0] && <img src={p.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                      </div>
                      <div>
                        <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 16, color: '#3b190f', marginBottom: 2 }}>{p.name}</p>
                        <p style={{ fontSize: 9, color: 'rgba(59,25,15,0.35)', letterSpacing: '0.1em' }}>
                          {p.tags?.slice(0,3).join(' · ') || '—'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 1.5rem', fontSize: 11, color: '#7a4f2d' }}>{p.category || '—'}</td>
                  <td style={{ padding: '12px 1.5rem', fontFamily: '"Cormorant Garamond", serif', fontSize: 15, color: '#3b190f' }}>
                    {p.price_fcfa ? `${Number(p.price_fcfa).toLocaleString('fr-FR')} FCFA` : '—'}
                  </td>
                  <td style={{ padding: '12px 1.5rem', fontFamily: '"Cormorant Garamond", serif', fontSize: 15, color: '#3b190f' }}>
                    {p.price_eur ? `${Number(p.price_eur).toFixed(2)} €` : '—'}
                  </td>
                  {/* Stock */}
                  <td style={{ padding: '12px 1.5rem' }}>
                    <span style={{ fontSize: 13, fontWeight: 300, color: p.stock === 0 ? '#c0392b' : p.stock <= 5 ? '#e67e22' : '#2d7a2d' }}>
                      {p.stock ?? '—'}
                      {p.stock === 0 && ' ⚠'}
                    </span>
                  </td>
                  {/* Toggle actif */}
                  <td style={{ padding: '12px 1.5rem' }}>
                    <button
                      onClick={() => toggleActive(p.id, p.active)}
                      style={{
                        fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase',
                        padding: '4px 10px', cursor: 'pointer', border: 'none', fontFamily: 'Jost, sans-serif',
                        background: p.active ? 'rgba(45,122,45,0.1)' : 'rgba(192,57,43,0.1)',
                        color: p.active ? '#2d7a2d' : '#c0392b',
                        transition: 'all 0.2s',
                      }}
                    >
                      {p.active ? '● Actif' : '○ Inactif'}
                    </button>
                  </td>
                  {/* Actions */}
                  <td style={{ padding: '12px 1.5rem' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link to={`/admin/products/${p.id}`}
                        style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#3b190f', textDecoration: 'none', padding: '5px 12px', border: '0.5px solid rgba(59,25,15,0.2)', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#3b190f'; e.currentTarget.style.color = '#fdf6ec'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = '#3b190f'; }}
                      >Modifier</Link>
                      <button
                        onClick={() => setDeleteId(p.id)}
                        style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c0392b', background: 'none', border: '0.5px solid rgba(192,57,43,0.2)', padding: '5px 10px', cursor: 'pointer', fontFamily: 'Jost, sans-serif', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#c0392b'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = '#c0392b'; }}
                      >Suppr.</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal suppression */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(59,25,15,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ background: '#fdf6ec', padding: '2.5rem', maxWidth: 400, width: '100%', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
            <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 24, color: '#3b190f', marginBottom: '0.8rem' }}>
              Supprimer ce produit ?
            </p>
            <p style={{ fontSize: 12, color: '#7a4f2d', lineHeight: 1.7, marginBottom: '2rem' }}>
              Cette action est irréversible. Le produit et ses images seront définitivement supprimés.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setDeleteId(null)}
                style={{ flex: 1, padding: '12px', background: 'none', border: '0.5px solid rgba(59,25,15,0.2)', color: '#3b190f', cursor: 'pointer', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif' }}>
                Annuler
              </button>
              <button onClick={confirmDelete} disabled={deleting}
                style={{ flex: 1, padding: '12px', background: '#c0392b', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif' }}>
                {deleting ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
