import { useEffect } from 'react';

/**
 * Dynamically update <head> meta tags for SEO.
 *
 * @param {object} opts
 * @param {string} opts.title        – <title> + og:title + twitter:title
 * @param {string} opts.description  – meta description + og:description
 * @param {string} [opts.url]        – canonical URL (defaults to window.location.href)
 * @param {string} [opts.image]      – OG / Twitter card image (absolute URL)
 * @param {string} [opts.lang]       – html lang attribute ('fr' | 'en')
 * @param {string} [opts.type]       – og:type (default: 'website')
 */
export function useSEO({ title, description, url, image, lang = 'fr', type = 'website' }) {
  useEffect(() => {
    /* ── Title ── */
    document.title = title;
    document.documentElement.lang = lang;

    // Domaine canonique : toujours la version www (apex → www via redirection Vercel).
    const toWww = (u) => (u || '').replace(/:\/\/eolekare\.com/, '://www.eolekare.com');
    const ogImage = toWww(image) || 'https://www.eolekare.com/images/og-image.jpg';
    const canonical = toWww(url) || window.location.href;

    /* ── Helper: upsert a <meta> tag ── */
    const setMeta = (attr, attrVal, content) => {
      let el = document.querySelector(`meta[${attr}="${attrVal}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    /* ── Standard ── */
    setMeta('name', 'description', description);
    setMeta('name', 'robots', 'index, follow');

    /* ── Open Graph ── */
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', canonical);
    setMeta('property', 'og:image', ogImage);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:site_name', 'Eolekare');
    setMeta('property', 'og:locale', lang === 'fr' ? 'fr_FR' : 'en_GB');

    /* ── Twitter Card ── */
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:site', '@eolekare');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', ogImage);

    /* ── Canonical ── */
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = canonical;
  }, [title, description, url, image, lang, type]);
}
