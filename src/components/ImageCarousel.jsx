import React, { useState, useCallback, useEffect, useRef } from 'react';

/**
 * ImageCarousel — carousel d'images élégant pour les produits Eolekare.
 * Si le produit n'a qu'une seule image, elle s'affiche normalement (pas de contrôles).
 *
 * Props:
 *   images    {string[]}  — tableau d'URLs
 *   alt       {string}    — texte alternatif (nom du produit)
 *   height    {number|string} — hauteur du conteneur (ex: 240 ou '100%')
 *   objectFit {string}    — objectFit CSS (default: 'cover')
 *   autoPlay  {boolean}   — défilement automatique (default: false)
 *   interval  {number}    — ms entre deux slides en autoPlay (default: 3500)
 *   onClick   {function}  — callback clic sur l'image (pour ouvrir la modal)
 */
export default function ImageCarousel({
  images = [],
  alt = '',
  height = 240,
  objectFit = 'cover',
  autoPlay = false,
  interval = 3500,
  onClick,
}) {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef(null);

  const total = images.length;

  const prev = useCallback((e) => {
    if (e) e.stopPropagation();
    setCurrent(c => (c - 1 + total) % total);
  }, [total]);

  const next = useCallback((e) => {
    if (e) e.stopPropagation();
    setCurrent(c => (c + 1) % total);
  }, [total]);

  const goTo = useCallback((e, idx) => {
    if (e) e.stopPropagation();
    setCurrent(idx);
  }, []);

  // Auto-play
  useEffect(() => {
    if (!autoPlay || total <= 1) return;
    timerRef.current = setInterval(next, interval);
    return () => clearInterval(timerRef.current);
  }, [autoPlay, interval, total, next]);

  // Pause autoplay on hover
  useEffect(() => {
    if (!autoPlay || total <= 1) return;
    if (isHovered) {
      clearInterval(timerRef.current);
    } else {
      timerRef.current = setInterval(next, interval);
    }
    return () => clearInterval(timerRef.current);
  }, [isHovered, autoPlay, interval, total, next]);

  // Swipe touch support
  const touchStartX = useRef(null);
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) dx < 0 ? next(null) : prev(null);
    touchStartX.current = null;
  };

  if (!images || total === 0) {
    return (
      <div
        onClick={onClick}
        style={{ height, background: '#f8cb78', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, opacity: 0.3, cursor: onClick ? 'pointer' : 'default' }}
      >
        🫙
      </div>
    );
  }

  // Single image — no carousel controls
  if (total === 1) {
    return (
      <div
        onClick={onClick}
        style={{ height, overflow: 'hidden', position: 'relative', cursor: onClick ? 'pointer' : 'default', background: '#f8cb78' }}
      >
        <img
          src={images[0]}
          alt={alt}
          style={{ width: '100%', height: '100%', objectFit, display: 'block', transition: 'transform 0.6s' }}
          onMouseEnter={e => { if (onClick) e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
        />
      </div>
    );
  }

  // Multiple images — full carousel
  return (
    <div
      style={{ height, overflow: 'hidden', position: 'relative', background: '#f8cb78', cursor: onClick ? 'pointer' : 'default' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={onClick}
    >
      {/* Slides */}
      <div
        style={{
          display: 'flex',
          height: '100%',
          transform: `translateX(-${current * 100}%)`,
          transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1)',
          willChange: 'transform',
        }}
      >
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={i === 0 ? alt : ''}
            style={{
              width: '100%',
              height: '100%',
              objectFit,
              display: 'block',
              flexShrink: 0,
              minWidth: '100%',
            }}
            draggable={false}
          />
        ))}
      </div>

      {/* Flèche gauche */}
      <button
        onClick={prev}
        aria-label="Image précédente"
        style={{
          position: 'absolute', top: '50%', left: 8, transform: 'translateY(-50%)',
          background: 'rgba(59,25,15,0.55)', border: 'none', cursor: 'pointer',
          color: '#f8cb78', width: 28, height: 28, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 13, borderRadius: 0,
          opacity: isHovered ? 1 : 0, transition: 'opacity 0.25s',
          zIndex: 2,
        }}
      >
        ‹
      </button>

      {/* Flèche droite */}
      <button
        onClick={next}
        aria-label="Image suivante"
        style={{
          position: 'absolute', top: '50%', right: 8, transform: 'translateY(-50%)',
          background: 'rgba(59,25,15,0.55)', border: 'none', cursor: 'pointer',
          color: '#f8cb78', width: 28, height: 28, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 13, borderRadius: 0,
          opacity: isHovered ? 1 : 0, transition: 'opacity 0.25s',
          zIndex: 2,
        }}
      >
        ›
      </button>

      {/* Points de navigation */}
      <div
        style={{
          position: 'absolute', bottom: 28, left: 0, right: 0,
          display: 'flex', justifyContent: 'center', gap: 5, zIndex: 2,
        }}
        onClick={e => e.stopPropagation()}
      >
        {images.map((_, i) => (
          <button
            key={i}
            onClick={e => goTo(e, i)}
            aria-label={`Image ${i + 1}`}
            style={{
              width: i === current ? 18 : 6,
              height: 6,
              borderRadius: 3,
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              background: i === current ? '#f8cb78' : 'rgba(248,203,120,0.45)',
              transition: 'all 0.3s',
            }}
          />
        ))}
      </div>
    </div>
  );
}
