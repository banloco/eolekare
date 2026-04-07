// DashboardPage.jsx - Version vérifiée (aucun changement majeur nécessaire)
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { getAllProducts } from '../../lib/shopify';

function StatCard({ label, value, sub, color = '#3b190f' }) {
  return (
    <div style={{ background: '#fff', padding: '1.8rem 2rem', border: '0.5px solid rgba(59,25,15,0.08)', flex: 1 }}>
      <p style={{ fontSize: 9, letterSpacing: '0.25em', color: '#7a4f2d', textTransform: 'uppercase', marginBottom: '0.8rem' }}>{label}</p>
      <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 42, fontWeight: 300, color, lineHeight: 1, marginBottom: '0.3rem' }}>{value}</p>
      {sub && <p style={{ fontSize: 10, color: 'rgba(59,25,15,0.4)', letterSpacing: '0.1em' }}>{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAllProducts()
      .then(data => {
        console.log('Produits chargés depuis Shopify:', data.length);
        setProducts(data);
        setError(null);
      })
      .catch(err => {
        console.error('Erreur chargement produits:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const active = products.filter(p => p.active).length;
  const inactive = products.filter(p => !p.active).length;
  const lowStock = products.filter(p => p.stock !== null && p.stock <= 5).length;
  const noStock = products.filter(p => p.stock === 0).length;

  if (error) {
    return (
      <AdminLayout>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ color: '#c0392b' }}>Erreur de chargement</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#3b190f', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            Réessayer
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 38, fontWeight: 300, color: '#3b190f', marginBottom: 4 }}>
            Vue d'ensemble
          </h1>
          <p style={{ fontSize: 11, color: '#7a4f2d', letterSpacing: '0.1em' }}>
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link to="/admin/products/new"
          style={{ display: 'inline-block', fontSize: 10, letterSpacing: '0.22em', fontWeight: 300, textTransform: 'uppercase', color: '#fdf6ec', background: '#3b190f', padding: '12px 28px', textDecoration: 'none', transition: 'background 0.3s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#5a2d12'}
          onMouseLeave={e => e.currentTarget.style.background = '#3b190f'}
        >
          + Ajouter un produit
        </Link>
      </div>

      {loading ? (
        <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 18, fontStyle: 'italic', color: 'rgba(59,25,15,0.4)' }}>Chargement…</p>
      ) : (
        <>
          {/* Stats */}
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            <StatCard label="Total produits" value={products.length} sub="dans Shopify" />
            <StatCard label="Actifs" value={active} sub="visibles en vitrine" color="#2d7a2d" />
            <StatCard label="Inactifs" value={inactive} sub="masqués" color="#7a4f2d" />
            <StatCard label="Stock faible" value={lowStock} sub="≤ 5 unités" color={lowStock > 0 ? '#c0392b' : '#3b190f'} />
          </div>

          {/* Alertes stock */}
          {noStock > 0 && (
            <div style={{ background: 'rgba(192,57,43,0.06)', border: '0.5px solid rgba(192,57,43,0.25)', padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>⚠️</span>
              <p style={{ fontSize: 12, color: '#c0392b', letterSpacing: '0.05em' }}>
                <strong>{noStock} produit{noStock > 1 ? 's' : ''}</strong> en rupture de stock.{' '}
                <Link to="/admin/products" style={{ color: '#c0392b', textDecoration: 'underline' }}>Gérer les stocks →</Link>
              </p>
            </div>
          )}

          {/* Derniers produits */}
          <div style={{ background: '#fff', border: '0.5px solid rgba(59,25,15,0.08)' }}>
            <div style={{ padding: '1.2rem 2rem', borderBottom: '0.5px solid rgba(59,25,15,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#3b190f', fontWeight: 300 }}>
                Derniers produits ajoutés
              </p>
              <Link to="/admin/products" style={{ fontSize: 9, letterSpacing: '0.18em', color: '#7a4f2d', textTransform: 'uppercase', textDecoration: 'none' }}>
                Tout voir →
              </Link>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '0.5px solid rgba(59,25,15,0.06)' }}>
                  {['Produit', 'Catégorie', 'Prix Bénin', 'Prix Europe', 'Stock', 'Statut'].map(h => (
                    <th key={h} style={{ padding: '10px 2rem', textAlign: 'left', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(59,25,15,0.4)', fontWeight: 300 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.slice(0, 8).map(p => (
                  <tr key={p.id} style={{ borderBottom: '0.5px solid rgba(59,25,15,0.04)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,203,120,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    <td style={{ padding: '14px 2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {p.images?.[0] && (
                          <img src={p.images[0]} alt="" style={{ width: 36, height: 36, objectFit: 'cover', flexShrink: 0, background: '#f8cb78' }} />
                        )}
                        <div>
                          <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 16, color: '#3b190f' }}>{p.name}</p>
                          {p.tags?.length > 0 && (
                            <p style={{ fontSize: 9, color: 'rgba(59,25,15,0.35)', letterSpacing: '0.1em' }}>{p.tags.slice(0,2).join(' · ')}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 2rem', fontSize: 11, color: '#7a4f2d' }}>{p.category || '—'}</td>
                    <td style={{ padding: '14px 2rem', fontFamily: '"Cormorant Garamond", serif', fontSize: 15, color: '#3b190f' }}>
                      {p.price_fcfa ? `${Number(p.price_fcfa).toLocaleString('fr-FR')} FCFA` : '—'}
                    </td>
                    <td style={{ padding: '14px 2rem', fontFamily: '"Cormorant Garamond", serif', fontSize: 15, color: '#3b190f' }}>
                      {p.price_eur ? `${Number(p.price_eur).toFixed(2)} €` : '—'}
                    </td>
                    <td style={{ padding: '14px 2rem' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 300,
                        color: p.stock === 0 ? '#c0392b' : p.stock <= 5 ? '#e67e22' : '#2d7a2d',
                      }}>
                        {p.stock ?? '—'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 2rem' }}>
                      <span style={{
                        fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 300,
                        padding: '3px 10px',
                        background: p.active ? 'rgba(45,122,45,0.1)' : 'rgba(122,79,45,0.1)',
                        color: p.active ? '#2d7a2d' : '#7a4f2d',
                        border: `0.5px solid ${p.active ? 'rgba(45,122,45,0.3)' : 'rgba(122,79,45,0.3)'}`,
                      }}>
                        {p.active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AdminLayout>
  );
}