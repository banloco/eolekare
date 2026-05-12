import BeholdWidget from '@behold/react';

const BEHOLD_FEED_ID = import.meta.env.VITE_BEHOLD_FEED_ID;

/**
 * CommunitySection — section "Rejoins la communauté"
 * Props :
 *  lang      : 'fr' | 'en'
 *  waNumber  : numéro WA (affiché uniquement sur BeninPage)
 */
export default function CommunitySection({ lang = 'fr', waNumber = null }) {
  const t = {
    fr: {
      eyebrow: 'Rejoins la communauté',
      tagline: 'Sur Instagram & TikTok',
      cta_ig:  'Instagram',
      cta_tt:  'TikTok',
    },
    en: {
      eyebrow: 'Join the community',
      tagline: 'On Instagram & TikTok',
      cta_ig:  'Instagram',
      cta_tt:  'TikTok',
    },
  }[lang] || {};

  return (
    <section style={{ background: '#fdf6ec', padding: 'clamp(4rem,7vw,6rem) clamp(1.25rem,4vw,3rem)', textAlign: 'center' }}>
      <p style={{ fontSize: 10, letterSpacing: '0.42em', fontWeight: 300, color: '#7a4f2d', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
        {t.eyebrow}
      </p>
      <h2 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 46, fontWeight: 300, fontStyle: 'italic', color: '#3b190f', marginBottom: '0.5rem' }}>
        @eolekare
      </h2>
      <p style={{ fontSize: 11, fontWeight: 300, color: 'rgba(59,25,15,0.45)', marginBottom: '2.5rem', letterSpacing: '0.08em' }}>
        {t.tagline}
      </p>

        {/* Feed Instagram */}
      <div style={{ maxWidth: 920, margin: '0 auto 2.5rem', minHeight: 300 }}>
        {BEHOLD_FEED_ID ? (
          <BeholdWidget feedId={BEHOLD_FEED_ID} />
        ) : (
          <div className="grid-instagram" style={{ display: 'flex', flexDirection: 'row', gap: '1rem', maxWidth: 1000, margin: '0 auto', overflowX: 'auto' }}>
            {[
              'https://www.instagram.com/reel/DUizfMFjDIo/embed/',
              'https://www.instagram.com/reel/DQ69CeEDPTl/embed/',
              'https://www.instagram.com/reel/DUqiTbajSHu/embed/',
              'https://www.instagram.com/p/DLHoqYRs9TZ/embed/',
            ].map((src, i) => (
              <div key={i} style={{ flex: '0 0 220px', aspectRatio: '9/16', overflow: 'hidden', background: '#f0e8d8' }}>
                <iframe
                  src={src}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  loading="lazy"
                  allowTransparency="true"
                  scrolling="no"
                  title={`Instagram post ${i + 1}`}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Boutons réseaux sociaux */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2.5rem' }}>
        <a
          href="https://instagram.com/eolekare"
          target="_blank"
          rel="noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 32px', background: '#3b190f', color: '#fdf6ec', textDecoration: 'none', fontSize: 10, letterSpacing: '0.25em', fontWeight: 300, textTransform: 'uppercase', fontFamily: 'Jost,sans-serif', transition: 'all 0.3s' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#5a2d12'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#3b190f'; e.currentTarget.style.transform = ''; }}
        >
          <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          {t.cta_ig}
        </a>

        <a
          href="https://tiktok.com/@eolekare"
          target="_blank"
          rel="noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 32px', background: 'transparent', color: '#3b190f', border: '0.5px solid rgba(59,25,15,0.25)', textDecoration: 'none', fontSize: 10, letterSpacing: '0.25em', fontWeight: 300, textTransform: 'uppercase', fontFamily: 'Jost,sans-serif', transition: 'all 0.3s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,25,15,0.06)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = ''; }}
        >
          <svg width={13} height={13} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2H12v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a7.1 7.1 0 00-.79-.05A7.23 7.23 0 002 16.19a7.23 7.23 0 007.12 7.23A7.23 7.23 0 0016.35 16V8.55a8.97 8.97 0 005.25 1.68V6.86a4.86 4.86 0 01-2.01-.17z"/>
          </svg>
          {t.cta_tt}
        </a>
      </div>
    </section>
  );
}
