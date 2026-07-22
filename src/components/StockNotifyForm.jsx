import React, { useState } from 'react';
import { submitStockNotification } from '../lib/api';

const T = {
  fr: { placeholder: 'Votre email', cta: "M'avertir du retour", sending: 'Envoi…', done: 'Merci, nous vous préviendrons dès le retour en stock !', error: 'Erreur, merci de réessayer.' },
  en: { placeholder: 'Your email', cta: 'Notify me', sending: 'Sending…', done: "Thanks, we'll email you as soon as it's back!", error: 'Error, please try again.' },
};

export default function StockNotifyForm({ productId, lang = 'fr' }) {
  const t = T[lang] || T.fr;
  const [email, setEmail]   = useState('');
  const [status, setStatus] = useState('idle'); // idle | busy | done | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!email.trim()) return;
    setStatus('busy');
    try {
      await submitStockNotification({ product_id: productId, email });
      setStatus('done');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'done') {
    return <p style={{ fontSize: 10, letterSpacing: '0.05em', color: '#7a4f2d' }}>{t.done}</p>;
  }

  return (
    <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} style={{ display: 'flex', gap: 6 }}>
      <input
        type="email" required value={email} placeholder={t.placeholder}
        onChange={(e) => setEmail(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        style={{ flex: 1, minWidth: 0, padding: '8px 10px', fontSize: 11, border: '0.5px solid rgba(59,25,15,0.2)', background: '#fff', color: '#3b190f', outline: 'none', fontFamily: 'inherit' }}
      />
      <button type="submit" disabled={status === 'busy'} style={{
        fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#fdf6ec', background: '#3b190f',
        border: 'none', padding: '0 12px', cursor: status === 'busy' ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
      }}>
        {status === 'busy' ? t.sending : t.cta}
      </button>
      {status === 'error' && <p style={{ fontSize: 10, color: '#c0392b', marginLeft: 6 }}>{t.error}</p>}
    </form>
  );
}
