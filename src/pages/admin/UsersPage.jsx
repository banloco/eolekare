import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser } from '../../lib/api';

const ROLE_LABELS = { super_admin: 'Super Admin', admin: 'Admin', readonly: 'Lecture seule' };
const ROLE_COLORS = {
  super_admin: { bg: 'rgba(248,203,120,0.25)', color: '#7a4f2d', border: 'rgba(248,203,120,0.6)' },
  admin:       { bg: 'rgba(59,25,15,0.08)',    color: '#3b190f', border: 'rgba(59,25,15,0.2)'    },
  readonly:    { bg: 'rgba(122,79,45,0.08)',   color: '#7a4f2d', border: 'rgba(122,79,45,0.2)'   },
};

const inputStyle = {
  width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '0.5px solid rgba(59,25,15,0.2)',
  background: '#fff', fontSize: 13, color: '#3b190f', outline: 'none', fontFamily: 'inherit',
};

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(59,25,15,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#fdf6ec', maxWidth: 480, width: '100%', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 26, fontWeight: 300, color: '#3b190f', margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, color: '#7a4f2d', cursor: 'pointer' }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function UserForm({ initial, onSubmit, onClose, isEdit }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'admin', ...initial });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const payload = { ...form };
      if (isEdit && !payload.password) delete payload.password;
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <p style={{ background: 'rgba(192,57,43,0.08)', border: '0.5px solid rgba(192,57,43,0.3)', padding: '0.6rem 1rem', fontSize: 12, color: '#c0392b', marginBottom: '1rem' }}>{error}</p>}

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7a4f2d', marginBottom: 6 }}>Nom</label>
        <input value={form.name} onChange={e => set('name', e.target.value)} required style={inputStyle} />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7a4f2d', marginBottom: 6 }}>Email</label>
        <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required style={inputStyle} />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7a4f2d', marginBottom: 6 }}>
          {isEdit ? 'Mot de passe (laisser vide = inchangé)' : 'Mot de passe'}
        </label>
        <input type="password" value={form.password} onChange={e => set('password', e.target.value)} required={!isEdit} minLength={8} style={inputStyle} autoComplete="new-password" />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7a4f2d', marginBottom: 6 }}>Rôle</label>
        <select value={form.role} onChange={e => set('role', e.target.value)} style={inputStyle}>
          <option value="admin">Admin</option>
          <option value="readonly">Lecture seule</option>
          <option value="super_admin">Super Admin</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
        <button type="button" onClick={onClose} style={{ padding: '10px 20px', border: '0.5px solid rgba(59,25,15,0.2)', background: 'transparent', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', color: '#7a4f2d' }}>
          Annuler
        </button>
        <button type="submit" disabled={loading} style={{ padding: '10px 24px', border: 'none', background: '#3b190f', color: '#fdf6ec', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer' }}>
          {loading ? '…' : isEdit ? 'Modifier' : 'Créer'}
        </button>
      </div>
    </form>
  );
}

export default function UsersPage() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null); // null | 'create' | { edit: user }
  const [error, setError]     = useState('');

  async function load() {
    setLoading(true);
    try { setUsers(await getAdminUsers()); } catch (e) { setError(e.message); } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(data) {
    await createAdminUser(data);
    await load();
  }

  async function handleUpdate(id, data) {
    await updateAdminUser(id, data);
    await load();
  }

  async function handleDelete(user) {
    if (!window.confirm(`Supprimer ${user.name} (${user.email}) ?`)) return;
    try {
      await deleteAdminUser(user.id);
      await load();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 38, fontWeight: 300, color: '#3b190f', marginBottom: 4 }}>
            Utilisateurs admin
          </h1>
          <p style={{ fontSize: 11, color: '#7a4f2d', letterSpacing: '0.1em' }}>{users.length} compte{users.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setModal('create')}
          style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#fdf6ec', background: '#3b190f', padding: '12px 24px', border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.background = '#5a2d12'}
          onMouseLeave={e => e.currentTarget.style.background = '#3b190f'}
        >
          + Ajouter un utilisateur
        </button>
      </div>

      {error && <p style={{ color: '#c0392b', fontSize: 12, marginBottom: '1rem' }}>{error}</p>}

      {loading ? (
        <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 18, fontStyle: 'italic', color: 'rgba(59,25,15,0.4)' }}>Chargement…</p>
      ) : (
        <div style={{ background: '#fff', border: '0.5px solid rgba(59,25,15,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '0.5px solid rgba(59,25,15,0.08)' }}>
                {['Nom', 'Email', 'Rôle', 'Créé le', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 2rem', textAlign: 'left', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(59,25,15,0.4)', fontWeight: 300 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const roleStyle = ROLE_COLORS[u.role] || ROLE_COLORS.admin;
                return (
                  <tr key={u.id} style={{ borderBottom: '0.5px solid rgba(59,25,15,0.04)' }}>
                    <td style={{ padding: '14px 2rem', fontFamily: '"Cormorant Garamond", serif', fontSize: 17, color: '#3b190f' }}>{u.name}</td>
                    <td style={{ padding: '14px 2rem', fontSize: 12, color: '#7a4f2d' }}>{u.email}</td>
                    <td style={{ padding: '14px 2rem' }}>
                      <span style={{ fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '3px 10px', background: roleStyle.bg, color: roleStyle.color, border: `0.5px solid ${roleStyle.border}` }}>
                        {ROLE_LABELS[u.role] || u.role}
                      </span>
                    </td>
                    <td style={{ padding: '14px 2rem', fontSize: 11, color: 'rgba(59,25,15,0.45)' }}>
                      {new Date(u.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={{ padding: '14px 2rem' }}>
                      <div style={{ display: 'flex', gap: '0.8rem' }}>
                        <button onClick={() => setModal({ edit: u })} style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', background: 'none', border: '0.5px solid rgba(59,25,15,0.2)', padding: '5px 14px', cursor: 'pointer', color: '#3b190f' }}>
                          Modifier
                        </button>
                        <button onClick={() => handleDelete(u)} style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', background: 'none', border: '0.5px solid rgba(192,57,43,0.3)', padding: '5px 14px', cursor: 'pointer', color: '#c0392b' }}>
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal créer */}
      {modal === 'create' && (
        <Modal title="Ajouter un utilisateur" onClose={() => setModal(null)}>
          <UserForm onSubmit={handleCreate} onClose={() => setModal(null)} isEdit={false} />
        </Modal>
      )}

      {/* Modal modifier */}
      {modal?.edit && (
        <Modal title="Modifier l'utilisateur" onClose={() => setModal(null)}>
          <UserForm
            initial={{ name: modal.edit.name, email: modal.edit.email, password: '', role: modal.edit.role }}
            onSubmit={data => handleUpdate(modal.edit.id, data)}
            onClose={() => setModal(null)}
            isEdit={true}
          />
        </Modal>
      )}
    </AdminLayout>
  );
}
