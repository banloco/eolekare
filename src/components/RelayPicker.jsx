import { useEffect, useRef } from 'react';

export default function RelayPicker({ onSelect, countryCode = 'FR' }) {
  const containerRef = useRef(null);
  const initialised  = useRef(false);
  const onSelectRef  = useRef(onSelect); // ref stable — évite les stale closures
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (initialised.current) return;

    function loadScript(src, id, cb) {
      if (document.getElementById(id)) { cb(); return; }
      const s = document.createElement('script');
      s.src = src; s.id = id; s.async = false;
      s.onload = cb;
      s.onerror = () => console.error('Failed to load script:', src);
      document.head.appendChild(s);
    }

    function loadStyle(href, id) {
      if (document.getElementById(id)) return;
      const l = document.createElement('link');
      l.rel = 'stylesheet'; l.href = href; l.id = id;
      document.head.appendChild(l);
    }

    loadStyle(
      'https://widget.mondialrelay.com/parcelshop-picker/v4_0/css/mondialrelay-widgetv4_0.css',
      'mr-css'
    );

    loadScript('https://code.jquery.com/jquery-3.7.1.min.js', 'jquery-mr', () => {
      // Expose jQuery globalement pour le plugin MR (Vite isole les modules)
      window.jQuery = window.jQuery || window.$;
      window.$      = window.jQuery;

      loadScript(
        'https://widget.mondialrelay.com/parcelshop-picker/v4_0/plugin/mondialrelay-parcelshoppicker.min.js',
        'mr-widget',
        () => {
          if (!containerRef.current || initialised.current) return;
          if (typeof window.jQuery().MRParcelShopPicker !== 'function') {
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
              onSelectRef.current && onSelectRef.current(relay);
            },
          });

          // Fallback : écoute l'input caché au cas où OnParcelShopSelected ne se déclenche pas
          const hiddenInput = document.getElementById('mr-selected-relay');
          if (hiddenInput) {
            hiddenInput.addEventListener('change', () => {
              if (!hiddenInput.value) return;
              const relayData = {
                ID:    hiddenInput.value,
                Nom:   'Point Relais ' + hiddenInput.value,
                Adresse1: '',
                CP:    '',
                Ville: '',
                Pays:  countryCode,
              };
              onSelectRef.current && onSelectRef.current(relayData);
            });
          }
        }
      );
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <p style={{ fontSize: 11, color: '#7a4f2d', marginBottom: 8, fontStyle: 'italic' }}>
        Saisissez votre code postal, cliquez sur "Rechercher" puis sélectionnez un point relais dans la liste.
      </p>
      <div id="mr-widget-container" ref={containerRef} style={{ width: '100%', minHeight: 400 }} />
      <input type="hidden" id="mr-selected-relay" />
    </div>
  );
}
