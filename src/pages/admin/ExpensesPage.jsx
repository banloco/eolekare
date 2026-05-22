import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  getAdminExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../../lib/api';

const CATEGORIES = ['Fournisseur', 'Packaging', 'Site & Tech', 'Publicité', 'Livraison', 'Autre'];
const MARKETS    = [
  { value: 'benin',          label: '🇧🇯 Bénin' },
  { value: 'international',  label: '🇪🇺 Europe' },
  { value: 'both',           label: '🌍 Les deux' },
];

const EMPTY_FORM = {
  date:        new Date().toISOString().slice(0, 10),
  category:    'Fournisseur',
  description: '',
  amount_fcfa: '',
  amount_eur:  '',
  market:      'benin',
};

function fmtFCFA(n) {
  if (!n) return '—';
  return `${Number(n).toLocaleString('fr-FR')} F`;
}
function fmtEUR(n) {
  if (!n) return '—';
  return `${Number(n).toFixed(2)} €`;
}

/* ── MODAL ajout / édition ─────────────────────────────── */
function ExpenseModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description.trim()) { setErr('La description est requise.'); return; }
    if (!form.amount_fcfa && !form.amount_eur) { setErr('Renseignez au moins un montant.'); return; }
    setBusy(true); setErr('');
    try {
      await onSave({
        ...form,
        amount_fcfa: form.amount_fcfa ? Number(form.amount_fcfa) : null,
        amount_eur:  form.amount_eur  ? Number(form.amount_eur)  : null,
      });
    } catch (e) {
      setErr(e.message);
      setBusy(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '9px 12px',
    border: '0.5px solid rgba(59,25,15,0.2)', background: '#fff',
    fontSize: 12, color: '#3b190f', outline: 'none',
    fontFamily: 'Jost, sans-serif', boxSizing: 'border-box',
  };
  const labelStyle = {
    display: 'block', fontSize: 9, letterSpacing: '0.2em',
    textTransform: 'uppercase', color: '#7a4f2d', marginBottom: 4, marginTop: '1rem',
  };
  const selectStyle = { ...inputStyle, cursor: 'pointer' };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(59,25,15,0.45)' }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        zIndex: 401, background: '#fdf6ec', width: '90%', maxWidth: 520,
        boxShadow: '0 32px 80px rgba(0,0,0,0.25)', padding: '2.5rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 26, fontWeight: 300, color: '#3b190f' }}>
            {initial ? 'Modifier la dépense' : 'Nouvelle dépense'}
          </p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#3b190f', opacity: 0.4 }}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Date *</label>
          <input type="date" style={inputStyle} value={form.date} onChange={e => set('date', e.target.value)} required />

          <label style={labelStyle}>Catégorie *</label>
          <select style={selectStyle} value={form.category} onChange={e => set('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <label style={labelStyle}>Description *</label>
          <input style={inputStyle} value={form.description} onChange={e => set('description', e.target.value)}
            placeholder="Ex: Facture Purethnik sept 2025" />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Montant FCFA</label>
              <input type="number" min="0" step="1" style={inputStyle} value={form.amount_fcfa}
                onChange={e => set('amount_fcfa', e.target.value)} placeholder="746120" />
            </div>
            <div>
              <label style={labelStyle}>Montant EUR</label>
              <input type="number" min="0" step="0.01" style={inputStyle} value={form.amount_eur}
                onChange={e => set('amount_eur', e.target.value)} placeholder="45.00" />
            </div>
          </div>

          <label style={labelStyle}>Marché *</label>
          <select style={selectStyle} value={form.market} onChange={e => set('market', e.target.value)}>
            {MARKETS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>

          {err && <p style={{ fontSize: 11, color: '#c0392b', marginTop: '1rem' }}>{err}</p>}

          <div style={{ display: 'flex', gap: '0.8rem', marginTop: '2rem' }}>
            <button type="submit" disabled={busy} style={{
              flex: 1, padding: '12px', background: busy ? '#999' : '#3b190f', color: '#fdf6ec',
              border: 'none', cursor: busy ? 'not-allowed' : 'pointer', fontSize: 10,
              letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif',
            }}>
              {busy ? 'Enregistrement…' : (initial ? 'Modifier' : 'Ajouter')}
            </button>
            <button type="button" onClick={onClose} style={{
              padding: '12px 20px', background: 'none', border: '0.5px solid rgba(59,25,15,0.2)',
              cursor: 'pointer', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
              fontFamily: 'Jost, sans-serif', color: '#3b190f',
            }}>Annuler</button>
          </div>
        </form>
      </div>
    </>
  );
}

/* ── PAGE PRINCIPALE ───────────────────────────────────── */
export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null); // null | 'new' | expense object
  const [deleting, setDeleting] = useState(null);
  const [filterMarket,   setFilterMarket]   = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterMonth,    setFilterMonth]    = useState('');

  const load = () => {
    setLoading(true);
    const params = {};
    if (filterMarket)   params.market   = filterMarket;
    if (filterCategory) params.category = filterCategory;
    if (filterMonth)    params.month    = filterMonth;
    getAdminExpenses(params)
      .then(setExpenses)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterMarket, filterCategory, filterMonth]);

  const totalFCFA = expenses.filter(e => e.market === 'benin' || e.market === 'both')
    .reduce((s, e) => s + (e.amount_fcfa || 0), 0);
  const totalEUR  = expenses.filter(e => e.market === 'international' || e.market === 'both')
    .reduce((s, e) => s + (e.amount_eur || 0), 0);

  const handleSave = async (data) => {
    if (modal && modal !== 'new') {
      await updateExpense(modal.id, data);
    } else {
      await createExpense(data);
    }
    setModal(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette dépense ?')) return;
    setDeleting(id);
    try {
      await deleteExpense(id);
      load();
    } finally {
      setDeleting(null);
    }
  };

  const marketLabel = (m) => MARKETS.find(x => x.value === m)?.label || m;

  const filterStyle = {
    padding: '7px 12px', border: '0.5px solid rgba(59,25,15,0.2)', background: '#fff',
    fontSize: 11, color: '#3b190f', cursor: 'pointer', fontFamily: 'Jost, sans-serif', outline: 'none',
  };

  return (
    <AdminLayout>
      {/* Modal */}
      {modal && (
        <ExpenseModal
          initial={modal !== 'new' ? {
            ...modal,
            date: modal.date ? modal.date.slice(0, 10) : '',
            amount_fcfa: modal.amount_fcfa ?? '',
            amount_eur:  modal.amount_eur  ?? '',
          } : null}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 38, fontWeight: 300, color: '#3b190f', marginBottom: 4 }}>
            Dépenses
          </h1>
          <p style={{ fontSize: 11, color: '#7a4f2d', letterSpacing: '0.1em' }}>
            Suivi des coûts et charges
          </p>
        </div>
        <button onClick={() => setModal('new')} style={{
          fontSize: 10, letterSpacing: '0.22em', fontWeight: 300, textTransform: 'uppercase',
          color: '#fdf6ec', background: '#3b190f', padding: '12px 28px', border: 'none', cursor: 'pointer',
          fontFamily: 'Jost, sans-serif',
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#5a2d12'}
          onMouseLeave={e => e.currentTarget.style.background = '#3b190f'}
        >
          + Ajouter une dépense
        </button>
      </div>

      {/* Totaux */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div style={{ background: '#fff', padding: '1.5rem 2rem', border: '0.5px solid rgba(59,25,15,0.08)', flex: 1, minWidth: 180 }}>
          <p style={{ fontSize: 9, letterSpacing: '0.25em', color: '#7a4f2d', textTransform: 'uppercase', marginBottom: '0.6rem' }}>Total (filtre en cours) — FCFA</p>
          <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 36, fontWeight: 300, color: '#c0392b', lineHeight: 1 }}>
            {totalFCFA > 0 ? fmtFCFA(totalFCFA) : '—'}
          </p>
        </div>
        <div style={{ background: '#fff', padding: '1.5rem 2rem', border: '0.5px solid rgba(59,25,15,0.08)', flex: 1, minWidth: 180 }}>
          <p style={{ fontSize: 9, letterSpacing: '0.25em', color: '#7a4f2d', textTransform: 'uppercase', marginBottom: '0.6rem' }}>Total (filtre en cours) — EUR</p>
          <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 36, fontWeight: 300, color: '#c0392b', lineHeight: 1 }}>
            {totalEUR > 0 ? fmtEUR(totalEUR) : '—'}
          </p>
        </div>
        <div style={{ background: '#fff', padding: '1.5rem 2rem', border: '0.5px solid rgba(59,25,15,0.08)', flex: 1, minWidth: 180 }}>
          <p style={{ fontSize: 9, letterSpacing: '0.25em', color: '#7a4f2d', textTransform: 'uppercase', marginBottom: '0.6rem' }}>Nombre d'entrées</p>
          <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 36, fontWeight: 300, color: '#3b190f', lineHeight: 1 }}>{expenses.length}</p>
        </div>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <p style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7a4f2d' }}>Filtrer :</p>
        <input type="month" style={filterStyle} value={filterMonth} onChange={e => setFilterMonth(e.target.value)} />
        <select style={filterStyle} value={filterMarket} onChange={e => setFilterMarket(e.target.value)}>
          <option value="">Tous les marchés</option>
          {MARKETS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
        <select style={filterStyle} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="">Toutes catégories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {(filterMarket || filterCategory || filterMonth) && (
          <button onClick={() => { setFilterMarket(''); setFilterCategory(''); setFilterMonth(''); }}
            style={{ ...filterStyle, background: 'rgba(192,57,43,0.08)', color: '#c0392b', border: '0.5px solid rgba(192,57,43,0.2)' }}>
            ✕ Réinitialiser
          </button>
        )}
      </div>

      {/* Tableau */}
      <div style={{ background: '#fff', border: '0.5px solid rgba(59,25,15,0.08)' }}>
        {loading ? (
          <p style={{ padding: '3rem', textAlign: 'center', fontFamily: '"Cormorant Garamond", serif', fontSize: 18, fontStyle: 'italic', color: 'rgba(59,25,15,0.4)' }}>
            Chargement…
          </p>
        ) : expenses.length === 0 ? (
          <p style={{ padding: '3rem', textAlign: 'center', fontFamily: '"Cormorant Garamond", serif', fontSize: 18, fontStyle: 'italic', color: 'rgba(59,25,15,0.4)' }}>
            Aucune dépense enregistrée.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '0.5px solid rgba(59,25,15,0.08)' }}>
                  {['Date', 'Catégorie', 'Description', 'Montant FCFA', 'Montant EUR', 'Marché', ''].map(h => (
                    <th key={h} style={{ padding: '10px 1.5rem', textAlign: 'left', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(59,25,15,0.4)', fontWeight: 300, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {expenses.map(e => (
                  <tr key={e.id} style={{ borderBottom: '0.5px solid rgba(59,25,15,0.04)', transition: 'background 0.15s' }}
                    onMouseEnter={el => el.currentTarget.style.background = 'rgba(248,203,120,0.04)'}
                    onMouseLeave={el => el.currentTarget.style.background = ''}>
                    <td style={{ padding: '12px 1.5rem', fontSize: 12, color: '#7a4f2d', whiteSpace: 'nowrap' }}>
                      {new Date(e.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={{ padding: '12px 1.5rem' }}>
                      <span style={{ fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '3px 8px', background: 'rgba(59,25,15,0.06)', color: '#7a4f2d' }}>{e.category}</span>
                    </td>
                    <td style={{ padding: '12px 1.5rem', fontSize: 12, color: '#3b190f', maxWidth: 280 }}>{e.description}</td>
                    <td style={{ padding: '12px 1.5rem', fontFamily: '"Cormorant Garamond", serif', fontSize: 15, color: '#3b190f', whiteSpace: 'nowrap' }}>{fmtFCFA(e.amount_fcfa)}</td>
                    <td style={{ padding: '12px 1.5rem', fontFamily: '"Cormorant Garamond", serif', fontSize: 15, color: '#3b190f', whiteSpace: 'nowrap' }}>{fmtEUR(e.amount_eur)}</td>
                    <td style={{ padding: '12px 1.5rem', fontSize: 11, color: '#7a4f2d', whiteSpace: 'nowrap' }}>{marketLabel(e.market)}</td>
                    <td style={{ padding: '12px 1.5rem', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => setModal(e)} style={{ background: 'none', border: '0.5px solid rgba(59,25,15,0.2)', padding: '5px 12px', cursor: 'pointer', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#3b190f', fontFamily: 'Jost, sans-serif' }}>
                          Modifier
                        </button>
                        <button onClick={() => handleDelete(e.id)} disabled={deleting === e.id} style={{ background: 'none', border: '0.5px solid rgba(192,57,43,0.25)', padding: '5px 12px', cursor: 'pointer', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c0392b', fontFamily: 'Jost, sans-serif' }}>
                          {deleting === e.id ? '…' : 'Supprimer'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
