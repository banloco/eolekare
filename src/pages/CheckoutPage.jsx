import React, { useState, useCallback } from 'react';
import RelayPicker from '../components/RelayPicker';
import { createOrder, stripeCreateCheckoutSession } from '../lib/api';
import { formatEUR } from '../lib/format';

// ─── STRIPE FORM ───────────────────────────────────────────
function StripeForm({ orderId, totalEur, onError }) {
  const [busy, setBusy] = useState(false);

  const handlePay = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { checkout_url } = await stripeCreateCheckoutSession(orderId);
      window.location.href = checkout_url;
    } catch (err) {
      onError(err.message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handlePay}>
      <button type="submit" disabled={busy}
        style={{ width: '100%', padding: 14, background: busy ? '#999' : '#3b190f', color: '#fdf6ec', border: 'none', cursor: busy ? 'not-allowed' : 'pointer', fontSize: 10, letterSpacing: '0.25em', fontWeight: 300, textTransform: 'uppercase', fontFamily: 'Jost,sans-serif' }}>
        {busy ? 'Redirection…' : `Payer ${formatEUR(totalEur)} par carte`}
      </button>
    </form>
  );
}

// ─── CHECKOUT PAGE ────────────────────────────────────────
const DELIVERY_MODES = [
  { value: 'point_relais', icon: '🏪', label: 'Point Relais', delay: '3-5 jours ouvrés' },
  { value: 'locker',       icon: '📦', label: 'Locker',       delay: '3-5 jours ouvrés' },
  { value: 'domicile',     icon: '🏠', label: 'À domicile',   delay: '3-5 jours ouvrés' },
];

export default function CheckoutPage({ cart, cartTotal, cartCount, onClose, onSuccess: onCheckoutDone }) {
  const [step, setStep]         = useState(1);
  const [customer, setCustomer] = useState({ firstname: '', lastname: '', email: '', phone: '', address: '', city: '', zip: '', country: 'FR' });
  const [deliveryMode, setDeliveryMode] = useState('point_relais');
  const [relay, setRelay]       = useState(null);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [busy, setBusy]         = useState(false);
  const [formError, setFormError] = useState('');

  const isDomicile = deliveryMode === 'domicile';

  // ── Validation client ──
  const validateCustomer = () => {
    if (!customer.firstname.trim()) return 'Veuillez entrer votre prénom.';
    if (!customer.lastname.trim())  return 'Veuillez entrer votre nom.';
    if (!customer.email.trim() || !/\S+@\S+\.\S+/.test(customer.email)) return 'Email invalide.';
    if (!customer.phone.trim()) return 'Veuillez entrer votre numéro de téléphone.';
    const phoneDigits = customer.phone.replace(/[\s().-]/g, '');
    if (!/^\+\d{8,15}$/.test(phoneDigits)) return "Le numéro de téléphone doit inclure l'indicatif de votre pays (ex : +33 pour la France).";
    if (isDomicile) {
      if (!customer.address.trim()) return 'Veuillez entrer votre adresse.';
      if (!customer.city.trim())    return 'Veuillez entrer votre ville.';
      if (!customer.zip.trim())     return 'Veuillez entrer votre code postal.';
    } else if (!relay) {
      return 'Veuillez sélectionner un point relais Mondial Relay.';
    }
    return null;
  };

  // ── Créer commande Laravel ──
  const handleCreateOrder = async () => {
    const err = validateCustomer();
    if (err) { setFormError(err); return; }
    setFormError('');
    setBusy(true);

    try {
      const payload = {
        market: 'international',
        customer_firstname: customer.firstname,
        customer_lastname:  customer.lastname,
        customer_email: customer.email,
        customer_phone: customer.phone,
        delivery_mode: deliveryMode,
        shipping_country: customer.country,
        currency: 'EUR',
        items: cart.map(i => ({ product_id: i.id, quantity: i.qty, unit_price: i.price_eur })),
      };

      if (isDomicile) {
        payload.shipping_address = customer.address;
        payload.shipping_city   = customer.city;
        payload.shipping_zip    = customer.zip;
      } else {
        payload.relay_id      = relay?.ID;
        payload.relay_name    = relay?.Nom;
        payload.relay_city    = relay?.Ville;
        payload.relay_country = relay?.Pays;
      }

      const order = await createOrder(payload);
      setCreatedOrder(order);
      setStep(3);
    } catch (e) {
      setFormError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const onPaymentSuccess = useCallback((method) => {
    setStep(4);
    onCheckoutDone && onCheckoutDone(method);
  }, [onCheckoutDone]);

  // ─── UI ───
  const inputStyle = { width: '100%', padding: '10px 12px', border: '0.5px solid rgba(59,25,15,0.15)', background: '#fff', fontSize: 12, color: '#3b190f', outline: 'none', fontFamily: 'Jost,sans-serif', boxSizing: 'border-box', marginBottom: '0.8rem' };
  const labelStyle = { display: 'block', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7a4f2d', marginBottom: 4 };

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(59,25,15,0.45)' }} />

      {/* Panel */}
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: step === 2 ? 720 : 480, maxWidth: '100vw', zIndex: 201, background: '#fdf6ec', display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 48px rgba(59,25,15,0.15)', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', borderBottom: '0.5px solid rgba(59,25,15,0.1)', position: 'sticky', top: 0, background: '#fdf6ec', zIndex: 10 }}>
          <div>
            <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 22, fontWeight: 300, color: '#3b190f' }}>
              {step === 1 && 'Récapitulatif'}
              {step === 2 && 'Livraison'}
              {step === 3 && 'Paiement'}
              {step === 4 && 'Confirmation'}
            </p>
            <p style={{ fontSize: 9, letterSpacing: '0.2em', color: '#7a4f2d', textTransform: 'uppercase' }}>
              Étape {Math.min(step, 3)} / 3
            </p>
          </div>
          {step < 4 && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#3b190f' }}>✕</button>
          )}
        </div>

        <div style={{ flex: 1, padding: '2rem' }}>

          {/* ── ÉTAPE 1 : Récap ── */}
          {step === 1 && (
            <div>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.8rem', marginBottom: '0.8rem', borderBottom: '0.5px solid rgba(59,25,15,0.07)' }}>
                  <div>
                    <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 17, color: '#3b190f' }}>{item.name}</p>
                    <p style={{ fontSize: 10, color: '#7a4f2d', marginTop: 2 }}>{formatEUR(item.price_eur)} × {item.qty}</p>
                  </div>
                  <span style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 17, color: '#3b190f' }}>{formatEUR(item.price_eur * item.qty)}</span>
                </div>
              ))}

              {/* Frais de port */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 0', borderBottom: '0.5px solid rgba(59,25,15,0.07)' }}>
                <span style={{ fontSize: 11, color: '#7a4f2d' }}>Livraison Mondial Relay</span>
                <span style={{ fontSize: 11, color: '#3b190f' }}>Calculé à l'étape suivante</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                <span style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7a4f2d' }}>Total produits</span>
                <span style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 24, color: '#3b190f' }}>{formatEUR(cartTotal)}</span>
              </div>

              <button onClick={() => setStep(2)}
                style={{ width: '100%', marginTop: '2rem', padding: 14, background: '#3b190f', color: '#fdf6ec', border: 'none', cursor: 'pointer', fontSize: 10, letterSpacing: '0.28em', fontWeight: 300, textTransform: 'uppercase', fontFamily: 'Jost,sans-serif' }}>
                Choisir ma livraison →
              </button>
            </div>
          )}

          {/* ── ÉTAPE 2 : Infos + Mondial Relay ── */}
          {step === 2 && (
            <div>
              <p style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#7a4f2d', marginBottom: '1.5rem' }}>Vos coordonnées</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={labelStyle}>Prénom *</label>
                  <input style={inputStyle} value={customer.firstname} onChange={e => setCustomer(p => ({ ...p, firstname: e.target.value }))} placeholder="Jean" />
                </div>
                <div>
                  <label style={labelStyle}>Nom *</label>
                  <input style={inputStyle} value={customer.lastname} onChange={e => setCustomer(p => ({ ...p, lastname: e.target.value }))} placeholder="Dupont" />
                </div>
                <div>
                  <label style={labelStyle}>Email *</label>
                  <input style={inputStyle} type="email" value={customer.email} onChange={e => setCustomer(p => ({ ...p, email: e.target.value }))} placeholder="jean@exemple.fr" />
                </div>
                <div>
                  <label style={labelStyle}>Téléphone *</label>
                  <input style={inputStyle} type="tel" required value={customer.phone} onChange={e => setCustomer(p => ({ ...p, phone: e.target.value }))} placeholder="+33 6 00 00 00 00" />
                </div>
                <div>
                  <label style={labelStyle}>Pays</label>
                  <select style={inputStyle} value={customer.country} onChange={e => {
                    const country = e.target.value;
                    setCustomer(p => ({ ...p, country }));
                    if (country === 'PL' && deliveryMode === 'domicile') { setDeliveryMode('point_relais'); setRelay(null); }
                  }}>
                    <option value="FR">France</option>
                    <option value="BE">Belgique</option>
                    <option value="ES">Espagne</option>
                    <option value="NL">Pays-Bas</option>
                    <option value="LU">Luxembourg</option>
                    <option value="DE">Allemagne</option>
                    <option value="PT">Portugal</option>
                    <option value="PL">Pologne</option>
                    <option value="IT">Italie</option>
                    <option value="AT">Autriche</option>
                  </select>
                </div>
              </div>

              {/* Mode de livraison */}
              <div style={{ marginTop: '2rem' }}>
                <p style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#7a4f2d', marginBottom: '0.8rem' }}>
                  Mode de livraison *
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
                  {DELIVERY_MODES.map(m => {
                    const active = deliveryMode === m.value;
                    const disabled = m.value === 'domicile' && customer.country === 'PL';
                    return (
                      <button key={m.value} type="button" disabled={disabled}
                        onClick={() => { setDeliveryMode(m.value); setRelay(null); setFormError(''); }}
                        style={{
                          padding: '14px 8px', textAlign: 'center', cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'Jost,sans-serif',
                          background: active ? '#3b190f' : '#fff',
                          border: active ? '0.5px solid #3b190f' : '0.5px solid rgba(59,25,15,0.15)',
                          color: active ? '#fdf6ec' : disabled ? 'rgba(59,25,15,0.3)' : '#3b190f',
                          opacity: disabled ? 0.5 : 1,
                        }}>
                        <div style={{ fontSize: 22, marginBottom: 4 }}>{m.icon}</div>
                        <div style={{ fontSize: 10, letterSpacing: '0.08em', marginBottom: 2 }}>{m.label}</div>
                        <div style={{ fontSize: 9, opacity: 0.65 }}>{disabled ? 'Indisponible en Pologne' : m.delay}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Point relais / Locker ou adresse domicile */}
              <div style={{ marginTop: '2rem' }}>
                {isDomicile ? (
                  <>
                    <p style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#7a4f2d', marginBottom: '0.5rem' }}>
                      Adresse de livraison *
                    </p>
                    <input style={inputStyle} value={customer.address} onChange={e => setCustomer(p => ({ ...p, address: e.target.value }))} placeholder="12 rue de la Paix" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <input style={inputStyle} value={customer.zip} onChange={e => setCustomer(p => ({ ...p, zip: e.target.value }))} placeholder="Code postal" />
                      <input style={inputStyle} value={customer.city} onChange={e => setCustomer(p => ({ ...p, city: e.target.value }))} placeholder="Ville" />
                    </div>
                  </>
                ) : (
                  <>
                    <p style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#7a4f2d', marginBottom: '0.5rem' }}>
                      {deliveryMode === 'locker' ? 'Locker Mondial Relay *' : 'Point relais Mondial Relay *'}
                    </p>
                    {relay ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#e8f5e9', border: '0.5px solid #4caf50', marginBottom: '1rem' }}>
                        <div>
                          <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 16, color: '#2e7d32' }}>✓ {relay.Nom}</p>
                          <p style={{ fontSize: 11, color: '#555' }}>{relay.Adresse1}, {relay.CP} {relay.Ville}</p>
                        </div>
                        <button onClick={() => setRelay(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', fontSize: 11, textDecoration: 'underline' }}>Changer</button>
                      </div>
                    ) : (
                      <RelayPicker onSelect={setRelay} countryCode={customer.country} />
                    )}
                  </>
                )}
              </div>

              {formError && <p style={{ color: '#c0392b', fontSize: 11, marginTop: '0.5rem' }}>{formError}</p>}

              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '2rem' }}>
                <button onClick={() => setStep(1)}
                  style={{ flex: 1, padding: 14, background: 'none', border: '0.5px solid rgba(59,25,15,0.2)', color: '#3b190f', cursor: 'pointer', fontSize: 10, letterSpacing: '0.2em', fontFamily: 'Jost,sans-serif' }}>
                  ← Retour
                </button>
                <button onClick={handleCreateOrder} disabled={busy}
                  style={{ flex: 2, padding: 14, background: busy ? '#999' : '#3b190f', color: '#fdf6ec', border: 'none', cursor: busy ? 'not-allowed' : 'pointer', fontSize: 10, letterSpacing: '0.25em', fontWeight: 300, textTransform: 'uppercase', fontFamily: 'Jost,sans-serif' }}>
                  {busy ? 'Validation…' : 'Aller au paiement →'}
                </button>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 3 : Paiement ── */}
          {step === 3 && createdOrder && (
            <div>
              {/* Récap commande */}
              <div style={{ background: '#f8cb78', padding: '1rem 1.2rem', marginBottom: '1.5rem' }}>
                <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 16, color: '#3b190f' }}>
                  Commande {createdOrder.reference}
                </p>
                <p style={{ fontSize: 11, color: '#7a4f2d', marginTop: 4 }}>
                  Livraison → {isDomicile ? `${customer.address}, ${customer.zip} ${customer.city}` : `${relay?.Nom}, ${relay?.Ville}`}
                </p>
              </div>

              {/* Détail du montant avant paiement */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', fontSize: 12, color: '#7a4f2d' }}>
                  <span>Sous-total</span>
                  <span>{formatEUR(createdOrder.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', fontSize: 12, color: '#7a4f2d', borderBottom: '0.5px solid rgba(59,25,15,0.1)' }}>
                  <span>Livraison Mondial Relay</span>
                  <span>{formatEUR(createdOrder.shipping_cost)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0 0' }}>
                  <span style={{ fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7a4f2d' }}>Total</span>
                  <span style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 20, color: '#3b190f' }}>{formatEUR(createdOrder.total)}</span>
                </div>
              </div>

              <StripeForm
                orderId={createdOrder.id}
                totalEur={createdOrder.total}
                onError={(msg) => setFormError(msg)}
              />

              <button onClick={() => setStep(2)} style={{ display: 'block', marginTop: '1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#7a4f2d', textDecoration: 'underline' }}>
                ← Modifier la livraison
              </button>
            </div>
          )}

          {/* ── ÉTAPE 4 : Confirmation ── */}
          {step === 4 && (
            <div style={{ textAlign: 'center', paddingTop: '3rem' }}>
              <div style={{ fontSize: 56, marginBottom: '1rem' }}>🎉</div>
              <h2 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 32, fontWeight: 300, color: '#3b190f', marginBottom: '1rem' }}>
                Merci pour votre commande !
              </h2>
              {createdOrder && (
                <p style={{ fontSize: 12, color: '#7a4f2d', marginBottom: '0.5rem' }}>
                  Référence : <strong>{createdOrder.reference}</strong>
                </p>
              )}
              <p style={{ fontSize: 12, color: '#7a4f2d', lineHeight: 1.8, maxWidth: 320, margin: '0 auto 2rem' }}>
                Un email de confirmation vous a été envoyé. {isDomicile ? 'Votre colis sera livré à votre adresse.' : 'Votre colis sera expédié en point relais.'}
              </p>
              {isDomicile ? (
                <div style={{ background: '#f8cb78', padding: '1rem', marginBottom: '2rem', maxWidth: 320, margin: '0 auto 2rem' }}>
                  <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 16, color: '#3b190f' }}>{customer.address}</p>
                  <p style={{ fontSize: 11, color: '#7a4f2d' }}>{customer.zip} {customer.city}</p>
                </div>
              ) : relay && (
                <div style={{ background: '#f8cb78', padding: '1rem', marginBottom: '2rem', maxWidth: 320, margin: '0 auto 2rem' }}>
                  <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 16, color: '#3b190f' }}>{relay.Nom}</p>
                  <p style={{ fontSize: 11, color: '#7a4f2d' }}>{relay.Adresse1}, {relay.CP} {relay.Ville}</p>
                </div>
              )}
              <button onClick={onClose}
                style={{ padding: '13px 40px', background: '#3b190f', color: '#fdf6ec', border: 'none', cursor: 'pointer', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', fontFamily: 'Jost,sans-serif' }}>
                Retour à la boutique
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
