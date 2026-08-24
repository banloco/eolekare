import React, { useState, useEffect } from 'react';
import FloatingFruits from '../components/FloatingFruits';
import StockNotifyForm from '../components/StockNotifyForm';
import CheckoutPage from './CheckoutPage';
import CommunitySection from '../components/CommunitySection';
import ReviewsSection from '../components/ReviewsSection';
import StorySection from '../components/StorySection';
import HowToSection from '../components/HowToSection';
import ImageCarousel from '../components/ImageCarousel';
import { useSEO } from '../hooks/useSEO';
import { useProducts } from '../hooks/useProducts';
import { formatEUR } from '../lib/format';

const CART_KEY = 'eolekare_eu_cart';

const T = {
  fr: { eyebrow:'100% Naturel · Made in 🇧🇯 · Pour tous', tagline:'Votre skincare aux parfums uniques', discover:'Découvrir la collection', collection:'Notre collection', story:'Notre histoire', howto:'L\' utilisation', buy:'Ajouter au panier', added:'Ajouté', soldout:'Épuisé', checkout:'Commander →', nav_cart:'Panier', close:'Fermer', qty:'Quantité', total:'Total', empty:'Votre panier est vide', upsell:'Vous aimerez aussi', details:'Voir les détails', inCart:'dans le panier', modify:'Modifier', secure:'Paiement sécurisé', back:'← Retour',
    pay_success:'Paiement confirmé ! Merci pour votre commande', pay_failed:'Le paiement a échoué. Vous pouvez réessayer.', pay_cancelled:'Paiement annulé.', pay_error:'Une erreur est survenue pendant le paiement.', pay_ref:'Référence', pay_close:'✕' },
  en: { eyebrow:'100% Natural · Made in 🇧🇯 · For everyone', tagline:'Your skincare with unique scents', discover:'Discover the collection', collection:'Our collection', story:'Our story', howto:'How to use', buy:'Add to cart', added:'Added', soldout:'Sold out', checkout:'Checkout →', nav_cart:'Cart', close:'Close', qty:'Quantity', total:'Total', empty:'Your cart is empty', upsell:'You might also like', details:'View details', inCart:'in cart', modify:'Edit', secure:'Secure payment', back:'← Back',
    pay_success:'Payment confirmed! Thank you for your order', pay_failed:'Payment failed. You can try again.', pay_cancelled:'Payment cancelled.', pay_error:'An error occurred during payment.', pay_ref:'Reference', pay_close:'✕' },
};

/* ─── Nom produit selon la langue (fallback FR si pas de traduction) ─── */
function displayName(p, lang) {
  return lang === 'en' ? (p.name_en || p.name) : p.name;
}

/* ─── PAYMENT STATUS BANNER (retour Stripe / FedaPay) ─── */
function PaymentBanner({ lang, status, reference, onClose }) {
  if (!status) return null;
  const t = T[lang];
  const variants = {
    success:   { bg: '#e8f5e9', border: '#4caf50', color: '#2e7d32', text: t.pay_success },
    failed:    { bg: '#fdecea', border: '#e53935', color: '#c0392b', text: t.pay_failed },
    cancelled: { bg: '#fff8e1', border: '#f5a623', color: '#8a6416', text: t.pay_cancelled },
    error:     { bg: '#fdecea', border: '#e53935', color: '#c0392b', text: t.pay_error },
  };
  const v = variants[status];
  if (!v) return null;

  return (
    <div style={{ position: 'fixed', top: 70, left: 0, right: 0, zIndex: 300, display: 'flex', justifyContent: 'center', padding: '0 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: v.bg, border: `0.5px solid ${v.border}`, color: v.color, padding: '12px 20px', maxWidth: 560, width: '100%', boxShadow: '0 4px 20px rgba(59,25,15,0.12)' }}>
        <p style={{ fontSize: 12, flex: 1 }}>
          {v.text}{reference && <> — <strong>{t.pay_ref} {reference}</strong></>}
        </p>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: v.color, fontSize: 14, flexShrink: 0 }}>{t.pay_close}</button>
      </div>
    </div>
  );
}

/* ─── CART HOOK (localStorage) ─── */
function useCart() {
  const [cart, setCartState] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
  });

  const setCart = (fn) => {
    setCartState(prev => {
      const next = typeof fn === 'function' ? fn(prev) : fn;
      try { localStorage.setItem(CART_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const add = (p, qty = 1) => setCart(prev => {
    const exists = prev.find(i => i.id === p.id);
    if (exists) return prev.map(i => i.id === p.id ? { ...i, qty: i.qty + qty } : i);
    return [...prev, { ...p, qty }];
  });

  const update = (id, qty) => setCart(prev =>
    qty <= 0 ? prev.filter(i => i.id !== id) : prev.map(i => i.id === id ? { ...i, qty } : i)
  );

  const remove = (id) => setCart(prev => prev.filter(i => i.id !== id));
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const total = cart.reduce((s, i) => s + Number(i.price_eur) * i.qty, 0);

  const clear = () => setCart([]);
  return { cart, add, update, remove, count, total, setCart: clear };
}

/* ─── NAV ─── */
const EU_NAV_LINKS = (t) => [['#products', t.collection], ['#story', t.story], ['#howto', t.howto]];

function Nav({ lang, setLang, cartCount, onCartOpen }) {
  const t = T[lang];
  const [mobOpen, setMobOpen] = useState(false);
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[100] flex justify-between items-center" style={{ padding: '0.9rem 1.5rem', background: '#f8cb78' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="nav-logo-wrap" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src="/images/Logo Eolekare .png" alt="Eolekare" className="nav-logo-img" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.22em', color: '#3b190f', textTransform: 'uppercase', borderBottom: '0.5px solid #3b190f', paddingBottom: 1 }}>Europe</span>
            <span style={{ fontSize: 8, color: 'rgba(59,25,15,0.3)' }}>·</span>
            <a href="/benin" title="Passer à la boutique Bénin"
              style={{ fontSize: 8, fontWeight: 300, letterSpacing: '0.22em', color: '#7a4f2d', textTransform: 'uppercase', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#3b190f'}
              onMouseLeave={e => e.currentTarget.style.color = '#7a4f2d'}
            >Bénin</a>
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {EU_NAV_LINKS(t).map(([h, l]) => (
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
          <button onClick={onCartOpen} style={{ background: 'none', border: '0.5px solid rgba(59,25,15,0.3)', cursor: 'pointer', color: '#3b190f', padding: '7px 12px', display: 'flex', alignItems: 'center', gap: 6, transition: 'background 0.3s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,25,15,0.06)'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {cartCount > 0 && <span style={{ background: '#3b190f', color: '#f8cb78', borderRadius: '50%', width: 18, height: 18, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{cartCount}</span>}
          </button>
        </div>

        {/* Mobile */}
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

      {mobOpen && (
        <div className="mob-menu md:hidden">
          <div className="mob-lang">
            {['fr', 'en'].map(l => (
              <button key={l} onClick={() => setLang(l)} className={lang === l ? 'active' : ''}>
                {l === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}
              </button>
            ))}
          </div>
          {EU_NAV_LINKS(t).map(([h, l]) => (
            <a key={h} href={h} onClick={() => setMobOpen(false)}>{l}</a>
          ))}
        </div>
      )}
    </>
  );
}

/* ─── CART DRAWER ─── */
function CartDrawer({ lang, cart, total, onUpdate, onRemove, onClose, products, onCheckout }) {
  const t = T[lang];
  // Upsell : produits pas dans le panier
  const upsell = products.filter(p => !cart.find(c => c.id === p.id)).slice(0, 3);

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(59,25,15,0.45)' }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 420, maxWidth: '100vw', zIndex: 201, background: '#fdf6ec', display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 48px rgba(59,25,15,0.15)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', borderBottom: '0.5px solid rgba(59,25,15,0.1)' }}>
          <div>
            <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 24, fontWeight: 300, color: '#3b190f' }}>{t.nav_cart}</p>
            {cart.length > 0 && <p style={{ fontSize: 10, letterSpacing: '0.15em', color: '#7a4f2d', textTransform: 'uppercase' }}>{cart.reduce((s, i) => s + i.qty, 0)} {cart.reduce((s, i) => s + i.qty, 0) > 1 ? 'articles' : 'article'}</p>}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#3b190f' }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: '4rem' }}>
              <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 22, fontStyle: 'italic', color: 'rgba(59,25,15,0.35)', marginBottom: 8 }}>{t.empty}</p>
              <p style={{ fontSize: 10, letterSpacing: '0.15em', color: 'rgba(59,25,15,0.3)', textTransform: 'uppercase' }}>Découvrez nos beurres</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {cart.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: '1rem', paddingBottom: '1.2rem', borderBottom: '0.5px solid rgba(59,25,15,0.08)' }}>
                    <div style={{ width: 70, height: 70, background: '#f8cb78', flexShrink: 0, overflow: 'hidden' }}>
                      {item.images?.[0] && <img src={item.images[0]} alt={displayName(item, lang)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 17, color: '#3b190f', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName(item, lang)}</p>
                      <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 14, fontStyle: 'italic', color: '#7a4f2d', marginBottom: 8 }}>{formatEUR(item.price_eur)}</p>
                      {/* Sélecteur quantité */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button onClick={() => onUpdate(item.id, item.qty - 1)} style={{ width: 26, height: 26, border: '0.5px solid rgba(59,25,15,0.2)', background: 'none', cursor: 'pointer', fontSize: 14, color: '#3b190f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                        <span style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 17, color: '#3b190f', minWidth: 18, textAlign: 'center' }}>{item.qty}</span>
                        <button onClick={() => onUpdate(item.id, item.qty + 1)} style={{ width: 26, height: 26, border: '0.5px solid rgba(59,25,15,0.2)', background: 'none', cursor: 'pointer', fontSize: 14, color: '#3b190f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                        <span style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 14, fontStyle: 'italic', color: '#7a4f2d', marginLeft: 'auto' }}>{formatEUR(item.price_eur * item.qty)}</span>
                      </div>
                    </div>
                    <button onClick={() => onRemove(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(59,25,15,0.25)', fontSize: 14, alignSelf: 'flex-start', lineHeight: 1 }}
                      onMouseEnter={e => e.currentTarget.style.color = '#c0392b'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(59,25,15,0.25)'}>✕</button>
                  </div>
                ))}
              </div>

              {/* Upsell */}
              {upsell.length > 0 && (
                <div style={{ marginTop: '2rem' }}>
                  <p style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#7a4f2d', marginBottom: '1rem' }}>{t.upsell}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {upsell.map(p => (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem', border: '0.5px solid rgba(59,25,15,0.08)', background: '#fff' }}>
                        <div style={{ width: 48, height: 48, background: '#f8cb78', flexShrink: 0, overflow: 'hidden' }}>
                          {p.images?.[0] && <img src={p.images[0]} alt={displayName(p, lang)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 15, color: '#3b190f' }}>{displayName(p, lang)}</p>
                          <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 13, fontStyle: 'italic', color: '#7a4f2d' }}>{formatEUR(p.price_eur)}</p>
                        </div>
                        <button
                          onClick={() => document.dispatchEvent(new CustomEvent('upsell-add', { detail: p }))}
                          style={{ background: '#3b190f', border: 'none', cursor: 'pointer', color: '#fdf6ec', fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'Jost,sans-serif', padding: '7px 12px', whiteSpace: 'nowrap' }}>
                          + {t.buy}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div style={{ padding: '1.5rem 2rem', borderTop: '0.5px solid rgba(59,25,15,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.2rem' }}>
              <span style={{ fontSize: 11, letterSpacing: '0.2em', color: '#7a4f2d', textTransform: 'uppercase' }}>{t.total}</span>
              <span style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 22, color: '#3b190f' }}>{formatEUR(total)}</span>
            </div>
            <button onClick={onCheckout}
              style={{ display: 'block', width: '100%', padding: '14px', background: '#3b190f', color: '#fdf6ec', border: 'none', cursor: 'pointer', fontSize: 10, letterSpacing: '0.28em', fontWeight: 300, textTransform: 'uppercase', fontFamily: 'Jost,sans-serif', textAlign: 'center', transition: 'background 0.3s', boxSizing: 'border-box' }}
              onMouseEnter={e => e.currentTarget.style.background = '#5a2d12'} onMouseLeave={e => e.currentTarget.style.background = '#3b190f'}>
              {t.checkout}
            </button>
            <p style={{ textAlign: 'center', fontSize: 9, letterSpacing: '0.12em', color: 'rgba(59,25,15,0.3)', textTransform: 'uppercase', marginTop: '0.8rem' }}>🔒 {t.secure}</p>
          </div>
        )}
      </div>
    </>
  );
}

/* ─── MODAL PRODUIT ─── */
function ProductModal({ product, lang, onClose, onAdd, inCart }) {
  const t = T[lang];
  const [qty, setQty] = useState(1);
  if (!product) return null;
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(59,25,15,0.55)' }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 301, background: '#fdf6ec', width: '90%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.3)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '0.8rem', right: '0.8rem', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(253,246,236,0.9)', borderRadius: '50%', border: 'none', fontSize: 18, cursor: 'pointer', color: '#3b190f', boxShadow: '0 2px 10px rgba(59,25,15,0.2)', zIndex: 2 }}>✕</button>
        <div className="grid-2col">
          {/* Images carousel */}
          <div style={{ height: 400, position: 'relative' }}>
            <ImageCarousel
              images={product.images || []}
              alt={displayName(product, lang)}
              height={400}
              objectFit="cover"
              autoPlay
              interval={3500}
            />
          </div>
          {/* Infos */}
          <div style={{ padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {product.format && <p style={{ fontSize: 9, letterSpacing: '0.25em', color: '#7a4f2d', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{product.format}</p>}
            <h2 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 30, fontWeight: 300, color: '#3b190f', marginBottom: '0.8rem' }}>{displayName(product, lang)}</h2>
            <p style={{ fontSize: 12, fontWeight: 300, color: '#7a4f2d', lineHeight: 1.85, marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>
              {lang === 'en'
                ? (product.description_short_en || product.description_long_en || product.description_short || product.description_long || '—')
                : (product.description_short || product.description_long || '—')}
            </p>

            {/* Ingrédients */}
            {(lang === 'en' ? (product.ingredients_en || product.ingredients) : product.ingredients) && (
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7a4f2d', marginBottom: 6 }}>{lang === 'en' ? 'Ingredients' : 'Ingrédients'}</p>
                <p style={{ fontSize: 10, fontWeight: 300, color: 'rgba(59,25,15,0.6)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {lang === 'en' ? (product.ingredients_en || product.ingredients) : product.ingredients}
                </p>
              </div>
            )}

            <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 26, fontStyle: 'italic', color: '#3b190f', marginBottom: '1.5rem' }}>{formatEUR(product.price_eur)}</p>

            {inCart && <p style={{ fontSize: 10, letterSpacing: '0.15em', color: '#7a4f2d', textTransform: 'uppercase', marginBottom: '0.8rem' }}>✓ {inCart.qty} {t.inCart}</p>}

            {product.stock > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {/* Qty */}
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
              <div>
                <p style={{ fontSize: 10, letterSpacing: '0.2em', color: 'rgba(59,25,15,0.35)', textTransform: 'uppercase', marginBottom: '0.6rem' }}>{t.soldout}</p>
                <StockNotifyForm productId={product.id} lang={lang} />
              </div>
            )}

            {product.stock > 0 && product.stock <= 5 && (
              <p style={{ fontSize: 10, color: '#e67e22', marginTop: '0.8rem', letterSpacing: '0.08em' }}>{lang === 'fr' ? `Plus que ${product.stock} en stock` : `Only ${product.stock} left`}</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── PRODUCTS ─── */
function Products({ lang, cartHook }) {
  const t = T[lang];
  const { products, loading, error } = useProducts('international');
  const { cart, add } = cartHook;
  const [added, setAdded] = useState(null);
  const [modal, setModal] = useState(null);
  const [format, setFormat] = useState('tous');

  const formats = ['tous', ...Array.from(new Set(products.map(p => p.format).filter(Boolean)))];
  const visible = format === 'tous' ? products : products.filter(p => p.format === format);

  useEffect(() => {
    const handler = (e) => { add(e.detail, 1); };
    document.addEventListener('upsell-add', handler);
    return () => document.removeEventListener('upsell-add', handler);
  }, [add]);

  const handleAdd = (p, qty = 1) => {
    if (p.stock === 0) return;
    add(p, qty);
    setAdded(p.id);
    setTimeout(() => setAdded(null), 2000);
  };

  return (
    <>
      {modal && <ProductModal product={modal} lang={lang} onClose={() => setModal(null)} onAdd={handleAdd} inCart={cart.find(i => i.id === modal.id)} />}
        <section id="products" style={{ padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,4vw,3rem)', background: '#fff' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.4em', fontWeight: 300, color: '#7a4f2d', textTransform: 'uppercase', textAlign: 'center', marginBottom: '0.8rem' }}>{t.collection}</p>
        <h2 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 50, fontWeight: 300, color: '#3b190f', textAlign: 'center', marginBottom: '2rem' }}>{lang === 'fr' ? 'Nos Beurres' : 'Our Butters'}</h2>

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
        {error && <p style={{ textAlign: 'center', color: '#c0392b', fontSize: 11 }}>{lang === 'fr' ? 'Erreur' : 'Error'} : {error}</p>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '2rem', maxWidth: 1000, margin: '0 auto' }}>
          {visible.map(p => {
            const isAdded = added === p.id;
            const inCart = cart.find(i => i.id === p.id);
            return (
              <div key={p.id} style={{ background: '#fff', border: '0.5px solid rgba(59,25,15,0.1)', overflow: 'hidden', transition: 'transform 0.4s,box-shadow 0.4s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 24px 50px rgba(59,25,15,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                {/* Image(s) cliquable(s) → carousel + modal */}
                <div style={{ position: 'relative' }}>
                  <ImageCarousel
                    images={p.images || []}
                    alt={displayName(p, lang)}
                    height={240}
                    objectFit="cover"
                    onClick={() => setModal(p)}
                  />
                  {/* Badges absolus sur le carousel */}
                  {p.stock === 0 && <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(59,25,15,0.8)', color: '#f8cb78', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '4px 10px', zIndex: 3, pointerEvents: 'none' }}>{t.soldout}</div>}
                  {p.stock > 0 && p.stock <= 5 && <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(200,80,0,0.85)', color: '#fff', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '4px 10px', zIndex: 3, pointerEvents: 'none' }}>{lang === 'fr' ? `Plus que ${p.stock} !` : `Only ${p.stock} left!`}</div>}
                  {inCart && <div style={{ position: 'absolute', top: 12, left: 12, background: '#3b190f', color: '#f8cb78', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '4px 10px', zIndex: 3, pointerEvents: 'none' }}>× {inCart.qty} {t.inCart}</div>}
                  {/* Lien "voir détails" */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0.6rem', background: 'linear-gradient(transparent,rgba(20,6,2,0.5))', textAlign: 'center', zIndex: 3, pointerEvents: 'none' }}>
                    <span style={{ fontSize: 9, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>{t.details} →</span>
                  </div>
                </div>
                <div style={{ padding: '1.8rem 1.5rem' }}>
                  <p style={{ fontSize: 9, letterSpacing: '0.25em', fontWeight: 300, color: '#7a4f2d', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{p.format || 'Skincare · Haircare · Corps'}</p>
                  <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 24, color: '#3b190f', marginBottom: '0.5rem' }}>{displayName(p, lang)}</p>
                  <p style={{ fontSize: 11, fontWeight: 300, color: '#7a4f2d', lineHeight: 1.8, marginBottom: '1.2rem' }}>
                    {(() => { const d = lang === 'en' ? (p.description_short_en || p.description_short) : p.description_short; return d ? d.slice(0, 80) + (d.length > 80 ? '…' : '') : ''; })()}
                  </p>
                  <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 19, color: '#3b190f', fontStyle: 'italic', marginBottom: '1.2rem' }}>{formatEUR(p.price_eur)}</p>
                  {p.stock === 0
                    ? <StockNotifyForm productId={p.id} lang={lang} />
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
    </>
  );
}


/* ─── ORDER ─── */
function Order({ lang, onCartOpen }) {
  return (
    <section id="order" style={{ background: '#faeacc', padding: 'clamp(4rem,8vw,6rem) clamp(1.25rem,4vw,3rem)', textAlign: 'center' }}>
      <h2 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 50, fontWeight: 300, color: '#3b190f', marginBottom: '0.8rem' }}>
        {lang === 'fr' ? 'Commandez maintenant' : 'Order now'}
      </h2>
      <p style={{ fontSize: 12, fontWeight: 300, color: '#7a4f2d', maxWidth: 500, margin: '0 auto 3rem' }}>
        {lang === 'fr' ? 'Livraison en Europe via Mondial Relay. Paiement sécurisé par carte bancaire.' : 'Delivery in Europe via Mondial Relay. Secure payment by credit card.'}
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
        {[
          { icon: '🛒', label: lang === 'fr' ? 'En ligne' : 'Online', val: lang === 'fr' ? 'Via le panier' : 'Via cart' },
          { icon: 'W', label: 'WhatsApp', val: '+229 0148654200' },
          { icon: '@', label: 'Instagram', val: '@eolekare' },
          { icon: '🚚', label: 'Mondial Relay', val: lang === 'fr' ? "Toute l'Europe" : 'All Europe' },
        ].map(m => (
          <div key={m.label} style={{ textAlign: 'center', minWidth: 120 }}>
            <div style={{ width: 56, height: 56, border: '0.5px solid rgba(59,25,15,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.8rem', fontFamily: '"Cormorant Garamond",serif', fontSize: 22, color: '#3b190f' }}>{m.icon}</div>
            <p style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#7a4f2d', marginBottom: 4 }}>{m.label}</p>
            <p style={{ fontSize: 11, fontWeight: 300, color: '#3b190f' }}>{m.val}</p>
          </div>
        ))}
      </div>
      <button onClick={onCartOpen}
        style={{ fontSize: 10, letterSpacing: '0.28em', fontWeight: 300, textTransform: 'uppercase', color: '#fdf6ec', background: '#3b190f', padding: '15px 42px', border: 'none', cursor: 'pointer', fontFamily: 'Jost,sans-serif', transition: 'background 0.3s' }}
        onMouseEnter={e => e.currentTarget.style.background = '#5a2d12'} onMouseLeave={e => e.currentTarget.style.background = '#3b190f'}>
        {lang === 'fr' ? 'Commander →' : 'Order →'}
      </button>
    </section>
  );
}

/* ─── FOOTER ─── */
function Footer({ lang }) {
  return (
    <footer style={{ background: '#3b190f', padding: '4rem 3rem', textAlign: 'center' }}>
      <div style={{ overflow: 'hidden', height: 52, margin: '0 auto 0.6rem', display: 'inline-block' }}>
        <img src="/images/Eolekare logo noir .png" alt="Eolekare" style={{ width: 180, display: 'block', marginTop: -67, filter: 'invert(1)', mixBlendMode: 'screen' }} />
      </div>
      <p style={{ fontSize: 9, letterSpacing: '0.32em', color: 'rgba(248,203,120,0.28)', textTransform: 'uppercase', marginBottom: '2rem' }}>by Eoleeg · Europe</p>
      <ul className="flex justify-center gap-12 list-none flex-wrap" style={{ marginBottom: '2rem' }}>
        {[['https://instagram.com/eolekare', 'Instagram @eolekare'], ['https://tiktok.com/@eolekare', 'TikTok @eolekare']].map(([h, l]) => (
          <li key={l}><a href={h} target="_blank" rel="noreferrer" style={{ fontSize: 10, letterSpacing: '0.18em', fontWeight: 300, color: 'rgba(248,203,120,0.4)', textDecoration: 'none', textTransform: 'uppercase', transition: 'color 0.3s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#f8cb78'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(248,203,120,0.4)'}>{l}</a></li>
        ))}
      </ul>
      <ul className="flex justify-center gap-8 list-none flex-wrap" style={{ marginBottom: '1.5rem' }}>
        {(lang === 'fr'
          ? [['mentions', 'Mentions légales'], ['cgv', 'CGV'], ['remboursement', 'Remboursement'], ['confidentialite', 'Confidentialité']]
          : [['mentions', 'Legal Notice'], ['cgv', 'Terms of Sale'], ['remboursement', 'Refunds'], ['confidentialite', 'Privacy']]
        ).map(([doc, l]) => (
          <li key={doc}><a href={`/legal?doc=${doc}&lang=${lang}`}
            style={{ fontSize: 9, letterSpacing: '0.12em', fontWeight: 300, color: 'rgba(248,203,120,0.22)', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.color = '#f8cb78'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(248,203,120,0.22)'}>{l}</a></li>
        ))}
      </ul>
      <p style={{ fontSize: 10, color: 'rgba(248,203,120,0.15)' }}>{lang === 'fr' ? '100% Naturel · Made in Bénin · Pour tous' : '100% Natural · Made in Benin · For everyone'} · © 2026 Eolekare by Eoleeg</p>
    </footer>
  );
}

/* ─── PAGE ─── */
export default function EuropePage() {
  const [lang, setLang]         = useState('fr');
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // ── Retour Stripe / FedaPay (?payment=success|failed|cancelled|error&ref=...) ──
  const [payment, setPayment] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('payment');
    return status ? { status, reference: params.get('ref') } : null;
  });
  const cartHook = useCart();
  const { products } = useProducts('international');

  useEffect(() => {
    if (!payment) return;
    if (payment.status === 'success') cartHook.setCart([]);

    const params = new URLSearchParams(window.location.search);
    params.delete('payment');
    params.delete('ref');
    const qs = params.toString();
    window.history.replaceState({}, '', window.location.pathname + (qs ? `?${qs}` : ''));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCheckout = () => { setCartOpen(false); setCheckoutOpen(true); };
  const closeCheckout = () => setCheckoutOpen(false);
  const onCheckoutDone = () => { cartHook.setCart([]); setCheckoutOpen(false); };

  useSEO({
    title: lang === 'fr'
      ? 'Eolekare Europe — Skincare naturel Made in Bénin, livré en Europe'
      : 'Eolekare Europe — Natural skincare Made in Benin, shipped to Europe',
    description: lang === 'fr'
      ? 'Découvrez les soins Eolekare en Europe. Beurres natifs, huiles végétales, 100% naturel. Livraison via Mondial Relay, paiement sécurisé.'
      : 'Discover Eolekare skincare in Europe. Native butters, vegetable oils, 100% natural. Delivery via Mondial Relay, secure payment.',
    url: 'https://eolekare.com/europe',
    lang,
  });

  return (
    <>
      <PaymentBanner lang={lang} status={payment?.status} reference={payment?.reference} onClose={() => setPayment(null)} />
      <Nav lang={lang} setLang={setLang} cartCount={cartHook.count} onCartOpen={() => setCartOpen(true)} />
      {cartOpen && (
        <CartDrawer
          lang={lang}
          cart={cartHook.cart}
          total={cartHook.total}
          onUpdate={cartHook.update}
          onRemove={cartHook.remove}
          onClose={() => setCartOpen(false)}
          products={products}
          onCheckout={openCheckout}
        />
      )}
      {checkoutOpen && (
        <CheckoutPage
          cart={cartHook.cart}
          cartTotal={cartHook.total}
          cartCount={cartHook.count}
          onClose={closeCheckout}
          onSuccess={onCheckoutDone}
        />
      )}

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center overflow-hidden" style={{ minHeight: '100vh', background: '#f8cb78', padding: '8rem 2rem 5rem' }}>
        <FloatingFruits variant="hero" />
        <div className="relative z-[2] flex flex-col items-center">
          <p style={{ fontSize: 10, letterSpacing: '0.5em', fontWeight: 300, color: '#000', opacity: 0.65, textTransform: 'uppercase', marginBottom: '2rem' }}>{T[lang].eyebrow}</p>
          <h1 style={{ fontFamily: '"Brown Sugar",cursive', fontSize: 'clamp(72px,11vw,140px)', fontWeight: 300, lineHeight: 0.88, color: '#000', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>EOLEKARE</h1>
          <p style={{ fontFamily: '"Montserrat",sans-serif', fontSize: 10, letterSpacing: '0.38em', fontWeight: 300, color: '#000', opacity: 0.55, textTransform: 'uppercase', marginBottom: '1.8rem' }}>by Eoleeg</p>
          <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 22, fontStyle: 'italic', color: '#000', maxWidth: 440, lineHeight: 1.65, marginBottom: '3rem' }}>{T[lang].tagline}</p>
          <div className="flex gap-6 flex-wrap justify-center">
            <a href="#products" style={{ fontSize: 10, letterSpacing: '0.28em', fontWeight: 300, textTransform: 'uppercase', color: '#fdf6ec', background: '#3b190f', padding: '15px 42px', textDecoration: 'none', transition: 'all 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#5a2d12'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#3b190f'; e.currentTarget.style.transform = ''; }}>
              {T[lang].discover}
            </a>
            {cartHook.count > 0 && (
              <button onClick={() => setCartOpen(true)} style={{ fontSize: 10, letterSpacing: '0.28em', fontWeight: 300, textTransform: 'uppercase', color: '#3b190f', border: '1px solid rgba(0,0,0,0.4)', padding: '14px 42px', background: 'transparent', cursor: 'pointer', fontFamily: 'Jost,sans-serif', display: 'flex', alignItems: 'center', gap: 8 }}>
                {T[lang].nav_cart} ({cartHook.count})
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Double strip */}
      <div style={{ display: 'flex', flexDirection: 'column', background: '#3b190f' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.42em', fontWeight: 300, color: 'rgba(248,203,120,0.55)', textTransform: 'uppercase', textAlign: 'center', padding: '2rem 0 1.5rem' }}>La nature dans chaque texture</p>
        <div className="img-strip" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', height: 260, overflow: 'hidden' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ position: 'relative', overflow: 'hidden' }}>
              <img src={`/images/texture-${i}.jpg`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.7s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,6,2,0.22)' }} />
            </div>
          ))}
        </div>
        <div className="img-strip" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', height: 260, overflow: 'hidden' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ position: 'relative', overflow: 'hidden' }}>
              <img src={`/images/fruit-${i}.jpg`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.7s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,6,2,0.22)' }} />
            </div>
          ))}
        </div>
      </div>

      {/* Ticker */}
      <div style={{ background: '#f8cb78', padding: '1rem 0', overflow: 'hidden' }}>
        <div className="ticker-track" style={{ display: 'flex', gap: '4rem', whiteSpace: 'nowrap' }}>
          {[...Array(2)].flatMap(() => ['Eolekare', '·', T[lang].tagline, '·', '100% Naturel', '·', 'Made in 🇧🇯', '·', 'Pour tous', '·']).map((t, i) => (
            <span key={i} style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 15, fontStyle: 'italic', letterSpacing: '0.1em', color: '#3b190f', flexShrink: 0 }}>{t}</span>
          ))}
        </div>
      </div>

      <Products lang={lang} cartHook={cartHook} />
      <StorySection lang={lang} />
      <HowToSection lang={lang} />
      <ReviewsSection lang={lang} />
      <CommunitySection lang={lang} />
      {/* <Order lang={lang} onCartOpen={() => setCartOpen(true)} /> */}
      <Footer lang={lang} />
    </>
  );
}
