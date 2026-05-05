import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/admin/dashboard', icon: '▦', label: 'Vue d\'ensemble' },
  { to: '/admin/products',  icon: '◈', label: 'Produits' },
  { to: '/admin/products/new', icon: '+', label: 'Ajouter produit' },
];

export default function AdminLayout({ children }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    navigate('/admin');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Jost, sans-serif', background: '#f5ede0' }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: 240, flexShrink: 0,
        background: '#3b190f',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0,
        zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{ padding: '2rem 1.5rem 1.5rem', borderBottom: '0.5px solid rgba(248,203,120,0.12)' }}>
          <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 24, fontWeight: 300, letterSpacing: '0.22em', color: '#f8cb78', lineHeight: 1 }}>
            EOLEKARE
          </p>
          <p style={{ fontSize: 8, letterSpacing: '0.25em', color: 'rgba(248,203,120,0.35)', textTransform: 'uppercase', marginTop: 4 }}>
            Admin Dashboard
          </p>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '1.5rem 0' }}>
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin/dashboard'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 1.5rem',
                textDecoration: 'none',
                fontSize: 11, letterSpacing: '0.12em',
                fontWeight: 300, textTransform: 'uppercase',
                color: isActive ? '#f8cb78' : 'rgba(253,246,236,0.45)',
                background: isActive ? 'rgba(248,203,120,0.08)' : 'transparent',
                borderLeft: isActive ? '2px solid #f8cb78' : '2px solid transparent',
                transition: 'all 0.2s',
              })}
            >
              <span style={{ fontSize: 14, opacity: 0.8 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div style={{ padding: '1.5rem', borderTop: '0.5px solid rgba(248,203,120,0.12)' }}>
          <p style={{ fontSize: 10, letterSpacing: '0.1em', color: 'rgba(248,203,120,0.4)', marginBottom: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.email}
          </p>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            style={{
              width: '100%', padding: '9px',
              background: 'rgba(248,203,120,0.08)',
              border: '0.5px solid rgba(248,203,120,0.2)',
              color: 'rgba(248,203,120,0.6)',
              cursor: 'pointer', fontSize: 9,
              letterSpacing: '0.2em', fontWeight: 300,
              textTransform: 'uppercase',
              fontFamily: 'Jost, sans-serif',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,203,120,0.15)'; e.currentTarget.style.color = '#f8cb78'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,203,120,0.08)'; e.currentTarget.style.color = 'rgba(248,203,120,0.6)'; }}
          >
            {signingOut ? 'Déconnexion…' : '→ Se déconnecter'}
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{ marginLeft: 240, flex: 1, minHeight: '100vh', padding: '2.5rem 3rem' }}>
        {children}
      </main>
    </div>
  );
}
