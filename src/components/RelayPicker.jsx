import { useEffect, useRef } from 'react';

/**
 * RelayPicker — widget Mondial Relay (jQuery-based SDK officiel)
 *
 * Props :
 *  - onSelect(relay) : callback appelé quand un point relais est choisi
 *                      relay = { ID, Nom, Adresse1, CP, Ville, Pays, ... }
 *  - countryCode : 'FR' | 'BE' | 'ES' | 'NL' | ... (défaut 'FR')
 */
export default function RelayPicker({ onSelect, countryCode = 'FR' }) {
  const containerRef = useRef(null);
  const initialised  = useRef(false);

  useEffect(() => {
    if (initialised.current) return;

    // 1. Charger jQuery si absent
    function loadScript(src, id, cb) {
      if (document.getElementById(id)) { cb(); return; }
      const s = document.createElement('script');
      s.src = src;
      s.id  = id;
      s.onload = cb;
      document.head.appendChild(s);
    }

    // 2. Charger le CSS Mondial Relay
    function loadStyle(href, id) {
      if (document.getElementById(id)) return;
      const l = document.createElement('link');
      l.rel  = 'stylesheet';
      l.href = href;
      l.id   = id;
      document.head.appendChild(l);
    }

    loadStyle(
      'https://widget.mondialrelay.com/parcelshop-picker/v4_0/css/mondialrelay-widgetv4_0.css',
      'mr-css'
    );

    // 3. Charger jQuery puis le widget MR
    loadScript(
      'https://code.jquery.com/jquery-3.7.1.min.js',
      'jquery-mr',
      () => {
        loadScript(
          'https://widget.mondialrelay.com/parcelshop-picker/v4_0/plugin/mondialrelay-parcelshoppicker.min.js',
          'mr-widget',
          () => {
            if (!containerRef.current || initialised.current) return;
            initialised.current = true;

            /* global jQuery */
            jQuery('#mr-widget-container').MRParcelShopPicker({
              Target:           '#mr-selected-relay', // input caché qui reçoit la valeur
              Brand:            'BDTEST  ',            // remplacer par votre code enseigne MR
              Country:          countryCode,
              EnableGmap:       false,
              ShowResultsOnMap: false,
              Responsive:       true,
              OnParcelShopSelected: (relay) => {
                onSelect && onSelect(relay);
              },
            });
          }
        );
      }
    );

    return () => {
      // Nettoyage : pas de destroy officiel — on réinitialise via la clé si besoin
    };
  }, [countryCode]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div id="mr-widget-container" ref={containerRef} style={{ width: '100%', minHeight: 400 }} />
      <input type="hidden" id="mr-selected-relay" />
    </div>
  );
}
