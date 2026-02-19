'use client';

import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { UserIcon, Search, Edit3, Trash2, CheckCircle, XCircle, Users, ShieldCheck } from 'lucide-react';

/* ─── STYLES ─────────────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');

  .mu {
    --red:        #E03131;
    --red-soft:   #FFF5F5;
    --red-mid:    #FFC9C9;
    --green:      #2F9E44;
    --green-soft: #EBFBEE;
    --green-mid:  #B2F2BB;
    --blue:       #1971C2;
    --blue-soft:  #E7F5FF;
    --blue-mid:   #A5D8FF;
    --ink:        #1A1A2E;
    --ink-2:      #495057;
    --ink-3:      #868E96;
    --rule:       #DEE2E6;
    --white:      #FFFFFF;
    --canvas:     #F8F9FA;
    font-family: 'DM Sans', sans-serif;
    background: var(--white);
    min-height: 100vh;
    color: var(--ink);
  }

  .mu-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2.5rem 1.5rem;
  }

  /* ── Top bar ── */
  .mu-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }

  .mu-brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .mu-brand-icon {
    width: 44px; height: 44px;
    border-radius: 12px;
    background: var(--blue);
    display: flex; align-items: center; justify-content: center;
    color: white;
    flex-shrink: 0;
  }

  .mu-title {
    font-family: 'DM Serif Display', serif;
    font-size: 1.7rem;
    font-weight: 400;
    color: var(--ink);
    line-height: 1.1;
    margin: 0;
  }

  .mu-title em {
    font-style: italic;
    color: var(--blue);
  }

  .mu-subtitle {
    font-size: 0.8rem;
    color: var(--ink-3);
    margin: 2px 0 0;
    font-weight: 500;
  }

  .mu-count {
    display: inline-flex; align-items: center; gap: 5px;
    background: var(--blue-soft);
    color: var(--blue);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.3rem 0.85rem;
    border-radius: 999px;
    border: 1px solid var(--blue-mid);
    white-space: nowrap;
  }

  /* ── Search bar ── */
  .mu-toolbar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
    flex-wrap: wrap;
  }

  .mu-search {
    position: relative;
    flex: 1;
    min-width: 200px;
    max-width: 380px;
  }

  .mu-search-ico {
    position: absolute; left: 11px; top: 50%;
    transform: translateY(-50%);
    color: var(--ink-3); pointer-events: none;
  }

  .mu-search-field {
    width: 100%;
    padding: 0.6rem 1rem 0.6rem 2.4rem;
    border: 1.5px solid var(--rule);
    border-radius: 8px;
    background: var(--canvas);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.875rem;
    color: var(--ink);
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    box-sizing: border-box;
  }

  .mu-search-field:focus {
    border-color: var(--blue);
    background: var(--white);
    box-shadow: 0 0 0 3px rgba(25,113,194,0.1);
  }
  .mu-search-field::placeholder { color: var(--ink-3); }

  /* ── Card ── */
  .mu-card {
    background: var(--white);
    border-radius: 12px;
    border: 1.5px solid var(--rule);
    overflow: hidden;
  }

  /* Top accent bar */
  .mu-stripe {
    height: 3px;
    background: linear-gradient(90deg, var(--red) 0% 33.3%, var(--green) 33.3% 66.6%, var(--blue) 66.6% 100%);
  }

  .mu-scroll { overflow-x: auto; }

  .mu-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 720px;
    font-size: 0.875rem;
  }

  /* ── Head ── */
  .mu-thead tr { border-bottom: 1.5px solid var(--rule); background: var(--canvas); }

  .mu-thead th {
    padding: 0.75rem 1rem;
    text-align: left;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink-3);
    white-space: nowrap;
  }

  /* ── Body rows ── */
  .mu-tbody tr { border-bottom: 1px solid var(--rule); transition: background 0.1s; }
  .mu-tbody tr:last-child { border-bottom: none; }
  .mu-tbody tr:hover { background: var(--canvas); }
  .mu-tbody tr.mu-editing {
    background: var(--blue-soft);
    box-shadow: inset 3px 0 0 var(--blue);
  }

  .mu-tbody td {
    padding: 0.8rem 1rem;
    color: var(--ink-2);
    vertical-align: middle;
  }

  /* ── Avatar ── */
  .mu-av {
    width: 34px; height: 34px;
    border-radius: 8px;
    object-fit: cover;
    border: 1.5px solid var(--rule);
    display: block;
  }
  .mu-av-fallback {
    width: 34px; height: 34px;
    border-radius: 8px;
    background: var(--blue-soft);
    border: 1.5px solid var(--blue-mid);
    display: flex; align-items: center; justify-content: center;
    color: var(--blue);
  }

  .mu-name { font-weight: 600; color: var(--ink); }

  /* ── Chamas ── */
  .mu-chamas { display: flex; flex-wrap: wrap; gap: 4px; max-width: 180px; }
  .mu-chama {
    font-size: 0.7rem; font-weight: 600;
    padding: 0.15rem 0.5rem;
    border-radius: 999px;
    background: var(--green-soft); color: var(--green);
    border: 1px solid var(--green-mid);
    white-space: nowrap;
  }
  .mu-none { color: var(--ink-3); font-size: 0.8rem; font-style: italic; }

  /* ── Role badge ── */
  .mu-badge {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 0.7rem; font-weight: 700;
    letter-spacing: 0.05em; text-transform: uppercase;
    padding: 0.22rem 0.6rem; border-radius: 999px;
  }
  .mu-badge-admin { background: var(--red-soft); color: var(--red); border: 1px solid var(--red-mid); }
  .mu-badge-user  { background: var(--green-soft); color: var(--green); border: 1px solid var(--green-mid); }

  .mu-date { color: var(--ink-3); font-size: 0.78rem; white-space: nowrap; }

  /* ── Edit inputs ── */
  .mu-inputs { display: flex; flex-direction: column; gap: 4px; }
  .mu-inp {
    padding: 0.3rem 0.55rem;
    border: 1.5px solid var(--rule);
    border-radius: 6px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.8rem; color: var(--ink);
    outline: none; background: var(--white);
    transition: border-color 0.12s, box-shadow 0.12s;
    width: 130px; box-sizing: border-box;
  }
  .mu-inp:focus { border-color: var(--blue); box-shadow: 0 0 0 2px rgba(25,113,194,0.1); }
  .mu-inp-wide { width: 160px; }
  .mu-inp-sm   { width: 100px; }

  /* ── Buttons ── */
  .mu-acts { display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap; }
  .mu-btn {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 0.35rem 0.7rem;
    border-radius: 6px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.76rem; font-weight: 600;
    cursor: pointer; border: 1.5px solid transparent;
    transition: all 0.13s; white-space: nowrap; line-height: 1;
  }

  .mu-btn-edit {
    background: var(--blue-soft); color: var(--blue);
    border-color: var(--blue-mid);
  }
  .mu-btn-edit:hover { background: var(--blue); color: white; border-color: var(--blue); }

  .mu-btn-del {
    background: var(--red-soft); color: var(--red);
    border-color: var(--red-mid);
  }
  .mu-btn-del:hover { background: var(--red); color: white; border-color: var(--red); }

  .mu-btn-save {
    background: var(--green); color: white;
    border-color: var(--green);
  }
  .mu-btn-save:hover { background: #237d33; border-color: #237d33; }

  .mu-btn-cancel {
    background: var(--canvas); color: var(--ink-3);
    border-color: var(--rule);
  }
  .mu-btn-cancel:hover { background: var(--rule); color: var(--ink-2); }

  /* ── States ── */
  .mu-state-row td { padding: 3.5rem 1rem; text-align: center; }

  .mu-loader { display: flex; justify-content: center; gap: 4px; margin-bottom: 0.75rem; }
  .mu-bar {
    width: 3px; height: 24px; border-radius: 2px;
    animation: mu-bar-anim 1s ease-in-out infinite;
  }
  .mu-bar:nth-child(1) { background: var(--red); animation-delay: 0s; }
  .mu-bar:nth-child(2) { background: var(--green); animation-delay: 0.15s; }
  .mu-bar:nth-child(3) { background: var(--blue); animation-delay: 0.3s; }
  .mu-bar:nth-child(4) { background: var(--red); animation-delay: 0.45s; }
  .mu-bar:nth-child(5) { background: var(--green); animation-delay: 0.6s; }
  @keyframes mu-bar-anim {
    0%, 100% { transform: scaleY(0.3); opacity: 0.4; }
    50% { transform: scaleY(1); opacity: 1; }
  }

  .mu-state-lbl { font-size: 0.875rem; color: var(--ink-3); font-weight: 500; }
  .mu-empty-ico {
    width: 44px; height: 44px; border-radius: 10px;
    background: var(--blue-soft); border: 1px solid var(--blue-mid);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 0.75rem; color: var(--blue);
  }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .mu-page { padding: 1.25rem 0.75rem; }
    .mu-search { max-width: 100%; min-width: 0; flex: 1 1 100%; }
    .mu-topbar { gap: 0.75rem; }
    .mu-title { font-size: 1.35rem; }
  }
`;

/* ─── COMPONENT ──────────────────────────────────────────────────────────── */
function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('user');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');

  const fetchAllUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed to fetch data');
      const data = await res.json();
      setUsers(data.users);
      setFilteredUsers(data.users);
    } catch (err) { toast.error(err.message); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchAllUsers(); }, []);

  useEffect(() => {
    if (!searchTerm) { setFilteredUsers(users); return; }
    const q = searchTerm.toLowerCase();
    setFilteredUsers(users.filter(u => {
      const name = `${u.firstName} ${u.lastName}`.toLowerCase();
      const chamas = u.chamas ? u.chamas.join(' ').toLowerCase() : '';
      return name.includes(q) || chamas.includes(q);
    }));
  }, [searchTerm, users]);

  const handleEdit = u => {
    setEditingId(u._id); setNewFirstName(u.firstName); setNewLastName(u.lastName);
    setNewEmail(u.email); setNewRole(u.role); setNewPhoneNumber(u.phoneNumber);
  };

  const handleCancel = () => {
    setEditingId(null); setNewFirstName(''); setNewLastName('');
    setNewEmail(''); setNewRole('user'); setNewPhoneNumber('');
  };

  const handleSave = async id => {
    if (!newFirstName || !newLastName || !newEmail || !newRole || !newPhoneNumber)
      return toast.error('All fields are required.');
    const tid = toast.loading('Saving…');
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: newFirstName, lastName: newLastName, email: newEmail, role: newRole, phoneNumber: newPhoneNumber }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Save failed'); }
      toast.success('Member updated!', { id: tid });
      setEditingId(null); fetchAllUsers();
    } catch (err) { toast.error(err.message, { id: tid }); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this member? This cannot be undone.')) return;
    const tid = toast.loading('Deleting…');
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Delete failed'); }
      toast.success('Member removed.', { id: tid }); fetchAllUsers();
    } catch (err) { toast.error(err.message, { id: tid }); }
  };

  return (
    <>
      <style>{css}</style>
      <div className="mu">
        <Toaster position="top-right" toastOptions={{
          style: { fontFamily: "'DM Sans',sans-serif", borderRadius: '8px', fontSize: '0.875rem' }
        }} />

        <div className="mu-page">

          {/* Top bar */}
          <div className="mu-topbar">
            <div className="mu-brand">
              <div className="mu-brand-icon">
                <Users size={20} />
              </div>
              <div>
                <h1 className="mu-title">Manage <em>Members</em></h1>
                <p className="mu-subtitle">Admin Console</p>
              </div>
            </div>

            {!isLoading && (
              <span className="mu-count">
                <Users size={12} />
                {filteredUsers.length} {filteredUsers.length === 1 ? 'member' : 'members'}
              </span>
            )}
          </div>

          {/* Search */}
          <div className="mu-toolbar">
            <div className="mu-search">
              <Search size={14} className="mu-search-ico" />
              <input
                className="mu-search-field"
                type="text"
                placeholder="Search by name or Chama…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="mu-card">
            <div className="mu-stripe" />
            <div className="mu-scroll">
              <table className="mu-table">

                <thead className="mu-thead">
                  <tr>
                    <th>Photo</th><th>Name</th><th>Chamas</th>
                    <th>Email</th><th>Phone</th><th>Role</th>
                    <th>Joined</th><th>Actions</th>
                  </tr>
                </thead>

                <tbody className="mu-tbody">
                  {isLoading ? (
                    <tr className="mu-state-row"><td colSpan="8">
                      <div className="mu-loader">
                        {[1,2,3,4,5].map(i => <div key={i} className="mu-bar" />)}
                      </div>
                      <div className="mu-state-lbl">Loading members…</div>
                    </td></tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr className="mu-state-row"><td colSpan="8">
                      <div className="mu-empty-ico"><Search size={20} /></div>
                      <div className="mu-state-lbl">
                        {searchTerm ? `No results for "${searchTerm}"` : 'No members yet.'}
                      </div>
                    </td></tr>
                  ) : filteredUsers.map(u => {
                    const ed = editingId === u._id;
                    return (
                      <tr key={u._id} className={ed ? 'mu-editing' : ''}>

                        {/* Avatar */}
                        <td>
                          {u?.photoUrl ? (
                            <img className="mu-av" src={u.photoUrl} alt={`${u.firstName} ${u.lastName}`}
                              onError={e => { e.target.style.display='none'; e.target.nextElementSibling.style.display='flex'; }} />
                          ) : null}
                          <div className="mu-av-fallback" style={{ display: u?.photoUrl ? 'none' : 'flex' }}>
                            <UserIcon size={15} />
                          </div>
                        </td>

                        {/* Name */}
                        <td>
                          {ed ? (
                            <div className="mu-inputs">
                              <input className="mu-inp" value={newFirstName} onChange={e => setNewFirstName(e.target.value)} placeholder="First name" />
                              <input className="mu-inp" value={newLastName} onChange={e => setNewLastName(e.target.value)} placeholder="Last name" />
                            </div>
                          ) : <span className="mu-name">{u.firstName} {u.lastName}</span>}
                        </td>

                        {/* Chamas */}
                        <td>
                          {u.chamas?.length > 0
                            ? <div className="mu-chamas">{u.chamas.map((c,i) => <span key={i} className="mu-chama">{c}</span>)}</div>
                            : <span className="mu-none">None</span>}
                        </td>

                        {/* Email */}
                        <td>
                          {ed ? <input className="mu-inp mu-inp-wide" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Email" />
                             : u.email}
                        </td>

                        {/* Phone */}
                        <td>
                          {ed ? <input className="mu-inp mu-inp-wide" value={newPhoneNumber} onChange={e => setNewPhoneNumber(e.target.value)} placeholder="Phone" />
                             : u.phoneNumber}
                        </td>

                        {/* Role */}
                        <td>
                          {ed ? (
                            <select className="mu-inp mu-inp-sm" value={newRole} onChange={e => setNewRole(e.target.value)}>
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          ) : (
                            <span className={`mu-badge ${u.role === 'admin' ? 'mu-badge-admin' : 'mu-badge-user'}`}>
                              {u.role === 'admin' && <ShieldCheck size={10} />}
                              {u.role}
                            </span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="mu-date">
                          {new Date(u.createdAt).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}
                        </td>

                        {/* Actions */}
                        <td>
                          {ed ? (
                            <div className="mu-acts">
                              <button className="mu-btn mu-btn-save" onClick={() => handleSave(u._id)}><CheckCircle size={12} /> Save</button>
                              <button className="mu-btn mu-btn-cancel" onClick={handleCancel}><XCircle size={12} /> Cancel</button>
                            </div>
                          ) : (
                            <div className="mu-acts">
                              <button className="mu-btn mu-btn-edit" onClick={() => handleEdit(u)}><Edit3 size={12} /> Edit</button>
                              <button className="mu-btn mu-btn-del" onClick={() => handleDelete(u._id)}><Trash2 size={12} /> Delete</button>
                            </div>
                          )}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default function ManageUsersPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <ManageUsers />
    </ProtectedRoute>
  );
}