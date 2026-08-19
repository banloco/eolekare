import React, { useState } from 'react';
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
  lead: { fontSize: 14, color: '#7a4f2d', lineHeight: 1.9, marginBottom: '2rem', borderBottom: '0.5px solid rgba(59,25,15,0.08)', paddingBottom: '2rem' },
  contactCard: { background: '#fff', border: '0.5px solid rgba(59,25,15,0.1)', padding: '2rem', marginBottom: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' },
  icon: { fontSize: 24, flexShrink: 0 },
  label: { fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(59,25,15,0.4)', marginBottom: 6 },
  value: { fontSize: 14, color: '#3b190f', fontFamily: '"Cormorant Garamond", serif', lineHeight: 1.5 },
  footer: { background: '#3b190f', padding: '2rem', textAlign: 'center' },
  footerText: { color: 'rgba(248,203,120,0.35)', fontSize: 10, letterSpacing: '0.12em', marginBottom: '0.4rem' },
};

export default function ContactPage() {
  useSEO({
    title: 'Eolekare — Contact',
    description: 'Contactez l’équipe Eolekare par WhatsApp, Instagram ou email. Commandes, questions, partenariats.',
    url: 'https://eolekare.com/contact',
    lang: 'fr',
  });
  return (
    <div style={s.body}>
      <header style={s.header}>
        <Link to="/" style={s.logo}>EOLEKARE</Link>
        <nav style={s.nav}>
          <Link to="/benin" style={s.navLink}>Bénin</Link>
          <Link to="/europe" style={s.navLink}>Europe</Link>
          <Link to="/about" style={s.navLink}>À propos</Link>
        </nav>
      </header>

      <main style={s.main}>
        <h1 style={s.h1}>Contact</h1>
        <p style={s.lead}>
          Notre équipe est disponible pour répondre à vos questions sur les produits,
          les commandes ou les livraisons.
        </p>

        <div style={s.contactCard}>
          <span style={s.icon}>📱</span>
          <div>
            <p style={s.label}>WhatsApp · Instagram</p>
            <p style={s.value}>@eolekare</p>
            <p style={{ fontSize: 12, color: '#7a4f2d', marginTop: 4 }}>
              La façon la plus rapide pour nous joindre. Réponse sous 24h.
            </p>
          </div>
        </div>

        <div style={s.contactCard}>
          <span style={s.icon}>📧</span>
          <div>
            <p style={s.label}>Email</p>
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
            <p style={s.label}>Siège · Bénin</p>
            <p style={s.value}>Cotonou, Bénin</p>
            <p style={{ fontSize: 12, color: '#7a4f2d', marginTop: 4 }}>
              Retrait sur place possible sur rendez-vous.
            </p>
          </div>
        </div>

        <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: 'rgba(248,203,120,0.1)', border: '0.5px solid rgba(248,203,120,0.3)' }}>
          <p style={{ fontSize: 13, color: '#7a4f2d', lineHeight: 1.9, margin: 0 }}>
            <strong style={{ color: '#3b190f' }}>Suivi de commande</strong><br />
            Pour toute question sur votre commande, indiquez votre numéro de référence
            (format EK-XXXXX) dans votre message afin que nous puissions vous répondre rapidement.
          </p>
        </div>
      </main>

      <footer style={s.footer}>
        <p style={s.footerText}>EOLEKARE · Cosmétiques naturels · Made in Bénin</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <Link to="/legal?doc=mentions" style={{ ...s.footerText, textDecoration: 'none', margin: 0 }}>Mentions légales</Link>
          <Link to="/legal?doc=cgv" style={{ ...s.footerText, textDecoration: 'none', margin: 0 }}>CGV</Link>
          <Link to="/legal?doc=remboursement" style={{ ...s.footerText, textDecoration: 'none', margin: 0 }}>Remboursement</Link>
          <Link to="/legal?doc=confidentialite" style={{ ...s.footerText, textDecoration: 'none', margin: 0 }}>Confidentialité</Link>
          <Link to="/about" style={{ ...s.footerText, textDecoration: 'none', margin: 0 }}>À propos</Link>
        </div>
      </footer>
    </div>
  );
}
