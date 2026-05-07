import React, { useState } from 'react';
import FloatingFruits from '../components/FloatingFruits';
import CommunitySection from '../components/CommunitySection';
import { useProducts } from '../hooks/useProducts';
import { formatFCFA } from '../lib/format';
import { createOrder, fedapayCreateTransaction } from '../lib/api';

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '2290148654200';
const WA_BASE = `https://wa.me/${WHATSAPP_NUMBER}`;

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
const NAV_LINKS = [['#story', 'Notre histoire'], ['#products', 'Collection'], ['#howto', 'Utilisation']];

function Nav({ cartCount, onCartOpen }) {
  const [mobOpen, setMobOpen] = useState(false);
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[100] flex justify-between items-center"
        style={{ padding: '0.9rem 1.5rem', background: '#f8cb78' }}>
        <div style={{ overflow: 'hidden', height: 52, cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img src="/images/Logo Eolekare .png" alt="Eolekare" style={{ width: 180, display: 'block', marginTop: -67 }} />
        </div>

        {/* Desktop nav */}
        <ul className="hidden md:flex gap-8 list-none items-center">
          {NAV_LINKS.map(([h, l]) => (
            <li key={h}><a href={h} style={{ fontSize: 10, fontWeight: 300, letterSpacing: '0.15em', color: '#3b190f', textDecoration: 'none', textTransform: 'uppercase', opacity: 0.7 }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.7}>{l}</a></li>
          ))}
          <li>
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
          </li>
        </ul>

        {/* Mobile: cart + hamburger */}
        <div className="flex md:hidden items-center gap-3">
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
          {NAV_LINKS.map(([h, l]) => (
            <a key={h} href={h} onClick={() => setMobOpen(false)}>{l}</a>
          ))}
        </div>
      )}
    </>
  );
}

/* ─── PANIER / CHECKOUT ───────────────────────────────────── */
function CartDrawer({ cart, onClose, onUpdate, onRemove }) {
  const [step, setStep]     = useState('cart'); // 'cart' | 'checkout'
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });
  const [busy, setBusy]     = useState(false);
  const [error, setError]   = useState('');
  const total = cart.reduce((s, i) => s + i.price_fcfa * i.qty, 0);

  const inputStyle = { width: '100%', padding: '10px 12px', border: '0.5px solid rgba(59,25,15,0.15)', background: '#fff', fontSize: 12, color: '#3b190f', outline: 'none', fontFamily: 'Jost,sans-serif', boxSizing: 'border-box', marginBottom: '0.8rem' };
  const labelStyle = { display: 'block', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7a4f2d', marginBottom: 4 };

  const handlePay = async () => {
    if (!customer.name.trim()) { setError('Veuillez entrer votre nom.'); return; }
    if (!customer.phone.trim()) { setError('Veuillez entrer votre téléphone.'); return; }
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
              {step === 'cart' ? 'Mon panier' : 'Récapitulatif'}
            </p>
            {cart.length > 0 && <p style={{ fontSize: 10, letterSpacing: '0.15em', color: '#7a4f2d', textTransform: 'uppercase' }}>{cart.reduce((s, i) => s + i.qty, 0)} article{cart.reduce((s, i) => s + i.qty, 0) > 1 ? 's' : ''}</p>}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#3b190f' }}>✕</button>
        </div>

        {/* Corps */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: '4rem' }}>
              <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 22, fontStyle: 'italic', color: 'rgba(59,25,15,0.35)', marginBottom: 8 }}>Votre panier est vide</p>
              <p style={{ fontSize: 10, letterSpacing: '0.15em', color: 'rgba(59,25,15,0.3)', textTransform: 'uppercase' }}>Découvrez nos beurres</p>
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
              <p style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#7a4f2d', marginBottom: '1.2rem' }}>Récapitulatif & paiement</p>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.7rem', marginBottom: '0.7rem', borderBottom: '0.5px solid rgba(59,25,15,0.06)' }}>
                  <span style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 15, color: '#3b190f' }}>{item.name} <span style={{ color: '#7a4f2d', fontSize: 13 }}>×{item.qty}</span></span>
                  <span style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 15, fontStyle: 'italic', color: '#3b190f' }}>{formatFCFA(item.price_fcfa * item.qty)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', paddingTop: '0.3rem' }}>
                <span style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7a4f2d' }}>Total</span>
                <span style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 20, color: '#3b190f' }}>{formatFCFA(total)}</span>
              </div>

              <div>
                <label style={labelStyle}>Nom complet *</label>
                <input style={inputStyle} value={customer.name} onChange={e => setCustomer(p => ({ ...p, name: e.target.value }))} placeholder="Jean Dupont" />
                <label style={labelStyle}>Téléphone *</label>
                <input style={inputStyle} type="tel" value={customer.phone} onChange={e => setCustomer(p => ({ ...p, phone: e.target.value }))} placeholder="+229 96 00 00 00" />
                <label style={labelStyle}>Adresse de livraison (optionnel)</label>
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
                  <span style={{ fontSize: 11, letterSpacing: '0.2em', color: '#7a4f2d', textTransform: 'uppercase' }}>Total</span>
                  <span style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 22, color: '#3b190f' }}>{formatFCFA(total)}</span>
                </div>
                <button onClick={() => setStep('checkout')}
                  style={{ width: '100%', padding: '14px', background: '#3b190f', color: '#fdf6ec', border: 'none', cursor: 'pointer', fontSize: 10, letterSpacing: '0.28em', fontWeight: 300, textTransform: 'uppercase', fontFamily: 'Jost,sans-serif', transition: 'background 0.3s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#5a2d12'} onMouseLeave={e => e.currentTarget.style.background = '#3b190f'}>
                  Commander →
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <button onClick={handlePay} disabled={busy}
                  style={{ width: '100%', padding: '14px', background: busy ? '#999' : '#3b190f', color: '#fdf6ec', border: 'none', cursor: busy ? 'not-allowed' : 'pointer', fontSize: 10, letterSpacing: '0.28em', fontWeight: 300, textTransform: 'uppercase', fontFamily: 'Jost,sans-serif', transition: 'background 0.3s' }}>
                  {busy ? 'Redirection…' : `Payer ${formatFCFA(total)} →`}
                </button>
                <button onClick={() => setStep('cart')}
                  style={{ width: '100%', padding: '11px', background: 'none', border: '0.5px solid rgba(59,25,15,0.2)', color: '#3b190f', cursor: 'pointer', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: 'Jost,sans-serif' }}>
                  ← Modifier le panier
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
function Hero({ onCartOpen }) {
  return (
    <section className="relative flex flex-col items-center justify-center text-center overflow-hidden"
      style={{ minHeight: '100vh', background: '#f8cb78', padding: '8rem 2rem 5rem' }}>
      <FloatingFruits variant="hero" />
      <div className="relative z-[2] flex flex-col items-center">
        <p style={{ fontSize: 10, letterSpacing: '0.5em', fontWeight: 300, color: '#000', opacity: 0.65, textTransform: 'uppercase', marginBottom: '2rem' }}>100% Naturel · Made in 🇧🇯 · Pour tous</p>
        <h1 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 'clamp(72px,11vw,140px)', fontWeight: 300, lineHeight: 0.88, color: '#000', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>EOLEKARE</h1>
        <p style={{ fontSize: 10, letterSpacing: '0.38em', fontWeight: 300, color: '#000', opacity: 0.55, textTransform: 'uppercase', marginBottom: '1.8rem' }}>by Eoleeg</p>
        <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 22, fontStyle: 'italic', color: '#000', maxWidth: 440, lineHeight: 1.65, marginBottom: '3rem' }}>Votre skincare aux parfums uniques</p>
        <div className="flex gap-6 flex-wrap justify-center">
          <a href="#products" style={{ fontSize: 10, letterSpacing: '0.28em', fontWeight: 300, textTransform: 'uppercase', color: '#fdf6ec', background: '#3b190f', padding: '15px 42px', textDecoration: 'none', transition: 'all 0.3s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#5a2d12'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#3b190f'; e.currentTarget.style.transform = ''; }}>
            Découvrir la collection
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─── PRODUCTS ── */
function Products({ cart, setCart }) {
  const { products, loading, error } = useProducts('benin');
  const [added, setAdded]   = useState(null);
  const [format, setFormat] = useState('tous');

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
    <section id="products" style={{ padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,4vw,3rem)', background: '#fff' }}>
      <p style={{ fontSize: 10, letterSpacing: '0.4em', fontWeight: 300, color: '#7a4f2d', textTransform: 'uppercase', textAlign: 'center', marginBottom: '0.8rem' }}>Notre collection</p>
      <h2 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 50, fontWeight: 300, color: '#3b190f', textAlign: 'center', marginBottom: '2rem' }}>Nos Beurres</h2>

      {/* Filtre par format */}
      {formats.length > 2 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
          {formats.map(f => (
            <button key={f} onClick={() => setFormat(f)} style={{
              padding: '6px 18px', border: '0.5px solid rgba(59,25,15,0.25)', background: format === f ? '#3b190f' : 'transparent',
              color: format === f ? '#f8cb78' : '#7a4f2d', fontSize: 9, letterSpacing: '0.22em',
              textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Jost,sans-serif', fontWeight: 300,
            }}>
              {f === 'tous' ? 'Tous' : f}
            </button>
          ))}
        </div>
      )}

      {loading && <p style={{ textAlign: 'center', fontFamily: '"Cormorant Garamond",serif', fontSize: 18, fontStyle: 'italic', color: 'rgba(59,25,15,0.4)' }}>Chargement…</p>}
      {error && <p style={{ textAlign: 'center', fontSize: 11, color: '#c0392b' }}>Erreur : {error}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '2rem', maxWidth: 1000, margin: '0 auto' }}>
          {products.map(p => {
            const isAdded = added === p.id;
            const inCart = cart.find(i => i.id === p.id);
            return (
              <div key={p.id} style={{ background: '#fff', border: '0.5px solid rgba(59,25,15,0.1)', overflow: 'hidden', transition: 'transform 0.4s,box-shadow 0.4s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 24px 50px rgba(59,25,15,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                {/* Image cliquable → modal */}
                <div onClick={() => setModal(p)} style={{ height: 240, overflow: 'hidden', background: '#f8cb78', position: 'relative', cursor: 'pointer' }}>
                  {p.images?.[0]
                    ? <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.6s' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = ''} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3, fontSize: 48 }}>🫙</div>
                  }
                  {p.images?.[1] && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                      <img src={p.images[1]} alt="" style={{ width: 110, height: 110, objectFit: 'contain', borderRadius: '50%', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }} />
                    </div>
                  )}
                  {p.stock === 0 && <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(59,25,15,0.8)', color: '#f8cb78', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '4px 10px' }}>{t.soldout}</div>}
                  {p.stock > 0 && p.stock <= 5 && <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(200,80,0,0.85)', color: '#fff', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '4px 10px' }}>Plus que {p.stock} !</div>}
                  {inCart && <div style={{ position: 'absolute', top: 12, left: 12, background: '#3b190f', color: '#f8cb78', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '4px 10px' }}>× {inCart.qty} {t.inCart}</div>}
                  {/* Lien "voir détails" */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0.6rem', background: 'linear-gradient(transparent,rgba(20,6,2,0.5))', textAlign: 'center' }}>
                    <span style={{ fontSize: 9, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>{t.details} →</span>
                  </div>
                </div>
                <div style={{ padding: '1.8rem 1.5rem' }}>
                  <p style={{ fontSize: 9, letterSpacing: '0.25em', fontWeight: 300, color: '#7a4f2d', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{p.format || 'Skincare · Haircare · Corps'}</p>
                  <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 24, color: '#3b190f', marginBottom: '0.5rem' }}>{p.name}</p>
                  <p style={{ fontSize: 11, fontWeight: 300, color: '#7a4f2d', lineHeight: 1.8, marginBottom: '1.2rem' }}>{p.description_short?.slice(0, 80)}{p.description_short?.length > 80 ? '…' : ''}</p>
                  <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 19, color: '#3b190f', fontStyle: 'italic', marginBottom: '1.2rem' }}>{formatEUR(p.price_eur)}</p>
                  {p.stock === 0
                    ? <span style={{ fontSize: 9, letterSpacing: '0.2em', color: 'rgba(59,25,15,0.3)', textTransform: 'uppercase' }}>{t.soldout}</span>
                    : <button onClick={() => handleAdd(p)} style={{ background: 'none', border: 'none', borderBottom: '1px solid #f8cb78', paddingBottom: 2, cursor: 'pointer', fontSize: 9, letterSpacing: '0.22em', fontWeight: 300, color: isAdded ? '#3b190f' : '#3b190f', textTransform: 'uppercase', fontFamily: 'Jost,sans-serif', display: 'inline-block', transition: 'color 0.3s' }}>
                        {isAdded ? `✓ ${t.added} →` : inCart ? `× ${inCart.qty} · ${t.buy} →` : `${t.buy} →`}
                      </button>
                  }
                </div>
              </div>
            );
          })}
        </div>
    </section>
  );
}

/* ─── STORY ── */
function Story() {
  return (
    <section id="story" style={{ background: '#3b190f', overflow: 'hidden' }}>
      <div className="grid-2col" style={{ maxWidth: 1100, margin: '0 auto', gap: 0, alignItems: 'stretch' }}>
        {/* Col 1 : Mot de la fondatrice */}
        <div style={{ padding: 'clamp(3rem,7vw,6rem) clamp(1.5rem,4vw,4rem)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ fontSize: 38, fontFamily: '"Cormorant Garamond",serif', fontWeight: 300, fontStyle: 'italic', color: 'rgba(248,203,120,0.5)', lineHeight: 1.15, marginBottom: '2rem' }}>Née d'un besoin, pensée pour tous.</h2>
          <p style={{ fontSize: 9, letterSpacing: '0.32em', fontWeight: 300, color: '#f8cb78', textTransform: 'uppercase', marginBottom: '2rem' }}>UN MOT DE LA FONDATRICE</p>
          <p style={{ fontSize: 14, fontWeight: 300, color: 'rgba(253,246,236,0.72)', lineHeight: 1.9, marginBottom: '1.4rem' }}>
            Quand je me suis rasée les cheveux, on m'a dit qu'ils ne repousseraient pas. Plutôt que d'accepter, je me suis tournée vers les ingrédients naturels du Bénin pour tester différents soins — et les résultats ont parlé d'eux-mêmes.
          </p>
          <p style={{ fontSize: 14, fontWeight: 300, color: 'rgba(253,246,236,0.72)', lineHeight: 1.9, marginBottom: '1.4rem' }}>
            Eolekare est la solution que j'ai trouvée pour moi, et que je partage aujourd'hui avec tous : hommes, femmes, enfants — pour vos cheveux, votre peau, votre corps.
          </p>
          <p style={{ fontSize: 14, fontWeight: 300, color: 'rgba(253,246,236,0.72)', lineHeight: 1.9, marginBottom: '2rem' }}>
            J'espère que ces produits deviendront les vôtres. Qu'ils traîneront dans votre sac, sur votre table de nuit, dans votre salle de bain. Qu'à chaque moment — matin, soir, en voyage — ils seront là pour adoucir, nourrir et prendre soin de vous.
          </p>
          <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 20, fontStyle: 'italic', color: '#f8cb78' }}>— @eoleeg</p>
        </div>
        {/* Col 2 : Instagram */}
        <div style={{ display: 'flex', alignItems: 'stretch', minHeight: 520, background: '#000' }}>
          <iframe
            src="https://www.instagram.com/p/DK-SszQsc60/embed/"
            style={{ width: '100%', height: '100%', minHeight: 520, border: 'none', display: 'block' }}
            loading="lazy"
            allowTransparency="true"
            scrolling="no"
            title="Eolekare Instagram"
          />
        </div>
      </div>
    </section>
  );
}

/* ─── HOWTO ── */
function HowTo() {
  const steps = [
    {
      n: '01',
      t: 'Sur les cheveux',
      d: 'Prélève une noisette, frotte entre tes mains. Applique sur les longueurs et pointes pour nourrir, réparer et faire briller.\n\nPour un soin intense, utilise en bain d\'huile : applique généreusement, masse profondément le cuir chevelu, laisse poser 30min à 2h sous un bonnet chauffant si possible.',
    },
    {
      n: '02',
      t: 'Sur le corps',
      d: 'Sur peau humide après la douche. Masse jusqu\'à pénétration complète. Idéal pour la peau, les ongles, les lèvres, les cils, les sourcils et les pieds — partout où ta peau a besoin de douceur.',
    },
    {
      n: '03',
      t: 'Sur la barbe',
      d: 'Quelques gouttes réchauffées entre les mains. Masse sur la barbe et la peau en dessous pour adoucir, hydrater et discipliner.',
    },
  ];
  return (
    <section id="howto" style={{ background: '#2a1208', padding: 'clamp(4rem,7vw,6rem) clamp(1.25rem,4vw,3rem)' }}>
      <p style={{ fontSize: 10, letterSpacing: '0.4em', fontWeight: 300, color: 'rgba(248,203,120,0.5)', textTransform: 'uppercase', textAlign: 'center', marginBottom: '0.8rem' }}>Rituel Eolekare</p>
      <h2 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 46, fontWeight: 300, color: '#fdf6ec', textAlign: 'center', marginBottom: '4rem' }}>Comment utiliser</h2>
      <div className="grid-3col" style={{ gap: '2rem', maxWidth: 960, margin: '0 auto' }}>
        {steps.map(({ n, t, d }) => (
          <div key={n} style={{ border: '0.5px solid rgba(248,203,120,0.15)', padding: '2.5rem 2rem' }}>
            <div style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 56, fontWeight: 300, color: 'rgba(248,203,120,0.12)', lineHeight: 1, marginBottom: '0.5rem' }}>{n}</div>
            <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 22, fontWeight: 300, color: '#f8cb78', marginBottom: '1rem' }}>{t}</p>
            {d.split('\n\n').map((para, i) => (
              <p key={i} style={{ fontSize: 12, fontWeight: 300, color: 'rgba(253,246,236,0.5)', lineHeight: 1.85, marginBottom: i < d.split('\n\n').length - 1 ? '0.8rem' : 0 }}>{para}</p>
            ))}
          </div>
        ))}
      </div>
    </section>
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
function Footer() {
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
      <p style={{ fontSize: 10, color: 'rgba(248,203,120,0.15)' }}>100% Naturel · Made in Bénin · Pour tous · © 2025 Eolekare by Eoleeg</p>
    </footer>
  );
}

/* ─── PAGE ── */
export default function BeninPage() {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const updateQty = (id, qty) => {
    if (qty <= 0) setCart(prev => prev.filter(i => i.id !== id));
    else setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  };
  const removeItem = (id) => setCart(prev => prev.filter(i => i.id !== id));
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <>
      <Nav cartCount={cartCount} onCartOpen={() => setCartOpen(true)} />
      {cartOpen && <CartDrawer cart={cart} onClose={() => setCartOpen(false)} onUpdate={updateQty} onRemove={removeItem} />}
      <Hero onCartOpen={() => setCartOpen(true)} />
      {/* Double strip */}
      <div style={{ display: 'flex', flexDirection: 'column', background: '#3b190f' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.42em', fontWeight: 300, color: 'rgba(248,203,120,0.55)', textTransform: 'uppercase', textAlign: 'center', padding: '2rem 0 1.5rem' }}>La nature dans chaque texture</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', height: 300, overflow: 'hidden' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ position: 'relative', overflow: 'hidden' }}>
              <img src={`/images/texture-${i}.jpg`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.7s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,6,2,0.22)' }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', height: 260, overflow: 'hidden', gap: 0, fontSize: 0 }}>
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
          {[...Array(2)].flatMap(() => ['Eolekare', '·', 'Votre skincare aux parfums uniques', '·', '100% Naturel', '·', 'Made in 🇧🇯', '·', 'Pour tous', '·']).map((t, i) => (
            <span key={i} style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 15, fontStyle: 'italic', letterSpacing: '0.1em', color: '#3b190f', flexShrink: 0 }}>{t}</span>
          ))}
        </div>
      </div>
      <Products cart={cart} setCart={setCart} />
      <Story />
      <HowTo />
      <CommunitySection lang="fr" waNumber={WHATSAPP_NUMBER} />
      {/* <Order /> */}
      <Footer />
    </>
  );
}
