import React, { useState } from 'react';
import RelayPicker from '../components/RelayPicker';
import { createOrder, stripeCreateCheckoutSession } from '../lib/api';
import { formatEUR } from '../lib/format';

// ─── i18n ─────────────────────────────────────────────────
const T = {
  fr: {
    step_recap: 'Récapitulatif', step_delivery: 'Livraison', step_payment: 'Paiement', step_confirm: 'Confirmation',
    step_of: (n) => `Étape ${n} / 3`,
    shipping_line: 'Livraison Mondial Relay', shipping_next_step: 'Calculé à l’étape suivante',
    products_total: 'Total produits', choose_delivery: 'Choisir ma livraison →',
    your_details: 'Vos coordonnées',
    firstname: 'Prénom *', lastname: 'Nom *', email: 'Email *', phone: 'Téléphone *', country: 'Pays',
    ph_firstname: 'Jean', ph_lastname: 'Dupont', ph_email: 'jean@exemple.fr', ph_phone: '+33 6 00 00 00 00',
    ph_address: '12 rue de la Paix', ph_zip: 'Code postal', ph_city: 'Ville',
    delivery_method: 'Mode de livraison *',
    mode_point_relais: 'Point Relais', mode_locker: 'Locker', mode_domicile: 'À domicile',
    delay: '3-5 jours ouvrés', unavailable_pl: 'Indisponible en Pologne',
    address_label: 'Adresse de livraison *',
    relay_locker_label: 'Locker Mondial Relay *', relay_point_label: 'Point relais Mondial Relay *',
    change: 'Changer', back: '← Retour', validating: 'Validation…', go_to_payment: 'Aller au paiement →',
    order_ref: (r) => `Commande ${r}`, delivery_to: 'Livraison →',
    subtotal: 'Sous-total', total: 'Total', redirecting: 'Redirection…',
    pay_by_card: (amt) => `Payer ${amt} par carte`, edit_delivery: '← Modifier la livraison',
    thanks: 'Merci pour votre commande !', reference: 'Référence :',
    email_sent: 'Un email de confirmation vous a été envoyé.',
    parcel_home: 'Votre colis sera livré à votre adresse.',
    parcel_relay: 'Votre colis sera expédié en point relais.',
    back_to_shop: 'Retour à la boutique',
    err_firstname: 'Veuillez entrer votre prénom.', err_lastname: 'Veuillez entrer votre nom.',
    err_email: 'Email invalide.', err_phone: 'Veuillez entrer votre numéro de téléphone.',
    err_phone_indicatif: "Le numéro de téléphone doit inclure l'indicatif de votre pays (ex : +33 pour la France).",
    err_address: 'Veuillez entrer votre adresse.', err_city: 'Veuillez entrer votre ville.',
    err_zip: 'Veuillez entrer votre code postal.', err_relay: 'Veuillez sélectionner un point relais Mondial Relay.',
    countries: { FR: 'France', BE: 'Belgique', ES: 'Espagne', NL: 'Pays-Bas', LU: 'Luxembourg', DE: 'Allemagne', PT: 'Portugal', PL: 'Pologne', IT: 'Italie', AT: 'Autriche' },
  },
  en: {
    step_recap: 'Summary', step_delivery: 'Delivery', step_payment: 'Payment', step_confirm: 'Confirmation',
    step_of: (n) => `Step ${n} / 3`,
    shipping_line: 'Mondial Relay delivery', shipping_next_step: 'Calculated at the next step',
    products_total: 'Products total', choose_delivery: 'Choose delivery →',
    your_details: 'Your details',
    firstname: 'First name *', lastname: 'Last name *', email: 'Email *', phone: 'Phone *', country: 'Country',
    ph_firstname: 'John', ph_lastname: 'Doe', ph_email: 'john@example.com', ph_phone: '+33 6 00 00 00 00',
    ph_address: '12 Peace Street', ph_zip: 'Postal code', ph_city: 'City',
    delivery_method: 'Delivery method *',
    mode_point_relais: 'Pickup point', mode_locker: 'Locker', mode_domicile: 'Home delivery',
    delay: '3-5 business days', unavailable_pl: 'Unavailable in Poland',
    address_label: 'Delivery address *',
    relay_locker_label: 'Mondial Relay locker *', relay_point_label: 'Mondial Relay pickup point *',
    change: 'Change', back: '← Back', validating: 'Validating…', go_to_payment: 'Go to payment →',
    order_ref: (r) => `Order ${r}`, delivery_to: 'Delivery →',
    subtotal: 'Subtotal', total: 'Total', redirecting: 'Redirecting…',
    pay_by_card: (amt) => `Pay ${amt} by card`, edit_delivery: '← Edit delivery',
    thanks: 'Thank you for your order!', reference: 'Reference:',
    email_sent: 'A confirmation email has been sent to you.',
    parcel_home: 'Your parcel will be delivered to your address.',
    parcel_relay: 'Your parcel will be shipped to the pickup point.',
    back_to_shop: 'Back to the shop',
    err_firstname: 'Please enter your first name.', err_lastname: 'Please enter your last name.',
    err_email: 'Invalid email.', err_phone: 'Please enter your phone number.',
    err_phone_indicatif: 'The phone number must include your country calling code (e.g. +33 for France).',
    err_address: 'Please enter your address.', err_city: 'Please enter your city.',
    err_zip: 'Please enter your postal code.', err_relay: 'Please select a Mondial Relay pickup point.',
    countries: { FR: 'France', BE: 'Belgium', ES: 'Spain', NL: 'Netherlands', LU: 'Luxembourg', DE: 'Germany', PT: 'Portugal', PL: 'Poland', IT: 'Italy', AT: 'Austria' },
  },
};

// ─── STRIPE FORM ───────────────────────────────────────────
function StripeForm({ orderId, totalEur, onError, t }) {
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
        {busy ? t.redirecting : t.pay_by_card(formatEUR(totalEur))}
      </button>
    </form>
  );
}

// ─── CHECKOUT PAGE ────────────────────────────────────────
const DELIVERY_MODES = [
  { value: 'point_relais', icon: '🏪', labelKey: 'mode_point_relais' },
  { value: 'locker',       icon: '📦', labelKey: 'mode_locker' },
  { value: 'domicile',     icon: '🏠', labelKey: 'mode_domicile' },
];

export default function CheckoutPage({ cart, cartTotal, onClose, lang = 'fr' }) {
  const t = T[lang] || T.fr;
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
    if (!customer.firstname.trim()) return t.err_firstname;
    if (!customer.lastname.trim())  return t.err_lastname;
    if (!customer.email.trim() || !/\S+@\S+\.\S+/.test(customer.email)) return t.err_email;
    if (!customer.phone.trim()) return t.err_phone;
    const phoneDigits = customer.phone.replace(/[\s().-]/g, '');
    if (!/^\+\d{8,15}$/.test(phoneDigits)) return t.err_phone_indicatif;
    if (isDomicile) {
      if (!customer.address.trim()) return t.err_address;
      if (!customer.city.trim())    return t.err_city;
      if (!customer.zip.trim())     return t.err_zip;
    } else if (!relay) {
      return t.err_relay;
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
        payload.relay_zip     = relay?.CP;
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

  // Note : après paiement Stripe, le retour se fait sur /europe?payment=success
  // (redirection pleine page). EuropePage vide alors le panier et affiche la bannière ;
  // l'étape 4 ci-dessous ne sert que de filet de sécurité.

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
              {step === 1 && t.step_recap}
              {step === 2 && t.step_delivery}
              {step === 3 && t.step_payment}
              {step === 4 && t.step_confirm}
            </p>
            <p style={{ fontSize: 9, letterSpacing: '0.2em', color: '#7a4f2d', textTransform: 'uppercase' }}>
              {t.step_of(Math.min(step, 3))}
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
                    <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 17, color: '#3b190f' }}>{lang === 'en' ? (item.name_en || item.name) : item.name}</p>
                    <p style={{ fontSize: 10, color: '#7a4f2d', marginTop: 2 }}>{formatEUR(item.price_eur)} × {item.qty}</p>
                  </div>
                  <span style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 17, color: '#3b190f' }}>{formatEUR(item.price_eur * item.qty)}</span>
                </div>
              ))}

              {/* Frais de port */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 0', borderBottom: '0.5px solid rgba(59,25,15,0.07)' }}>
                <span style={{ fontSize: 11, color: '#7a4f2d' }}>{t.shipping_line}</span>
                <span style={{ fontSize: 11, color: '#3b190f' }}>{t.shipping_next_step}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                <span style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7a4f2d' }}>{t.products_total}</span>
                <span style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 24, color: '#3b190f' }}>{formatEUR(cartTotal)}</span>
              </div>

              <button onClick={() => setStep(2)}
                style={{ width: '100%', marginTop: '2rem', padding: 14, background: '#3b190f', color: '#fdf6ec', border: 'none', cursor: 'pointer', fontSize: 10, letterSpacing: '0.28em', fontWeight: 300, textTransform: 'uppercase', fontFamily: 'Jost,sans-serif' }}>
                {t.choose_delivery}
              </button>
            </div>
          )}

          {/* ── ÉTAPE 2 : Infos + Mondial Relay ── */}
          {step === 2 && (
            <div>
              <p style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#7a4f2d', marginBottom: '1.5rem' }}>{t.your_details}</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={labelStyle}>{t.firstname}</label>
                  <input style={inputStyle} value={customer.firstname} onChange={e => setCustomer(p => ({ ...p, firstname: e.target.value }))} placeholder={t.ph_firstname} />
                </div>
                <div>
                  <label style={labelStyle}>{t.lastname}</label>
                  <input style={inputStyle} value={customer.lastname} onChange={e => setCustomer(p => ({ ...p, lastname: e.target.value }))} placeholder={t.ph_lastname} />
                </div>
                <div>
                  <label style={labelStyle}>{t.email}</label>
                  <input style={inputStyle} type="email" value={customer.email} onChange={e => setCustomer(p => ({ ...p, email: e.target.value }))} placeholder={t.ph_email} />
                </div>
                <div>
                  <label style={labelStyle}>{t.phone}</label>
                  <input style={inputStyle} type="tel" autoComplete="tel" required value={customer.phone} onChange={e => setCustomer(p => ({ ...p, phone: e.target.value }))} placeholder={t.ph_phone} />
                </div>
                <div>
                  <label style={labelStyle}>{t.country}</label>
                  <select style={inputStyle} value={customer.country} onChange={e => {
                    const country = e.target.value;
                    setCustomer(p => ({ ...p, country }));
                    if (country === 'PL' && deliveryMode === 'domicile') { setDeliveryMode('point_relais'); setRelay(null); }
                  }}>
                    {['FR', 'BE', 'ES', 'NL', 'LU', 'DE', 'PT', 'PL', 'IT', 'AT'].map(c => (
                      <option key={c} value={c}>{t.countries[c]}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mode de livraison */}
              <div style={{ marginTop: '2rem' }}>
                <p style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#7a4f2d', marginBottom: '0.8rem' }}>
                  {t.delivery_method}
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
                        <div style={{ fontSize: 10, letterSpacing: '0.08em', marginBottom: 2 }}>{t[m.labelKey]}</div>
                        <div style={{ fontSize: 9, opacity: 0.65 }}>{disabled ? t.unavailable_pl : t.delay}</div>
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
                      {t.address_label}
                    </p>
                    <input style={inputStyle} value={customer.address} onChange={e => setCustomer(p => ({ ...p, address: e.target.value }))} placeholder={t.ph_address} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <input style={inputStyle} value={customer.zip} onChange={e => setCustomer(p => ({ ...p, zip: e.target.value }))} placeholder={t.ph_zip} />
                      <input style={inputStyle} value={customer.city} onChange={e => setCustomer(p => ({ ...p, city: e.target.value }))} placeholder={t.ph_city} />
                    </div>
                  </>
                ) : (
                  <>
                    <p style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#7a4f2d', marginBottom: '0.5rem' }}>
                      {deliveryMode === 'locker' ? t.relay_locker_label : t.relay_point_label}
                    </p>
                    {relay ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#e8f5e9', border: '0.5px solid #4caf50', marginBottom: '1rem' }}>
                        <div>
                          <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 16, color: '#2e7d32' }}>✓ {relay.Nom}</p>
                          <p style={{ fontSize: 11, color: '#555' }}>{relay.Adresse1}, {relay.CP} {relay.Ville}</p>
                        </div>
                        <button onClick={() => setRelay(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', fontSize: 11, textDecoration: 'underline' }}>{t.change}</button>
                      </div>
                    ) : (
                      <RelayPicker onSelect={setRelay} countryCode={customer.country} lang={lang} />
                    )}
                  </>
                )}
              </div>

              {formError && <p style={{ color: '#c0392b', fontSize: 11, marginTop: '0.5rem' }}>{formError}</p>}

              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '2rem' }}>
                <button onClick={() => setStep(1)}
                  style={{ flex: 1, padding: 14, background: 'none', border: '0.5px solid rgba(59,25,15,0.2)', color: '#3b190f', cursor: 'pointer', fontSize: 10, letterSpacing: '0.2em', fontFamily: 'Jost,sans-serif' }}>
                  {t.back}
                </button>
                <button onClick={handleCreateOrder} disabled={busy}
                  style={{ flex: 2, padding: 14, background: busy ? '#999' : '#3b190f', color: '#fdf6ec', border: 'none', cursor: busy ? 'not-allowed' : 'pointer', fontSize: 10, letterSpacing: '0.25em', fontWeight: 300, textTransform: 'uppercase', fontFamily: 'Jost,sans-serif' }}>
                  {busy ? t.validating : t.go_to_payment}
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
                  {t.order_ref(createdOrder.reference)}
                </p>
                <p style={{ fontSize: 11, color: '#7a4f2d', marginTop: 4 }}>
                  {t.delivery_to} {isDomicile ? `${customer.address}, ${customer.zip} ${customer.city}` : `${relay?.Nom}, ${relay?.Ville}`}
                </p>
              </div>

              {/* Détail du montant avant paiement */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', fontSize: 12, color: '#7a4f2d' }}>
                  <span>{t.subtotal}</span>
                  <span>{formatEUR(createdOrder.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', fontSize: 12, color: '#7a4f2d', borderBottom: '0.5px solid rgba(59,25,15,0.1)' }}>
                  <span>{t.shipping_line}</span>
                  <span>{formatEUR(createdOrder.shipping_cost)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0 0' }}>
                  <span style={{ fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7a4f2d' }}>{t.total}</span>
                  <span style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 20, color: '#3b190f' }}>{formatEUR(createdOrder.total)}</span>
                </div>
              </div>

              <StripeForm
                orderId={createdOrder.id}
                totalEur={createdOrder.total}
                onError={(msg) => setFormError(msg)}
                t={t}
              />

              <button onClick={() => setStep(2)} style={{ display: 'block', marginTop: '1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#7a4f2d', textDecoration: 'underline' }}>
                {t.edit_delivery}
              </button>
            </div>
          )}

          {/* ── ÉTAPE 4 : Confirmation ── */}
          {step === 4 && (
            <div style={{ textAlign: 'center', paddingTop: '3rem' }}>
              <div style={{ fontSize: 56, marginBottom: '1rem' }}>🎉</div>
              <h2 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 32, fontWeight: 300, color: '#3b190f', marginBottom: '1rem' }}>
                {t.thanks}
              </h2>
              {createdOrder && (
                <p style={{ fontSize: 12, color: '#7a4f2d', marginBottom: '0.5rem' }}>
                  {t.reference} <strong>{createdOrder.reference}</strong>
                </p>
              )}
              <p style={{ fontSize: 12, color: '#7a4f2d', lineHeight: 1.8, maxWidth: 320, margin: '0 auto 2rem' }}>
                {t.email_sent} {isDomicile ? t.parcel_home : t.parcel_relay}
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
                {t.back_to_shop}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
