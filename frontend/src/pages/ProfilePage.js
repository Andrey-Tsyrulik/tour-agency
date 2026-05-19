import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, bookingsAPI, paymentsAPI, browsingAPI } from '../api';
import { useNavigate } from 'react-router-dom';

const TABS = [['bookings','Бронирования'],['history','История платежей'],['browsing','Просмотренные'],['settings','Настройки']];

const StatusBadge = ({ status }) => {
  const cfg = {
    pending:   { bg:'#FFF3CD', color:'#856404', label:'Ожидает' },
    confirmed: { bg:'#D1FAE5', color:'#065F46', label:'Подтверждено' },
    cancelled: { bg:'#FBF0F2', color:'#7D1128', label:'Отменено' },
    completed: { bg:'#EEF6FB', color:'#3A6A8A', label:'Завершено' },
  };
  const c = cfg[status] || { bg:'#F3F7FA', color:'#5A6A7E', label: status };
  return <span style={{ background:c.bg, color:c.color, fontSize:11, fontWeight:700, padding:'3px 11px', borderRadius:50, letterSpacing:0.3 }}>{c.label}</span>;
};

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [browsing, setBrowsing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: user?.name||'', currentPassword:'', newPassword:'' });
  const [avatar, setAvatar] = useState(user?.avatar||'');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    if (tab==='bookings') load(bookingsAPI.getMy, setBookings);
    if (tab==='history')  load(paymentsAPI.getMy, setPayments);
    if (tab==='browsing') load(browsingAPI.getHistory, setBrowsing);
  }, [tab]);

  const load = async (fn, setter) => {
    setLoading(true);
    try { const r = await fn(); setter(r.data); } catch {}
    finally { setLoading(false); }
  };

  const cancelBooking = async (id) => {
    if (!window.confirm('Отменить это бронирование?')) return;
    try { await bookingsAPI.cancel(id); load(bookingsAPI.getAll, setBookings); } catch (e) { alert(e.response?.data?.message || 'Ошибка'); }
  };

  const handleFile = (e) => {
    const f = e.target.files[0]; if (!f) return;
    if (f.size > 2*1024*1024) { setError('Файл слишком большой (макс. 2 MB)'); return; }
    const r = new FileReader(); r.onload = ev => setAvatar(ev.target.result); r.readAsDataURL(f);
  };

  const saveProfile = async (e) => {
    e.preventDefault(); setError(''); setSuccess(''); setSaving(true);
    try {
      const payload = { name: form.name.trim(), avatar };
      if (form.newPassword) { payload.currentPassword = form.currentPassword; payload.newPassword = form.newPassword; }
      const res = await authAPI.updateMe(payload);
      updateUser(res.data);
      setSuccess('Профиль успешно обновлён');
      setForm(f => ({ ...f, currentPassword:'', newPassword:'' }));
    } catch (err) { setError(err.response?.data?.message || 'Ошибка при сохранении'); }
    finally { setSaving(false); }
  };

  const s = {
    header: {
      background:'linear-gradient(135deg,#5C0F1A 0%,#7D1128 45%,#3A6A8A 100%)',
      padding:'44px 20px 80px', position:'relative', overflow:'hidden',
    },
    wave: {
      position:'absolute', bottom:0, left:0, right:0, height:60,
      background:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 60'%3E%3Cpath fill='%23F3F7FA' d='M0,30 C360,60 720,0 1080,30 C1260,45 1380,20 1440,30 L1440,60 L0,60 Z'/%3E%3C/svg%3E\")",
      backgroundSize:'cover',
    },
    avatarWrap: {
      width:92, height:92, borderRadius:'50%', border:'3px solid rgba(255,255,255,0.45)',
      overflow:'hidden', background:'rgba(255,255,255,0.18)',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:34, color:'white', fontWeight:700, cursor:'pointer', flexShrink:0, position:'relative',
    },
    card: { background:'white', borderRadius:16, padding:22, boxShadow:'0 2px 14px rgba(30,42,56,0.09)', marginBottom:14 },
    bookRow: {
      background:'white', borderRadius:14, padding:18, boxShadow:'0 2px 12px rgba(30,42,56,0.08)',
      display:'grid', gridTemplateColumns:'76px 1fr auto', gap:16, alignItems:'center', marginBottom:12,
    },
    thumb: { width:76, height:76, borderRadius:10, objectFit:'cover', background:'linear-gradient(135deg,#7D1128,#4E8098)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:11, fontWeight:600 },
    sInput: {
      width:'100%', padding:'11px 14px', border:'1.5px solid #E8EDF3', borderRadius:9,
      fontFamily:'Montserrat,sans-serif', fontSize:14, outline:'none', background:'#FAFBFD',
    },
    sLabel: { fontSize:11, fontWeight:700, color:'#4E8098', display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:0.5 },
    rolePill: {
      background:'rgba(255,255,255,0.2)', color:'white', fontSize:10, fontWeight:700,
      padding:'2px 10px', borderRadius:50, letterSpacing:0.5, textTransform:'uppercase', marginTop:4, display:'inline-block',
    },
  };

  const roleMap = { user:'Пользователь', agent:'Агент', admin:'Администратор' };
  const active = bookings.filter(b=>b.status==='confirmed'||b.status==='pending');
  const past   = bookings.filter(b=>b.status==='completed'||b.status==='cancelled');

  return (
    <div>
      <div style={s.header}>
        <div style={{ maxWidth:1000, margin:'0 auto', display:'flex', alignItems:'center', gap:22 }}>
          <div style={s.avatarWrap} onClick={() => fileRef.current?.click()}>
            {avatar ? <img src={avatar} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : user?.name?.[0]?.toUpperCase()}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleFile} />
          <div>
            <div style={{ fontFamily:"'Playfair Display', serif", fontSize:26, color:'white', fontWeight:700 }}>{user?.name}</div>
            <div style={{ color:'rgba(255,255,255,0.72)', fontSize:13.5 }}>{user?.email}</div>
            <div style={s.rolePill}>{roleMap[user?.role]||user?.role}</div>
          </div>
        </div>
        <div style={s.wave} />
      </div>

      <div style={{ maxWidth:1000, margin:'-16px auto 0', padding:'0 20px 40px', position:'relative' }}>
        <div className="tabs">
          {TABS.map(([key,label]) => (
            <button key={key} className={`tab${tab===key?' active':''}`} onClick={() => setTab(key)}>{label}</button>
          ))}
        </div>

        {loading && <div className="loading-center"><div className="spinner" /></div>}

        {!loading && tab==='bookings' && (
          <>
            {active.length > 0 && (
              <>
                <h3 style={{ fontFamily:"'Playfair Display', serif", color:'#1E2A38', marginBottom:14, fontSize:18 }}>Активные бронирования</h3>
                {active.map(b => (
                  <div key={b.id} style={s.bookRow}>
                    {b.tour_image
                      ? <img src={b.tour_image} alt="" style={{ ...s.thumb, objectFit:'cover' }} onError={e => e.target.style.display='none'} />
                      : <div style={s.thumb}>Нет фото</div>
                    }
                    <div>
                      <div style={{ fontWeight:700, color:'#1E2A38', marginBottom:3, fontSize:15 }}>{b.tour_title}</div>
                      <div style={{ fontSize:12.5, color:'#5A6A7E', marginBottom:3 }}>
                        {b.arrival_date} — {b.departure_date} &nbsp;&middot;&nbsp; {b.guests} чел.
                      </div>
                      <div style={{ fontWeight:700, color:'#7D1128', fontSize:14 }}>{Number(b.total_price).toLocaleString('ru')} ₽</div>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end' }}>
                      <StatusBadge status={b.status} />
                      {b.status==='pending' && (
                        <button onClick={() => cancelBooking(b.id)} style={{ fontSize:12, color:'#7D1128', background:'none', border:'none', cursor:'pointer', fontWeight:700, padding:0 }}>
                          Отменить
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
            {past.length > 0 && (
              <>
                <h3 style={{ fontFamily:"'Playfair Display', serif", color:'#1E2A38', marginBottom:14, marginTop:24, fontSize:18 }}>История поездок</h3>
                {past.map(b => (
                  <div key={b.id} style={{ ...s.bookRow, opacity:0.7 }}>
                    <div style={s.thumb}>Архив</div>
                    <div>
                      <div style={{ fontWeight:700, color:'#1E2A38', marginBottom:3 }}>{b.tour_title}</div>
                      <div style={{ fontSize:12.5, color:'#5A6A7E' }}>{b.arrival_date} — {b.departure_date} &nbsp;&middot;&nbsp; {Number(b.total_price).toLocaleString('ru')} ₽</div>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                ))}
              </>
            )}
            {bookings.length === 0 && (
              <div style={{ textAlign:'center', padding:60, color:'#5A6A7E' }}>
                <div style={{ fontSize:40, marginBottom:14, opacity:0.35 }}>[ ]</div>
                <div style={{ fontSize:17, fontWeight:700, color:'#1E2A38', marginBottom:8 }}>Нет активных бронирований</div>
                <div style={{ marginBottom:20, fontSize:14 }}>Выберите тур и начните планировать путешествие</div>
                <button className="btn btn-primary" onClick={() => navigate('/tours')}>Смотреть туры</button>
              </div>
            )}
          </>
        )}

        {!loading && tab==='history' && (
          <>
            {payments.length === 0 ? (
              <div style={{ textAlign:'center', padding:60, color:'#5A6A7E' }}>
                <div style={{ fontSize:17, fontWeight:700, color:'#1E2A38', marginBottom:8 }}>История платежей пуста</div>
              </div>
            ) : payments.map(p => (
              <div key={p.id} style={s.card}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
                  <div>
                    <div style={{ fontWeight:700, color:'#1E2A38', marginBottom:4 }}>{p.tour_title}</div>
                    <div style={{ fontSize:12.5, color:'#5A6A7E' }}>
                      {new Date(p.created_at).toLocaleDateString('ru')} &nbsp;&middot;&nbsp; {p.method} &nbsp;&middot;&nbsp; #{p.transaction_id}
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontWeight:700, fontSize:20, color:'#1E2A38' }}>{Number(p.amount).toLocaleString('ru')} ₽</div>
                    <span style={{ background:'#D1FAE5', color:'#065F46', fontSize:11, fontWeight:700, padding:'2px 10px', borderRadius:50 }}>Оплачено</span>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {!loading && tab==='browsing' && (
          <>
            {browsing.length === 0 ? (
              <div style={{ textAlign:'center', padding:60, color:'#5A6A7E' }}>
                <div style={{ fontSize:17, fontWeight:700, color:'#1E2A38', marginBottom:8 }}>История просмотров пуста</div>
                <button className="btn btn-secondary" onClick={() => navigate('/tours')}>Смотреть туры</button>
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))', gap:16 }}>
                {browsing.map(b => (
                  <div key={b.id} style={{ background:'white', borderRadius:14, overflow:'hidden', boxShadow:'0 2px 12px rgba(30,42,56,0.08)', cursor:'pointer', transition:'all 0.2s' }}
                    onClick={() => navigate(`/tours/${b.tour_id}`)}
                    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(30,42,56,0.14)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 2px 12px rgba(30,42,56,0.08)'; }}>
                    {b.image_url
                      ? <img src={b.image_url} alt="" style={{ width:'100%', height:120, objectFit:'cover' }} onError={e => e.target.style.display='none'} />
                      : <div style={{ width:'100%', height:120, background:'linear-gradient(135deg,#7D1128,#4E8098)' }} />
                    }
                    <div style={{ padding:'12px 14px' }}>
                      <div style={{ fontWeight:700, color:'#1E2A38', fontSize:13.5, marginBottom:3 }}>{b.title}</div>
                      <div style={{ fontSize:12, color:'#5A6A7E', marginBottom:5 }}>{b.location}</div>
                      <div style={{ fontWeight:700, color:'#7D1128', fontSize:14 }}>{Number(b.price).toLocaleString('ru')} ₽</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab==='settings' && (
          <div style={{ maxWidth:520 }}>
            <form style={s.card} onSubmit={saveProfile}>
              <h3 style={{ fontFamily:"'Playfair Display', serif", color:'#1E2A38', marginBottom:18, fontSize:19 }}>Личные данные</h3>
              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <div style={{ marginBottom:16 }}>
                <label style={s.sLabel}>Фото профиля</label>
                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <div style={{ width:56, height:56, borderRadius:'50%', overflow:'hidden', border:'2px solid #E8EDF3', background:'linear-gradient(135deg,#7D1128,#4E8098)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, color:'white', fontWeight:700 }}>
                    {avatar ? <img src={avatar} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : user?.name?.[0]?.toUpperCase()}
                  </div>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()}>Загрузить фото</button>
                  {avatar && <button type="button" className="btn btn-sm" style={{ background:'#FBF0F2', color:'#7D1128', border:'none', borderRadius:50, padding:'7px 14px', cursor:'pointer', fontWeight:600, fontSize:12, fontFamily:'Montserrat,sans-serif' }} onClick={() => setAvatar('')}>Удалить</button>}
                </div>
              </div>

              <div style={{ marginBottom:16 }}>
                <label style={s.sLabel}>Имя</label>
                <input style={s.sInput} value={form.name} onChange={e => setForm(f => ({ ...f, name:e.target.value }))} placeholder="Ваше имя" required />
              </div>

              <div style={{ background:'#F3F7FA', borderRadius:10, padding:'16px', marginBottom:16 }}>
                <div style={{ fontWeight:700, color:'#1E2A38', marginBottom:12, fontSize:13 }}>Смена пароля</div>
                {[['currentPassword','Текущий пароль'],['newPassword','Новый пароль']].map(([field, label]) => (
                  <div key={field} style={{ marginBottom:12 }}>
                    <label style={s.sLabel}>{label}</label>
                    <input type="password" style={s.sInput} value={form[field]}
                      onChange={e => setForm(f => ({ ...f, [field]:e.target.value }))}
                      placeholder={field==='newPassword'?'Минимум 6 символов':'••••••'} />
                  </div>
                ))}
              </div>

              <button type="submit" className="btn btn-primary" style={{ width:'100%' }} disabled={saving}>
                {saving ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
