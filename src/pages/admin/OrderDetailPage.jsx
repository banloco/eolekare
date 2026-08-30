import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { getAdminOrder, updateOrderStatus } from '../../lib/api';

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

function SectionTitle({ children }) {
  return (
    <p style={{ fontSize: 9, letterSpacing: '0.25em', color: '#7a4f2d', textTransform: 'uppercase', marginBottom: '1.2rem', fontWeight: 300 }}>
      {children}
    </p>
  );
}

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.6rem' }}>
      <span style={{ fontSize: 10, letterSpacing: '0.08em', color: 'rgba(59,25,15,0.45)', minWidth: 130, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 12, color: '#3b190f' }}>{value}</span>
    </div>
  );
}

/* ─── Lien WhatsApp Click-to-Chat pré-rempli avec le récap de commande ─── */
function buildOrderWALink(order) {
  const phoneDigits = (order.customer_phone || '').replace(/\D/g, '');

  if (order.currency === 'XOF') {
    const totalStr = `${Number(order.total).toLocaleString('fr-FR')} FCFA`;
    const lines = (order.items || []).map(i => `* ${i.product_name} ×${i.quantity}`).join('\n');
    const message = `Bonjour ${order.customer_name || ''}, merci pour votre commande sur Eolekare 🥑🥥🥭 !\n\n`
      + `Récapitulatif de la commande n° ${order.reference} :\n${lines}\n\n`
      + `Total : ${totalStr}\n\n`
      + `Dès que votre commande sera prête, notre livreur vous contactera directement pour convenir de l'heure et du lieu de livraison. Le règlement de la livraison se fera directement avec lui, à la remise du colis.\n\n`
      + `Merci encore pour votre confiance,\nL'équipe Eolekare 🥑🥥🥭`;
    return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`;
  }

  const totalStr = `${Number(order.total).toFixed(2)} €`;
  const lines = (order.items || []).map(i => `• ${i.product_name} ×${i.quantity}`).join('\n');
  const address = order.shipping_address
    ? `${order.shipping_address}, ${order.shipping_zip || ''} ${order.shipping_city || ''}`.trim()
    : null;
  const message = `Bonjour ${order.customer_name || ''}, ici Eolekare 👋\n\n`
    + `Concernant votre commande ${order.reference} :\n${lines}\n\n`
    + `Total : ${totalStr}\n`
    + (address ? `📍 Adresse : ${address}\n` : '');
  return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`;
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [saving, setSaving]     = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    getAdminOrder(id)
      .then(o => { setOrder(o); setNewStatus(o.status); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === order.status) return;
    setSaving(true);
    try {
      const updated = await updateOrderStatus(id, newStatus);
      setOrder(updated);
      setSavedMsg('Statut mis à jour.');
      setTimeout(() => setSavedMsg(''), 3000);
    } catch (e) {
      setSavedMsg('Erreur : ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 22, fontStyle: 'italic', color: 'rgba(59,25,15,0.4)', marginTop: '3rem' }}>
          Chargement…
        </p>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <p style={{ fontSize: 14, color: '#c0392b', marginTop: '2rem' }}>Commande introuvable.</p>
        <button onClick={() => navigate('/admin/orders')} style={backBtnStyle}>← Retour aux commandes</button>
      </AdminLayout>
    );
  }

  const sc = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
  const isEurope = order.market === 'international';

  return (
    <AdminLayout>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => navigate('/admin/orders')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, letterSpacing: '0.15em', color: '#7a4f2d', textTransform: 'uppercase', padding: 0, marginBottom: '1.2rem', fontFamily: 'Jost, sans-serif' }}
        >
          ← Retour aux commandes
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 38, fontWeight: 300, color: '#3b190f', marginBottom: 6 }}>
              {order.reference}
            </h1>
            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase',
                padding: '4px 12px', background: sc.bg, color: sc.color, border: `0.5px solid ${sc.border}`,
              }}>
                {STATUS_LABELS[order.status] || order.status}
              </span>
              <span style={{
                fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase',
                padding: '4px 12px',
                background: isEurope ? 'rgba(59,25,15,0.06)' : 'rgba(248,203,120,0.15)',
                color: isEurope ? '#3b190f' : '#7a4f2d',
                border: `0.5px solid ${isEurope ? 'rgba(59,25,15,0.18)' : 'rgba(248,203,120,0.4)'}`,
              }}>
                {isEurope ? 'Europe' : 'Bénin'}
              </span>
              <span style={{ fontSize: 11, color: 'rgba(59,25,15,0.4)', letterSpacing: '0.06em' }}>
                {new Date(order.created_at).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Changer le statut */}
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={newStatus}
              onChange={e => setNewStatus(e.target.value)}
              style={{ padding: '9px 14px', border: '0.5px solid rgba(59,25,15,0.2)', background: '#fff', color: '#3b190f', fontSize: 11, letterSpacing: '0.08em', fontFamily: 'Jost, sans-serif', outline: 'none', cursor: 'pointer' }}
            >
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <button
              onClick={handleStatusUpdate}
              disabled={saving || newStatus === order.status}
              style={{
                padding: '9px 20px', fontSize: 10, letterSpacing: '0.18em', fontWeight: 300,
                textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', cursor: (saving || newStatus === order.status) ? 'default' : 'pointer',
                background: (saving || newStatus === order.status) ? 'rgba(59,25,15,0.08)' : '#3b190f',
                color: (saving || newStatus === order.status) ? 'rgba(59,25,15,0.3)' : '#fdf6ec',
                border: 'none', transition: 'all 0.2s',
              }}
            >
              {saving ? 'Enregistrement…' : 'Mettre à jour'}
            </button>
            {savedMsg && (
              <span style={{ fontSize: 11, color: savedMsg.startsWith('Erreur') ? '#c0392b' : '#2d7a2d', letterSpacing: '0.06em' }}>
                {savedMsg}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Contenu en 2 colonnes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* Colonne gauche */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Client */}
          <div style={cardStyle}>
            <SectionTitle>Informations client</SectionTitle>
            <InfoRow label="Nom" value={order.customer_name} />
            <InfoRow label="Email" value={order.customer_email} />
            <InfoRow label="Téléphone" value={order.customer_phone} />
            {!isEurope && order.customer_phone && (
              <a
                href={buildOrderWALink(order)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: '0.8rem',
                  padding: '9px 18px', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase',
                  fontFamily: 'Jost, sans-serif', color: '#fdf6ec', background: '#25D366',
                  textDecoration: 'none',
                }}
              >
                💬 Contacter via WhatsApp
              </a>
            )}
          </div>

          {/* Livraison */}
          <div style={cardStyle}>
            <SectionTitle>Livraison</SectionTitle>
            {order.relay_id ? (
              <>
                <InfoRow label="Mode" value={
                  order.delivery_mode === 'locker' ? 'Locker Mondial Relay' : 'Point Relais Mondial Relay'
                } />
                <InfoRow label="Relais" value={order.relay_name} />
                <InfoRow label="Ville" value={order.relay_city} />
                <InfoRow label="Pays" value={order.relay_country?.toUpperCase()} />
                <InfoRow label="Code relais" value={order.relay_id} />
              </>
            ) : (
              <>
                <InfoRow label="Mode" value="Livraison à domicile" />
                <InfoRow label="Adresse" value={order.shipping_address} />
                <InfoRow label="Ville" value={order.shipping_city} />
                <InfoRow label="Code postal" value={order.shipping_zip} />
                <InfoRow label="Pays" value={order.shipping_country} />
              </>
            )}
            <InfoRow label="Frais de port" value={
              Number(order.shipping_cost) === 0
                ? 'Offerts'
                : order.currency === 'XOF'
                  ? `${Number(order.shipping_cost).toLocaleString('fr-FR')} FCFA`
                  : `${Number(order.shipping_cost).toFixed(2)} €`
            } />
            {isEurope && (
              order.mondialrelay_tracking_number ? (
                <>
                  <InfoRow label="N° expédition" value={order.mondialrelay_tracking_number} />
                  {order.mondialrelay_label_url && (
                    <a
                      href={order.mondialrelay_label_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: '0.8rem',
                        padding: '9px 18px', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase',
                        fontFamily: 'Jost, sans-serif', color: '#fdf6ec', background: '#3b190f',
                        textDecoration: 'none',
                      }}
                    >
                      📦 Voir l'étiquette Mondial Relay
                    </a>
                  )}
                </>
              ) : ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status) && (
                <p style={{ fontSize: 11, color: 'rgba(59,25,15,0.45)', marginTop: '0.6rem', fontStyle: 'italic' }}>
                  Aucune étiquette créée automatiquement — à créer manuellement sur le portail Mondial Relay.
                </p>
              )
            )}
          </div>

          {/* Notes */}
          {order.notes && (
            <div style={cardStyle}>
              <SectionTitle>Notes</SectionTitle>
              <p style={{ fontSize: 12, color: '#3b190f', lineHeight: 1.6 }}>{order.notes}</p>
            </div>
          )}

          {/* Paiement */}
          <div style={cardStyle}>
            <SectionTitle>Paiement</SectionTitle>
            <InfoRow label="Méthode" value={order.payment_method === 'fedapay' ? 'FedaPay' : order.payment_method} />
            {order.fedapay_transaction_id && (
              <InfoRow label="ID transaction" value={order.fedapay_transaction_id} />
            )}
          </div>
        </div>

        {/* Colonne droite — Articles */}
        <div style={cardStyle}>
          <SectionTitle>Articles commandés</SectionTitle>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '0.5px solid rgba(59,25,15,0.08)' }}>
                {['Produit', 'Qté', 'P.U.', 'Total'].map(h => (
                  <th key={h} style={{ padding: '8px 0', textAlign: 'left', fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(59,25,15,0.35)', fontWeight: 300 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map(item => (
                <tr key={item.id} style={{ borderBottom: '0.5px solid rgba(59,25,15,0.04)' }}>
                  <td style={{ padding: '12px 0' }}>
                    <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 15, color: '#3b190f', marginBottom: 2 }}>
                      {item.product_name}
                    </p>
                    {item.format && (
                      <p style={{ fontSize: 9, color: 'rgba(59,25,15,0.4)', letterSpacing: '0.08em' }}>{item.format}</p>
                    )}
                    {item.product_sku && (
                      <p style={{ fontSize: 9, color: 'rgba(59,25,15,0.3)', letterSpacing: '0.06em' }}>SKU: {item.product_sku}</p>
                    )}
                  </td>
                  <td style={{ padding: '12px 0', fontSize: 13, color: '#3b190f' }}>×{item.quantity}</td>
                  <td style={{ padding: '12px 0', fontSize: 13, color: '#7a4f2d' }}>
                    {item.currency === 'XOF'
                      ? `${Number(item.unit_price).toLocaleString('fr-FR')}`
                      : `${Number(item.unit_price).toFixed(2)} €`}
                  </td>
                  <td style={{ padding: '12px 0', fontFamily: '"Cormorant Garamond", serif', fontSize: 15, color: '#3b190f' }}>
                    {item.currency === 'XOF'
                      ? `${Number(item.total_price).toLocaleString('fr-FR')} F`
                      : `${Number(item.total_price).toFixed(2)} €`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totaux */}
          <div style={{ borderTop: '0.5px solid rgba(59,25,15,0.1)', marginTop: '1rem', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: 11, color: 'rgba(59,25,15,0.5)' }}>Sous-total</span>
              <span style={{ fontSize: 13, color: '#3b190f' }}>
                {order.currency === 'XOF'
                  ? `${Number(order.subtotal).toLocaleString('fr-FR')} FCFA`
                  : `${Number(order.subtotal).toFixed(2)} €`}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: 11, color: 'rgba(59,25,15,0.5)' }}>Frais de port</span>
              <span style={{ fontSize: 13, color: '#3b190f' }}>
                {Number(order.shipping_cost) === 0
                  ? 'Offerts'
                  : order.currency === 'XOF'
                    ? `${Number(order.shipping_cost).toLocaleString('fr-FR')} FCFA`
                    : `${Number(order.shipping_cost).toFixed(2)} €`}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '0.5px solid rgba(59,25,15,0.1)', paddingTop: '0.8rem', marginTop: '0.5rem' }}>
              <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 18, color: '#3b190f' }}>Total</span>
              <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 22, color: '#3b190f', fontWeight: 400 }}>
                {order.currency === 'XOF'
                  ? `${Number(order.total).toLocaleString('fr-FR')} FCFA`
                  : `${Number(order.total).toFixed(2)} €`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

const cardStyle = {
  background: '#fff',
  border: '0.5px solid rgba(59,25,15,0.08)',
  padding: '1.8rem 2rem',
};

const backBtnStyle = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: 10, letterSpacing: '0.15em', color: '#7a4f2d',
  textTransform: 'uppercase', padding: 0, fontFamily: 'Jost, sans-serif',
};
