import React, { createContext, useContext, useState } from 'react';

const LangContext = createContext(null);

export const TRANSLATIONS = {
  fr: {
    nav_collection:'Collection', nav_story:'Notre histoire', nav_instagram:'Instagram', nav_cart:'Panier',
    hero_eyebrow:'100% Naturel · Made in Bénin · Pour tous', hero_tagline:'Votre skincare aux parfums uniques',
    hero_cta_discover:'Découvrir la collection', hero_badge_natural:'100% Naturel',
    hero_badge_made:'Made in Bénin', hero_badge_all:'Pour tous',
    strip_label:'La nature dans chaque texture',
    products_meta:'Notre collection', products_title:'Nos Beurres',
    products_loading:'Chargement…', products_add:'Ajouter au panier', products_soldout:'Épuisé',
    story_quote:"L'odeur, la texture, le rituel… un moment rien qu'à toi.",
    story_body:"Eolekare, c'est une marque capillaire & cosmétique 100% naturelle, produite au Bénin avec amour.",
    story_cta:'Découvrir la collection',
    story_p1_title:'100% Naturel', story_p1_text:'Beurres natifs, huiles végétales, vitamine E.',
    story_p2_title:'Made in Bénin', story_p2_text:'Fabriqué avec amour au Bénin pour le monde.',
    story_p3_title:'Multi-usage', story_p3_text:'Peau, cheveux, corps, ongles, cils, sourcils.',
    story_p4_title:'Parfums uniques', story_p4_text:'Chaque beurre a son parfum signature.',
    insta_title:'Rejoins la communauté', insta_handle:'sur Instagram & TikTok', insta_cta:'Suivre @eolekare',
    howto_meta:'Rituel Eolekare', howto_title:'Comment utiliser',
    howto_s1_title:'Sur les cheveux', howto_s1_text:'Prélève une noisette, frotte entre tes mains. Applique sur longueurs et pointes.',
    howto_s2_title:'Sur le corps', howto_s2_text:"Sur peau humide après la douche. Masse jusqu'à pénétration.",
    howto_s3_title:"Bain d'huile profond", howto_s3_text:'1x par semaine. 30min à 2h sous bonnet chaud.',
    order_title:'Commandez maintenant', order_sub:'Livraison partout en Europe via Mondial Relay.',
    order_shipping:'Livraison', order_shipping_val:'Mondial Relay',
    order_payment:'Paiement', order_payment_val:'Sécurisé Shopify',
    order_tracking:'Suivi', order_tracking_val:'Numéro de tracking',
    order_cta:'Voir le panier & commander',
    cart_title:'Votre panier', cart_empty:'Votre panier est vide', cart_empty_sub:'Découvrez notre collection',
    cart_total:'Total', cart_checkout:'Passer la commande →', cart_secure:'Paiement sécurisé via Shopify',
    cart_articles:'article', cart_articles_pl:'articles', cart_updating:'Mise à jour…',
    footer_tagline:'Votre skincare aux parfums uniques',
    footer_copy:'100% Naturel · Made in Bénin · Pour tous · © 2025 Eolekare by Eoleeg',
  },
  en: {
    nav_collection:'Collection', nav_story:'Our story', nav_instagram:'Instagram', nav_cart:'Cart',
    hero_eyebrow:'100% Natural · Made in Benin · For everyone', hero_tagline:'Your skincare with unique scents',
    hero_cta_discover:'Discover the collection', hero_badge_natural:'100% Natural',
    hero_badge_made:'Made in Benin', hero_badge_all:'For everyone',
    strip_label:'Nature in every texture',
    products_meta:'Our collection', products_title:'Our Butters',
    products_loading:'Loading…', products_add:'Add to cart', products_soldout:'Sold out',
    story_quote:'The scent, the texture, the ritual… a moment just for you.',
    story_body:'Eolekare is a 100% natural hair & cosmetic brand, made in Benin with love.',
    story_cta:'Discover the collection',
    story_p1_title:'100% Natural', story_p1_text:'Native butters, vegetable oils, vitamin E.',
    story_p2_title:'Made in Benin', story_p2_text:'Crafted with love in Benin for the world.',
    story_p3_title:'Multi-use', story_p3_text:'Skin, hair, body, nails, lashes, brows.',
    story_p4_title:'Unique scents', story_p4_text:'Each butter has its signature fragrance.',
    insta_title:'Join the community', insta_handle:'on Instagram & TikTok', insta_cta:'Follow @eolekare',
    howto_meta:'Eolekare Ritual', howto_title:'How to use',
    howto_s1_title:'On hair', howto_s1_text:'Take a hazelnut-sized amount. Apply to lengths and ends.',
    howto_s2_title:'On body', howto_s2_text:'On damp skin after shower. Massage until absorbed.',
    howto_s3_title:'Deep oil bath', howto_s3_text:'1x per week. 30min to 2h under a warm cap.',
    order_title:'Order now', order_sub:'Delivery across Europe via Mondial Relay.',
    order_shipping:'Delivery', order_shipping_val:'Mondial Relay',
    order_payment:'Payment', order_payment_val:'Secure Shopify',
    order_tracking:'Tracking', order_tracking_val:'Tracking number',
    order_cta:'View cart & order',
    cart_title:'Your cart', cart_empty:'Your cart is empty', cart_empty_sub:'Discover our collection',
    cart_total:'Total', cart_checkout:'Checkout →', cart_secure:'Secure payment via Shopify',
    cart_articles:'item', cart_articles_pl:'items', cart_updating:'Updating…',
    footer_tagline:'Your skincare with unique scents',
    footer_copy:'100% Natural · Made in Benin · For everyone · © 2025 Eolekare by Eoleeg',
  },
};

export function LangProvider({ children, defaultLang = 'fr' }) {
  const [lang, setLang] = useState(defaultLang);
  const t = (key) => TRANSLATIONS[lang][key] || key;
  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be inside <LangProvider>');
  return ctx;
}
