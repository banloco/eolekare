import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import AdminLayout from '../../components/admin/AdminLayout';
import { getAdminWaitlist, deleteWaitlistSignup } from '../../lib/api';

const ZONES = [
  { value: 'benin',          label: '🇧🇯 Bénin' },
  { value: 'international',  label: '🇪🇺 Europe' },
];

export default function WaitlistPage() {
  const [signups, setSignups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [filterZone, setFilterZone] = useState('');

  const load = () => {
    setLoading(true);
    const params = {};
    if (filterZone) params.zone = filterZone;
    getAdminWaitlist(params)
      .then(setSignups)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterZone]);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette inscription ?')) return;
    setDeleting(id);
    try {
      await deleteWaitlistSignup(id);
      load();
    } finally {
      setDeleting(null);
    }
  };

  const zoneLabel = (z) => ZONES.find(x => x.value === z)?.label || z;

  const waNumber = (phone) => (phone || '').replace(/[^\d+]/g, '');

  const handleExportExcel = () => {
    const rows = signups.map(s => ({
      Date: new Date(s.created_at).toLocaleDateString('fr-FR'),
      Zone: zoneLabel(s.zone),
      'Produit souhaité': s.product_type,
      Prénom: s.firstname,
      Email: s.email || '',
      Téléphone: s.phone || '',
      Instagram: s.instagram || '',
    }));
    const sheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, 'Liste d\'attente');
    XLSX.writeFile(workbook, `liste-attente-eolekare-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const filterStyle = {
    padding: '7px 12px', border: '0.5px solid rgba(59,25,15,0.2)', background: '#fff',
    fontSize: 11, color: '#3b190f', cursor: 'pointer', fontFamily: 'Jost, sans-serif', outline: 'none',
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 38, fontWeight: 300, color: '#3b190f', marginBottom: 4 }}>
            Liste d'attente
          </h1>
          <p style={{ fontSize: 11, color: '#7a4f2d', letterSpacing: '0.1em' }}>
            Demandes enregistrées avant le lancement
          </p>
        </div>
        <button
          onClick={handleExportExcel}
          disabled={signups.length === 0}
          style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#fdf6ec', background: '#3b190f', padding: '12px 24px', border: 'none', cursor: signups.length === 0 ? 'not-allowed' : 'pointer', opacity: signups.length === 0 ? 0.5 : 1 }}
          onMouseEnter={e => { if (signups.length) e.currentTarget.style.background = '#5a2d12'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#3b190f'; }}
        >
          ↓ Exporter Excel
        </button>
      </div>

      {/* Total */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div style={{ background: '#fff', padding: '1.5rem 2rem', border: '0.5px solid rgba(59,25,15,0.08)', flex: 1, minWidth: 180 }}>
          <p style={{ fontSize: 9, letterSpacing: '0.25em', color: '#7a4f2d', textTransform: 'uppercase', marginBottom: '0.6rem' }}>Inscriptions (filtre en cours)</p>
          <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 36, fontWeight: 300, color: '#3b190f', lineHeight: 1 }}>{signups.length}</p>
        </div>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <p style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7a4f2d' }}>Filtrer :</p>
        <select style={filterStyle} value={filterZone} onChange={e => setFilterZone(e.target.value)}>
          <option value="">Toutes les zones</option>
          {ZONES.map(z => <option key={z.value} value={z.value}>{z.label}</option>)}
        </select>
        {filterZone && (
          <button onClick={() => setFilterZone('')}
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
        ) : signups.length === 0 ? (
          <p style={{ padding: '3rem', textAlign: 'center', fontFamily: '"Cormorant Garamond", serif', fontSize: 18, fontStyle: 'italic', color: 'rgba(59,25,15,0.4)' }}>
            Aucune inscription pour le moment.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '0.5px solid rgba(59,25,15,0.08)' }}>
                  {['Date', 'Zone', 'Produit souhaité', 'Prénom', 'Email', 'Téléphone', 'Instagram', ''].map(h => (
                    <th key={h} style={{ padding: '10px 1.5rem', textAlign: 'left', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(59,25,15,0.4)', fontWeight: 300, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {signups.map(s => (
                  <tr key={s.id} style={{ borderBottom: '0.5px solid rgba(59,25,15,0.04)', transition: 'background 0.15s' }}
                    onMouseEnter={el => el.currentTarget.style.background = 'rgba(248,203,120,0.04)'}
                    onMouseLeave={el => el.currentTarget.style.background = ''}>
                    <td style={{ padding: '12px 1.5rem', fontSize: 12, color: '#7a4f2d', whiteSpace: 'nowrap' }}>
                      {new Date(s.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={{ padding: '12px 1.5rem', fontSize: 11, color: '#7a4f2d', whiteSpace: 'nowrap' }}>{zoneLabel(s.zone)}</td>
                    <td style={{ padding: '12px 1.5rem', fontSize: 12, color: '#3b190f' }}>{s.product_type}</td>
                    <td style={{ padding: '12px 1.5rem', fontSize: 12, color: '#3b190f', whiteSpace: 'nowrap' }}>{s.firstname}</td>
                    <td style={{ padding: '12px 1.5rem', fontSize: 12, color: '#3b190f', whiteSpace: 'nowrap' }}>
                      {s.email ? <a href={`mailto:${s.email}`} style={{ color: '#3b190f' }}>{s.email}</a> : '—'}
                    </td>
                    <td style={{ padding: '12px 1.5rem', fontSize: 12, color: '#3b190f', whiteSpace: 'nowrap' }}>
                      <a href={`https://wa.me/${waNumber(s.phone)}`} target="_blank" rel="noreferrer" style={{ color: '#3b190f' }}>{s.phone}</a>
                    </td>
                    <td style={{ padding: '12px 1.5rem', fontSize: 12, color: '#3b190f', whiteSpace: 'nowrap' }}>{s.instagram || '—'}</td>
                    <td style={{ padding: '12px 1.5rem', whiteSpace: 'nowrap' }}>
                      <button onClick={() => handleDelete(s.id)} disabled={deleting === s.id} style={{ background: 'none', border: '0.5px solid rgba(192,57,43,0.25)', padding: '5px 12px', cursor: 'pointer', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c0392b', fontFamily: 'Jost, sans-serif' }}>
                        {deleting === s.id ? '…' : 'Supprimer'}
                      </button>
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
