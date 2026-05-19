import React, { useState, useEffect } from 'react';
import { usersAPI, toursAPI, bookingsAPI } from '../api';

const EMPTY_USER = { name: '', email: '', password: '', role: 'user' };
const roleLabel = { user: '🧳 Пользователь', agent: '📋 Агент', admin: '⚙️ Админ' };
const roleColor = { user: '#dbeafe', agent: '#fef3c7', admin: '#fee2e2' };
const roleTextColor = { user: '#1e40af', agent: '#92400e', admin: '#991b1b' };

const AdminDashboard = () => {
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [tours, setTours] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState(EMPTY_USER);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (tab === 'users') loadUsers();
    else if (tab === 'tours') loadTours();
    else if (tab === 'bookings') loadBookings();
  }, [tab]);

  const loadUsers = async () => { setLoading(true); try { const r = await usersAPI.getAll(); setUsers(r.data); } catch {} finally { setLoading(false); } };
  const loadTours = async () => { setLoading(true); try { const r = await toursAPI.getAllAdmin(); setTours(r.data); } catch {} finally { setLoading(false); } };
  const loadBookings = async () => { setLoading(true); try { const r = await bookingsAPI.getAll(); setBookings(r.data); } catch {} finally { setLoading(false); } };

  const openCreate = () => { setEditUser(null); setForm(EMPTY_USER); setError(''); setSuccess(''); setShowModal(true); };
  const openEdit = (u) => { setEditUser(u); setForm({ name: u.name, email: u.email, password: '', role: u.role }); setError(''); setSuccess(''); setShowModal(true); };

  const saveUser = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      if (!form.name || !form.email) { setError('Имя и email обязательны'); setSaving(false); return; }
      if (!editUser && !form.password) { setError('Укажите пароль'); setSaving(false); return; }
      if (editUser) await usersAPI.update(editUser.id, { name: form.name, email: form.email, role: form.role });
      else await usersAPI.create(form);
      setSuccess(editUser ? 'Пользователь обновлён!' : 'Пользователь создан!');
      loadUsers(); setTimeout(() => { setShowModal(false); setSuccess(''); }, 1200);
    } catch (err) { setError(err.response?.data?.message || 'Ошибка'); }
    finally { setSaving(false); }
  };

  const deleteUser = async (id, name) => {
    if (!window.confirm(`Удалить пользователя ${name}?`)) return;
    try { await usersAPI.delete(id); loadUsers(); } catch (err) { alert(err.response?.data?.message || 'Ошибка'); }
  };

  const deleteTour = async (id) => {
    if (!window.confirm('Удалить тур?')) return;
    try { await toursAPI.delete(id); loadTours(); } catch {}
  };

  const updateBookingStatus = async (id, status) => {
    try { await bookingsAPI.updateStatus(id, status); loadBookings(); } catch {}
  };

  const filteredUsers = users.filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const stats = [
    ['👥', 'Пользователей', users.length, '#0a3d62'],
    ['🏝', 'Туров', tours.length, '#0097b2'],
    ['📋', 'Бронирований', bookings.length, '#1e6091'],
    ['💰', 'Доход', bookings.filter(b=>b.status!=='cancelled').reduce((s,b)=>s+Number(b.total_price||0),0).toLocaleString('ru')+' ₽', '#065f46'],
  ];

  const s = {
    header: {
      background: 'linear-gradient(135deg, #0a3d62 0%, #0097b2 100%)',
      padding: '40px 20px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden',
    },
    wave: {
      position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
      background: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 60'%3E%3Cpath fill='%23e8f4fd' d='M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,60 L0,60 Z'/%3E%3C/svg%3E\")",
      backgroundSize: 'cover',
    },
    input: {
      width: '100%', padding: '11px 14px', border: '2px solid #e2e8f0', borderRadius: 10,
      fontFamily: 'Montserrat, sans-serif', fontSize: 14, outline: 'none',
    },
    label: { fontSize: 12, fontWeight: 600, color: '#0a3d62', display: 'block', marginBottom: 5, marginTop: 12 },
    overlay: {
      position: 'fixed', inset: 0, background: 'rgba(10,61,98,0.6)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20, backdropFilter: 'blur(4px)',
    },
    modal: { background: 'white', borderRadius: 20, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(10,61,98,0.3)' },
    modalHead: { background: 'linear-gradient(135deg, #0a3d62, #0097b2)', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '20px 20px 0 0' },
    row: { background: 'white', borderRadius: 14, padding: '16px 20px', boxShadow: '0 2px 12px rgba(10,61,98,0.08)', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 },
  };

  const bookStatusLabel = { pending:'⏳ Ожидает', confirmed:'✅ Подтверждено', cancelled:'❌ Отменено', completed:'🏁 Завершено' };
  const bookStatusBg = { pending:'#fff3cd', confirmed:'#d1fae5', cancelled:'#fee2e2', completed:'#dbeafe' };
  const bookStatusTxt = { pending:'#856404', confirmed:'#065f46', cancelled:'#991b1b', completed:'#1e40af' };

  return (
    <div>
      <div style={s.header}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>⚙️</div>
        <div style={{ fontFamily:"'Playfair Display', serif", fontSize: 32, color: 'white', fontWeight: 700 }}>Панель администратора</div>
        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15 }}>Полное управление системой</div>
        <div style={s.wave} />
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
          {stats.map(([icon, label, val, color]) => (
            <div key={label} style={{ background: 'white', borderRadius: 16, padding: '20px 16px', boxShadow: '0 4px 16px rgba(10,61,98,0.1)', textAlign: 'center' }}>
              <div style={{ fontSize: 30, marginBottom: 6 }}>{icon}</div>
              <div style={{ fontFamily:"'Playfair Display', serif", fontSize: 24, fontWeight: 700, color }}>{val}</div>
              <div style={{ color: '#64748b', fontSize: 12 }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 4, background: '#e2e8f0', padding: 4, borderRadius: 50, marginBottom: 24 }}>
          {[['users','👥 Пользователи'],['tours','🏝 Туры'],['bookings','📋 Бронирования']].map(([key,label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              flex: 1, padding: '10px', border: 'none', borderRadius: 50,
              background: tab===key?'white':'transparent', color: tab===key?'#0a3d62':'#64748b',
              fontFamily:'Montserrat,sans-serif', fontWeight:600, fontSize:14, cursor:'pointer',
              boxShadow: tab===key?'0 2px 8px rgba(0,0,0,0.1)':'none', transition:'all 0.3s',
            }}>{label}</button>
          ))}
        </div>

        {loading && <div className="loading-center"><div className="spinner" /></div>}

        {!loading && tab === 'users' && (
          <>
            <div style={{ display:'flex', gap:12, marginBottom:16, alignItems:'center' }}>
              <input style={{ ...s.input, maxWidth:300 }} placeholder="🔍 Поиск пользователя..." value={search} onChange={e => setSearch(e.target.value)} />
              <button className="btn btn-gold" onClick={openCreate}>+ Добавить пользователя</button>
            </div>
            <div style={{ background:'white', borderRadius:16, boxShadow:'0 4px 20px rgba(10,61,98,0.1)', overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
                <thead>
                  <tr style={{ background:'linear-gradient(135deg,#0a3d62,#1e6091)' }}>
                    {['#','Имя','Email','Роль','Дата рег.','Действия'].map(h => (
                      <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontWeight:700, color:'white', fontSize:12 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, i) => (
                    <tr key={u.id} style={{ borderBottom:'1px solid #f1f5f9' }}>
                      <td style={{ padding:'12px 16px', color:'#94a3b8', fontWeight:600 }}>{u.id}</td>
                      <td style={{ padding:'12px 16px', fontWeight:700, color:'#0a3d62' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg,#0097b2,#48cae4)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:14, flexShrink:0 }}>
                            {u.name[0]?.toUpperCase()}
                          </div>
                          {u.name}
                        </div>
                      </td>
                      <td style={{ padding:'12px 16px', color:'#475569' }}>{u.email}</td>
                      <td style={{ padding:'12px 16px' }}>
                        <span style={{ background:roleColor[u.role]||'#e2e8f0', color:roleTextColor[u.role]||'#475569', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:50 }}>
                          {roleLabel[u.role]||u.role}
                        </span>
                      </td>
                      <td style={{ padding:'12px 16px', color:'#94a3b8', fontSize:12 }}>{new Date(u.created_at).toLocaleDateString('ru')}</td>
                      <td style={{ padding:'12px 16px' }}>
                        <div style={{ display:'flex', gap:6 }}>
                          <button onClick={() => openEdit(u)} style={{ padding:'6px 12px', border:'none', borderRadius:8, background:'#dbeafe', color:'#1e40af', cursor:'pointer', fontWeight:600, fontSize:12, fontFamily:'Montserrat,sans-serif' }}>✏️</button>
                          <button onClick={() => deleteUser(u.id, u.name)} style={{ padding:'6px 12px', border:'none', borderRadius:8, background:'#fee2e2', color:'#991b1b', cursor:'pointer', fontWeight:600, fontSize:12, fontFamily:'Montserrat,sans-serif' }}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div style={{ textAlign:'center', padding:40, color:'#64748b' }}>Пользователи не найдены</div>
              )}
            </div>
          </>
        )}

        {!loading && tab === 'tours' && (
          <div>
            {tours.map(t => (
              <div key={t.id} style={{ ...s.row, cursor:'default' }}>
                <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                  <div style={{ width:60, height:60, borderRadius:12, overflow:'hidden', flexShrink:0 }}>
                    {t.image_url
                      ? <img src={t.image_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => e.target.style.display='none'} />
                      : <div style={{ width:'100%', height:'100%', background:'linear-gradient(135deg,#0a3d62,#0097b2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>🏝️</div>
                    }
                  </div>
                  <div>
                    <div style={{ fontWeight:700, color:'#0a3d62' }}>{t.title}</div>
                    <div style={{ fontSize:12, color:'#64748b' }}>📍 {t.location}, {t.country} · ⭐ {t.rating}</div>
                    <div style={{ fontWeight:700, color:'#0097b2', fontSize:14 }}>{Number(t.price).toLocaleString('ru')} ₽</div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <span style={{ background:t.available?'#d1fae5':'#fee2e2', color:t.available?'#065f46':'#991b1b', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:50 }}>{t.available?'Активен':'Скрыт'}</span>
                  <button onClick={() => deleteTour(t.id)} style={{ padding:'7px 14px', border:'none', borderRadius:8, background:'#fee2e2', color:'#991b1b', cursor:'pointer', fontWeight:600, fontSize:13, fontFamily:'Montserrat,sans-serif' }}>🗑️ Удалить</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && tab === 'bookings' && (
          <div>
            {bookings.map(b => (
              <div key={b.id} style={s.row}>
                <div>
                  <div style={{ fontWeight:700, color:'#0a3d62', marginBottom:4 }}>#{b.id} — {b.tour_title}</div>
                  <div style={{ fontSize:13, color:'#64748b', marginBottom:2 }}>👤 {b.user_name} ({b.user_email})</div>
                  <div style={{ fontSize:13, color:'#64748b' }}>📅 {b.arrival_date} → {b.departure_date} · 👥 {b.guests} · 💰 {Number(b.total_price).toLocaleString('ru')} ₽</div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:6, alignItems:'flex-end' }}>
                  <span style={{ background:bookStatusBg[b.status], color:bookStatusTxt[b.status], fontSize:12, fontWeight:700, padding:'4px 12px', borderRadius:50 }}>{bookStatusLabel[b.status]}</span>
                  <div style={{ display:'flex', gap:6 }}>
                    {b.status==='pending' && <button style={{ padding:'5px 12px', border:'none', borderRadius:8, background:'#d1fae5', color:'#065f46', cursor:'pointer', fontWeight:600, fontSize:12, fontFamily:'Montserrat,sans-serif' }} onClick={() => updateBookingStatus(b.id,'confirmed')}>✅</button>}
                    {(b.status==='pending'||b.status==='confirmed') && <button style={{ padding:'5px 12px', border:'none', borderRadius:8, background:'#fee2e2', color:'#991b1b', cursor:'pointer', fontWeight:600, fontSize:12, fontFamily:'Montserrat,sans-serif' }} onClick={() => updateBookingStatus(b.id,'cancelled')}>❌</button>}
                    {b.status==='confirmed' && <button style={{ padding:'5px 12px', border:'none', borderRadius:8, background:'#dbeafe', color:'#1e40af', cursor:'pointer', fontWeight:600, fontSize:12, fontFamily:'Montserrat,sans-serif' }} onClick={() => updateBookingStatus(b.id,'completed')}>🏁</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={s.modal}>
            <div style={s.modalHead}>
              <span style={{ color:'white', fontWeight:700, fontSize:18 }}>{editUser ? '✏️ Редактировать пользователя' : '+ Новый пользователь'}</span>
              <button onClick={() => setShowModal(false)} style={{ background:'rgba(255,255,255,0.2)', border:'none', color:'white', borderRadius:'50%', width:32, height:32, cursor:'pointer', fontSize:16 }}>✕</button>
            </div>
            <form style={{ padding:24 }} onSubmit={saveUser}>
              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}
              {[['name','Имя','text'],['email','Email','email'],
                ...(!editUser ? [['password','Пароль','password']] : [])].map(([field,label,type]) => (
                <div key={field}>
                  <label style={s.label}>{label}</label>
                  <input type={type} style={s.input} required value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
                </div>
              ))}
              <label style={s.label}>Роль</label>
              <select style={{ ...s.input, cursor:'pointer' }} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="user">🧳 Пользователь</option>
                <option value="agent">📋 Тур-агент</option>
                <option value="admin">⚙️ Администратор</option>
              </select>
              <div style={{ display:'flex', gap:12, marginTop:20 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex:1, padding:12, border:'2px solid #e2e8f0', borderRadius:50, background:'white', color:'#64748b', fontFamily:'Montserrat,sans-serif', fontWeight:600, cursor:'pointer' }}>Отмена</button>
                <button type="submit" className="btn btn-primary" style={{ flex:2 }} disabled={saving}>{saving?'⌛ Сохранение...':'💾 Сохранить'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
