import { useState } from 'react';

const inputStyle = {
  padding: '10px 12px',
  border: '0.5px solid rgba(59,25,15,0.2)',
  background: '#fff',
  fontSize: 12,
  color: '#3b190f',
  outline: 'none',
  fontFamily: 'Jost,sans-serif',
  boxSizing: 'border-box',
};

export default function RelayPicker({ onSelect, countryCode = 'FR' }) {
  const [cp, setCp]           = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError]     = useState('');

  const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  const handleSearch = async (e) => {
    e.preventDefault();
    if (cp.trim().length < 4) { setError('Entrez un code postal valide.'); return; }
    setError('');
    setLoading(true);
    setSearched(false);
    setResults([]);
    try {
      const res = await fetch(`${BASE}/relay-points?cp=${encodeURIComponent(cp.trim())}&country=${countryCode}`, {
        headers: { Accept: 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur serveur');
      setResults(data);
      setSearched(true);
    } catch (err) {
      setError(err.message || 'Impossible de charger les points relais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Formulaire de recherche */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
        <input
          style={{ ...inputStyle, flex: 1 }}
          value={cp}
          onChange={e => setCp(e.target.value)}
          placeholder="Code postal (ex : 75001)"
          maxLength={10}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ padding: '10px 16px', background: loading ? '#999' : '#3b190f', color: '#fdf6ec', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'Jost,sans-serif', whiteSpace: 'nowrap' }}
        >
          {loading ? '…' : 'Rechercher'}
        </button>
      </form>

      {error && <p style={{ color: '#c0392b', fontSize: 11, marginBottom: 8 }}>{error}</p>}

      {/* Résultats */}
      {results.length > 0 && (
        <div style={{ maxHeight: 320, overflowY: 'auto', border: '0.5px solid rgba(59,25,15,0.1)' }}>
          {results.map((relay) => (
            <button
              key={relay.ID}
              type="button"
              onClick={() => onSelect(relay)}
              style={{ display: 'block', width: '100%', padding: '12px 14px', background: 'none', border: 'none', borderBottom: '0.5px solid rgba(59,25,15,0.07)', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8f0e3'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 15, color: '#3b190f', margin: 0 }}>{relay.Nom}</p>
              <p style={{ fontSize: 11, color: '#7a4f2d', margin: '2px 0 0' }}>{relay.Adresse1} — {relay.CP} {relay.Ville}</p>
              {relay.Horaires && <p style={{ fontSize: 10, color: '#aaa', margin: '2px 0 0' }}>{relay.Horaires}</p>}
            </button>
          ))}
        </div>
      )}

      {searched && results.length === 0 && !error && (
        <p style={{ fontSize: 11, color: '#7a4f2d', fontStyle: 'italic' }}>Aucun point relais trouvé pour ce code postal.</p>
      )}
    </div>
  );
}
