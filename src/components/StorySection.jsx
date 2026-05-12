import React from 'react';

export default function StorySection({ lang = 'fr' }) {
  const features = lang === 'fr'
    ? [
        ['01', '100% Naturel',   'Beurres natifs, huiles v\u00e9g\u00e9tales, vitamine E.'],
        ['02', 'Made in B\u00e9nin', 'Fabriqu\u00e9 avec amour pour le monde.'],
        ['03', 'Multi-usage',    'Peau, cheveux, corps, ongles, cils.'],
        ['04', 'Parfums uniques','Chaque beurre a son parfum signature.'],
      ]
    : [
        ['01', '100% Natural',   'Native butters, vegetable oils, vitamin E.'],
        ['02', 'Made in Benin',  'Crafted with love for the world.'],
        ['03', 'Multi-use',      'Skin, hair, body, nails, lashes.'],
        ['04', 'Unique scents',  'Each butter has its signature fragrance.'],
      ];

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
            <h2 style={{ fontSize: 38, fontFamily: '"Cormorant Garamond",serif', fontWeight: 300, fontStyle: 'italic', color: 'rgb(250, 209, 73)', lineHeight: 1.15, marginBottom: '2rem' }}>
              {lang === 'fr' ? 'N\u00e9e d\u2019un besoin, pens\u00e9e pour tous.' : 'Born from a need, made for everyone.'}
            </h2>
            <p style={{ fontSize: 9, letterSpacing: '0.32em', fontWeight: 300, color: '#f8cb78c7', textTransform: 'uppercase', marginBottom: '2rem' }}>
              {lang === 'fr' ? 'UN MOT DE LA FONDATRICE' : 'A WORD FROM THE FOUNDER'}
            </p>
            <p style={{ fontSize: 14, fontWeight: 300, color: 'rgba(253,246,236,0.72)', lineHeight: 1.9, marginBottom: '1.4rem' }}>
              {lang === 'fr'
                ? "Quand je me suis ras\u00e9e les cheveux, on m'a dit qu'ils ne repousseraient pas. Plut\u00f4t que d'accepter, je me suis tourn\u00e9e vers les ingr\u00e9dients naturels du B\u00e9nin pour tester diff\u00e9rents soins \u2014 et les r\u00e9sultats ont parl\u00e9 d'eux-m\u00eames."
                : "When I shaved my head, I was told my hair wouldn\u2019t grow back. Rather than accept that, I turned to Benin\u2019s natural ingredients to test different treatments \u2014 and the results spoke for themselves."}
            </p>
            <p style={{ fontSize: 14, fontWeight: 300, color: 'rgba(253,246,236,0.72)', lineHeight: 1.9, marginBottom: '1.4rem' }}>
              {lang === 'fr'
                ? "Eolekare est la solution que j'ai trouv\u00e9e pour moi, et que je partage aujourd'hui avec tous\u00a0: hommes, femmes, enfants \u2014 pour vos cheveux, votre peau, votre corps."
                : "Eolekare is the solution I found for myself, and that I now share with everyone: men, women, children \u2014 for your hair, your skin, your body."}
            </p>
            <p style={{ fontSize: 14, fontWeight: 300, color: 'rgba(253,246,236,0.72)', lineHeight: 1.9, marginBottom: '2rem' }}>
              {lang === 'fr'
                ? "J'esp\u00e8re que ces produits deviendront les v\u00f4tres. Qu'ils tra\u00eeneront dans votre sac, sur votre table de nuit, dans votre salle de bain. Qu'\u00e0 chaque moment \u2014 matin, soir, en voyage \u2014 ils seront l\u00e0 pour adoucir, nourrir et prendre soin de vous."
                : "I hope these products will become yours. That they\u2019ll end up in your bag, on your nightstand, in your bathroom. That at every moment \u2014 morning, evening, on the go \u2014 they\u2019ll be there to soften, nourish and take care of you."}
            </p>
            <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 20, fontStyle: 'italic', color: '#f8cb78' }}>\u2014 @eoleeg</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignSelf: 'center' }}>
            {features.map(([n, ti, d]) => (
              <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingBottom: '1.5rem', borderBottom: '0.5px solid rgba(248,203,120,0.1)' }}>
                <span style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 32, fontWeight: 300, color: 'rgba(248,203,120,0.22)', marginBottom: 4 }}>{n}</span>
                <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 18, color: '#f8cb78', marginBottom: 4 }}>{ti}</p>
                <p style={{ fontSize: 12, fontWeight: 300, color: 'rgba(253,246,236,0.46)', lineHeight: 1.75 }}>{d}</p>
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
