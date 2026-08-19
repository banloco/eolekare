import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';

const DOC_SLUGS = ['mentions', 'cgv', 'remboursement', 'confidentialite'];

const s = {
  body: { minHeight: '100vh', background: '#fdf6ec', fontFamily: "'Helvetica Neue', Arial, sans-serif" },
  header: { background: '#3b190f', padding: '1.2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' },
  logo: { color: '#f8cb78', fontFamily: '"Cormorant Garamond", serif', fontSize: 22, letterSpacing: '0.3em', textDecoration: 'none', fontWeight: 300 },
  nav: { display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' },
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

const mailLink = <a href="mailto:contact@eolekare.com" style={{ color: '#7a4f2d' }}>contact@eolekare.com</a>;

const TABS = {
  fr: ['Mentions légales', 'CGV', 'Remboursement', 'Confidentialité'],
  en: ['Legal Notice', 'Terms of Sale', 'Refunds', 'Privacy'],
};

/* ─── CONTENU DES 4 DOCUMENTS, FR + EN ─────────────────────────── */
const CONTENT = {
  mentions: {
    fr: [
      { h2: 'Éditeur du site', body: (
        <p style={s.p}>
          Le site <strong>www.eolekare.com</strong> est édité par :<br />
          <strong>Eole &amp; Co</strong> (nom commercial : Eolekare)<br />
          Entreprise individuelle (auto-entreprise)<br />
          SIRET : 933 699 969 00012<br />
          Adresse : 240 avenue des Grésillons, 92600 Asnières-sur-Seine, France<br />
          Email : {mailLink}<br />
          Téléphone : +229 48 65 42 00
        </p>
      ) },
      { h2: 'Directrice de la publication', body: <p style={s.p}>Eole Gauthé, fondatrice d'Eolekare.</p> },
      { h2: 'Hébergement', body: (
        <p style={s.p}>Le site eolekare.com est hébergé par <strong>Netlify, Inc.</strong> (frontend) et <strong>Hetzner Online GmbH</strong> (API backend).</p>
      ) },
      { h2: 'Développement du site', body: <p style={s.p}>Site développé par Fortuné (développeur indépendant).</p> },
      { h2: 'Propriété intellectuelle', body: (
        <p style={s.p}>
          L'ensemble des contenus présents sur le site eolekare.com (textes, images, logos, photographies,
          vidéos, éléments graphiques) est la propriété exclusive d'Eole &amp; Co, sauf mention contraire.
          Toute reproduction, représentation, modification ou exploitation, totale ou partielle,
          sans autorisation écrite préalable, est interdite.
        </p>
      ) },
      { h2: 'Données personnelles', body: (
        <p style={s.p}>
          Les données collectées sur ce site sont traitées conformément à notre Politique de confidentialité
          (voir l'onglet « Confidentialité »).
        </p>
      ) },
    ],
    en: [
      { h2: 'Website publisher', body: (
        <p style={s.p}>
          The website <strong>www.eolekare.com</strong> is published by:<br />
          <strong>Eole &amp; Co</strong> (trading as Eolekare)<br />
          Sole proprietorship (auto-entrepreneur)<br />
          SIRET: 933 699 969 00012<br />
          Address: 240 avenue des Grésillons, 92600 Asnières-sur-Seine, France<br />
          Email: {mailLink}<br />
          Phone: +229 48 65 42 00
        </p>
      ) },
      { h2: 'Publication director', body: <p style={s.p}>Eole Gauthé, founder of Eolekare.</p> },
      { h2: 'Hosting', body: (
        <p style={s.p}>The website eolekare.com is hosted by <strong>Netlify, Inc.</strong> (frontend) and <strong>Hetzner Online GmbH</strong> (API backend).</p>
      ) },
      { h2: 'Website development', body: <p style={s.p}>Website developed by Fortuné (independent developer).</p> },
      { h2: 'Intellectual property', body: (
        <p style={s.p}>
          All content on the eolekare.com website (text, images, logos, photographs, videos, graphic
          elements) is the exclusive property of Eole &amp; Co, unless otherwise stated. Any reproduction,
          representation, modification or use, in whole or in part, without prior written authorization,
          is prohibited.
        </p>
      ) },
      { h2: 'Personal data', body: (
        <p style={s.p}>
          Data collected on this site is processed in accordance with our Privacy Policy
          (see the "Privacy" tab).
        </p>
      ) },
    ],
  },

  cgv: {
    fr: [
      { h2: 'Article 1 — Objet', body: (
        <p style={s.p}>
          Les présentes CGV régissent les ventes de produits cosmétiques réalisées sur le site eolekare.com
          entre Eole &amp; Co (« le Vendeur ») et toute personne physique effectuant un achat (« le Client »).
        </p>
      ) },
      { h2: 'Article 2 — Produits', body: (
        <p style={s.p}>
          Eolekare commercialise des beurres et soins cosmétiques naturels (mangue, avocat, coco) fabriqués
          au Bénin. Les caractéristiques essentielles des produits sont présentées sur chaque fiche produit.
        </p>
      ) },
      { h2: 'Article 3 — Prix', body: (
        <p style={s.p}>
          Les prix sont indiqués en euros (€) TTC pour les livraisons en France, et en francs CFA (XOF) pour
          les livraisons au Bénin. Le Vendeur se réserve le droit de modifier ses prix à tout moment, les
          produits étant facturés sur la base du tarif en vigueur au moment de la validation de la commande.
        </p>
      ) },
      { h2: 'Article 4 — Commande', body: (
        <p style={s.p}>
          Toute commande passée sur le site implique l'acceptation pleine et entière des présentes CGV.
          La commande est confirmée après validation du paiement.
        </p>
      ) },
      { h2: 'Article 5 — Paiement', body: (
        <>
          <p style={s.p}>Le paiement s'effectue en ligne, de façon sécurisée :</p>
          <ul style={s.ul}>
            <li>Par carte bancaire (<strong>Stripe</strong>) pour les commandes internationales et en France</li>
            <li>Par <strong>FedaPay</strong> pour les commandes au Bénin</li>
          </ul>
        </>
      ) },
      { h2: 'Article 6 — Livraison', body: (
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
      ) },
      { h2: 'Article 7 — Droit de rétractation', body: (
        <p style={s.p}>
          Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne
          s'applique pas aux produits descellés qui ne peuvent être renvoyés pour des raisons d'hygiène
          ou de protection de la santé, une fois ouverts par le Client. Voir la Politique de remboursement
          pour le détail.
        </p>
      ) },
      { h2: 'Article 8 — Responsabilité', body: (
        <p style={s.p}>
          Eolekare ne saurait être tenue responsable des dommages résultant d'une mauvaise utilisation
          des produits ou du non-respect des précautions d'usage indiquées sur l'emballage.
        </p>
      ) },
      { h2: 'Article 9 — Service client', body: (
        <p style={s.p}>Pour toute question relative à une commande : {mailLink} / +229 48 65 42 00</p>
      ) },
      { h2: 'Article 10 — Droit applicable', body: (
        <p style={s.p}>
          Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable
          sera recherchée avant toute action judiciaire.
        </p>
      ) },
    ],
    en: [
      { h2: 'Article 1 — Purpose', body: (
        <p style={s.p}>
          These Terms and Conditions of Sale govern the sale of cosmetic products made on the eolekare.com
          website between Eole &amp; Co ("the Seller") and any individual making a purchase ("the Customer").
        </p>
      ) },
      { h2: 'Article 2 — Products', body: (
        <p style={s.p}>
          Eolekare sells natural cosmetic butters and skincare products (mango, avocado, coconut) made in
          Benin. The essential characteristics of each product are presented on its product page.
        </p>
      ) },
      { h2: 'Article 3 — Prices', body: (
        <p style={s.p}>
          Prices are shown in euros (€), tax included, for deliveries in France, and in CFA francs (XOF) for
          deliveries in Benin. The Seller reserves the right to change prices at any time; products are
          invoiced based on the rate in effect at the time the order is confirmed.
        </p>
      ) },
      { h2: 'Article 4 — Order', body: (
        <p style={s.p}>
          Placing an order on the website constitutes full and unreserved acceptance of these Terms and
          Conditions of Sale. The order is confirmed once payment has been validated.
        </p>
      ) },
      { h2: 'Article 5 — Payment', body: (
        <>
          <p style={s.p}>Payment is made online, securely:</p>
          <ul style={s.ul}>
            <li>By credit/debit card (<strong>Stripe</strong>) for international orders and orders within France</li>
            <li>By <strong>FedaPay</strong> for orders in Benin</li>
          </ul>
        </>
      ) },
      { h2: 'Article 6 — Delivery', body: (
        <p style={s.p}>
          <strong>France</strong>: delivery via Mondial Relay Pro, to a pickup point or to your home
          depending on the option chosen at checkout. Estimated delivery time: 3 to 5 business days from
          shipment.<br /><br />
          <strong>Benin (Cotonou and surrounding areas)</strong>: delivery within a minimum of 24 hours from
          order confirmation.<br /><br />
          Delivery times are provided as an estimate only and may vary depending on the destination,
          product availability and logistical conditions. Eolekare cannot be held responsible for delays
          caused by the carrier.
        </p>
      ) },
      { h2: 'Article 7 — Right of withdrawal', body: (
        <p style={s.p}>
          In accordance with Article L221-28 of the French Consumer Code, the right of withdrawal does not
          apply to unsealed products which, for hygiene or health protection reasons, cannot be returned
          once opened by the Customer. See the Refund Policy for details.
        </p>
      ) },
      { h2: 'Article 8 — Liability', body: (
        <p style={s.p}>
          Eolekare cannot be held liable for damage resulting from misuse of the products or failure to
          follow the usage precautions indicated on the packaging.
        </p>
      ) },
      { h2: 'Article 9 — Customer service', body: (
        <p style={s.p}>For any question regarding an order: {mailLink} / +229 48 65 42 00</p>
      ) },
      { h2: 'Article 10 — Governing law', body: (
        <p style={s.p}>
          These Terms and Conditions of Sale are governed by French law. In the event of a dispute, an
          amicable resolution will be sought before any legal action.
        </p>
      ) },
    ],
  },

  remboursement: {
    fr: [
      { h2: 'Produits scellés (non ouverts)', body: (
        <p style={s.p}>
          Vous disposez d'un délai de <strong>14 jours</strong> à compter de la réception de votre commande
          pour exercer votre droit de rétractation, à condition que le produit soit retourné dans son
          emballage d'origine, non ouvert et non descellé.
        </p>
      ) },
      { h2: 'Produits ouverts / descellés', body: (
        <p style={s.p}>
          Pour des raisons d'hygiène et de protection de la santé, les produits cosmétiques descellés ne
          peuvent ni être repris ni remboursés une fois ouverts, conformément à l'article L221-28 du
          Code de la consommation.
        </p>
      ) },
      { h2: 'Produits défectueux ou erreur de commande', body: (
        <p style={s.p}>
          Si vous recevez un produit défectueux, endommagé ou différent de votre commande, contactez-nous
          sous <strong>48h</strong> à {mailLink} avec photo à l'appui. Un remboursement ou un échange vous
          sera proposé sans frais.
        </p>
      ) },
      { h2: 'Modalités de retour', body: (
        <p style={s.p}>
          Pour toute demande de retour éligible, contactez {mailLink}. Les frais de retour sont à la charge
          du Client, sauf en cas de produit défectueux ou d'erreur du Vendeur.
        </p>
      ) },
      { h2: 'Délai de remboursement', body: (
        <p style={s.p}>
          Le remboursement est effectué dans un délai de <strong>14 jours</strong> à compter de la
          réception du produit retourné, via le même moyen de paiement que celui utilisé lors de l'achat.
        </p>
      ) },
    ],
    en: [
      { h2: 'Sealed products (unopened)', body: (
        <p style={s.p}>
          You have <strong>14 days</strong> from receipt of your order to exercise your right of
          withdrawal, provided the product is returned in its original packaging, unopened and unsealed.
        </p>
      ) },
      { h2: 'Opened / unsealed products', body: (
        <p style={s.p}>
          For hygiene and health protection reasons, unsealed cosmetic products cannot be returned or
          refunded once opened, in accordance with Article L221-28 of the French Consumer Code.
        </p>
      ) },
      { h2: 'Defective products or order errors', body: (
        <p style={s.p}>
          If you receive a defective or damaged product, or one that differs from your order, contact us
          within <strong>48 hours</strong> at {mailLink} with a supporting photo. A refund or exchange will
          be offered at no charge.
        </p>
      ) },
      { h2: 'Return process', body: (
        <p style={s.p}>
          For any eligible return request, contact {mailLink}. Return shipping costs are the Customer's
          responsibility, except in the case of a defective product or an error by the Seller.
        </p>
      ) },
      { h2: 'Refund timeframe', body: (
        <p style={s.p}>
          Refunds are issued within <strong>14 days</strong> of receiving the returned product, using the
          same payment method used for the purchase.
        </p>
      ) },
    ],
  },

  confidentialite: {
    fr: [
      { h2: 'Responsable du traitement', body: (
        <p style={s.p}>Eole &amp; Co (Eolekare), 240 avenue des Grésillons, 92600 Asnières-sur-Seine — {mailLink}</p>
      ) },
      { h2: 'Données collectées', body: (
        <>
          <p style={s.p}>Lors de votre navigation et de vos achats sur eolekare.com, nous collectons :</p>
          <ul style={s.ul}>
            <li>Nom, prénom, adresse email, adresse postale, numéro de téléphone</li>
            <li>Données de commande et de paiement (traitées par nos prestataires Stripe et FedaPay, non stockées par Eolekare)</li>
            <li>Données de navigation (cookies, voir ci-dessous)</li>
          </ul>
        </>
      ) },
      { h2: 'Finalités du traitement', body: (
        <ul style={s.ul}>
          <li>Traitement et livraison des commandes</li>
          <li>Gestion de la relation client</li>
          <li>Envoi de communications commerciales (avec votre consentement)</li>
          <li>Amélioration du site et de l'expérience client</li>
        </ul>
      ) },
      { h2: 'Base légale', body: (
        <p style={s.p}>
          Le traitement repose sur l'exécution du contrat de vente, votre consentement pour les
          communications marketing, et notre intérêt légitime pour l'amélioration du service.
        </p>
      ) },
      { h2: 'Destinataires des données', body: (
        <p style={s.p}>
          Vos données peuvent être transmises à nos prestataires techniques (hébergeur, Stripe, FedaPay,
          Mondial Relay Pro) dans la stricte mesure nécessaire à l'exécution de votre commande.
        </p>
      ) },
      { h2: 'Durée de conservation', body: (
        <p style={s.p}>
          Vos données sont conservées pendant la durée nécessaire aux finalités mentionnées ci-dessus,
          et conformément aux obligations légales (notamment comptables).
        </p>
      ) },
      { h2: 'Vos droits (RGPD)', body: (
        <p style={s.p}>
          Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement,
          de limitation, d'opposition et de portabilité de vos données. Vous pouvez exercer ces droits
          en écrivant à {mailLink}.
        </p>
      ) },
      { h2: 'Cookies', body: (
        <>
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
        </>
      ) },
      { h2: 'Sécurité', body: (
        <p style={s.p}>
          Eolekare met en œuvre les mesures techniques et organisationnelles appropriées pour protéger
          vos données contre tout accès non autorisé, perte ou divulgation.
        </p>
      ) },
      { h2: 'Prestataires de paiement', body: (
        <p style={s.p}>
          Le paiement est traité par <strong>Stripe</strong> (international / France) et <strong>FedaPay</strong> (Bénin).
          Ces prestataires disposent de leurs propres politiques de confidentialité.
        </p>
      ) },
    ],
    en: [
      { h2: 'Data controller', body: (
        <p style={s.p}>Eole &amp; Co (Eolekare), 240 avenue des Grésillons, 92600 Asnières-sur-Seine — {mailLink}</p>
      ) },
      { h2: 'Data collected', body: (
        <>
          <p style={s.p}>When you browse and make purchases on eolekare.com, we collect:</p>
          <ul style={s.ul}>
            <li>First and last name, email address, postal address, phone number</li>
            <li>Order and payment data (processed by our providers Stripe and FedaPay, not stored by Eolekare)</li>
            <li>Browsing data (cookies, see below)</li>
          </ul>
        </>
      ) },
      { h2: 'Purposes of processing', body: (
        <ul style={s.ul}>
          <li>Processing and delivery of orders</li>
          <li>Customer relationship management</li>
          <li>Sending marketing communications (with your consent)</li>
          <li>Improving the website and customer experience</li>
        </ul>
      ) },
      { h2: 'Legal basis', body: (
        <p style={s.p}>
          Processing is based on the performance of the sales contract, your consent for marketing
          communications, and our legitimate interest in improving our service.
        </p>
      ) },
      { h2: 'Data recipients', body: (
        <p style={s.p}>
          Your data may be shared with our technical service providers (hosting provider, Stripe, FedaPay,
          Mondial Relay Pro) only to the extent necessary to fulfill your order.
        </p>
      ) },
      { h2: 'Data retention period', body: (
        <p style={s.p}>
          Your data is kept for as long as necessary for the purposes described above, and in accordance
          with legal obligations (in particular accounting requirements).
        </p>
      ) },
      { h2: 'Your rights (GDPR)', body: (
        <p style={s.p}>
          In accordance with the GDPR, you have the right to access, rectify, erase, restrict and object to
          the processing of your data, as well as the right to data portability. You may exercise these
          rights by writing to {mailLink}.
        </p>
      ) },
      { h2: 'Cookies', body: (
        <>
          <p style={s.p}>
            The eolekare.com website uses cookies, small files stored on your device while you browse.
            There are two types of cookies:
          </p>
          <ul style={s.ul}>
            <li>
              <strong>Strictly necessary cookies</strong>: essential for the website to function (shopping
              cart, secure payment process via Stripe/FedaPay, browsing session). These cookies do not
              require your consent.
            </li>
            <li>
              <strong>Audience measurement and advertising cookies</strong> (where applicable): these may be
              used to analyze site traffic (e.g. Google Analytics) or offer targeted advertising (e.g. Meta
              Pixel). These cookies are only set with your prior consent, collected via a dedicated banner
              on your first visit.
            </li>
          </ul>
          <p style={s.p}>
            You can change your preferences or object to non-essential cookies at any time via your browser
            settings or, where available, the site's cookie management banner.
          </p>
        </>
      ) },
      { h2: 'Security', body: (
        <p style={s.p}>
          Eolekare implements appropriate technical and organizational measures to protect your data
          against unauthorized access, loss or disclosure.
        </p>
      ) },
      { h2: 'Payment providers', body: (
        <p style={s.p}>
          Payment is processed by <strong>Stripe</strong> (international / France) and <strong>FedaPay</strong> (Benin).
          These providers have their own privacy policies.
        </p>
      ) },
    ],
  },
};

const SEO_TEXT = {
  fr: {
    title: 'Eolekare — Mentions légales, CGV & Politique de confidentialité',
    description: 'Mentions légales, conditions générales de vente, politique de remboursement et politique de confidentialité d\'Eolekare.',
  },
  en: {
    title: 'Eolekare — Legal Notice, Terms of Sale & Privacy Policy',
    description: 'Legal notice, terms and conditions of sale, refund policy and privacy policy for Eolekare.',
  },
};

export default function LegalPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = Math.max(0, DOC_SLUGS.indexOf(searchParams.get('doc')));
  const initialLang = searchParams.get('lang') === 'en' ? 'en' : 'fr';
  const [tab, setTab] = useState(initialTab);
  const [lang, setLang] = useState(initialLang);

  const selectTab = (i) => {
    setTab(i);
    setSearchParams({ doc: DOC_SLUGS[i], lang }, { replace: true });
  };

  const selectLang = (l) => {
    setLang(l);
    setSearchParams({ doc: DOC_SLUGS[tab], lang: l }, { replace: true });
  };

  useSEO({
    title: SEO_TEXT[lang].title,
    description: SEO_TEXT[lang].description,
    url: 'https://eolekare.com/legal',
    lang,
  });

  const sections = CONTENT[DOC_SLUGS[tab]][lang];

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
              <button key={l} onClick={() => selectLang(l)} style={{
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
        <h1 style={s.h1}>{lang === 'fr' ? 'Informations légales' : 'Legal information'}</h1>

        {/* Onglets */}
        <div style={s.tabs}>
          {TABS[lang].map((t, i) => (
            <button key={i} onClick={() => selectTab(i)} style={{
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

        {sections.map((sec, i) => (
          <div key={i}>
            <h2 style={s.h2}>{sec.h2}</h2>
            {sec.body}
          </div>
        ))}
      </main>

      <footer style={s.footer}>
        <p style={s.footerText}>EOLEKARE · {lang === 'fr' ? 'Cosmétiques naturels · Made in Bénin' : 'Natural cosmetics · Made in Benin'}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem' }}>
          <Link to="/about" style={{ ...s.footerText, textDecoration: 'none', margin: 0 }}>{lang === 'fr' ? 'À propos' : 'About'}</Link>
          <Link to="/contact" style={{ ...s.footerText, textDecoration: 'none', margin: 0 }}>Contact</Link>
        </div>
      </footer>
    </div>
  );
}
