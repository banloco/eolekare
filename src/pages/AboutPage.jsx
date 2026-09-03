import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';

const s = {
  body: { minHeight: '100vh', background: '#fdf6ec', fontFamily: "'Helvetica Neue', Arial, sans-serif" },
  header: { background: '#3b190f', padding: '1.2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' },
  logo: { color: '#f8cb78', fontFamily: '"Cormorant Garamond", serif', fontSize: 22, letterSpacing: '0.3em', textDecoration: 'none', fontWeight: 300 },
  nav: { display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' },
  navLink: { color: 'rgba(248,203,120,0.65)', fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', textDecoration: 'none' },
  main: { maxWidth: 760, margin: '0 auto', padding: 'clamp(2rem,6vw,4rem) clamp(1.25rem,4vw,2rem)' },
  h1: { fontFamily: '"Cormorant Garamond", serif', fontSize: 46, fontWeight: 300, color: '#3b190f', marginBottom: '0.5rem' },
  lead: { fontSize: 14, color: '#7a4f2d', lineHeight: 1.9, marginBottom: '2rem' },
  section: { marginBottom: '3rem' },
  h2: { fontFamily: '"Cormorant Garamond", serif', fontSize: 26, fontWeight: 400, color: '#3b190f', marginBottom: '1rem', borderBottom: '0.5px solid rgba(59,25,15,0.1)', paddingBottom: '0.5rem' },
  p: { fontSize: 13, color: '#7a4f2d', lineHeight: 1.9, marginBottom: '1rem' },
  footer: { background: '#3b190f', padding: '2rem', textAlign: 'center' },
  footerText: { color: 'rgba(248,203,120,0.35)', fontSize: 10, letterSpacing: '0.12em', marginBottom: '0.4rem' },
};

const C = {
  fr: {
    h1: 'À propos',
    lead: "Eolekare est une marque de cosmétiques naturels née au Bénin, pensée pour sublimer la peau avec les richesses de la nature africaine.",
    story_h2: 'Notre histoire',
    story_p: "Fondée par Eoleeg, Eolekare est née d'une conviction profonde : la peau mérite d'être nourrie avec des ingrédients purs, tracés de la terre à l'emballage. Chaque formule est élaborée au Bénin, en collaboration avec des artisans locaux qui maîtrisent les secrets des plantes.",
    values_h2: 'Nos valeurs',
    value_natural: <><strong>Naturalité</strong> — Nos produits sont formulés sans parabènes, sans silicones et sans colorants artificiels. 100% d'origine naturelle.</>,
    value_trace: <><strong>Traçabilité</strong> — Chaque ingrédient est sourcé en Afrique de l'Ouest, dans le respect des producteurs locaux.</>,
    value_effi: <><strong>Efficacité</strong> — La naturalité ne sacrifie pas les résultats. Nos formules sont testées et approuvées par nos clientes.</>,
    where_h2: 'Où nous trouver',
    where_p: "Eolekare est disponible au Bénin (livraison directe ou retrait) et en Europe (livraison à domicile ou en point relais Mondial Relay). Nous livrons en France, Belgique, Luxembourg, Pays-Bas, Allemagne, Espagne, Portugal, Italie, Autriche et Pologne.",
    footer_tag: 'Cosmétiques naturels · Made in Bénin',
    legal: ['Mentions légales', 'CGV', 'Remboursement', 'Confidentialité'],
    contact: 'Contact',
  },
  en: {
    h1: 'About',
    lead: "Eolekare is a natural cosmetics brand born in Benin, designed to nourish the skin with the riches of African nature.",
    story_h2: 'Our story',
    story_p: "Founded by Eoleeg, Eolekare grew out of a deep conviction: skin deserves to be nourished with pure ingredients, traced from the soil to the packaging. Every formula is made in Benin, in partnership with local artisans who know the secrets of plants.",
    values_h2: 'Our values',
    value_natural: <><strong>Natural</strong> — Our products are formulated without parabens, silicones or artificial dyes. 100% of natural origin.</>,
    value_trace: <><strong>Traceability</strong> — Every ingredient is sourced in West Africa, with respect for local producers.</>,
    value_effi: <><strong>Effectiveness</strong> — Being natural doesn't mean compromising on results. Our formulas are tested and approved by our customers.</>,
    where_h2: 'Where to find us',
    where_p: "Eolekare is available in Benin (direct delivery or pickup) and in Europe (home delivery or Mondial Relay pickup point). We ship to France, Belgium, Luxembourg, the Netherlands, Germany, Spain, Portugal, Italy, Austria and Poland.",
    footer_tag: 'Natural cosmetics · Made in Benin',
    legal: ['Legal Notice', 'Terms of Sale', 'Refunds', 'Privacy'],
    contact: 'Contact',
  },
};

const DOC_SLUGS = ['mentions', 'cgv', 'remboursement', 'confidentialite'];

export default function AboutPage() {
  const [lang, setLang] = useState('fr');
  const c = C[lang];

  useSEO({
    title: lang === 'fr' ? 'Eolekare — Notre histoire' : 'Eolekare — Our story',
    description: lang === 'fr'
      ? "Découvrez l'histoire d'Eolekare, marque de soins naturels Made in Bénin. Beurres natifs, huiles végétales, pour toute la famille."
      : 'Discover the story of Eolekare, a natural skincare brand Made in Benin. Native butters, vegetable oils, for the whole family.',
    url: 'https://eolekare.com/about',
    lang,
  });

  return (
    <div style={s.body}>
      <header style={s.header}>
        <Link to="/" style={s.logo}>EOLEKARE</Link>
        <nav style={s.nav}>
          <Link to="/benin" style={s.navLink}>Bénin</Link>
          <Link to="/europe" style={s.navLink}>Europe</Link>
          <Link to="/contact" style={s.navLink}>Contact</Link>
          <div style={{ display: 'flex', gap: 2 }}>
            {['fr', 'en'].map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                background: lang === l ? '#f8cb78' : 'transparent',
                color: lang === l ? '#3b190f' : 'rgba(248,203,120,0.65)',
                border: '0.5px solid rgba(248,203,120,0.35)', padding: '4px 9px', fontSize: 9,
                letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all 0.2s',
              }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main style={s.main}>
        <h1 style={s.h1}>{c.h1}</h1>
        <p style={{ ...s.lead, borderBottom: '0.5px solid rgba(59,25,15,0.08)', paddingBottom: '2rem' }}>
          {c.lead}
        </p>

        <div style={s.section}>
          <h2 style={s.h2}>{c.story_h2}</h2>
          <p style={s.p}>{c.story_p}</p>
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>{c.values_h2}</h2>
          <p style={s.p}>{c.value_natural}</p>
          <p style={s.p}>{c.value_trace}</p>
          <p style={s.p}>{c.value_effi}</p>
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>{c.where_h2}</h2>
          <p style={s.p}>{c.where_p}</p>
        </div>
      </main>

      <footer style={s.footer}>
        <p style={s.footerText}>EOLEKARE · {c.footer_tag}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          {DOC_SLUGS.map((doc, i) => (
            <Link key={doc} to={`/legal?doc=${doc}&lang=${lang}`} style={{ ...s.footerText, textDecoration: 'none', margin: 0 }}>{c.legal[i]}</Link>
          ))}
          <Link to="/contact" style={{ ...s.footerText, textDecoration: 'none', margin: 0 }}>{c.contact}</Link>
        </div>
      </footer>
    </div>
  );
}
