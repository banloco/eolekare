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
  tabs: { display: 'flex', gap: 0, marginBottom: '2.5rem', borderBottom: '0.5px solid rgba(59,25,15,0.1)', flexWrap: 'wrap' },
  h1: { fontFamily: '"Cormorant Garamond", serif', fontSize: 46, fontWeight: 300, color: '#3b190f', marginBottom: '0.5rem' },
  h2: { fontFamily: '"Cormorant Garamond", serif', fontSize: 24, fontWeight: 400, color: '#3b190f', marginBottom: '0.8rem', marginTop: '2rem' },
  p: { fontSize: 13, color: '#7a4f2d', lineHeight: 1.9, marginBottom: '1rem' },
  ul: { fontSize: 13, color: '#7a4f2d', lineHeight: 1.9, marginBottom: '1rem', paddingLeft: '1.5rem' },
  footer: { background: '#3b190f', padding: '2rem', textAlign: 'center' },
  footerText: { color: 'rgba(248,203,120,0.35)', fontSize: 10, letterSpacing: '0.12em', marginBottom: '0.4rem' },
};

const TABS = ['Mentions légales', 'CGV', 'Remboursement', 'Confidentialité'];

export default function LegalPage() {
  const [tab, setTab] = useState(0);
  useSEO({
    title: 'Eolekare — Mentions légales, CGV & Politique de confidentialité',
    description: 'Mentions légales, conditions générales de vente, politique de remboursement et politique de confidentialité d\'Eolekare.',
    url: 'https://eolekare.com/legal',
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

        {/* ── 1. MENTIONS LÉGALES ── */}
        {tab === 0 && (
          <div>
            <h2 style={s.h2}>Éditeur du site</h2>
            <p style={s.p}>
              Le site <strong>www.eolekare.com</strong> est édité par :<br />
              <strong>Eole &amp; Co</strong> (nom commercial : Eolekare)<br />
              Entreprise individuelle (auto-entreprise)<br />
              SIRET : 933 699 969 00012<br />
              Adresse : 240 avenue des Grésillons, 92600 Asnières-sur-Seine, France<br />
              Email : <a href="mailto:contact@eolekare.com" style={{ color: '#7a4f2d' }}>contact@eolekare.com</a><br />
              Téléphone : +229 48 65 42 00
            </p>

            <h2 style={s.h2}>Directrice de la publication</h2>
            <p style={s.p}>Eole Gauthé, fondatrice d'Eolekare.</p>

            <h2 style={s.h2}>Hébergement</h2>
            <p style={s.p}>
              Le site eolekare.com est hébergé par <strong>Netlify, Inc.</strong> (frontend) et <strong>Hetzner Online GmbH</strong> (API backend).
            </p>

            <h2 style={s.h2}>Développement du site</h2>
            <p style={s.p}>Site développé par Fortuné (développeur indépendant).</p>

            <h2 style={s.h2}>Propriété intellectuelle</h2>
            <p style={s.p}>
              L'ensemble des contenus présents sur le site eolekare.com (textes, images, logos, photographies,
              vidéos, éléments graphiques) est la propriété exclusive d'Eole &amp; Co, sauf mention contraire.
              Toute reproduction, représentation, modification ou exploitation, totale ou partielle,
              sans autorisation écrite préalable, est interdite.
            </p>

            <h2 style={s.h2}>Données personnelles</h2>
            <p style={s.p}>
              Les données collectées sur ce site sont traitées conformément à notre Politique de confidentialité
              (voir l'onglet « Confidentialité »).
            </p>
          </div>
        )}

        {/* ── 2. CGV ── */}
        {tab === 1 && (
          <div>
            <h2 style={s.h2}>Article 1 — Objet</h2>
            <p style={s.p}>
              Les présentes CGV régissent les ventes de produits cosmétiques réalisées sur le site eolekare.com
              entre Eole &amp; Co (« le Vendeur ») et toute personne physique effectuant un achat (« le Client »).
            </p>

            <h2 style={s.h2}>Article 2 — Produits</h2>
            <p style={s.p}>
              Eolekare commercialise des beurres et soins cosmétiques naturels (mangue, avocat, coco) fabriqués
              au Bénin. Les caractéristiques essentielles des produits sont présentées sur chaque fiche produit.
            </p>

            <h2 style={s.h2}>Article 3 — Prix</h2>
            <p style={s.p}>
              Les prix sont indiqués en euros (€) TTC pour les livraisons en France, et en francs CFA (XOF) pour
              les livraisons au Bénin. Le Vendeur se réserve le droit de modifier ses prix à tout moment, les
              produits étant facturés sur la base du tarif en vigueur au moment de la validation de la commande.
            </p>

            <h2 style={s.h2}>Article 4 — Commande</h2>
            <p style={s.p}>
              Toute commande passée sur le site implique l'acceptation pleine et entière des présentes CGV.
              La commande est confirmée après validation du paiement.
            </p>

            <h2 style={s.h2}>Article 5 — Paiement</h2>
            <p style={s.p}>Le paiement s'effectue en ligne, de façon sécurisée :</p>
            <ul style={s.ul}>
              <li>Par carte bancaire (<strong>Stripe</strong>) pour les commandes internationales et en France</li>
              <li>Par <strong>FedaPay</strong> pour les commandes au Bénin</li>
            </ul>

            <h2 style={s.h2}>Article 6 — Livraison</h2>
            <p style={s.p}>
              <strong>France</strong> : livraison via Mondial Relay Pro, en point relais ou à domicile selon
              l'option choisie au moment de la commande. Délai indicatif : 3 à 5 jours ouvrés à compter de
              l'expédition.<br /><br />
              <strong>Bénin (Cotonou et environs)</strong> : livraison sous un délai minimum de 24 heures à
              compter de la validation de la commande.<br /><br />
              Les délais de livraison sont donnés à titre indicatif et peuvent varier selon la destination,
              la disponibilité des produits et les conditions logistiques. Eolekare ne saurait être tenue
              responsable des retards imputables au transporteur.
            </p>

            <h2 style={s.h2}>Article 7 — Droit de rétractation</h2>
            <p style={s.p}>
              Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne
              s'applique pas aux produits descellés qui ne peuvent être renvoyés pour des raisons d'hygiène
              ou de protection de la santé, une fois ouverts par le Client. Voir la Politique de remboursement
              pour le détail.
            </p>

            <h2 style={s.h2}>Article 8 — Responsabilité</h2>
            <p style={s.p}>
              Eolekare ne saurait être tenue responsable des dommages résultant d'une mauvaise utilisation
              des produits ou du non-respect des précautions d'usage indiquées sur l'emballage.
            </p>

            <h2 style={s.h2}>Article 9 — Service client</h2>
            <p style={s.p}>
              Pour toute question relative à une commande :{' '}
              <a href="mailto:contact@eolekare.com" style={{ color: '#7a4f2d' }}>contact@eolekare.com</a>
              {' '}/ +229 48 65 42 00
            </p>

            <h2 style={s.h2}>Article 10 — Droit applicable</h2>
            <p style={s.p}>
              Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable
              sera recherchée avant toute action judiciaire.
            </p>
          </div>
        )}

        {/* ── 3. POLITIQUE DE REMBOURSEMENT ── */}
        {tab === 2 && (
          <div>
            <h2 style={s.h2}>Produits scellés (non ouverts)</h2>
            <p style={s.p}>
              Vous disposez d'un délai de <strong>14 jours</strong> à compter de la réception de votre commande
              pour exercer votre droit de rétractation, à condition que le produit soit retourné dans son
              emballage d'origine, non ouvert et non descellé.
            </p>

            <h2 style={s.h2}>Produits ouverts / descellés</h2>
            <p style={s.p}>
              Pour des raisons d'hygiène et de protection de la santé, les produits cosmétiques descellés ne
              peuvent ni être repris ni remboursés une fois ouverts, conformément à l'article L221-28 du
              Code de la consommation.
            </p>

            <h2 style={s.h2}>Produits défectueux ou erreur de commande</h2>
            <p style={s.p}>
              Si vous recevez un produit défectueux, endommagé ou différent de votre commande, contactez-nous
              sous <strong>48h</strong> à{' '}
              <a href="mailto:contact@eolekare.com" style={{ color: '#7a4f2d' }}>contact@eolekare.com</a>{' '}
              avec photo à l'appui. Un remboursement ou un échange vous sera proposé sans frais.
            </p>

            <h2 style={s.h2}>Modalités de retour</h2>
            <p style={s.p}>
              Pour toute demande de retour éligible, contactez{' '}
              <a href="mailto:contact@eolekare.com" style={{ color: '#7a4f2d' }}>contact@eolekare.com</a>.
              Les frais de retour sont à la charge du Client, sauf en cas de produit défectueux ou d'erreur
              du Vendeur.
            </p>

            <h2 style={s.h2}>Délai de remboursement</h2>
            <p style={s.p}>
              Le remboursement est effectué dans un délai de <strong>14 jours</strong> à compter de la
              réception du produit retourné, via le même moyen de paiement que celui utilisé lors de l'achat.
            </p>
          </div>
        )}

        {/* ── 4. POLITIQUE DE CONFIDENTIALITÉ ── */}
        {tab === 3 && (
          <div>
            <h2 style={s.h2}>Responsable du traitement</h2>
            <p style={s.p}>
              Eole &amp; Co (Eolekare), 240 avenue des Grésillons, 92600 Asnières-sur-Seine —{' '}
              <a href="mailto:contact@eolekare.com" style={{ color: '#7a4f2d' }}>contact@eolekare.com</a>
            </p>

            <h2 style={s.h2}>Données collectées</h2>
            <p style={s.p}>Lors de votre navigation et de vos achats sur eolekare.com, nous collectons :</p>
            <ul style={s.ul}>
              <li>Nom, prénom, adresse email, adresse postale, numéro de téléphone</li>
              <li>Données de commande et de paiement (traitées par nos prestataires Stripe et FedaPay, non stockées par Eolekare)</li>
              <li>Données de navigation (cookies, voir ci-dessous)</li>
            </ul>

            <h2 style={s.h2}>Finalités du traitement</h2>
            <ul style={s.ul}>
              <li>Traitement et livraison des commandes</li>
              <li>Gestion de la relation client</li>
              <li>Envoi de communications commerciales (avec votre consentement)</li>
              <li>Amélioration du site et de l'expérience client</li>
            </ul>

            <h2 style={s.h2}>Base légale</h2>
            <p style={s.p}>
              Le traitement repose sur l'exécution du contrat de vente, votre consentement pour les
              communications marketing, et notre intérêt légitime pour l'amélioration du service.
            </p>

            <h2 style={s.h2}>Destinataires des données</h2>
            <p style={s.p}>
              Vos données peuvent être transmises à nos prestataires techniques (hébergeur, Stripe, FedaPay,
              Mondial Relay Pro) dans la stricte mesure nécessaire à l'exécution de votre commande.
            </p>

            <h2 style={s.h2}>Durée de conservation</h2>
            <p style={s.p}>
              Vos données sont conservées pendant la durée nécessaire aux finalités mentionnées ci-dessus,
              et conformément aux obligations légales (notamment comptables).
            </p>

            <h2 style={s.h2}>Vos droits (RGPD)</h2>
            <p style={s.p}>
              Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement,
              de limitation, d'opposition et de portabilité de vos données. Vous pouvez exercer ces droits
              en écrivant à{' '}
              <a href="mailto:contact@eolekare.com" style={{ color: '#7a4f2d' }}>contact@eolekare.com</a>.
            </p>

            <h2 style={s.h2}>Cookies</h2>
            <p style={s.p}>
              Le site eolekare.com utilise des cookies, c'est-à-dire de petits fichiers déposés sur votre
              appareil lors de votre navigation. On distingue deux types de cookies :
            </p>
            <ul style={s.ul}>
              <li>
                <strong>Cookies strictement nécessaires</strong> : indispensables au fonctionnement du site
                (panier d'achat, processus de paiement sécurisé via Stripe/FedaPay, session de navigation).
                Ces cookies ne nécessitent pas votre consentement.
              </li>
              <li>
                <strong>Cookies de mesure d'audience et de publicité</strong> (le cas échéant) : ils peuvent
                être utilisés pour analyser la fréquentation du site (ex. Google Analytics) ou proposer des
                publicités ciblées (ex. Meta Pixel). Ces cookies ne sont déposés qu'avec votre consentement
                préalable, recueilli via une bannière dédiée lors de votre première visite.
              </li>
            </ul>
            <p style={s.p}>
              Vous pouvez à tout moment modifier vos préférences ou vous opposer aux cookies non essentiels
              via les paramètres de votre navigateur ou, si disponible, le bandeau de gestion des cookies du site.
            </p>

            <h2 style={s.h2}>Sécurité</h2>
            <p style={s.p}>
              Eolekare met en œuvre les mesures techniques et organisationnelles appropriées pour protéger
              vos données contre tout accès non autorisé, perte ou divulgation.
            </p>

            <h2 style={s.h2}>Prestataires de paiement</h2>
            <p style={s.p}>
              Le paiement est traité par <strong>Stripe</strong> (international / France) et{' '}
              <strong>FedaPay</strong> (Bénin). Ces prestataires disposent de leurs propres politiques de
              confidentialité.
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
