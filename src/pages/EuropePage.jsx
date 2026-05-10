import React, { useState, useEffect } from 'react';
import FloatingFruits from '../components/FloatingFruits';
import CheckoutPage from './CheckoutPage';
import CommunitySection from '../components/CommunitySection';
import { useProducts } from '../hooks/useProducts';
import { formatEUR } from '../lib/format';

const CART_KEY = 'eolekare_eu_cart';

const T = {
  fr: { eyebrow:'100% Naturel · Made in 🇧🇯 · Pour tous', tagline:'Votre skincare aux parfums uniques', discover:'Découvrir la collection', collection:'Collection', story:'Notre histoire', buy:'Ajouter au panier', added:'Ajouté', soldout:'Épuisé', checkout:'Commander →', nav_cart:'Panier', close:'Fermer', qty:'Quantité', total:'Total', empty:'Votre panier est vide', upsell:'Vous aimerez aussi', details:'Voir les détails', inCart:'dans le panier', modify:'Modifier', secure:'Paiement sécurisé · Shopify', back:'← Retour' },
  en: { eyebrow:'100% Natural · Made in 🇧🇯 · For everyone', tagline:'Your skincare with unique scents', discover:'Discover the collection', collection:'Collection', story:'Our story', buy:'Add to cart', added:'Added', soldout:'Sold out', checkout:'Checkout →', nav_cart:'Cart', close:'Close', qty:'Quantity', total:'Total', empty:'Your cart is empty', upsell:'You might also like', details:'View details', inCart:'in cart', modify:'Edit', secure:'Secure payment · Shopify', back:'← Back' },
};

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
const EU_NAV_LINKS = (t) => [['#story', t.story], ['#products', t.collection]];

function Nav({ lang, setLang, cartCount, onCartOpen }) {
  const t = T[lang];
  const [mobOpen, setMobOpen] = useState(false);
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[100] flex justify-between items-center" style={{ padding: '0.9rem 1.5rem', background: '#f8cb78' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ overflow: 'hidden', height: 52, cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src="/images/Logo Eolekare .png" alt="Eolekare" style={{ width: 180, display: 'block', marginTop: -67 }} />
          </div>
          <span style={{ fontSize: 8, fontWeight: 300, letterSpacing: '0.22em', color: '#7a4f2d', textTransform: 'uppercase' }}>Europe</span>
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

      {mobOpen && (
        <div className="mob-menu md:hidden">
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
                      {item.images?.[0] && <img src={item.images[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 17, color: '#3b190f', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
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
                          {p.images?.[0] && <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 15, color: '#3b190f' }}>{p.name}</p>
                          <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 13, fontStyle: 'italic', color: '#7a4f2d' }}>{formatEUR(p.price_eur)}</p>
                        </div>
                        <button onClick={() => { onUpdate && null; }} style={{ background: '#3b190f', border: 'none', cursor: 'pointer', color: '#fdf6ec', fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'Jost,sans-serif', padding: '7px 12px', whiteSpace: 'nowrap' }}
                          onClick={() => { /* handled by parent */ document.dispatchEvent(new CustomEvent('upsell-add', { detail: p })); }}>
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
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1.2rem', background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#3b190f', opacity: 0.45, zIndex: 1 }}>✕</button>
        <div className="grid-2col">
          {/* Image */}
          <div style={{ height: 400, background: '#f8cb78', overflow: 'hidden', position: 'relative' }}>
            {product.images?.[0]
              ? <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, opacity: 0.3 }}>🫙</div>
            }
            {product.images?.[1] && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <img src={product.images[1]} alt="" style={{ width: 140, height: 140, objectFit: 'contain', borderRadius: '50%', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }} />
              </div>
            )}
          </div>
          {/* Infos */}
          <div style={{ padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {product.format && <p style={{ fontSize: 9, letterSpacing: '0.25em', color: '#7a4f2d', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{product.format}</p>}
            <h2 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 30, fontWeight: 300, color: '#3b190f', marginBottom: '0.8rem' }}>{product.name}</h2>
            <p style={{ fontSize: 12, fontWeight: 300, color: '#7a4f2d', lineHeight: 1.85, marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>{product.description_short || product.description_long || '—'}</p>

            {/* Ingrédients */}
            {product.ingredients && (
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7a4f2d', marginBottom: 6 }}>Ingrédients</p>
                <p style={{ fontSize: 10, fontWeight: 300, color: 'rgba(59,25,15,0.6)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{product.ingredients}</p>
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
              <p style={{ fontSize: 10, letterSpacing: '0.2em', color: 'rgba(59,25,15,0.35)', textTransform: 'uppercase' }}>{t.soldout}</p>
            )}

            {product.stock > 0 && product.stock <= 5 && (
              <p style={{ fontSize: 10, color: '#e67e22', marginTop: '0.8rem', letterSpacing: '0.08em' }}>⚠ Plus que {product.stock} en stock</p>
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
                {f === 'tous' ? (lang === 'fr' ? 'Tous' : 'All') : f}
              </button>
            ))}
          </div>
        )}

        {loading && <p style={{ textAlign: 'center', fontFamily: '"Cormorant Garamond",serif', fontSize: 18, fontStyle: 'italic', color: 'rgba(59,25,15,0.4)' }}>Chargement…</p>}
        {error && <p style={{ textAlign: 'center', color: '#c0392b', fontSize: 11 }}>Erreur : {error}</p>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '2rem', maxWidth: 1000, margin: '0 auto' }}>
          {visible.map(p => {
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
    </>
  );
}

/* ─── STORY ─── */
function Story({ lang }) {
  return (
    <section id="story" style={{ background: '#3b190f', padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,4vw,3rem)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: 0, top: 0, width: '50%', height: '100%', zIndex: 0 }}>
        <img src="/images/story-bg.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.13, filter: 'saturate(0.4)' }} />
      </div>
      <div style={{ maxWidth: 980, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: 10, letterSpacing: '0.4em', fontWeight: 300, color: 'rgba(248,203,120,0.5)', textTransform: 'uppercase', textAlign: 'center', marginBottom: '0.8rem' }}>
          {lang === 'fr' ? 'Notre histoire' : 'Our story'}
        </p>
        <div className="story-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(2rem,5vw,5rem)', alignItems: 'start' }}>
        <div>
          <h2 style={{ fontSize: 38, fontFamily: '"Cormorant Garamond",serif', fontWeight: 300, fontStyle: 'italic', color: 'rgba(248,203,120,0.5)', lineHeight: 1.15, marginBottom: '2rem' }}>
            {lang === 'fr' ? "N\u00e9e d\u2019un besoin, pens\u00e9e pour tous." : 'Born from a need, made for everyone.'}
          </h2>
          <p style={{ fontSize: 9, letterSpacing: '0.32em', fontWeight: 300, color: '#f8cb78', textTransform: 'uppercase', marginBottom: '2rem' }}>
            {lang === 'fr' ? 'UN MOT DE LA FONDATRICE' : 'A WORD FROM THE FOUNDER'}
          </p>
          <p style={{ fontSize: 14, fontWeight: 300, color: 'rgba(253,246,236,0.72)', lineHeight: 1.9, marginBottom: '1.4rem' }}>
            {lang === 'fr' ? "Quand je me suis ras\u00e9e les cheveux, on m'a dit qu'ils ne repousseraient pas. Plut\u00f4t que d'accepter, je me suis tourn\u00e9e vers les ingr\u00e9dients naturels du B\u00e9nin pour tester diff\u00e9rents soins \u2014 et les r\u00e9sultats ont parl\u00e9 d'eux-m\u00eames." : "When I shaved my head, I was told my hair wouldn't grow back. Rather than accept that, I turned to Benin's natural ingredients to test different treatments \u2014 and the results spoke for themselves."}
          </p>
          <p style={{ fontSize: 14, fontWeight: 300, color: 'rgba(253,246,236,0.72)', lineHeight: 1.9, marginBottom: '1.4rem' }}>
            {lang === 'fr' ? "Eolekare est la solution que j'ai trouv\u00e9e pour moi, et que je partage aujourd'hui avec tous : hommes, femmes, enfants \u2014 pour vos cheveux, votre peau, votre corps." : "Eolekare is the solution I found for myself, and that I now share with everyone: men, women, children \u2014 for your hair, your skin, your body."}
          </p>
          <p style={{ fontSize: 14, fontWeight: 300, color: 'rgba(253,246,236,0.72)', lineHeight: 1.9, marginBottom: '2rem' }}>
            {lang === 'fr' ? "J'esp\u00e8re que ces produits deviendront les v\u00f4tres. Qu'ils tra\u00eeneront dans votre sac, sur votre table de nuit, dans votre salle de bain. Qu'\u00e0 chaque moment \u2014 matin, soir, en voyage \u2014 ils seront l\u00e0 pour adoucir, nourrir et prendre soin de vous." : "I hope these products will become yours. That they'll end up in your bag, on your nightstand, in your bathroom. That at every moment \u2014 morning, evening, on the go \u2014 they'll be there to soften, nourish and take care of you."}
          </p>
          <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 20, fontStyle: 'italic', color: '#f8cb78' }}>— @eoleeg</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {(lang === 'fr'
            ? [['01', '100% Naturel', 'Beurres natifs, huiles v\u00e9g\u00e9tales, vitamine E.'], ['02', 'Made in B\u00e9nin', 'Fabriqu\u00e9 avec amour pour le monde.'], ['03', 'Multi-usage', 'Peau, cheveux, corps, ongles, cils.'], ['04', 'Parfums uniques', 'Chaque beurre a son parfum signature.']]
            : [['01', '100% Natural', 'Native butters, vegetable oils, vitamin E.'], ['02', 'Made in Benin', 'Crafted with love for the world.'], ['03', 'Multi-use', 'Skin, hair, body, nails, lashes.'], ['04', 'Unique scents', 'Each butter has its signature fragrance.']]
          ).map(([n, ti, d]) => (
            <div key={n} style={{ display: 'flex', gap: '1.2rem', paddingBottom: '1.5rem', borderBottom: '0.5px solid rgba(248,203,120,0.1)' }}>
              <span style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 32, fontWeight: 300, color: 'rgba(248,203,120,0.22)', minWidth: 40 }}>{n}</span>
              <div>
                <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 18, color: '#f8cb78', marginBottom: 4 }}>{ti}</p>
                <p style={{ fontSize: 12, fontWeight: 300, color: 'rgba(253,246,236,0.46)', lineHeight: 1.75 }}>{d}</p>
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
      {/* Instagram post */}
      <div style={{ maxWidth: 480, margin: '4rem auto 0', position: 'relative', zIndex: 1 }}>
        <iframe
          src="https://www.instagram.com/p/DK-SszQsc60/embed/"
          style={{ width: '100%', height: 560, border: 'none', display: 'block' }}
          loading="lazy"
          allowTransparency="true"
          scrolling="no"
          title="Eolekare Instagram"
        />
      </div>
    </section>
  );
}

/* ─── HOWTO ─── */
function HowTo({ lang }) {
  const steps = lang === 'fr'
    ? [
        { n: '01', t: 'Sur les cheveux', paras: [
          "Prélève une noisette, frotte entre tes mains. Applique sur les longueurs et pointes pour nourrir, réparer et faire briller.",
          "Pour un soin intense, utilise en bain d'huile : applique généreusement, masse profondément le cuir chevelu, laisse poser 30min à 2h sous un bonnet chauffant si possible.",
        ]},
        { n: '02', t: 'Sur le corps', paras: [
          "Sur peau humide après la douche. Masse jusqu'à pénétration complète. Idéal pour la peau, les ongles, les lèvres, les cils, les sourcils et les pieds — partout où ta peau a besoin de douceur.",
        ]},
        { n: '03', t: 'Sur la barbe', paras: [
          "Quelques gouttes réchauffées entre les mains. Masse sur la barbe et la peau en dessous pour adoucir, hydrater et discipliner.",
        ]},
      ]
    : [
        { n: '01', t: 'On hair', paras: [
          "Take a small amount, rub between your hands. Apply to lengths and ends to nourish, repair and add shine.",
          "For an intensive treatment, use as a hot oil bath: apply generously, deeply massage the scalp, leave on 30min to 2h under a warm cap if possible.",
        ]},
        { n: '02', t: 'On body', paras: [
          "Apply to damp skin after the shower. Massage until fully absorbed. Perfect for skin, nails, lips, lashes, brows and feet — anywhere your skin needs softness.",
        ]},
        { n: '03', t: 'On beard', paras: [
          "A few drops warmed between the hands. Massage into the beard and skin beneath to soften, moisturize and tame.",
        ]},
      ];
  return (
    <section id="howto" style={{ background: '#2a1208', padding: 'clamp(4rem,7vw,6rem) clamp(1.25rem,4vw,3rem)' }}>
      <p style={{ fontSize: 10, letterSpacing: '0.4em', fontWeight: 300, color: 'rgba(248,203,120,0.5)', textTransform: 'uppercase', textAlign: 'center', marginBottom: '0.8rem' }}>Rituel Eolekare</p>
      <h2 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 46, fontWeight: 300, color: '#fdf6ec', textAlign: 'center', marginBottom: '4rem' }}>{lang === 'fr' ? 'Comment utiliser' : 'How to use'}</h2>
      <div className="grid-3col" style={{ gap: '2rem', maxWidth: 960, margin: '0 auto' }}>
        {steps.map(({ n, t, paras }) => (
          <div key={n} style={{ border: '0.5px solid rgba(248,203,120,0.15)', padding: '2.5rem 2rem' }}>
            <div style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 56, fontWeight: 300, color: 'rgba(248,203,120,0.12)', lineHeight: 1, marginBottom: '0.5rem' }}>{n}</div>
            <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 22, fontWeight: 300, color: '#f8cb78', marginBottom: '1rem' }}>{t}</p>
            {paras.map((p, i) => (
              <p key={i} style={{ fontSize: 12, fontWeight: 300, color: 'rgba(253,246,236,0.5)', lineHeight: 1.85, marginBottom: i < paras.length - 1 ? '0.8rem' : 0 }}>{p}</p>
            ))}
          </div>
        ))}
      </div>
    </section>
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
      <p style={{ fontSize: 10, color: 'rgba(248,203,120,0.15)' }}>{lang === 'fr' ? '100% Naturel · Made in Bénin · Pour tous' : '100% Natural · Made in Benin · For everyone'} · © 2025 Eolekare by Eoleeg</p>
    </footer>
  );
}

/* ─── PAGE ─── */
export default function EuropePage() {
  const [lang, setLang]         = useState('fr');
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const cartHook = useCart();
  const { products } = useProducts('international');

  const openCheckout = () => { setCartOpen(false); setCheckoutOpen(true); };
  const closeCheckout = () => setCheckoutOpen(false);
  const onCheckoutDone = () => { cartHook.setCart([]); setCheckoutOpen(false); };

  return (
    <>
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
          <h1 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 'clamp(72px,11vw,140px)', fontWeight: 300, lineHeight: 0.88, color: '#000', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>EOLEKARE</h1>
          <p style={{ fontSize: 10, letterSpacing: '0.38em', fontWeight: 300, color: '#000', opacity: 0.55, textTransform: 'uppercase', marginBottom: '1.8rem' }}>by Eoleeg</p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(59,25,15,0.08)', border: '0.5px solid rgba(59,25,15,0.15)', padding: '6px 18px', marginBottom: '1.5rem', borderRadius: 2 }}>
            <span style={{ fontSize: 16 }}>🇪🇺</span>
            <span style={{ fontSize: 9, letterSpacing: '0.25em', fontWeight: 300, color: '#3b190f', textTransform: 'uppercase' }}>Europe · Mondial Relay</span>
          </div>
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

      <Story lang={lang} />
      <Products lang={lang} cartHook={cartHook} />
      <HowTo lang={lang} />
      <CommunitySection lang={lang} />
      {/* <Order lang={lang} onCartOpen={() => setCartOpen(true)} /> */}
      <Footer lang={lang} />
    </>
  );
}
