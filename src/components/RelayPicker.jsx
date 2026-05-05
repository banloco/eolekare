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

    function loadScript(src, id, cb) {
      if (document.getElementById(id)) { cb(); return; }
      const s = document.createElement('script');
      s.src = src;
      s.id  = id;
      s.async = false;
      s.onload = cb;
      s.onerror = () => console.error('Failed to load script:', src);
      document.head.appendChild(s);
    }

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

    loadScript(
      'https://code.jquery.com/jquery-3.7.1.min.js',
      'jquery-mr',
      () => {
        // Expose jQuery globalement pour le plugin MR
        window.jQuery = window.jQuery || window.$;
        window.$      = window.jQuery;

        loadScript(
          'https://widget.mondialrelay.com/parcelshop-picker/v4_0/plugin/mondialrelay-parcelshoppicker.min.js',
          'mr-widget',
          () => {
            if (!containerRef.current || initialised.current) return;

            // Vérification que le plugin est bien chargé
            if (typeof window.jQuery('#mr-widget-container').MRParcelShopPicker !== 'function') {
              console.error('MRParcelShopPicker plugin not loaded');
              return;
            }

            initialised.current = true;

            window.jQuery('#mr-widget-container').MRParcelShopPicker({
              Target:           '#mr-selected-relay',
              Brand:            'BDTEST  ',
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
  }, [countryCode]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div id="mr-widget-container" ref={containerRef} style={{ width: '100%', minHeight: 400 }} />
      <input type="hidden" id="mr-selected-relay" />
    </div>
  );
}

