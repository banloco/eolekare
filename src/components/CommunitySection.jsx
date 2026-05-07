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
      cta_ig:  'Suivre @eolekare',
      cta_tt:  'TikTok @eolekare',
    },
    en: {
      eyebrow: 'Join the community',
      tagline: 'On Instagram & TikTok',
      cta_ig:  'Follow @eolekare',
      cta_tt:  'TikTok @eolekare',
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', maxWidth: 600, margin: '0 auto' }}>
            {[
              'https://www.instagram.com/reel/DUizfMFjDIo/embed/',
              'https://www.instagram.com/reel/DQ69CeEDPTl/embed/',
              'https://www.instagram.com/reel/DUqiTbajSHu/embed/',
              'https://www.instagram.com/p/DLHoqYRs9TZ/embed/',
            ].map((src, i) => (
              <div key={i} style={{ aspectRatio: '9/16', overflow: 'hidden', background: '#f0e8d8' }}>
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
    </section>
  );
}
