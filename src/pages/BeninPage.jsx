import React, { useState } from 'react';
import FloatingFruits from '../components/FloatingFruits';
import CommunitySection from '../components/CommunitySection';
import ReviewsSection from '../components/ReviewsSection';
import StorySection from '../components/StorySection';
import HowToSection from '../components/HowToSection';
import { useSEO } from '../hooks/useSEO';
import { useProducts } from '../hooks/useProducts';
import { formatFCFA } from '../lib/format';
import { createOrder, fedapayCreateTransaction } from '../lib/api';

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '2290148654200';
const WA_BASE = `https://wa.me/${WHATSAPP_NUMBER}`;

const T_BJ = {
  fr: {
    ingredients: 'Ingrédients', buy: 'Ajouter au panier', added: '✓ Ajouté →', soldout: 'Épuisé', qty: 'Quantité', inCart: 'dans le panier', details: 'Voir les détails →', loading: 'Chargement…',
    eyebrow: '100% Naturel · Made in 🇧🇯 · Pour tous',
    tagline: 'Votre skincare aux parfums uniques',
    discover: 'Découvrir la collection',
    cart_title: 'Mon panier', summary_title: 'Récapitulatif',
    article: 'article', articles: 'articles',
    empty: 'Votre panier est vide', discover_butters: 'Découvrez nos beurres',
    recap: 'Récapitulatif & paiement',
    label_name: 'Nom complet *', label_phone: 'Téléphone *', label_address: 'Adresse de livraison (optionnel)',
    order_btn: 'Commander →', back_cart: '← Modifier le panier',
    total: 'Total', redirecting: 'Redirection…', pay_prefix: 'Payer ',
    err_name: 'Veuillez entrer votre nom.', err_phone: 'Veuillez entrer votre téléphone.',
    nature_strip: 'La nature dans chaque texture',
    ticker: ['Eolekare', '·', 'Votre skincare aux parfums uniques', '·', '100% Naturel', '·', 'Made in 🇧🇯', '·', 'Pour tous', '·'],
  },
  en: {
    ingredients: 'Ingredients', buy: 'Add to cart', added: '✓ Added →', soldout: 'Sold out', qty: 'Quantity', inCart: 'in cart', details: 'View details →', loading: 'Loading…',
    eyebrow: '100% Natural · Made in 🇧🇯 · For everyone',
    tagline: 'Your skincare with unique scents',
    discover: 'Discover the collection',
    cart_title: 'My cart', summary_title: 'Summary',
    article: 'item', articles: 'items',
    empty: 'Your cart is empty', discover_butters: 'Discover our butters',
    recap: 'Summary & payment',
    label_name: 'Full name *', label_phone: 'Phone *', label_address: 'Delivery address (optional)',
    order_btn: 'Order →', back_cart: '← Edit cart',
    total: 'Total', redirecting: 'Redirecting…', pay_prefix: 'Pay ',
    err_name: 'Please enter your name.', err_phone: 'Please enter your phone.',
    nature_strip: 'Nature in every texture',
    ticker: ['Eolekare', '·', 'Your skincare with unique scents', '·', '100% Natural', '·', 'Made in 🇧🇯', '·', 'For everyone', '·'],
  },
};

/* ─── PANIER WHATSAPP ─────────────────────────────────────── */
function buildWAMessage(cart, address) {
  const lines = cart.map(i => `• ${i.name} x${i.qty} — ${formatFCFA(i.price_fcfa * i.qty)}`).join('\n');
  const total = cart.reduce((s, i) => s + i.price_fcfa * i.qty, 0);
  return encodeURIComponent(
    `Bonjour Eolekare ! 👋\n\nJe souhaite commander :\n\n${lines}\n\n` +
    `*Total : ${formatFCFA(total)}*\n\n` +
    (address ? `📍 Adresse de livraison : ${address}\n\n` : '') +
    `Merci ! 🙏`
  );
}

/* ─── NAV ── */
const BJ_NAV_LINKS = (lang) => [
  ['#products', lang === 'fr' ? 'Notre collection' : 'Our collection'],
  ['#story',    lang === 'fr' ? 'Notre histoire' : 'Our story'],
  ['#howto',    lang === 'fr' ? 'L\' utilisation' : 'How to use'],
];

function Nav({ lang, setLang, cartCount, onCartOpen }) {
  const [mobOpen, setMobOpen] = useState(false);
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[100] flex justify-between items-center"
        style={{ padding: '0.9rem 1.5rem', background: '#f8cb78' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ overflow: 'hidden', height: 52, cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src="/images/Logo Eolekare .png" alt="Eolekare" style={{ width: 180, display: 'block', marginTop: -67 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.22em', color: '#3b190f', textTransform: 'uppercase' }}>Bénin</span>
            <span style={{ fontSize: 8, color: 'rgba(59,25,15,0.3)' }}>·</span>
            <a href="/europe" title="Passer à la boutique Europe"
              style={{ fontSize: 8, fontWeight: 300, letterSpacing: '0.22em', color: '#7a4f2d', textTransform: 'uppercase', textDecoration: 'none', borderBottom: '0.5px solid rgba(122,79,45,0.35)', paddingBottom: 1 }}
              onMouseEnter={e => e.currentTarget.style.color = '#3b190f'}
              onMouseLeave={e => e.currentTarget.style.color = '#7a4f2d'}
            >Europe</a>
          </div>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {BJ_NAV_LINKS(lang).map(([h, l]) => (
            <a key={h} href={h} style={{ fontSize: 10, fontWeight: 300, letterSpacing: '0.15em', color: '#3b190f', textDecoration: 'none', textTransform: 'uppercase', opacity: 0.7 }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.7}>{l}</a>
          ))}
          <div style={{ display: 'flex', gap: 2 }}>
            {['fr', 'en'].map(l => (
              <button key={l} onClick={() => setLang(l)} style={{ background: lang === l ? '#3b190f' : 'transparent', color: lang === l ? '#f8cb78' : 'rgba(59,25,15,0.5)', border: '0.5px solid rgba(59,25,15,0.2)', padding: '4px 10px', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Jost,sans-serif', transition: 'all 0.2s' }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <button onClick={onCartOpen} style={{ position: 'relative', background: 'none', border: '0.5px solid rgba(59,25,15,0.3)', cursor: 'pointer', color: '#3b190f', padding: '7px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {cartCount > 0 && (
              <span style={{ background: '#3b190f', color: '#f8cb78', borderRadius: '50%', width: 18, height: 18, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>{cartCount}</span>
            )}
          </button>
        </div>

        {/* Mobile: lang + cart + hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <div style={{ display: 'flex', gap: 2 }}>
            {['fr', 'en'].map(l => (
              <button key={l} onClick={() => setLang(l)} style={{ background: lang === l ? '#3b190f' : 'transparent', color: lang === l ? '#f8cb78' : 'rgba(59,25,15,0.5)', border: '0.5px solid rgba(59,25,15,0.2)', padding: '4px 8px', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Jost,sans-serif' }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <button onClick={onCartOpen} style={{ background: 'none', border: '0.5px solid rgba(59,25,15,0.3)', cursor: 'pointer', color: '#3b190f', padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {cartCount > 0 && <span style={{ background: '#3b190f', color: '#f8cb78', borderRadius: '50%', width: 18, height: 18, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{cartCount}</span>}
          </button>
          <button onClick={() => setMobOpen(v => !v)} style={{ background: 'none', border: '0.5px solid rgba(59,25,15,0.2)', cursor: 'pointer', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#3b190f', flexShrink: 0 }}>
            {mobOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobOpen && (
        <div className="mob-menu md:hidden">
          {BJ_NAV_LINKS(lang).map(([h, l]) => (
            <a key={h} href={h} onClick={() => setMobOpen(false)}>{l}</a>
          ))}
        </div>
      )}
    </>
  );
}

/* ─── PANIER / CHECKOUT ───────────────────────────────────── */
function CartDrawer({ lang = 'fr', cart, onClose, onUpdate, onRemove }) {
  const t = T_BJ[lang];
  const [step, setStep]     = useState('cart'); // 'cart' | 'checkout'
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });
  const [busy, setBusy]     = useState(false);
  const [error, setError]   = useState('');
  const total = cart.reduce((s, i) => s + i.price_fcfa * i.qty, 0);

  const inputStyle = { width: '100%', padding: '10px 12px', border: '0.5px solid rgba(59,25,15,0.15)', background: '#fff', fontSize: 12, color: '#3b190f', outline: 'none', fontFamily: 'Jost,sans-serif', boxSizing: 'border-box', marginBottom: '0.8rem' };
  const labelStyle = { display: 'block', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7a4f2d', marginBottom: 4 };

  const handlePay = async () => {
    if (!customer.name.trim()) { setError(t.err_name); return; }
    if (!customer.phone.trim()) { setError(t.err_phone); return; }
    setError('');
    setBusy(true);
    try {
      const order = await createOrder({
        market:          'benin',
        customer_name:   customer.name,
        customer_phone:  customer.phone,
        shipping_address: customer.address || null,
        items:           cart.map(i => ({ product_id: i.id, quantity: i.qty })),
      });
      const { checkout_url } = await fedapayCreateTransaction(order.id);
      window.location.href = checkout_url;
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(59,25,15,0.45)' }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 420, maxWidth: '100vw', zIndex: 201, background: '#fdf6ec', display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 48px rgba(59,25,15,0.15)' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', borderBottom: '0.5px solid rgba(59,25,15,0.1)' }}>
          <div>
            <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 24, fontWeight: 300, color: '#3b190f' }}>
              {step === 'cart' ? t.cart_title : t.summary_title}
            </p>
            {cart.length > 0 && <p style={{ fontSize: 10, letterSpacing: '0.15em', color: '#7a4f2d', textTransform: 'uppercase' }}>{cart.reduce((s, i) => s + i.qty, 0)} {cart.reduce((s, i) => s + i.qty, 0) > 1 ? t.articles : t.article}</p>}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#3b190f' }}>✕</button>
        </div>

        {/* Corps */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: '4rem' }}>
              <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 22, fontStyle: 'italic', color: 'rgba(59,25,15,0.35)', marginBottom: 8 }}>{t.empty}</p>
              <p style={{ fontSize: 10, letterSpacing: '0.15em', color: 'rgba(59,25,15,0.3)', textTransform: 'uppercase' }}>{t.discover_butters}</p>
            </div>
          ) : step === 'cart' ? (
            /* ── ÉTAPE 1 : liste ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '1rem', paddingBottom: '1.2rem', borderBottom: '0.5px solid rgba(59,25,15,0.08)' }}>
                  <div style={{ width: 64, height: 64, background: '#f8cb78', flexShrink: 0, overflow: 'hidden' }}>
                    {item.images?.[0] && <img src={item.images[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 17, color: '#3b190f', marginBottom: 2 }}>{item.name}</p>
                    <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 14, fontStyle: 'italic', color: '#7a4f2d' }}>{formatFCFA(item.price_fcfa)}</p>
                  </div>
                  {/* Sélecteur quantité */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <button onClick={() => onRemove(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'rgba(59,25,15,0.3)', lineHeight: 1 }}
                      onMouseEnter={e => e.currentTarget.style.color = '#c0392b'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(59,25,15,0.3)'}>✕</button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button onClick={() => onUpdate(item.id, item.qty - 1)} style={{ width: 26, height: 26, border: '0.5px solid rgba(59,25,15,0.2)', background: 'none', cursor: 'pointer', fontSize: 14, color: '#3b190f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                      <span style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 17, color: '#3b190f', minWidth: 18, textAlign: 'center' }}>{item.qty}</span>
                      <button onClick={() => onUpdate(item.id, item.qty + 1)} style={{ width: 26, height: 26, border: '0.5px solid rgba(59,25,15,0.2)', background: 'none', cursor: 'pointer', fontSize: 14, color: '#3b190f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* ── ÉTAPE 2 : infos client + paiement FedaPay ── */
            <div>
              <p style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#7a4f2d', marginBottom: '1.2rem' }}>{t.recap}</p>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.7rem', marginBottom: '0.7rem', borderBottom: '0.5px solid rgba(59,25,15,0.06)' }}>
                  <span style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 15, color: '#3b190f' }}>{item.name} <span style={{ color: '#7a4f2d', fontSize: 13 }}>×{item.qty}</span></span>
                  <span style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 15, fontStyle: 'italic', color: '#3b190f' }}>{formatFCFA(item.price_fcfa * item.qty)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', paddingTop: '0.3rem' }}>
                <span style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7a4f2d' }}>{t.total}</span>
                <span style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 20, color: '#3b190f' }}>{formatFCFA(total)}</span>
              </div>

              <div>
                <label style={labelStyle}>{t.label_name}</label>
                <input style={inputStyle} value={customer.name} onChange={e => setCustomer(p => ({ ...p, name: e.target.value }))} placeholder="Jean Dupont" />
                <label style={labelStyle}>{t.label_phone}</label>
                <input style={inputStyle} type="tel" value={customer.phone} onChange={e => setCustomer(p => ({ ...p, phone: e.target.value }))} placeholder="+229 96 00 00 00" />
                <label style={labelStyle}>{t.label_address}</label>
                <textarea value={customer.address} onChange={e => setCustomer(p => ({ ...p, address: e.target.value }))}
                  placeholder="Quartier, rue, ville…" rows={2}
                  style={{ ...inputStyle, resize: 'none' }} />
              </div>
              {error && <p style={{ color: '#c0392b', fontSize: 11, marginBottom: '0.8rem' }}>{error}</p>}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div style={{ padding: '1.5rem 2rem', borderTop: '0.5px solid rgba(59,25,15,0.1)' }}>
            {step === 'cart' ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.2rem' }}>
                  <span style={{ fontSize: 11, letterSpacing: '0.2em', color: '#7a4f2d', textTransform: 'uppercase' }}>{t.total}</span>
                  <span style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 22, color: '#3b190f' }}>{formatFCFA(total)}</span>
                </div>
                <button onClick={() => setStep('checkout')}
                  style={{ width: '100%', padding: '14px', background: '#3b190f', color: '#fdf6ec', border: 'none', cursor: 'pointer', fontSize: 10, letterSpacing: '0.28em', fontWeight: 300, textTransform: 'uppercase', fontFamily: 'Jost,sans-serif', transition: 'background 0.3s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#5a2d12'} onMouseLeave={e => e.currentTarget.style.background = '#3b190f'}>
                  {t.order_btn}
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <button onClick={handlePay} disabled={busy}
                  style={{ width: '100%', padding: '14px', background: busy ? '#999' : '#3b190f', color: '#fdf6ec', border: 'none', cursor: busy ? 'not-allowed' : 'pointer', fontSize: 10, letterSpacing: '0.28em', fontWeight: 300, textTransform: 'uppercase', fontFamily: 'Jost,sans-serif', transition: 'background 0.3s' }}>
                  {busy ? t.redirecting : `${t.pay_prefix}${formatFCFA(total)} →`}
                </button>
                <button onClick={() => setStep('cart')}
                  style={{ width: '100%', padding: '11px', background: 'none', border: '0.5px solid rgba(59,25,15,0.2)', color: '#3b190f', cursor: 'pointer', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: 'Jost,sans-serif' }}>
                  {t.back_cart}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

/* ─── HERO ── */
function Hero({ lang = 'fr', onCartOpen }) {
  const t = T_BJ[lang];
  return (
    <section className="relative flex flex-col items-center justify-center text-center overflow-hidden"
      style={{ minHeight: '100vh', background: '#f8cb78', padding: '8rem 2rem 5rem' }}>
      <FloatingFruits variant="hero" />
      <div className="relative z-[2] flex flex-col items-center">
        <p style={{ fontSize: 10, letterSpacing: '0.5em', fontWeight: 300, color: '#000', opacity: 0.65, textTransform: 'uppercase', marginBottom: '2rem' }}>{t.eyebrow}</p>
        <h1 style={{ fontFamily: '"Brown Sugar",cursive', fontSize: 'clamp(72px,11vw,140px)', fontWeight: 300, lineHeight: 0.88, color: '#000', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>EOLEKARE</h1>
        <p style={{ fontFamily: '"Montserrat",sans-serif', fontSize: 10, letterSpacing: '0.38em', fontWeight: 300, color: '#000', opacity: 0.55, textTransform: 'uppercase', marginBottom: '1.8rem' }}>by Eoleeg</p>
        <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 22, fontStyle: 'italic', color: '#000', maxWidth: 440, lineHeight: 1.65, marginBottom: '3rem' }}>{t.tagline}</p>
        <div className="flex gap-6 flex-wrap justify-center">
          <a href="#products" style={{ fontSize: 10, letterSpacing: '0.28em', fontWeight: 300, textTransform: 'uppercase', color: '#fdf6ec', background: '#3b190f', padding: '15px 42px', textDecoration: 'none', transition: 'all 0.3s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#5a2d12'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#3b190f'; e.currentTarget.style.transform = ''; }}>
            {t.discover}
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─── MODAL PRODUIT ── */
function ProductModal({ product, lang = 'fr', onClose, onAdd, inCart }) {
  const t = T_BJ[lang];
  const [qty, setQty] = useState(1);
  if (!product) return null;
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(59,25,15,0.55)' }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 301, background: '#fdf6ec', width: '90%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.3)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1.2rem', background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#3b190f', opacity: 0.45, zIndex: 1 }}>✕</button>
        <div className="grid-2col">
          <div style={{ height: 400, background: '#f8cb78', overflow: 'hidden', position: 'relative' }}>
            {product.images?.[0]
              ? <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, opacity: 0.3 }}>🫙</div>
            }
          </div>
          <div style={{ padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {product.format && <p style={{ fontSize: 9, letterSpacing: '0.25em', color: '#7a4f2d', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{product.format}</p>}
            <h2 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 30, fontWeight: 300, color: '#3b190f', marginBottom: '0.8rem' }}>{product.name}</h2>
            <p style={{ fontSize: 12, fontWeight: 300, color: '#7a4f2d', lineHeight: 1.85, marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>
              {lang === 'en'
                ? (product.description_short_en || product.description_long_en || product.description_short || product.description_long || '—')
                : (product.description_short || product.description_long || '—')}
            </p>
            {(lang === 'en' ? (product.ingredients_en || product.ingredients) : product.ingredients) && (
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7a4f2d', marginBottom: 6 }}>{t.ingredients}</p>
                <p style={{ fontSize: 10, fontWeight: 300, color: 'rgba(59,25,15,0.6)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {lang === 'en' ? (product.ingredients_en || product.ingredients) : product.ingredients}
                </p>
              </div>
            )}
            <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 26, fontStyle: 'italic', color: '#3b190f', marginBottom: '1.5rem' }}>{formatFCFA(product.price_fcfa)}</p>
            {inCart && <p style={{ fontSize: 10, letterSpacing: '0.15em', color: '#7a4f2d', textTransform: 'uppercase', marginBottom: '0.8rem' }}>✓ {inCart.qty} {t.inCart}</p>}
            {product.stock > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7a4f2d' }}>{t.qty}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '0.5px solid rgba(59,25,15,0.15)', padding: '4px 8px' }}>
                    <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#3b190f', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                    <span style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 18, color: '#3b190f', minWidth: 20, textAlign: 'center' }}>{qty}</span>
                    <button onClick={() => setQty(q => q + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#3b190f', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                  </div>
                </div>
                <button onClick={() => { onAdd(product, qty); onClose(); }}
                  style={{ padding: '13px', background: '#3b190f', color: '#fdf6ec', border: 'none', cursor: 'pointer', fontSize: 10, letterSpacing: '0.25em', fontWeight: 300, textTransform: 'uppercase', fontFamily: 'Jost,sans-serif', transition: 'background 0.3s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#5a2d12'} onMouseLeave={e => e.currentTarget.style.background = '#3b190f'}>
                  {t.buy}
                </button>
              </div>
            ) : (
              <p style={{ fontSize: 10, letterSpacing: '0.2em', color: 'rgba(59,25,15,0.35)', textTransform: 'uppercase' }}>{t.soldout}</p>
            )}
            {product.stock > 0 && product.stock <= 5 && (
              <p style={{ fontSize: 10, color: '#e67e22', marginTop: '0.8rem', letterSpacing: '0.08em' }}>{lang === 'fr' ? `⚠ Plus que ${product.stock} en stock` : `⚠ Only ${product.stock} in stock`}</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── PRODUCTS ── */
function Products({ cart, setCart, lang = 'fr' }) {
  const { products, loading, error } = useProducts('benin');
  const [added, setAdded]   = useState(null);
  const [format, setFormat] = useState('tous');
  const [modal, setModal]   = useState(null);

  const formats = ['tous', ...Array.from(new Set(products.map(p => p.format).filter(Boolean)))];
  const visible = format === 'tous' ? products : products.filter(p => p.format === format);

  const handleAdd = (p) => {
    if (p.stock === 0) return;
    setCart(prev => {
      const exists = prev.find(i => i.id === p.id);
      if (exists) return prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...p, qty: 1 }];
    });
    setAdded(p.id);
    setTimeout(() => setAdded(null), 2000);
  };

  return (
    <>
      {modal && <ProductModal product={modal} lang={lang} onClose={() => setModal(null)} onAdd={(p, qty) => { const exists = cart.find(i => i.id === p.id); if (exists) setCart(prev => prev.map(i => i.id === p.id ? { ...i, qty: i.qty + qty } : i)); else setCart(prev => [...prev, { ...p, qty }]); setAdded(p.id); setTimeout(() => setAdded(null), 2000); }} inCart={cart.find(i => i.id === modal?.id)} />}
    <section id="products" style={{ padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,4vw,3rem)', background: '#fff' }}>
      <p style={{ fontSize: 10, letterSpacing: '0.4em', fontWeight: 300, color: '#7a4f2d', textTransform: 'uppercase', textAlign: 'center', marginBottom: '0.8rem' }}>
        {lang === 'fr' ? 'Notre collection' : 'Our collection'}
      </p>
      <h2 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 50, fontWeight: 300, color: '#3b190f', textAlign: 'center', marginBottom: '2rem' }}>
        {lang === 'fr' ? 'Nos Beurres' : 'Our Butters'}
      </h2>

      {/* Filtre par format */}
      {formats.length > 2 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
          {formats.map(f => (
            <button key={f} onClick={() => setFormat(f)} style={{
              padding: '6px 18px', border: '0.5px solid rgba(59,25,15,0.25)', background: format === f ? '#3b190f' : 'transparent',
              color: format === f ? '#f8cb78' : '#7a4f2d', fontSize: 9, letterSpacing: '0.22em',
              textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Jost,sans-serif', fontWeight: 300,
            }}>
              {f === 'tous' ? (lang === 'fr' ? 'Tous' : 'All') : f}
            </button>
          ))}
        </div>
      )}

      {loading && <p style={{ textAlign: 'center', fontFamily: '"Cormorant Garamond",serif', fontSize: 18, fontStyle: 'italic', color: 'rgba(59,25,15,0.4)' }}>{lang === 'fr' ? 'Chargement…' : 'Loading…'}</p>}
      {error && <p style={{ textAlign: 'center', fontSize: 11, color: '#c0392b' }}>{lang === 'fr' ? 'Erreur' : 'Error'} : {error}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '2rem', maxWidth: 1000, margin: '0 auto' }}>
          {visible.map(p => {
            const isAdded = added === p.id;
            const inCart = cart.find(i => i.id === p.id);
            return (
              <div key={p.id} style={{ background: '#fff', border: '0.5px solid rgba(59,25,15,0.1)', overflow: 'hidden', transition: 'transform 0.4s,box-shadow 0.4s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 24px 50px rgba(59,25,15,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                <div onClick={() => setModal(p)} style={{ height: 240, overflow: 'hidden', background: '#f8cb78', position: 'relative', cursor: 'pointer' }}>
                  {p.images?.[0]
                    ? <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.6s' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = ''} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3, fontSize: 48 }}>🫙</div>
                  }
                  {p.stock === 0 && <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(59,25,15,0.8)', color: '#f8cb78', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '4px 10px' }}>{lang === 'fr' ? 'Épuisé' : 'Sold out'}</div>}
                  {p.stock > 0 && p.stock <= 5 && <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(200,80,0,0.85)', color: '#fff', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '4px 10px' }}>{lang === 'fr' ? `Plus que ${p.stock} !` : `Only ${p.stock} left!`}</div>}
                  {inCart && <div style={{ position: 'absolute', top: 12, left: 12, background: '#3b190f', color: '#f8cb78', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '4px 10px' }}>× {inCart.qty} {lang === 'fr' ? 'dans le panier' : 'in cart'}</div>}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0.6rem', background: 'linear-gradient(transparent,rgba(20,6,2,0.5))', textAlign: 'center' }}>
                    <span style={{ fontSize: 9, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>{lang === 'fr' ? 'Voir les détails →' : 'View details →'}</span>
                  </div>
                </div>
                <div style={{ padding: '1.8rem 1.5rem' }}>
                  <p style={{ fontSize: 9, letterSpacing: '0.25em', fontWeight: 300, color: '#7a4f2d', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{p.format || 'Skincare · Haircare · Corps'}</p>
                  <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 24, color: '#3b190f', marginBottom: '0.5rem' }}>{p.name}</p>
                  <p style={{ fontSize: 11, fontWeight: 300, color: '#7a4f2d', lineHeight: 1.8, marginBottom: '1.2rem' }}>
                    {(() => { const d = lang === 'en' ? (p.description_short_en || p.description_short) : p.description_short; return d ? d.slice(0, 80) + (d.length > 80 ? '…' : '') : ''; })()}
                  </p>
                  <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 19, color: '#3b190f', fontStyle: 'italic', marginBottom: '1.2rem' }}>{formatFCFA(p.price_fcfa)}</p>
                  {p.stock === 0
                      ? <span style={{ fontSize: 9, letterSpacing: '0.2em', color: 'rgba(59,25,15,0.3)', textTransform: 'uppercase' }}>{lang === 'fr' ? 'Épuisé' : 'Sold out'}</span>
                      : <button onClick={() => handleAdd(p)} style={{ background: 'none', border: 'none', borderBottom: '1px solid #f8cb78', paddingBottom: 2, cursor: 'pointer', fontSize: 9, letterSpacing: '0.22em', fontWeight: 300, color: '#3b190f', textTransform: 'uppercase', fontFamily: 'Jost,sans-serif', display: 'inline-block', transition: 'color 0.3s' }}>
                          {isAdded ? (lang === 'fr' ? '✓ Ajouté →' : '✓ Added →') : inCart ? `× ${inCart.qty} · ${lang === 'fr' ? 'Ajouter →' : 'Add →'}` : (lang === 'fr' ? 'Ajouter au panier →' : 'Add to cart →')}
                      </button>
                  }
                </div>
              </div>
            );
          })}
        </div>
    </section>
    </>
  );
}




/* ─── ORDER ── */
function Order() {
  return (
    <section id="order" style={{ background: '#faeacc', padding: 'clamp(4rem,8vw,6rem) clamp(1.25rem,4vw,3rem)', textAlign: 'center' }}>
      <h2 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 50, fontWeight: 300, color: '#3b190f', marginBottom: '0.8rem' }}>Commandez maintenant</h2>
      <p style={{ fontSize: 12, fontWeight: 300, color: '#7a4f2d', maxWidth: 500, margin: '0 auto 3rem' }}>
        Livraison en Europe & à l'international. Pour l'Afrique de l'ouest, contactez-nous directement.
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
        {[
          { icon: 'W', label: 'WhatsApp', val: '+229 0148654200' },
          { icon: '@', label: 'Instagram', val: '@eolekare' },
          { icon: 'T', label: 'TikTok', val: '@eolekare' },
          { icon: '$', label: 'Paiement', val: 'revolut.me/eole15vp4' },
        ].map(m => (
          <div key={m.label} style={{ textAlign: 'center', minWidth: 120 }}>
            <div style={{ width: 56, height: 56, border: '0.5px solid rgba(59,25,15,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.8rem', fontFamily: '"Cormorant Garamond",serif', fontSize: 22, color: '#3b190f' }}>{m.icon}</div>
            <p style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#7a4f2d', marginBottom: 4 }}>{m.label}</p>
            <p style={{ fontSize: 11, fontWeight: 300, color: '#3b190f' }}>{m.val}</p>
          </div>
        ))}
      </div>
      <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer"
        style={{ fontSize: 10, letterSpacing: '0.28em', fontWeight: 300, textTransform: 'uppercase', color: '#fdf6ec', background: '#3b190f', padding: '15px 42px', textDecoration: 'none', display: 'inline-block', transition: 'background 0.3s' }}
        onMouseEnter={e => e.currentTarget.style.background = '#5a2d12'} onMouseLeave={e => e.currentTarget.style.background = '#3b190f'}>
        Commander sur WhatsApp
      </a>
    </section>
  );
}

/* ─── FOOTER ── */
function Footer({ lang = 'fr' }) {
  return (
    <footer style={{ background: '#3b190f', padding: '4rem 3rem', textAlign: 'center' }}>
      <div style={{ overflow: 'hidden', height: 52, margin: '0 auto 0.6rem', display: 'inline-block' }}>
        <img src="/images/Eolekare logo noir .png" alt="Eolekare" style={{ width: 180, display: 'block', marginTop: -67, filter: 'invert(1)', mixBlendMode: 'screen' }} />
      </div>
      <ul className="flex justify-center gap-12 list-none flex-wrap" style={{ marginBottom: '2rem' }}>
        {[['https://instagram.com/eolekare', 'Instagram @eolekare'], [WA_BASE, 'WhatsApp'], ['https://tiktok.com/@eolekare', 'TikTok @eolekare']].map(([h, l]) => (
          <li key={l}><a href={h} target="_blank" rel="noreferrer"
            style={{ fontSize: 10, letterSpacing: '0.18em', fontWeight: 300, color: 'rgba(248,203,120,0.4)', textDecoration: 'none', textTransform: 'uppercase', transition: 'color 0.3s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#f8cb78'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(248,203,120,0.4)'}>{l}</a></li>
        ))}
      </ul>
      <p style={{ fontSize: 10, color: 'rgba(248,203,120,0.15)' }}>{lang === 'fr' ? '100% Naturel · Made in Bénin · Pour tous' : '100% Natural · Made in Benin · For everyone'} · © 2026 Eolekare by Eoleeg</p>
    </footer>
  );
}

/* ─── PAGE ── */
export default function BeninPage() {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [lang, setLang] = useState('fr');

  const updateQty = (id, qty) => {
    if (qty <= 0) setCart(prev => prev.filter(i => i.id !== id));
    else setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  };
  const removeItem = (id) => setCart(prev => prev.filter(i => i.id !== id));
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  useSEO({
    title: lang === 'fr'
      ? 'Eolekare Bénin — Soins naturels Made in Bénin'
      : 'Eolekare Benin — Natural skincare Made in Benin',
    description: lang === 'fr'
      ? 'Commandez les soins Eolekare au Bénin. Beurres natifs, huiles végétales, multi-usage pour cheveux, peau et corps. Livraison nationale.'
      : 'Order Eolekare skincare in Benin. Native butters, vegetable oils, multi-use for hair, skin and body. Nationwide delivery.',
    url: 'https://eolekare.com/benin',
    lang,
  });

  return (
    <>
      <Nav lang={lang} setLang={setLang} cartCount={cartCount} onCartOpen={() => setCartOpen(true)} />
      {cartOpen && <CartDrawer lang={lang} cart={cart} onClose={() => setCartOpen(false)} onUpdate={updateQty} onRemove={removeItem} />}
      <Hero lang={lang} onCartOpen={() => setCartOpen(true)} />
      {/* Double strip */}
      <div style={{ display: 'flex', flexDirection: 'column', background: '#3b190f' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.42em', fontWeight: 300, color: 'rgba(248,203,120,0.55)', textTransform: 'uppercase', textAlign: 'center', padding: '2rem 0 1.5rem' }}>{T_BJ[lang].nature_strip}</p>
        <div className="img-strip" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', height: 300, overflow: 'hidden' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ position: 'relative', overflow: 'hidden' }}>
              <img src={`/images/texture-${i}.jpg`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.7s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,6,2,0.22)' }} />
            </div>
          ))}
        </div>
        <div className="img-strip" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', height: 260, overflow: 'hidden', gap: 0, fontSize: 0 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ position: 'relative', overflow: 'hidden' }}>
              <img src={`/images/fruit-${i}.jpg`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.7s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,6,2,0.22)' }} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: '#f8cb78', padding: '1rem 0', overflow: 'hidden' }}>
        <div className="ticker-track" style={{ display: 'flex', gap: '4rem', whiteSpace: 'nowrap' }}>
          {[...Array(2)].flatMap(() => T_BJ[lang].ticker).map((t, i) => (
            <span key={i} style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 15, fontStyle: 'italic', letterSpacing: '0.1em', color: '#3b190f', flexShrink: 0 }}>{t}</span>
          ))}
        </div>
      </div>
      <Products cart={cart} setCart={setCart} lang={lang} />
      <StorySection lang={lang} />
      <HowToSection lang={lang} />
      <ReviewsSection lang={lang} />
      <CommunitySection lang={lang} waNumber={WHATSAPP_NUMBER} />
      {/* <Order /> */}
      <Footer lang={lang} />
    </>
  );
}
