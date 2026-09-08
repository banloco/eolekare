import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { getAllProducts, getAdminStats, getStockNotifications } from '../../lib/api';

function StatCard({ label, value, sub, color = '#3b190f', to }) {
  const card = (
    <div style={{ background: '#fff', padding: '1.8rem 2rem', border: '0.5px solid rgba(59,25,15,0.08)', flex: 1, height: '100%', transition: 'background 0.15s' }}>
      <p style={{ fontSize: 9, letterSpacing: '0.25em', color: '#7a4f2d', textTransform: 'uppercase', marginBottom: '0.8rem' }}>{label}</p>
      <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 42, fontWeight: 300, color, lineHeight: 1, marginBottom: '0.3rem' }}>{value}</p>
      {sub && <p style={{ fontSize: 10, color: 'rgba(59,25,15,0.4)', letterSpacing: '0.1em' }}>{sub}</p>}
    </div>
  );
  if (!to) return card;
  return (
    <Link
      to={to}
      style={{ flex: 1, display: 'flex', textDecoration: 'none' }}
      onMouseEnter={e => { e.currentTarget.firstChild.style.background = 'rgba(248,203,120,0.09)'; }}
      onMouseLeave={e => { e.currentTarget.firstChild.style.background = '#fff'; }}
    >
      {card}
    </Link>
  );
}

function fmt(n, currency) {
  if (n == null || n === 0) return '—';
  if (currency === 'XOF') return `${Number(n).toLocaleString('fr-FR')} F`;
  return `${Number(n).toFixed(0)} €`;
}

export default function DashboardPage() {
  const [products, setProducts] = useState([]);
  const [stats, setStats]       = useState(null);
  const [stockNotifs, setStockNotifs] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([getAllProducts(), getAdminStats(), getStockNotifications()])
      .then(([prods, s, sn]) => { setProducts(prods); setStats(s); setStockNotifs(sn); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const active    = products.filter(p => p.active).length;
  const inactive  = products.filter(p => !p.active).length;
  const lowStock  = products.filter(p => (p.stock_benin ?? 0) <= (p.stock_alert ?? 5) || (p.stock_international ?? 0) <= (p.stock_alert ?? 5)).length;
  const noStock   = products.filter(p => p.stock_benin === 0 || p.stock_international === 0).length;
  const waitingForStock = stockNotifs.reduce((sum, n) => sum + n.count, 0);

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
          style={{ display: 'inline-block', fontSize: 10, letterSpacing: '0.22em', fontWeight: 300, textTransform: 'uppercase', color: '#fdf6ec', background: '#3b190f', padding: '12px 28px', textDecoration: 'none' }}
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
          {/* Stats produits */}
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <StatCard label="Total produits"  value={products.length} sub="dans la base" />
            <StatCard label="Actifs"          value={active}   sub="visibles en vitrine" color="#2d7a2d" />
            <StatCard label="Inactifs"        value={inactive} sub="masqués"              color="#7a4f2d" />
            <StatCard label="Stock faible"    value={lowStock} sub="≤ seuil d'alerte"   color={lowStock > 0 ? '#c0392b' : '#3b190f'} />
          </div>

          {/* Stats commandes */}
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <StatCard label="Commandes totales"  value={stats?.orders?.total ?? '…'}     sub="toutes commandes · voir tout →" to="/admin/orders" />
            <StatCard label="Confirmées"         value={stats?.orders?.confirmed ?? '…'} sub="payées & livrées · voir le détail →" color="#2d7a2d" to="/admin/orders?status=paid" />
            <StatCard label="Annulées"           value={stats?.orders?.cancelled ?? '…'} sub="paiement échoué ou abandonné" color="#c0392b" />
            <StatCard label="En attente"         value={stats?.orders?.pending ?? '…'}   sub="à confirmer" color={(stats?.orders?.pending ?? 0) > 0 ? '#e67e22' : '#3b190f'} />
          </div>

          {/* CA Europe (EUR) — uniquement les commandes payées (confirmées → livrées) */}
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <StatCard label="CA Aujourd'hui (EUR)"   value={fmt(stats?.revenue?.today_eur, 'EUR')} sub="commandes confirmées · Europe" color="#2d7a2d" />
            <StatCard label="CA Cette semaine (EUR)" value={fmt(stats?.revenue?.week_eur,  'EUR')} sub="commandes confirmées · Europe" color="#2d7a2d" />
            <StatCard label="CA Ce mois (EUR)"       value={fmt(stats?.revenue?.month_eur, 'EUR')} sub="commandes confirmées · Europe" color="#2d7a2d" />
          </div>

          {/* CA Bénin (FCFA) — uniquement les commandes payées (confirmées → livrées) */}
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            <StatCard label="CA Aujourd'hui (FCFA)"   value={fmt(stats?.revenue?.today_xof, 'XOF')} sub="commandes confirmées · Bénin" color="#2d7a2d" />
            <StatCard label="CA Cette semaine (FCFA)" value={fmt(stats?.revenue?.week_xof,  'XOF')} sub="commandes confirmées · Bénin" color="#2d7a2d" />
            <StatCard label="CA Ce mois (FCFA)"       value={fmt(stats?.revenue?.month_xof, 'XOF')} sub="commandes confirmées · Bénin" color="#2d7a2d" />
          </div>

          {/* Alertes stock */}
          {noStock > 0 && (
            <div style={{ background: 'rgba(192,57,43,0.06)', border: '0.5px solid rgba(192,57,43,0.25)', padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>⚠️</span>
              <p style={{ fontSize: 12, color: '#c0392b', letterSpacing: '0.05em' }}>
                <strong>{noStock} produit{noStock > 1 ? 's' : ''}</strong> en rupture de stock
                {waitingForStock > 0 && <> · <strong>{waitingForStock}</strong> client{waitingForStock > 1 ? 's' : ''} en attente d'une alerte retour</>}.{' '}
                <Link to="/admin/products" style={{ color: '#c0392b', textDecoration: 'underline' }}>Gérer les stocks →</Link>
              </p>
            </div>
          )}

          {/* Dernières commandes */}
          {stats?.recent_orders?.length > 0 && (
            <div style={{ background: '#fff', border: '0.5px solid rgba(59,25,15,0.08)', marginBottom: '2.5rem' }}>
              <div style={{ padding: '1.2rem 2rem', borderBottom: '0.5px solid rgba(59,25,15,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#3b190f', fontWeight: 300 }}>Dernières commandes</p>
                <Link to="/admin/orders" style={{ fontSize: 9, letterSpacing: '0.18em', color: '#7a4f2d', textTransform: 'uppercase', textDecoration: 'none' }}>Tout voir →</Link>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '0.5px solid rgba(59,25,15,0.06)' }}>
                    {['Référence', 'Client', 'Marché', 'Total', 'Statut', 'Date'].map(h => (
                      <th key={h} style={{ padding: '10px 2rem', textAlign: 'left', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(59,25,15,0.4)', fontWeight: 300 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.recent_orders.map(o => (
                    <tr key={o.id} style={{ borderBottom: '0.5px solid rgba(59,25,15,0.04)' }}>
                      <td style={{ padding: '12px 2rem', fontFamily: '"Cormorant Garamond", serif', fontSize: 15, color: '#3b190f' }}>{o.reference}</td>
                      <td style={{ padding: '12px 2rem', fontSize: 12, color: '#3b190f' }}>{o.customer_name}</td>
                      <td style={{ padding: '12px 2rem', fontSize: 11, color: '#7a4f2d' }}>{o.market === 'benin' ? '🇧🇯 Bénin' : '🇪🇺 Intl'}</td>
                      <td style={{ padding: '12px 2rem', fontFamily: '"Cormorant Garamond", serif', fontSize: 15 }}>
                        {o.currency === 'XOF' ? `${Number(o.total).toLocaleString('fr-FR')} F` : `${Number(o.total).toFixed(2)} €`}
                      </td>
                      <td style={{ padding: '12px 2rem' }}>
                        <span style={{ fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '3px 8px', background: o.status === 'pending' ? 'rgba(230,126,34,0.1)' : 'rgba(45,122,45,0.1)', color: o.status === 'pending' ? '#e67e22' : '#2d7a2d' }}>
                          {o.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 2rem', fontSize: 11, color: 'rgba(59,25,15,0.5)' }}>
                        {new Date(o.created_at).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                  {['Produit', 'Format', 'Prix Bénin', 'Prix Europe', 'Stock', 'Statut'].map(h => (
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
                          {p.sku && <p style={{ fontSize: 9, color: 'rgba(59,25,15,0.35)', letterSpacing: '0.1em' }}>{p.sku}</p>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 2rem', fontSize: 11, color: '#7a4f2d' }}>{p.format || '—'}</td>
                    <td style={{ padding: '14px 2rem', fontFamily: '"Cormorant Garamond", serif', fontSize: 15, color: '#3b190f' }}>
                      {p.price_fcfa ? `${Number(p.price_fcfa).toLocaleString('fr-FR')} FCFA` : '—'}
                    </td>
                    <td style={{ padding: '14px 2rem', fontFamily: '"Cormorant Garamond", serif', fontSize: 15, color: '#3b190f' }}>
                      {p.price_eur ? `${Number(p.price_eur).toFixed(2)} €` : '—'}
                    </td>
                    <td style={{ padding: '14px 2rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontSize: 11, fontWeight: 300, color: p.stock_benin === 0 ? '#c0392b' : p.stock_benin <= 5 ? '#e67e22' : '#2d7a2d' }}>
                          🇧🇯 {p.stock_benin ?? '—'}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 300, color: p.stock_international === 0 ? '#c0392b' : p.stock_international <= 5 ? '#e67e22' : '#2d7a2d' }}>
                          🇪🇺 {p.stock_international ?? '—'}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 2rem' }}>
                      <span style={{ fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 300, padding: '3px 10px', background: p.active ? 'rgba(45,122,45,0.1)' : 'rgba(122,79,45,0.1)', color: p.active ? '#2d7a2d' : '#7a4f2d' }}>
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

