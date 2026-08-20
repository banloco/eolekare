import React, { useState } from 'react';

/* ─── Card with hover reveal ─── */
function HowToCard({ n, t, img, paras }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        overflow: 'hidden',
        border: '0.5px solid rgba(248,203,120,0.15)',
        aspectRatio: '3/4',
        cursor: 'default',
      }}
    >
      {/* Background image */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: img
          ? `url(${img}) center/cover no-repeat`
          : 'linear-gradient(160deg, #3b190f 0%, #2a1208 100%)',
        transition: 'transform 0.6s cubic-bezier(.4,0,.2,1)',
        transform: hovered ? 'scale(1.06)' : 'scale(1)',
      }} />

      {/* Dark overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: hovered
          ? 'linear-gradient(to top, rgba(42,18,8,0.97) 0%, rgba(42,18,8,0.72) 100%)'
          : 'linear-gradient(to top, rgba(42,18,8,0.55) 0%, rgba(42,18,8,0.08) 60%)',
        transition: 'background 0.5s ease',
      }} />

      {/* Step number — fades out on hover */}
      <div style={{
        position: 'absolute',
        top: '1.5rem',
        left: '1.5rem',
        fontFamily: '"Cormorant Garamond",serif',
        fontSize: 64,
        fontWeight: 300,
        color: 'rgba(248,203,120,0.22)',
        lineHeight: 1,
        transition: 'opacity 0.35s ease',
        opacity: hovered ? 0 : 1,
      }}>{n}</div>

      {/* Bottom content */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: hovered ? '2rem 1.8rem 2.5rem' : '1.5rem 1.8rem',
        transition: 'padding 0.5s ease',
      }}>
        {/* Title */}
        <p style={{
          fontFamily: '"Cormorant Garamond",serif',
          fontSize: 24,
          fontWeight: 300,
          color: '#f8cb78',
          marginBottom: hovered ? '1rem' : 0,
          transition: 'margin 0.4s ease',
        }}>{t}</p>

        {/* Text — slides in on hover */}
        <div style={{
          maxHeight: hovered ? '300px' : 0,
          overflow: 'hidden',
          opacity: hovered ? 1 : 0,
          transition: 'max-height 0.55s cubic-bezier(.4,0,.2,1), opacity 0.4s ease 0.1s',
        }}>
          {paras.map((p, i) => (
            <p key={i} style={{
              fontSize: 12,
              fontWeight: 300,
              color: 'rgba(253,246,236,0.65)',
              lineHeight: 1.85,
              marginBottom: i < paras.length - 1 ? '0.7rem' : 0,
            }}>{p}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main section ─── */
export default function HowToSection({ lang = 'fr' }) {
  const steps = lang === 'fr'
    ? [
        {
          n: '01',
          t: 'Sur les cheveux',
          img: '/images/howto-01.jpg',
          paras: [
            "Prélève une noisette, frotte entre tes mains. Applique sur les longueurs et pointes pour nourrir, réparer et faire briller.",
            "Pour un soin intense, utilise en bain d'huile\u00a0: applique généreusement, masse profondément le cuir chevelu, laisse poser 30min à 2h sous un bonnet chauffant si possible.",
          ],
        },
        {
          n: '02',
          t: 'Sur le corps',
          img: '/images/howto-02.jpg',
          paras: [
            "Sur peau humide après la douche. Masse jusqu'à pénétration complète. Idéal pour la peau, les ongles, les lèvres, les cils, les sourcils et les pieds \u2014 partout où ta peau a besoin de douceur.",
          ],
        },
        {
          n: '03',
          t: 'Sur la barbe',
          img: '/images/howto-03.jpeg',
          paras: [
            "Quelques gouttes réchauffées entre les mains. Masse sur la barbe et la peau en dessous pour adoucir, hydrater et discipliner.",
          ],
        },
      ]
    : [
        {
          n: '01',
          t: 'On hair',
          img: '/images/howto-01.jpg',
          paras: [
            "Take a small amount, rub between your hands. Apply to lengths and ends to nourish, repair and add shine.",
            "For an intensive treatment, use as a hot oil bath: apply generously, deeply massage the scalp, leave on 30min to 2h under a warm cap if possible.",
          ],
        },
        {
          n: '02',
          t: 'On body',
          img: '/images/howto-02.jpg',
          paras: [
            "Apply to damp skin after the shower. Massage until fully absorbed. Perfect for skin, nails, lips, lashes, brows and feet \u2014 anywhere your skin needs softness.",
          ],
        },
        {
          n: '03',
          t: 'On beard',
          img: '/images/howto-03.jpeg',
          paras: [
            "A few drops warmed between the hands. Massage into the beard and skin beneath to soften, moisturize and tame.",
          ],
        },
      ];

  return (
    <section id="howto" style={{ background: '#2a1208', padding: 'clamp(4rem,7vw,6rem) clamp(1.25rem,4vw,3rem)' }}>
      <p style={{ fontSize: 10, letterSpacing: '0.4em', fontWeight: 300, color: 'rgba(248,203,120,0.5)', textTransform: 'uppercase', textAlign: 'center', marginBottom: '0.8rem' }}>
        Rituel Eolekare
      </p>
      <h2 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 46, fontWeight: 300, color: '#fdf6ec', textAlign: 'center', marginBottom: '4rem' }}>
        {lang === 'fr' ? 'Comment utiliser' : 'How to use'}
      </h2>
      <div className="grid-3col" style={{ gap: '2rem', maxWidth: 960, margin: '0 auto' }}>
        {steps.map((step) => (
          <HowToCard key={step.n} {...step} />
        ))}
      </div>
    </section>
  );
}
