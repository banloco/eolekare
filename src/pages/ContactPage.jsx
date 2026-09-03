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
  lead: { fontSize: 14, color: '#7a4f2d', lineHeight: 1.9, marginBottom: '2rem', borderBottom: '0.5px solid rgba(59,25,15,0.08)', paddingBottom: '2rem' },
  contactCard: { background: '#fff', border: '0.5px solid rgba(59,25,15,0.1)', padding: '2rem', marginBottom: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' },
  icon: { fontSize: 24, flexShrink: 0 },
  label: { fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(59,25,15,0.4)', marginBottom: 6 },
  value: { fontSize: 14, color: '#3b190f', fontFamily: '"Cormorant Garamond", serif', lineHeight: 1.5 },
  footer: { background: '#3b190f', padding: '2rem', textAlign: 'center' },
  footerText: { color: 'rgba(248,203,120,0.35)', fontSize: 10, letterSpacing: '0.12em', marginBottom: '0.4rem' },
};

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '2290148654200';

const DOC_SLUGS = ['mentions', 'cgv', 'remboursement', 'confidentialite'];

const C = {
  fr: {
    h1: 'Contact',
    lead: "Notre équipe est disponible pour répondre à vos questions sur les produits, les commandes ou les livraisons.",
    social_label: 'WhatsApp · Instagram',
    social_note: 'La façon la plus rapide pour nous joindre. Réponse sous 24h.',
    email_label: 'Email',
    hq_label: 'Siège · Bénin',
    hq_value: 'Cotonou, Bénin',
    hq_note: 'Retrait sur place possible sur rendez-vous.',
    track_title: 'Suivi de commande',
    track_body: <>Pour toute question sur votre commande, indiquez votre numéro de référence (format <strong>EK-2026-XXXX</strong>) dans votre message afin que nous puissions vous répondre rapidement.</>,
    footer_tag: 'Cosmétiques naturels · Made in Bénin',
    legal: ['Mentions légales', 'CGV', 'Remboursement', 'Confidentialité'],
    about: 'À propos',
  },
  en: {
    h1: 'Contact',
    lead: "Our team is available to answer your questions about products, orders or deliveries.",
    social_label: 'WhatsApp · Instagram',
    social_note: 'The fastest way to reach us. Reply within 24h.',
    email_label: 'Email',
    hq_label: 'Head office · Benin',
    hq_value: 'Cotonou, Benin',
    hq_note: 'In-person pickup available by appointment.',
    track_title: 'Order tracking',
    track_body: <>For any question about your order, include your reference number (format <strong>EK-2026-XXXX</strong>) in your message so we can get back to you quickly.</>,
    footer_tag: 'Natural cosmetics · Made in Benin',
    legal: ['Legal Notice', 'Terms of Sale', 'Refunds', 'Privacy'],
    about: 'About',
  },
};

export default function ContactPage() {
  const [lang, setLang] = useState('fr');
  const c = C[lang];

  useSEO({
    title: lang === 'fr' ? 'Eolekare — Contact' : 'Eolekare — Contact',
    description: lang === 'fr'
      ? "Contactez l'équipe Eolekare par WhatsApp, Instagram ou email. Commandes, questions, partenariats."
      : 'Contact the Eolekare team via WhatsApp, Instagram or email. Orders, questions, partnerships.',
    url: 'https://eolekare.com/contact',
    lang,
  });

  return (
    <div style={s.body}>
      <header style={s.header}>
        <Link to="/" style={s.logo}>EOLEKARE</Link>
        <nav style={s.nav}>
          <Link to="/benin" style={s.navLink}>Bénin</Link>
          <Link to="/europe" style={s.navLink}>Europe</Link>
          <Link to="/about" style={s.navLink}>{c.about}</Link>
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
        <p style={s.lead}>{c.lead}</p>

        <div style={s.contactCard}>
          <span style={s.icon}>📱</span>
          <div>
            <p style={s.label}>{c.social_label}</p>
            <p style={s.value}>
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" style={{ color: '#3b190f', textDecoration: 'none' }}>WhatsApp</a>
              {' · '}
              <a href="https://instagram.com/eolekare" target="_blank" rel="noreferrer" style={{ color: '#3b190f', textDecoration: 'none' }}>@eolekare</a>
            </p>
            <p style={{ fontSize: 12, color: '#7a4f2d', marginTop: 4 }}>
              {c.social_note}
            </p>
          </div>
        </div>

        <div style={s.contactCard}>
          <span style={s.icon}>📧</span>
          <div>
            <p style={s.label}>{c.email_label}</p>
            <p style={s.value}>
              <a href="mailto:contact@eolekare.com" style={{ color: '#3b190f', textDecoration: 'none' }}>
                contact@eolekare.com
              </a>
            </p>
          </div>
        </div>

        <div style={s.contactCard}>
          <span style={s.icon}>🇧🇯</span>
          <div>
            <p style={s.label}>{c.hq_label}</p>
            <p style={s.value}>{c.hq_value}</p>
            <p style={{ fontSize: 12, color: '#7a4f2d', marginTop: 4 }}>
              {c.hq_note}
            </p>
          </div>
        </div>

        <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: 'rgba(248,203,120,0.1)', border: '0.5px solid rgba(248,203,120,0.3)' }}>
          <p style={{ fontSize: 13, color: '#7a4f2d', lineHeight: 1.9, margin: 0 }}>
            <strong style={{ color: '#3b190f' }}>{c.track_title}</strong><br />
            {c.track_body}
          </p>
        </div>
      </main>

      <footer style={s.footer}>
        <p style={s.footerText}>EOLEKARE · {c.footer_tag}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          {DOC_SLUGS.map((doc, i) => (
            <Link key={doc} to={`/legal?doc=${doc}&lang=${lang}`} style={{ ...s.footerText, textDecoration: 'none', margin: 0 }}>{c.legal[i]}</Link>
          ))}
          <Link to="/about" style={{ ...s.footerText, textDecoration: 'none', margin: 0 }}>{c.about}</Link>
        </div>
      </footer>
    </div>
  );
}
