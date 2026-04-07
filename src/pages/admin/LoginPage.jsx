// src/pages/admin/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Assurez-vous du bon chemin

export default function LoginPage() {  // ← Assurez-vous que c'est 'export default'
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#3b190f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'Jost, sans-serif',
    }}>
      <div style={{
        background: '#fdf6ec',
        width: '100%',
        maxWidth: 420,
        padding: '3rem',
        boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 36, fontWeight: 300, letterSpacing: '0.25em', color: '#3b190f', lineHeight: 1 }}>
            EOLEKARE
          </p>
          <p style={{ fontSize: 9, letterSpacing: '0.3em', color: '#7a4f2d', textTransform: 'uppercase', marginTop: 4 }}>
            Dashboard Admin
          </p>
          <div style={{ width: 32, height: '0.5px', background: '#f8cb78', margin: '1rem auto 0' }} />
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7a4f2d', marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{
                width: '100%', padding: '12px 14px',
                border: '0.5px solid rgba(59,25,15,0.2)',
                background: '#fff',
                fontSize: 13, color: '#3b190f',
                outline: 'none', fontFamily: 'Jost, sans-serif',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = '#f8cb78'}
              onBlur={e => e.target.style.borderColor = 'rgba(59,25,15,0.2)'}
            />
          </div>

          <div style={{ marginBottom: '1.8rem' }}>
            <label style={{ display: 'block', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7a4f2d', marginBottom: 6 }}>
              Mot de passe
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{
                  width: '100%', padding: '12px 44px 12px 14px',
                  border: '0.5px solid rgba(59,25,15,0.2)',
                  background: '#fff',
                  fontSize: 13, color: '#3b190f',
                  outline: 'none', fontFamily: 'Jost, sans-serif',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = '#f8cb78'}
                onBlur={e => e.target.style.borderColor = 'rgba(59,25,15,0.2)'}
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#7a4f2d', padding: 0 }}
              >
                {showPwd ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(192,57,43,0.08)', border: '0.5px solid rgba(192,57,43,0.3)', padding: '10px 14px', marginBottom: '1.2rem' }}>
              <p style={{ fontSize: 11, color: '#c0392b', letterSpacing: '0.05em' }}>⚠ {error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px',
              background: loading ? 'rgba(59,25,15,0.5)' : '#3b190f',
              color: '#fdf6ec',
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 10, letterSpacing: '0.28em',
              fontWeight: 300, textTransform: 'uppercase',
              fontFamily: 'Jost, sans-serif',
              transition: 'background 0.3s',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#5a2d12'; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#3b190f'; }}
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 9, letterSpacing: '0.12em', color: 'rgba(59,25,15,0.3)', marginTop: '2rem', textTransform: 'uppercase' }}>
          Accès réservé — Eolekare Admin
        </p>
      </div>
    </div>
  );
}