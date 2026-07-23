import React, { useState } from 'react';
import FloatingFruits from '../components/FloatingFruits';
import { useSEO } from '../hooks/useSEO';
import { submitWaitlist } from '../lib/api';

const PRODUCT_TYPES = ['Mangue 100ml', 'Avocat 100ml', 'Coco 100ml', 'Mangue 500ml', 'Avocat 500ml', 'Coco 500ml', 'Pack découverte'];

const inputStyle = {
  width: '100%', padding: '12px 14px', border: '1px solid rgba(255,255,255,0.3)',
  background: 'rgba(255,255,255,0.1)', color: '#000', fontSize: 13, outline: 'none',
  fontFamily: 'inherit', boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
  color: 'rgba(0,0,0,0.6)', marginBottom: 6,
};

function ChoiceButton({ active, onClick, children }) {
  return (
    <button type="button" onClick={onClick} style={{
      padding: '10px 16px', fontSize: 12, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.3)',
      background: active ? '#fff' : 'rgba(255,255,255,0.1)', color: '#000',
      transition: 'all 0.25s', borderRadius: 3,
    }}>
      {children}
    </button>
  );
}

export default function WaitlistPage() {
  useSEO({
    title: 'Eolekare — Bientôt disponible',
    description: "Le lancement d'Eolekare arrive bientôt. Inscrivez-vous pour être averti en priorité.",
    url: 'https://eolekare.com/',
    lang: 'fr',
  });

  const [form, setForm] = useState({ zone: '', product_type: '', firstname: '', phone: '', instagram: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const update = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.zone) { setError('Merci de choisir votre zone (Bénin ou Europe).'); return; }
    if (!form.product_type) { setError('Merci de choisir le beurre qui vous intéresse.'); return; }
    if (!form.firstname.trim()) { setError('Merci de renseigner votre prénom.'); return; }
    if (!form.phone.trim()) { setError('Merci de renseigner votre numéro de téléphone / WhatsApp.'); return; }
    setError('');
    setBusy(true);
    try {
      await submitWaitlist(form);
      setDone(true);
    } catch (err) {
      setError(err.message || "Une erreur est survenue, merci de réessayer.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <style>{`
        html,body{height:100%;overflow:auto;background:#f8cb78}
      `}</style>

      <div className="fixed inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: "url('/bg-hero.jpg')", filter: 'brightness(0.35) saturate(0.6)' }} />
      <div className="fixed inset-0 z-[1]" style={{ background: 'linear-gradient(135deg,rgba(248,203,120,0.88) 0%,rgba(59,25,15,0.75) 100%)' }} />
      <div className="fixed inset-0 z-[2] pointer-events-none overflow-hidden">
        <FloatingFruits variant="selector" />
      </div>

      <div className="relative z-[3] flex flex-col items-center" style={{ minHeight: '100vh', padding: '4rem 1.5rem' }}>

        <p style={{ fontFamily: '"Brown Sugar",cursive', fontSize: 'clamp(32px,6vw,60px)', fontWeight: 400, letterSpacing: '0.05em', color: '#000', lineHeight: 1.1, textShadow: '0 2px 20px rgba(59,25,15,0.3)', marginBottom: '0.3rem', textAlign: 'center' }}>
          Eolekare
        </p>
        <p style={{ fontFamily: '"Montserrat",sans-serif', fontSize: 11, letterSpacing: '0.35em', fontWeight: 300, color: 'rgba(0,0,0,0.6)', textTransform: 'uppercase', marginBottom: '1.5rem' }}>by Eoleeg</p>

        <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 'clamp(20px,3vw,28px)', fontStyle: 'italic', color: '#000', maxWidth: 480, lineHeight: 1.5, marginBottom: '0.6rem', textAlign: 'center' }}>
          Nos stocks partent très vite.
        </p>
        <p style={{ fontSize: 12, letterSpacing: '0.05em', fontWeight: 300, color: 'rgba(0,0,0,0.65)', maxWidth: 420, lineHeight: 1.7, marginBottom: '2.5rem', textAlign: 'center' }}>
          Précommandez pour être sûr d'avoir le vôtre. Dites-nous ce qui vous intéresse, nous vous prévenons dès l'ouverture.
        </p>

        {done ? (
          <div style={{ maxWidth: 420, textAlign: 'center', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 4, padding: '2.5rem 2rem' }}>
            <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 20, color: '#000', lineHeight: 1.6 }}>
              Nous avons bien enregistré vos envies, nous revenons vers vous au plus vite.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 420, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 4, padding: '2rem' }}>

            <label style={labelStyle}>Votre zone</label>
            <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.4rem' }}>
              <ChoiceButton active={form.zone === 'benin'} onClick={() => update('zone')('benin')}>Bénin</ChoiceButton>
              <ChoiceButton active={form.zone === 'international'} onClick={() => update('zone')('international')}>Europe</ChoiceButton>
            </div>

            <label style={labelStyle}>Beurre souhaité</label>
            <select
              style={{ ...inputStyle, marginBottom: '1.4rem' }}
              value={form.product_type}
              onChange={(e) => update('product_type')(e.target.value)}
            >
              <option value="" disabled style={{ color: '#000' }}>Choisissez un produit</option>
              {PRODUCT_TYPES.map((p) => (
                <option key={p} value={p} style={{ color: '#000' }}>{p}</option>
              ))}
            </select>

            <label style={labelStyle}>Prénom</label>
            <input style={{ ...inputStyle, marginBottom: '1.2rem' }} value={form.firstname} onChange={(e) => update('firstname')(e.target.value)} placeholder="Votre prénom" />

            <label style={labelStyle}>Téléphone / WhatsApp</label>
            <input style={{ ...inputStyle, marginBottom: '1.2rem' }} type="tel" value={form.phone} onChange={(e) => update('phone')(e.target.value)} placeholder="+229 00 00 00 00" />

            <label style={labelStyle}>Instagram (optionnel)</label>
            <input style={{ ...inputStyle, marginBottom: '1.6rem' }} value={form.instagram} onChange={(e) => update('instagram')(e.target.value)} placeholder="@votre_pseudo" />

            {error && <p style={{ color: '#ffb3b3', fontSize: 12, marginBottom: '1rem' }}>{error}</p>}

            <button type="submit" disabled={busy} style={{
              width: '100%', padding: 14, background: busy ? 'rgba(255,255,255,0.4)' : '#fff', color: '#000',
              border: 'none', cursor: busy ? 'not-allowed' : 'pointer', fontSize: 11, letterSpacing: '0.25em',
              fontWeight: 500, textTransform: 'uppercase', borderRadius: 3,
            }}>
              {busy ? 'Envoi…' : 'Valider'}
            </button>
          </form>
        )}

        <p style={{ marginTop: '3rem', fontSize: 9, letterSpacing: '0.18em', fontWeight: 300, color: 'rgba(0,0,0,0.3)', textTransform: 'uppercase' }}>
          © 2026 Eolekare by Eoleeg &nbsp;·&nbsp; Instagram @eolekare
        </p>
      </div>
    </>
  );
}
