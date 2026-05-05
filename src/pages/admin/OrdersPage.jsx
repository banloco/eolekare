import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { getAdminOrders, exportAdminOrders } from '../../lib/api';

const STATUS_LABELS = {
  pending:    'En attente',
  confirmed:  'Confirmée',
  processing: 'En préparation',
  shipped:    'Expédiée',
  delivered:  'Livrée',
  cancelled:  'Annulée',
};

const STATUS_COLORS = {
  pending:    { bg: 'rgba(230,126,34,0.1)',  color: '#e67e22', border: 'rgba(230,126,34,0.3)' },
  confirmed:  { bg: 'rgba(52,152,219,0.1)',  color: '#2980b9', border: 'rgba(52,152,219,0.3)' },
  processing: { bg: 'rgba(155,89,182,0.1)',  color: '#8e44ad', border: 'rgba(155,89,182,0.3)' },
  shipped:    { bg: 'rgba(52,73,94,0.1)',    color: '#2c3e50', border: 'rgba(52,73,94,0.3)'   },
  delivered:  { bg: 'rgba(45,122,45,0.1)',   color: '#2d7a2d', border: 'rgba(45,122,45,0.3)'  },
  cancelled:  { bg: 'rgba(192,57,43,0.1)',   color: '#c0392b', border: 'rgba(192,57,43,0.3)'  },
};

const MARKET_LABELS = { benin: 'Bénin', international: 'Europe' };

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <span style={{
      fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 300,
      padding: '3px 10px', background: s.bg, color: s.color, border: `0.5px solid ${s.border}`,
      whiteSpace: 'nowrap',
    }}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function MarketBadge({ market }) {
  const isEurope = market === 'international';
  return (
    <span style={{
      fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 300,
      padding: '3px 10px',
      background: isEurope ? 'rgba(59,25,15,0.06)' : 'rgba(248,203,120,0.15)',
      color: isEurope ? '#3b190f' : '#7a4f2d',
      border: `0.5px solid ${isEurope ? 'rgba(59,25,15,0.18)' : 'rgba(248,203,120,0.4)'}`,
      whiteSpace: 'nowrap',
    }}>
      {MARKET_LABELS[market] || market}
    </span>
  );
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', market: '', page: 1 });

  const load = useCallback(() => {
    setLoading(true);
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.market) params.market = filters.market;
    params.page = filters.page;
    getAdminOrders(params)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const orders  = data?.data ?? [];
  const meta    = data?.meta ?? {};
  const lastPage = meta.last_page ?? 1;

  const setFilter = (key, value) =>
    setFilters(f => ({ ...f, [key]: value, page: 1 }));

  return (
    <AdminLayout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 38, fontWeight: 300, color: '#3b190f', marginBottom: 4 }}>
            Commandes
          </h1>
          <p style={{ fontSize: 11, color: '#7a4f2d', letterSpacing: '0.1em' }}>
            {meta.total != null ? `${meta.total} commande${meta.total !== 1 ? 's' : ''} au total` : ''}
          </p>
        </div>
        <button
          onClick={() => exportAdminOrders({ status: filters.status, market: filters.market })}
          style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#fdf6ec', background: '#3b190f', padding: '12px 24px', border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.background = '#5a2d12'}
          onMouseLeave={e => e.currentTarget.style.background = '#3b190f'}
        >
          ↓ Exporter CSV
        </button>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.8rem', flexWrap: 'wrap' }}>
        <select
          value={filters.status}
          onChange={e => setFilter('status', e.target.value)}
          style={selectStyle}
        >
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        <select
          value={filters.market}
          onChange={e => setFilter('market', e.target.value)}
          style={selectStyle}
        >
          <option value="">Tous les marchés</option>
          <option value="benin">Bénin</option>
          <option value="international">Europe</option>
        </select>

        {(filters.status || filters.market) && (
          <button
            onClick={() => setFilters({ status: '', market: '', page: 1 })}
            style={{ ...selectStyle, background: 'rgba(59,25,15,0.06)', cursor: 'pointer', color: '#7a4f2d' }}
          >
            ✕ Réinitialiser
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '0.5px solid rgba(59,25,15,0.08)' }}>
        {loading ? (
          <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 18, fontStyle: 'italic', color: 'rgba(59,25,15,0.4)' }}>
              Chargement…
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 22, fontStyle: 'italic', color: 'rgba(59,25,15,0.3)' }}>
              Aucune commande trouvée
            </p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '0.5px solid rgba(59,25,15,0.08)' }}>
                {['Référence', 'Client', 'Marché', 'Articles', 'Total', 'Statut', 'Date'].map(h => (
                  <th key={h} style={{ padding: '12px 1.5rem', textAlign: 'left', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(59,25,15,0.4)', fontWeight: 300 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr
                  key={order.id}
                  onClick={() => navigate(`/admin/orders/${order.id}`)}
                  style={{ borderBottom: '0.5px solid rgba(59,25,15,0.04)', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,203,120,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  <td style={{ padding: '14px 1.5rem' }}>
                    <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 15, color: '#3b190f', fontWeight: 400 }}>
                      {order.reference}
                    </span>
                  </td>
                  <td style={{ padding: '14px 1.5rem' }}>
                    <p style={{ fontSize: 12, color: '#3b190f', marginBottom: 2 }}>{order.customer_name}</p>
                    {order.customer_email && (
                      <p style={{ fontSize: 10, color: 'rgba(59,25,15,0.4)', letterSpacing: '0.04em' }}>{order.customer_email}</p>
                    )}
                  </td>
                  <td style={{ padding: '14px 1.5rem' }}>
                    <MarketBadge market={order.market} />
                  </td>
                  <td style={{ padding: '14px 1.5rem', fontSize: 12, color: '#7a4f2d' }}>
                    {order.items?.length ?? '—'} art.
                  </td>
                  <td style={{ padding: '14px 1.5rem' }}>
                    <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 16, color: '#3b190f' }}>
                      {order.currency === 'XOF'
                        ? `${Number(order.total).toLocaleString('fr-FR')} FCFA`
                        : `${Number(order.total).toFixed(2)} €`}
                    </span>
                  </td>
                  <td style={{ padding: '14px 1.5rem' }}>
                    <StatusBadge status={order.status} />
                  </td>
                  <td style={{ padding: '14px 1.5rem', fontSize: 11, color: 'rgba(59,25,15,0.5)' }}>
                    {new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {lastPage > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem', alignItems: 'center' }}>
          <button
            disabled={filters.page <= 1}
            onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
            style={paginationBtn(filters.page <= 1)}
          >
            ← Précédent
          </button>
          <span style={{ fontSize: 11, color: '#7a4f2d', letterSpacing: '0.1em', padding: '0 1rem' }}>
            Page {filters.page} / {lastPage}
          </span>
          <button
            disabled={filters.page >= lastPage}
            onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
            style={paginationBtn(filters.page >= lastPage)}
          >
            Suivant →
          </button>
        </div>
      )}
    </AdminLayout>
  );
}

const selectStyle = {
  padding: '9px 14px',
  border: '0.5px solid rgba(59,25,15,0.2)',
  background: '#fff',
  color: '#3b190f',
  fontSize: 11,
  letterSpacing: '0.08em',
  fontFamily: 'Jost, sans-serif',
  outline: 'none',
  cursor: 'pointer',
};

const paginationBtn = (disabled) => ({
  padding: '8px 18px',
  border: '0.5px solid rgba(59,25,15,0.2)',
  background: disabled ? 'rgba(59,25,15,0.03)' : '#fff',
  color: disabled ? 'rgba(59,25,15,0.25)' : '#3b190f',
  fontSize: 10,
  letterSpacing: '0.12em',
  fontFamily: 'Jost, sans-serif',
  cursor: disabled ? 'default' : 'pointer',
  textTransform: 'uppercase',
});
