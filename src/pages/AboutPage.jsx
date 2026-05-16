import React from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';

const s = {
  body: { minHeight: '100vh', background: '#fdf6ec', fontFamily: "'Helvetica Neue', Arial, sans-serif" },
  header: { background: '#3b190f', padding: '1.2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' },
  logo: { color: '#f8cb78', fontFamily: '"Cormorant Garamond", serif', fontSize: 22, letterSpacing: '0.3em', textDecoration: 'none', fontWeight: 300 },
  nav: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
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

export default function AboutPage() {
  useSEO({
    title: 'Eolekare — Notre histoire',
    description: 'Découvrez l’histoire d’Eolekare, marque de soins naturels Made in Bénin. Beurres natifs, huiles végétales, pour toute la famille.',
    url: 'https://eolekare.com/about',
    lang: 'fr',
  });
  return (
    <div style={s.body}>
      <header style={s.header}>
        <Link to="/" style={s.logo}>EOLEKARE</Link>
        <nav style={s.nav}>
          <Link to="/benin" style={s.navLink}>Bénin</Link>
          <Link to="/europe" style={s.navLink}>Europe</Link>
          <Link to="/contact" style={s.navLink}>Contact</Link>
        </nav>
      </header>

      <main style={s.main}>
        <h1 style={s.h1}>À propos</h1>
        <p style={{ ...s.lead, borderBottom: '0.5px solid rgba(59,25,15,0.08)', paddingBottom: '2rem' }}>
          Eolekare est une marque de cosmétiques naturels née au Bénin, pensée pour sublimer
          la peau avec les richesses de la nature africaine.
        </p>

        <div style={s.section}>
          <h2 style={s.h2}>Notre histoire</h2>
          <p style={s.p}>
            Fondée par Eoleeg, Eolekare est née d'une conviction profonde : la peau mérite
            d'être nourrie avec des ingrédients purs, tracés de la terre à l'emballage.
            Chaque formule est élaborée au Bénin, en collaboration avec des artisans locaux
            qui maîtrisent les secrets des plantes.
          </p>
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>Nos valeurs</h2>
          <p style={s.p}><strong>Naturalité</strong> — Nos produits sont formulés sans parabènes, sans silicones et sans colorants artificiels. 100% d'origine naturelle.</p>
          <p style={s.p}><strong>Traçabilité</strong> — Chaque ingrédient est sourcé en Afrique de l'Ouest, dans le respect des producteurs locaux.</p>
          <p style={s.p}><strong>Efficacité</strong> — La naturalité ne sacrifie pas les résultats. Nos formules sont testées et approuvées par nos clientes.</p>
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>Où nous trouver</h2>
          <p style={s.p}>
            Eolekare est disponible au Bénin (livraison directe ou retrait) et en Europe
            (livraison domicile ou en point relais Mondial Relay). Nous livrons dans toute la
            France, la Belgique, les Pays-Bas et l'Espagne.
          </p>
        </div>
      </main>

      <footer style={s.footer}>
        <p style={s.footerText}>EOLEKARE · Cosmétiques naturels · Made in Bénin</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem' }}>
          <Link to="/legal" style={{ ...s.footerText, textDecoration: 'none', margin: 0 }}>Mentions légales</Link>
          <Link to="/contact" style={{ ...s.footerText, textDecoration: 'none', margin: 0 }}>Contact</Link>
        </div>
      </footer>
    </div>
  );
}
