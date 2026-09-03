import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { getAllProducts, updateProduct, deleteProduct, getStockNotifications, reorderProducts } from '../../lib/api';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [marketFilter, setMarketFilter] = useState('tous');
  const [statusFilter, setStatusFilter] = useState('tous');
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [stockNotifs, setStockNotifs] = useState({}); // { [product_id]: { count, emails } }
  const [notifModal, setNotifModal] = useState(null); // produit affiché dans le modal
  const [dragIndex, setDragIndex] = useState(null);
  const [savingOrder, setSavingOrder] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setProducts(await getAllProducts()); }
    catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    getStockNotifications()
      .then(rows => setStockNotifs(Object.fromEntries(rows.map(r => [r.product_id, r]))))
      .catch(console.error);
  }, []);

  // Filtres
  useEffect(() => {
    let list = [...products];
    if (search.trim()) list = list.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase()) ||
      p.description_short?.toLowerCase().includes(search.toLowerCase())
    );
    if (marketFilter === 'benin') list = list.filter(p => p.benin_available);
    if (marketFilter === 'intl')  list = list.filter(p => p.intl_available);
    if (statusFilter === 'actif') list = list.filter(p => p.active);
    if (statusFilter === 'inactif') list = list.filter(p => !p.active);
    if (statusFilter === 'stock') list = list.filter(p => p.stock <= (p.stock_alert ?? 5));
    setFiltered(list);
  }, [products, search, marketFilter, statusFilter]);

  const toggleActive = async (id, current) => {
    try {
      await updateProduct(id, { active: !current });
      setProducts(ps => ps.map(p => p.id === id ? { ...p, active: !current } : p));
    } catch(e) { console.error(e); }
  };

  // Réordonner (drag & drop) : uniquement possible sans filtre actif, sinon
  // l'index affiché ne correspondrait plus à l'ordre réel des produits.
  const canReorder = !search.trim() && marketFilter === 'tous' && statusFilter === 'tous';

  const handleDrop = async (dropIndex) => {
    if (dragIndex === null || dragIndex === dropIndex) { setDragIndex(null); return; }
    const reordered = [...products];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, moved);
    setProducts(reordered);
    setDragIndex(null);
    setSavingOrder(true);
    try {
      await reorderProducts(reordered.map(p => p.id));
    } catch (e) {
      console.error(e);
      load(); // resynchronise avec le serveur en cas d'échec
    } finally {
      setSavingOrder(false);
    }
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
        <select value={marketFilter} onChange={e => setMarketFilter(e.target.value)} style={inputStyle}>
          <option value="tous">Tous les marchés</option>
          <option value="benin">Bénin</option>
          <option value="intl">Europe</option>
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

      <p style={{ fontSize: 10, letterSpacing: '0.08em', color: 'rgba(59,25,15,0.4)', marginBottom: '1rem' }}>
        {canReorder
          ? (savingOrder ? 'Enregistrement de l\'ordre…' : '⠿ Glisse-dépose les lignes pour changer l\'ordre d\'affichage sur le site.')
          : 'Réinitialise les filtres pour pouvoir réordonner les produits.'}
      </p>

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
                <th style={{ width: 32 }}></th>
                {['Produit', 'Format', 'Prix Bénin', 'Prix Europe', 'Stock', 'Statut', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 1.5rem', textAlign: 'left', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(59,25,15,0.4)', fontWeight: 300 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, index) => (
                <tr key={p.id}
                  draggable={canReorder}
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={e => canReorder && e.preventDefault()}
                  onDrop={() => canReorder && handleDrop(index)}
                  onDragEnd={() => setDragIndex(null)}
                  style={{
                    borderBottom: '0.5px solid rgba(59,25,15,0.04)',
                    transition: 'background 0.15s',
                    opacity: dragIndex === index ? 0.4 : 1,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,203,120,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  <td style={{ padding: '12px 0 12px 1rem', textAlign: 'center', color: canReorder ? 'rgba(59,25,15,0.3)' : 'rgba(59,25,15,0.1)', cursor: canReorder ? 'grab' : 'default', fontSize: 14 }}>
                    ⠿
                  </td>
                  {/* Produit */}
                  <td style={{ padding: '12px 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 44, height: 44, flexShrink: 0, background: '#f8cb78', overflow: 'hidden' }}>
                        {p.images?.[0] && <img src={p.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                      </div>
                      <div>
                        <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 16, color: '#3b190f', marginBottom: 2 }}>{p.name}</p>
                        <p style={{ fontSize: 9, color: 'rgba(59,25,15,0.35)', letterSpacing: '0.1em' }}>
                          {p.sku || '—'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 1.5rem' }}>
                    <div style={{ fontSize: 11, color: '#7a4f2d', marginBottom: 4 }}>{p.format || '—'}</div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {p.benin_available && <span style={{ fontSize: 8, letterSpacing: '0.1em', padding: '2px 6px', background: 'rgba(45,122,45,0.1)', color: '#2d7a2d' }}>🇧🇯 Bénin</span>}
                      {p.intl_available  && <span style={{ fontSize: 8, letterSpacing: '0.1em', padding: '2px 6px', background: 'rgba(59,25,15,0.06)', color: '#7a4f2d' }}>🇪🇺 Europe</span>}
                    </div>
                  </td>
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
                    {stockNotifs[p.id] && (
                      <button onClick={() => setNotifModal(stockNotifs[p.id])}
                        style={{ display: 'block', marginTop: 4, fontSize: 9, letterSpacing: '0.08em', color: '#7a4f2d', background: 'rgba(122,79,45,0.08)', border: 'none', padding: '2px 8px', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
                        🔔 {stockNotifs[p.id].count} en attente
                      </button>
                    )}
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
      {/* Modal alertes retour en stock */}
      {notifModal && (
        <div onClick={() => setNotifModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(59,25,15,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fdf6ec', padding: '2.5rem', maxWidth: 440, width: '100%', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
            <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 22, color: '#3b190f', marginBottom: 4 }}>
              {notifModal.product_name} {notifModal.format && `· ${notifModal.format}`}
            </p>
            <p style={{ fontSize: 11, color: '#7a4f2d', marginBottom: '1.5rem' }}>
              {notifModal.count} personne{notifModal.count > 1 ? 's' : ''} en attente du retour en stock
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: '2rem' }}>
              {notifModal.emails.map((email, i) => (
                <a key={i} href={`mailto:${email}`} style={{ fontSize: 12, color: '#3b190f', textDecoration: 'none', padding: '8px 12px', background: '#fff', border: '0.5px solid rgba(59,25,15,0.08)' }}>
                  {email}
                </a>
              ))}
            </div>
            <button onClick={() => setNotifModal(null)}
              style={{ width: '100%', padding: '12px', background: 'none', border: '0.5px solid rgba(59,25,15,0.2)', color: '#3b190f', cursor: 'pointer', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif' }}>
              Fermer
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
