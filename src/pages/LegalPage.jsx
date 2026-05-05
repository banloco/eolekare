import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const s = {
  body: { minHeight: '100vh', background: '#fdf6ec', fontFamily: "'Helvetica Neue', Arial, sans-serif" },
  header: { background: '#3b190f', padding: '1.2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' },
  logo: { color: '#f8cb78', fontFamily: '"Cormorant Garamond", serif', fontSize: 22, letterSpacing: '0.3em', textDecoration: 'none', fontWeight: 300 },
  nav: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
  navLink: { color: 'rgba(248,203,120,0.65)', fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', textDecoration: 'none' },
  main: { maxWidth: 760, margin: '0 auto', padding: 'clamp(2rem,6vw,4rem) clamp(1.25rem,4vw,2rem)' },
  tabs: { display: 'flex', gap: 0, marginBottom: '2.5rem', borderBottom: '0.5px solid rgba(59,25,15,0.1)', flexWrap: 'wrap' },
  h1: { fontFamily: '"Cormorant Garamond", serif', fontSize: 46, fontWeight: 300, color: '#3b190f', marginBottom: '0.5rem' },
  h2: { fontFamily: '"Cormorant Garamond", serif', fontSize: 24, fontWeight: 400, color: '#3b190f', marginBottom: '0.8rem', marginTop: '2rem' },
  p: { fontSize: 13, color: '#7a4f2d', lineHeight: 1.9, marginBottom: '1rem' },
  footer: { background: '#3b190f', padding: '2rem', textAlign: 'center' },
  footerText: { color: 'rgba(248,203,120,0.35)', fontSize: 10, letterSpacing: '0.12em', marginBottom: '0.4rem' },
};

const TABS = ['Mentions légales', 'CGV', 'Confidentialité'];

export default function LegalPage() {
  const [tab, setTab] = useState(0);

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
        <h1 style={s.h1}>Informations légales</h1>

        {/* Onglets */}
        <div style={s.tabs}>
          {TABS.map((t, i) => (
            <button key={i} onClick={() => setTab(i)} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '10px 20px',
              fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase',
              color: tab === i ? '#3b190f' : 'rgba(59,25,15,0.4)',
              borderBottom: tab === i ? '1.5px solid #3b190f' : '1.5px solid transparent',
              marginBottom: -1,
            }}>
              {t}
            </button>
          ))}
        </div>

        {/* Mentions légales */}
        {tab === 0 && (
          <div>
            <h2 style={s.h2}>Éditeur</h2>
            <p style={s.p}>
              Eolekare est une marque de Eoleeg, entreprise individuelle basée à Cotonou, Bénin.<br />
              Contact : <a href="mailto:contact@eolekare.com" style={{ color: '#7a4f2d' }}>contact@eolekare.com</a>
            </p>

            <h2 style={s.h2}>Hébergement</h2>
            <p style={s.p}>
              Le site eolekare.com est hébergé par Netlify, Inc. (frontend) et Hetzner Online GmbH (API backend).
            </p>

            <h2 style={s.h2}>Propriété intellectuelle</h2>
            <p style={s.p}>
              L'ensemble du contenu de ce site (textes, images, logos, formulations) est protégé par le droit d'auteur.
              Toute reproduction sans autorisation écrite est interdite.
            </p>
          </div>
        )}

        {/* CGV */}
        {tab === 1 && (
          <div>
            <h2 style={s.h2}>1. Objet</h2>
            <p style={s.p}>
              Les présentes Conditions Générales de Vente régissent toutes les commandes passées sur eolekare.com
              par des clients particuliers, que ce soit depuis le Bénin ou depuis l'Europe.
            </p>

            <h2 style={s.h2}>2. Produits</h2>
            <p style={s.p}>
              Les produits Eolekare sont des cosmétiques naturels. Les prix indiqués sont en FCFA pour le Bénin
              et en EUR pour l'Europe, toutes taxes comprises. Eolekare se réserve le droit de modifier ses prix
              à tout moment.
            </p>

            <h2 style={s.h2}>3. Paiement</h2>
            <p style={s.p}>
              Les paiements au Bénin s'effectuent via FedaPay (Mobile Money). Les paiements en Europe
              s'effectuent par virement ou paiement en ligne sécurisé via Stripe.
              Le paiement est dû à la commande.
            </p>

            <h2 style={s.h2}>4. Livraison</h2>
            <p style={s.p}>
              <strong>Bénin</strong> : livraison sous 2 à 5 jours ouvrables à Cotonou et environs. Retrait possible.<br />
              <strong>Europe</strong> : livraison en 5 à 12 jours ouvrables. Livraison à domicile ou en point relais
              Mondial Relay. Les frais de port sont indiqués lors du tunnel de commande.
            </p>

            <h2 style={s.h2}>5. Retours</h2>
            <p style={s.p}>
              Pour des raisons d'hygiène, les produits cosmétiques ouverts ne peuvent pas être retournés.
              En cas de produit défectueux ou d'erreur de commande, contactez-nous dans les 48h suivant
              la réception à <a href="mailto:contact@eolekare.com" style={{ color: '#7a4f2d' }}>contact@eolekare.com</a>.
            </p>

            <h2 style={s.h2}>6. Droit applicable</h2>
            <p style={s.p}>
              Ces CGV sont soumises au droit béninois. Tout litige sera porté devant les juridictions
              compétentes de Cotonou, Bénin.
            </p>
          </div>
        )}

        {/* Confidentialité */}
        {tab === 2 && (
          <div>
            <h2 style={s.h2}>Données collectées</h2>
            <p style={s.p}>
              Lors d'une commande, nous collectons : nom, prénom, email, numéro de téléphone, adresse de livraison.
              Ces données sont nécessaires au traitement et à l'expédition de votre commande.
            </p>

            <h2 style={s.h2}>Utilisation des données</h2>
            <p style={s.p}>
              Vos données personnelles sont utilisées exclusivement pour :<br />
              — Le traitement et le suivi de votre commande<br />
              — L'envoi de la confirmation de commande par email<br />
              — La communication liée à votre livraison
            </p>
            <p style={s.p}>
              Vos données ne sont jamais vendues ou partagées avec des tiers à des fins commerciales.
            </p>

            <h2 style={s.h2}>Prestataires de paiement</h2>
            <p style={s.p}>
              Le paiement est traité par FedaPay (Bénin). Ces prestataires disposent de leurs propres
              politiques de confidentialité.
            </p>

            <h2 style={s.h2}>Vos droits (RGPD)</h2>
            <p style={s.p}>
              Conformément au RGPD (pour les résidents européens), vous disposez d'un droit d'accès,
              de rectification et de suppression de vos données.
              Contactez-nous à <a href="mailto:contact@eolekare.com" style={{ color: '#7a4f2d' }}>contact@eolekare.com</a>.
            </p>

            <h2 style={s.h2}>Cookies</h2>
            <p style={s.p}>
              Ce site n'utilise pas de cookies de tracking ou de publicité. Seul un token d'authentification
              local (localStorage) est utilisé pour la session admin.
            </p>
          </div>
        )}
      </main>

      <footer style={s.footer}>
        <p style={s.footerText}>EOLEKARE · Cosmétiques naturels · Made in Bénin</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem' }}>
          <Link to="/about" style={{ ...s.footerText, textDecoration: 'none', margin: 0 }}>À propos</Link>
          <Link to="/contact" style={{ ...s.footerText, textDecoration: 'none', margin: 0 }}>Contact</Link>
        </div>
      </footer>
    </div>
  );
}
