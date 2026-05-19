import React, { useState, useEffect } from 'react';
import { usersAPI, toursAPI, bookingsAPI } from '../api';

const ROLE_CFG = {
  user:  { bg:'#EEF6FB', color:'#3A6A8A', label:'Пользователь' },
  agent: { bg:'#FEF3C7', color:'#92400E', label:'Агент' },
  admin: { bg:'#FBF0F2', color:'#7D1128', label:'Администратор' },
};

const StatusBadge = ({ status }) => {
  const map = { pending:['#FFF3CD','#856404','Ожидает'], confirmed:['#D1FAE5','#065F46','Подтверждено'], cancelled:['#FBF0F2','#7D1128','Отменено'], completed:['#EEF6FB','#3A6A8A','Завершено'] };
  const [bg,color,label] = map[status]||['#F3F7FA','#5A6A7E',status];
  return <span style={{ background:bg, color, fontSize:11, fontWeight:700, padding:'3px 11px', borderRadius:50 }}>{label}</span>;
};

const AdminDashboard = () => {
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [tours, setTours] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'user' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (tab==='users') load(usersAPI.getAll, setUsers);
    else if (tab==='tours') load(toursAPI.getAllAdmin, setTours);
    else if (tab==='bookings') load(bookingsAPI.getAll, setBookings);
  }, [tab]);

  const load = async (fn, setter) => { setLoading(true); try { const r = await fn(); setter(r.data); } catch {} finally { setLoading(false); } };

  const openCreate = () => { setEditUser(null); setForm({ name:'', email:'', password:'', role:'user' }); setError(''); setSuccess(''); setShowModal(true); };
  const openEdit = (u) => { setEditUser(u); setForm({ name:u.name, email:u.email, password:'', role:u.role }); setError(''); setSuccess(''); setShowModal(true); };

  const saveUser = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      if (!form.name||!form.email) { setError('Имя и email обязательны'); setSaving(false); return; }
      if (!editUser && !form.password) { setError('Укажите пароль для нового пользователя'); setSaving(false); return; }
      if (editUser) await usersAPI.update(editUser.id, { name:form.name, email:form.email, role:form.role });
      else await usersAPI.create(form);
      setSuccess(editUser ? 'Данные обновлены' : 'Пользователь создан');
      load(usersAPI.getAll, setUsers);
      setTimeout(() => { setShowModal(false); setSuccess(''); }, 1200);
    } catch (err) { setError(err.response?.data?.message || 'Ошибка'); }
    finally { setSaving(false); }
  };

  const deleteUser = async (id, name) => {
    if (!window.confirm(`Удалить пользователя "${name}"? Это действие необратимо.`)) return;
    try { await usersAPI.delete(id); load(usersAPI.getAll, setUsers); }
    catch (err) { alert(err.response?.data?.message || 'Ошибка при удалении'); }
  };

  const deleteTour = async (id, title) => {
    if (!window.confirm(`Удалить тур "${title}"?`)) return;
    try { await toursAPI.delete(id); load(toursAPI.getAllAdmin, setTours); } catch {}
  };

  const updateBookingStatus = async (id, status) => {
    try { await bookingsAPI.updateStatus(id, status); load(bookingsAPI.getAll, setBookings); } catch {}
  };

  const filteredUsers = users.filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const income = bookings.filter(b=>b.status!=='cancelled').reduce((s,b)=>s+Number(b.total_price||0),0);

  const s = {
    hero: { background:'linear-gradient(135deg,#5C0F1A 0%,#7D1128 45%,#3A6A8A 100%)', padding:'44px 20px 80px', textAlign:'center', position:'relative', overflow:'hidden' },
    wave: { position:'absolute', bottom:0, left:0, right:0, height:60, background:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 60'%3E%3Cpath fill='%23F3F7FA' d='M0,30 C360,60 720,0 1080,30 C1260,45 1380,20 1440,30 L1440,60 L0,60 Z'/%3E%3C/svg%3E\")", backgroundSize:'cover' },
    statCard: { background:'white', borderRadius:14, padding:'20px 16px', textAlign:'center', boxShadow:'0 2px 12px rgba(30,42,56,0.08)' },
    row: { background:'white', borderRadius:14, padding:'16px 20px', boxShadow:'0 2px 12px rgba(30,42,56,0.08)', marginBottom:10, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 },
    input: { width:'100%', padding:'10px 14px', border:'1.5px solid #E8EDF3', borderRadius:9, fontFamily:'Montserrat,sans-serif', fontSize:13.5, outline:'none', background:'#FAFBFD' },
    label: { fontSize:11, fontWeight:700, color:'#4E8098', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:0.5, marginTop:12 },
    overlay: { position:'fixed', inset:0, background:'rgba(30,42,56,0.52)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20, backdropFilter:'blur(5px)' },
    modal: { background:'white', borderRadius:22, width:'100%', maxWidth:500, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 28px 70px rgba(30,42,56,0.25)' },
    modalHead: { background:'linear-gradient(135deg,#7D1128,#9B1B30)', padding:'18px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', borderRadius:'22px 22px 0 0' },
    iconBtn: { padding:'7px 14px', border:'none', borderRadius:8, cursor:'pointer', fontWeight:700, fontSize:12, fontFamily:'Montserrat,sans-serif', transition:'all 0.2s' },
    actionBtn: { padding:'6px 12px', border:'none', borderRadius:8, cursor:'pointer', fontWeight:700, fontSize:12, fontFamily:'Montserrat,sans-serif' },
  };

  return (
    <div>
      <div style={s.hero}>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.65)', letterSpacing:3, textTransform:'uppercase', marginBottom:12, fontWeight:600 }}>Tour Agency</div>
        <div style={{ fontFamily:"'Playfair Display', serif", fontSize:32, color:'white', fontWeight:700 }}>Панель администратора</div>
        <div style={{ color:'rgba(255,255,255,0.78)', fontSize:14.5, marginTop:6 }}>Полное управление системой</div>
        <div style={s.wave} />
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'24px 20px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
          {[['Пользователей',users.length,'#7D1128'],['Туров',tours.length,'#4E8098'],['Бронирований',bookings.length,'#3A6A8A'],[`${income.toLocaleString('ru')} ₽`,'Общий доход','#065F46']].map(([val,label,color],i) => (
            <div key={label} style={{ ...s.statCard, borderTop:`3px solid ${i===3?color:'transparent'}`, borderLeft:i!==3?`3px solid ${color}`:'none' }}>
              <div style={{ fontFamily:"'Playfair Display', serif", fontSize:i===3?20:28, fontWeight:700, color }}>{val}</div>
              <div style={{ color:'#5A6A7E', fontSize:12, marginTop:2 }}>{i===3?'':label}{i===3?val.includes('₽')?'':label:''}</div>
              {i===3 && <div style={{ color:'#5A6A7E', fontSize:12, marginTop:2 }}>Общий доход</div>}
            </div>
          ))}
        </div>

        <div className="tabs">
          {[['users','Пользователи'],['tours','Туры'],['bookings','Бронирования']].map(([key,label]) => (
            <button key={key} className={`tab${tab===key?' active':''}`} onClick={() => setTab(key)}>{label}</button>
          ))}
        </div>

        {loading && <div className="loading-center"><div className="spinner" /></div>}

        {!loading && tab==='users' && (
          <>
            <div style={{ display:'flex', gap:12, marginBottom:16, alignItems:'center', flexWrap:'wrap' }}>
              <input style={{ ...s.input, maxWidth:300 }} placeholder="Поиск по имени или email..."
                value={search} onChange={e => setSearch(e.target.value)} />
              <button className="btn btn-primary btn-sm" onClick={openCreate}>+ Добавить пользователя</button>
            </div>
            <div style={{ background:'white', borderRadius:16, boxShadow:'0 3px 16px rgba(30,42,56,0.09)', overflow:'hidden' }}>
              <table className="table">
                <thead>
                  <tr>
                    {['ID','Имя','Email','Роль','Дата регистрации','Действия'].map(h => <th key={h}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td style={{ color:'#8A9BB0', fontWeight:600 }}>{u.id}</td>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#7D1128,#4E8098)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:13, flexShrink:0 }}>
                            {u.name[0]?.toUpperCase()}
                          </div>
                          <span style={{ fontWeight:600, color:'#1E2A38' }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ color:'#5A6A7E' }}>{u.email}</td>
                      <td>
                        {(() => { const c=ROLE_CFG[u.role]||{bg:'#F3F7FA',color:'#5A6A7E',label:u.role}; return (
                          <span style={{ background:c.bg, color:c.color, fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:50 }}>{c.label}</span>
                        ); })()}
                      </td>
                      <td style={{ color:'#8A9BB0', fontSize:13 }}>{new Date(u.created_at).toLocaleDateString('ru')}</td>
                      <td>
                        <div style={{ display:'flex', gap:6 }}>
                          <button style={{ ...s.iconBtn, background:'#EEF6FB', color:'#3A6A8A' }} onClick={() => openEdit(u)}>Изм.</button>
                          <button style={{ ...s.iconBtn, background:'#FBF0F2', color:'#7D1128' }} onClick={() => deleteUser(u.id, u.name)}>Удал.</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length===0 && <tr><td colSpan={6} style={{ textAlign:'center', padding:30, color:'#5A6A7E' }}>Пользователи не найдены</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}

        {!loading && tab==='tours' && (
          <div>
            {tours.map(t => (
              <div key={t.id} style={s.row}>
                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                  {t.image_url
                    ? <img src={t.image_url} alt="" style={{ width:56, height:56, borderRadius:10, objectFit:'cover', flexShrink:0 }} onError={e=>e.target.style.display='none'} />
                    : <div style={{ width:56, height:56, borderRadius:10, background:'linear-gradient(135deg,#7D1128,#4E8098)', flexShrink:0 }} />
                  }
                  <div>
                    <div style={{ fontWeight:700, color:'#1E2A38', marginBottom:2 }}>{t.title}</div>
                    <div style={{ fontSize:12.5, color:'#5A6A7E' }}>{t.location}, {t.country} &nbsp;&middot;&nbsp; Рейтинг: {t.rating}</div>
                    <div style={{ fontWeight:700, color:'#7D1128', fontSize:14 }}>{Number(t.price).toLocaleString('ru')} ₽</div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:9, alignItems:'center' }}>
                  <span style={{ background:t.available?'#D1FAE5':'#FBF0F2', color:t.available?'#065F46':'#7D1128', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:50 }}>
                    {t.available?'Активен':'Скрыт'}
                  </span>
                  <button style={{ ...s.iconBtn, background:'#FBF0F2', color:'#7D1128' }} onClick={() => deleteTour(t.id, t.title)}>Удалить</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && tab==='bookings' && (
          <div>
            {bookings.map(b => (
              <div key={b.id} style={s.row}>
                <div>
                  <div style={{ fontWeight:700, color:'#1E2A38', marginBottom:3 }}>#{b.id} — {b.tour_title}</div>
                  <div style={{ fontSize:12.5, color:'#5A6A7E', marginBottom:2 }}>{b.user_name} ({b.user_email})</div>
                  <div style={{ fontSize:12.5, color:'#5A6A7E' }}>{b.arrival_date} — {b.departure_date} &nbsp;&middot;&nbsp; {b.guests} чел. &nbsp;&middot;&nbsp; {Number(b.total_price).toLocaleString('ru')} ₽</div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:7, alignItems:'flex-end' }}>
                  <StatusBadge status={b.status} />
                  <div style={{ display:'flex', gap:6 }}>
                    {b.status==='pending' && <button style={{ ...s.actionBtn, background:'#D1FAE5', color:'#065F46' }} onClick={() => updateBookingStatus(b.id,'confirmed')}>Подтвердить</button>}
                    {(b.status==='pending'||b.status==='confirmed') && <button style={{ ...s.actionBtn, background:'#FBF0F2', color:'#7D1128' }} onClick={() => updateBookingStatus(b.id,'cancelled')}>Отменить</button>}
                    {b.status==='confirmed' && <button style={{ ...s.actionBtn, background:'#EEF6FB', color:'#3A6A8A' }} onClick={() => updateBookingStatus(b.id,'completed')}>Завершить</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div style={s.overlay} onClick={e => e.target===e.currentTarget && setShowModal(false)}>
          <div style={s.modal}>
            <div style={s.modalHead}>
              <span style={{ color:'white', fontWeight:700, fontSize:17 }}>{editUser ? 'Редактировать пользователя' : 'Новый пользователь'}</span>
              <button onClick={() => setShowModal(false)} style={{ background:'rgba(255,255,255,0.18)', border:'none', color:'white', borderRadius:'50%', width:30, height:30, cursor:'pointer', fontSize:16 }}>✕</button>
            </div>
            <form style={{ padding:24 }} onSubmit={saveUser}>
              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}
              {[['name','Имя','text'],['email','Email','email'], ...(!editUser?[['password','Пароль','password']]:[])]
                .map(([field,label,type]) => (
                <div key={field}>
                  <label style={s.label}>{label}</label>
                  <input type={type} style={s.input} required value={form[field]} onChange={e => setForm(f => ({ ...f, [field]:e.target.value }))} />
                </div>
              ))}
              <label style={s.label}>Роль</label>
              <select style={{ ...s.input, cursor:'pointer' }} value={form.role} onChange={e => setForm(f => ({ ...f, role:e.target.value }))}>
                <option value="user">Пользователь</option>
                <option value="agent">Агент</option>
                <option value="admin">Администратор</option>
              </select>
              <div style={{ display:'flex', gap:12, marginTop:20 }}>
                <button type="button" className="btn btn-ghost" style={{ flex:1 }} onClick={() => setShowModal(false)}>Отмена</button>
                <button type="submit" className="btn btn-primary" style={{ flex:2 }} disabled={saving}>{saving?'Сохранение...':'Сохранить'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
