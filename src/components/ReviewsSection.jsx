import React from 'react';

/* Ordre : blanc karité / beurre doré / mangue / avocat — progression chromatique */
const REVIEWS = [
  { img: '/avis/WhatsApp%20Image%202026-05-10%20at%202.08.29%20PM%20(1).jpeg', rot: '-5deg' },
  { img: '/avis/WhatsApp%20Image%202026-05-10%20at%202.08.28%20PM.jpeg',       rot: '3.5deg' },
  { img: '/avis/WhatsApp%20Image%202026-05-10%20at%202.08.29%20PM.jpeg',       rot: '-2.5deg' },
  { img: '/avis/WhatsApp%20Image%202026-05-10%20at%202.08.28%20PM%20(1).jpeg', rot: '4.5deg' },
];

export default function ReviewsSection({ lang = 'fr' }) {
  return (
    <section style={{
      background: '#2a1208',
      padding: 'clamp(5rem,10vw,8rem) clamp(1.25rem,4vw,3rem)',
      overflow: 'hidden',
      position: 'relative',
    }}>

      {/* Lueur ambrée centrale */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        width: '90vw', height: '90vw', maxWidth: 900, maxHeight: 900,
        transform: 'translate(-50%,-50%)',
        background: 'radial-gradient(ellipse at center, rgba(248,203,120,0.07) 0%, transparent 62%)',
        pointerEvents: 'none',
      }} />

      {/* En-tête */}
      <div style={{ textAlign: 'center', marginBottom: 'clamp(3rem,6vw,5rem)', position: 'relative', zIndex: 1 }}>
        <p style={{
          fontSize: 10, letterSpacing: '0.45em', fontFamily: 'Jost,sans-serif',
          fontWeight: 300, color: '#f8cb78', textTransform: 'uppercase',
          marginBottom: '1.2rem', opacity: 0.7,
        }}>
          {lang === 'fr' ? 'Ce que vous dites' : 'What you say'}
        </p>
        <h2 style={{
          fontFamily: '"Cormorant Garamond",serif',
          fontSize: 'clamp(2.4rem,5vw,3.8rem)',
          fontWeight: 300, fontStyle: 'italic',
          color: '#fdf6ec', lineHeight: 1.15, margin: 0,
        }}>
          {lang === 'fr' ? 'Ils nous font confiance' : 'They trust us'}
        </h2>
        <div style={{ width: 40, height: '0.5px', background: '#f8cb78', margin: '2rem auto 0', opacity: 0.3 }} />
      </div>

      {/* Carrousel de mockups téléphone */}
      <div className="reviews-carousel" style={{
        display: 'flex',
        gap: 'clamp(1.8rem,3.5vw,3rem)',
        justifyContent: 'center',
        alignItems: 'center',
        overflowX: 'auto',
        paddingBottom: '2.5rem',
        paddingTop: '2rem',
        paddingLeft: '1rem',
        paddingRight: '1rem',
        maxWidth: 1080,
        margin: '0 auto',
        position: 'relative',
        zIndex: 1,
      }}>
        {REVIEWS.map((r, i) => (
          <div
            key={i}
            style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem' }}
          >
            {/* Cadre téléphone */}
            <div
              style={{
                width: 'clamp(152px,14.5vw,188px)',
                height: 'clamp(334px,32vw,414px)',
                borderRadius: 30,
                border: '5px solid rgba(248,203,120,0.2)',
                overflow: 'hidden',
                transform: `rotate(${r.rot})`,
                boxShadow: '0 22px 60px rgba(0,0,0,0.65), 0 0 0 1px rgba(248,203,120,0.05)',
                transition: 'transform 0.6s cubic-bezier(.34,1.56,.64,1), box-shadow 0.6s ease',
                cursor: 'pointer',
                position: 'relative',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'rotate(0deg) translateY(-18px) scale(1.06)';
                e.currentTarget.style.boxShadow = '0 45px 90px rgba(0,0,0,0.7), 0 0 0 1.5px rgba(248,203,120,0.35), 0 0 55px rgba(248,203,120,0.12)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = `rotate(${r.rot})`;
                e.currentTarget.style.boxShadow = '0 22px 60px rgba(0,0,0,0.65), 0 0 0 1px rgba(248,203,120,0.05)';
              }}
            >
              <img
                src={r.img}
                alt="Avis client Eolekare"
                loading="lazy"
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'cover', objectPosition: 'center top',
                  display: 'block',
                }}
              />
              {/* Reflet subtil en haut du téléphone */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '28%',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 100%)',
                pointerEvents: 'none',
                borderRadius: '24px 24px 0 0',
              }} />
            </div>
            {/* Étoiles */}
            <p style={{
              color: '#f8cb78', fontSize: 13, letterSpacing: '0.14em',
              opacity: 0.72, fontFamily: 'Jost,sans-serif', margin: 0,
            }}>
              ★★★★★
            </p>
          </div>
        ))}
      </div>

      {/* Citation de clôture */}
      <p style={{
        textAlign: 'center',
        marginTop: 'clamp(2rem,4vw,3.5rem)',
        fontFamily: '"Cormorant Garamond",serif',
        fontSize: 'clamp(1rem,1.8vw,1.25rem)',
        fontStyle: 'italic',
        color: 'rgba(253,246,236,0.42)',
        letterSpacing: '0.04em',
        position: 'relative', zIndex: 1,
      }}>
        {lang === 'fr'
          ? 'Des r\u00e9sultats qui parlent d\u2019eux-m\u00eames.'
          : 'Results that speak for themselves.'}
      </p>
    </section>
  );
}
