import React, { useState, useEffect } from 'react';
import { toursAPI, bookingsAPI } from '../api';

const statusLabel = { pending: 'Ожидает', confirmed: 'Подтверждено', cancelled: 'Отменено', completed: 'Завершено' };
const statusColor = { pending: '#fff3cd', confirmed: '#d1fae5', cancelled: '#fee2e2', completed: '#dbeafe' };
const statusText = { pending: '#856404', confirmed: '#065f46', cancelled: '#991b1b', completed: '#1e40af' };

const EMPTY_TOUR = { title: '', description: '', price: '', duration: '', location: '', country: '', image_url: '', rating: 4.5, category: 'Пляжный', available: true };

const AgentDashboard = () => {
  const [tab, setTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editTour, setEditTour] = useState(null);
  const [form, setForm] = useState(EMPTY_TOUR);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (tab === 'bookings') loadBookings();
    if (tab === 'tours') loadTours();
  }, [tab]);

  const loadBookings = async () => { setLoading(true); try { const r = await bookingsAPI.getAll(); setBookings(r.data); } catch {} finally { setLoading(false); } };
  const loadTours = async () => { setLoading(true); try { const r = await toursAPI.getAllAdmin(); setTours(r.data); } catch {} finally { setLoading(false); } };

  const openCreate = () => { setEditTour(null); setForm(EMPTY_TOUR); setError(''); setSuccess(''); setShowModal(true); };
  const openEdit = (t) => { setEditTour(t); setForm({ ...t }); setError(''); setSuccess(''); setShowModal(true); };

  const saveTour = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      if (!form.title || !form.price) { setError('Название и цена обязательны'); setSaving(false); return; }
      if (editTour) await toursAPI.update(editTour.id, { ...form, price: Number(form.price), rating: Number(form.rating) });
      else await toursAPI.create({ ...form, price: Number(form.price), rating: Number(form.rating) });
      setSuccess(editTour ? 'Тур обновлён!' : 'Тур создан!');
      loadTours(); setTimeout(() => { setShowModal(false); setSuccess(''); }, 1200);
    } catch (err) { setError(err.response?.data?.message || 'Ошибка при сохранении'); }
    finally { setSaving(false); }
  };

  const updateStatus = async (id, status) => {
    try { await bookingsAPI.updateStatus(id, status); loadBookings(); } catch {}
  };

  const filtered = filterStatus === 'all' ? bookings : bookings.filter(b => b.status === filterStatus);

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
    card: { background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 4px 16px rgba(10,61,98,0.1)', marginBottom: 12 },
    input: {
      width: '100%', padding: '11px 14px', border: '2px solid #e2e8f0', borderRadius: 10,
      fontFamily: 'Montserrat, sans-serif', fontSize: 14, outline: 'none', marginBottom: 2,
    },
    label: { fontSize: 12, fontWeight: 600, color: '#0a3d62', display: 'block', marginBottom: 5, marginTop: 12 },
    overlay: {
      position: 'fixed', inset: 0, background: 'rgba(10,61,98,0.6)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20, backdropFilter: 'blur(4px)',
    },
    modal: { background: 'white', borderRadius: 20, width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(10,61,98,0.3)' },
    modalHead: { background: 'linear-gradient(135deg, #0a3d62, #0097b2)', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    tourCard: {
      background: 'white', borderRadius: 16, overflow: 'hidden',
      boxShadow: '0 4px 16px rgba(10,61,98,0.1)', display: 'flex', gap: 0,
      marginBottom: 12, cursor: 'pointer',
    },
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
  };

  return (
    <div>
      <div style={s.header}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>📋</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: 'white', fontWeight: 700 }}>Панель агента</div>
        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15 }}>Управление турами и бронированиями</div>
        <div style={s.wave} />
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
          {[['📋','Всего бронирований', stats.total, '#0a3d62'],['⏳','Ожидают',stats.pending,'#856404'],['✅','Подтверждено',stats.confirmed,'#065f46']].map(([icon,label,val,color]) => (
            <div key={label} style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 4px 16px rgba(10,61,98,0.1)', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 6 }}>{icon}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color }}>{val}</div>
              <div style={{ color: '#64748b', fontSize: 13 }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 4, background: '#e2e8f0', padding: 4, borderRadius: 50, marginBottom: 24 }}>
          {[['bookings','🗓 Бронирования'],['tours','🏝 Туры']].map(([key,label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              flex: 1, padding: '10px', border: 'none', borderRadius: 50,
              background: tab===key?'white':'transparent', color: tab===key?'#0a3d62':'#64748b',
              fontFamily:'Montserrat,sans-serif', fontWeight:600, fontSize:14, cursor:'pointer',
              boxShadow: tab===key?'0 2px 8px rgba(0,0,0,0.1)':'none', transition:'all 0.3s',
            }}>{label}</button>
          ))}
        </div>

        {loading && <div className="loading-center"><div className="spinner" /></div>}

        {!loading && tab === 'bookings' && (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {[['all','Все'],['pending','Ожидают'],['confirmed','Подтверждено'],['cancelled','Отменено'],['completed','Завершено']].map(([val,label]) => (
                <button key={val} onClick={() => setFilterStatus(val)}
                  style={{ padding:'7px 16px', border:'2px solid', borderColor:filterStatus===val?'#0097b2':'#e2e8f0',
                    background:filterStatus===val?'#0097b2':'white', color:filterStatus===val?'white':'#475569',
                    borderRadius:50, fontFamily:'Montserrat,sans-serif', fontWeight:600, fontSize:12, cursor:'pointer' }}>{label}</button>
              ))}
            </div>
            {filtered.length === 0 ? (
              <div style={{ textAlign:'center', padding:60, color:'#64748b' }}><div style={{ fontSize:48, marginBottom:12 }}>📭</div><div>Нет бронирований</div></div>
            ) : filtered.map(b => (
              <div key={b.id} style={s.card}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
                  <div>
                    <div style={{ fontWeight:700, color:'#0a3d62', fontSize:16, marginBottom:4 }}>#{b.id} — {b.tour_title}</div>
                    <div style={{ fontSize:13, color:'#64748b', marginBottom:4 }}>👤 {b.user_name} ({b.user_email})</div>
                    <div style={{ fontSize:13, color:'#64748b', marginBottom:4 }}>📅 {b.arrival_date} → {b.departure_date} · 👥 {b.guests} чел.</div>
                    <div style={{ fontSize:13, color:'#64748b' }}>🚗 {b.transport_type} · {b.travel_class} · 📍 от {b.origin}</div>
                    <div style={{ fontWeight:700, color:'#0097b2', marginTop:6 }}>{Number(b.total_price).toLocaleString('ru')} ₽</div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end' }}>
                    <span style={{ background:statusColor[b.status], color:statusText[b.status], fontSize:12, fontWeight:700, padding:'4px 12px', borderRadius:50 }}>{statusLabel[b.status]}</span>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                      {b.status==='pending' && <button className="btn btn-sm" style={{ background:'#d1fae5', color:'#065f46', border:'none', borderRadius:50, padding:'6px 14px', cursor:'pointer', fontWeight:600, fontSize:12 }} onClick={() => updateStatus(b.id,'confirmed')}>✅ Подтвердить</button>}
                      {(b.status==='pending'||b.status==='confirmed') && <button className="btn btn-sm" style={{ background:'#fee2e2', color:'#991b1b', border:'none', borderRadius:50, padding:'6px 14px', cursor:'pointer', fontWeight:600, fontSize:12 }} onClick={() => updateStatus(b.id,'cancelled')}>❌ Отменить</button>}
                      {b.status==='confirmed' && <button className="btn btn-sm" style={{ background:'#dbeafe', color:'#1e40af', border:'none', borderRadius:50, padding:'6px 14px', cursor:'pointer', fontWeight:600, fontSize:12 }} onClick={() => updateStatus(b.id,'completed')}>🏁 Завершить</button>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {!loading && tab === 'tours' && (
          <>
            <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:20 }}>
              <button className="btn btn-gold" onClick={openCreate}>+ Добавить тур</button>
            </div>
            {tours.map(t => (
              <div key={t.id} style={s.tourCard}>
                {t.image_url
                  ? <img src={t.image_url} alt="" style={{ width:120, height:100, objectFit:'cover', flexShrink:0 }} onError={e => e.target.style.display='none'} />
                  : <div style={{ width:120, height:100, background:'linear-gradient(135deg,#0a3d62,#0097b2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, flexShrink:0 }}>🏝️</div>
                }
                <div style={{ flex:1, padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
                  <div>
                    <div style={{ fontWeight:700, color:'#0a3d62', fontSize:16, marginBottom:4 }}>{t.title}</div>
                    <div style={{ fontSize:13, color:'#64748b', marginBottom:4 }}>📍 {t.location}, {t.country} · {t.duration}</div>
                    <div style={{ fontSize:13, color:'#64748b' }}>⭐ {t.rating} · {t.category}</div>
                    <div style={{ fontWeight:700, color:'#0097b2', marginTop:4 }}>{Number(t.price).toLocaleString('ru')} ₽</div>
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <span style={{ background:t.available?'#d1fae5':'#fee2e2', color:t.available?'#065f46':'#991b1b', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:50 }}>{t.available?'Доступен':'Скрыт'}</span>
                    <button className="btn btn-sm btn-outline" onClick={() => openEdit(t)}>✏️ Редактировать</button>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {showModal && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={s.modal}>
            <div style={s.modalHead}>
              <span style={{ color:'white', fontWeight:700, fontSize:18 }}>{editTour ? '✏️ Редактировать тур' : '+ Новый тур'}</span>
              <button onClick={() => setShowModal(false)} style={{ background:'rgba(255,255,255,0.2)', border:'none', color:'white', borderRadius:'50%', width:32, height:32, cursor:'pointer', fontSize:16 }}>✕</button>
            </div>
            <form style={{ padding:24 }} onSubmit={saveTour}>
              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                {[['title','Название','text',1],['price','Цена (₽)','number',1],['location','Город','text',0],['country','Страна','text',0],['duration','Длительность','text',0],['rating','Рейтинг','number',0]].map(([field,label,type,req]) => (
                  <div key={field} style={{ gridColumn: field==='title'?'1/-1':'auto' }}>
                    <label style={s.label}>{label}</label>
                    <input type={type} style={s.input} required={!!req} step={field==='rating'?0.1:1} min={field==='rating'?1:0} max={field==='rating'?5:undefined}
                      value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
                  </div>
                ))}
                <div>
                  <label style={s.label}>Категория</label>
                  <select style={{ ...s.input, cursor:'pointer' }} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {['Пляжный','Культурный','Приключения'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={s.label}>Статус</label>
                  <select style={{ ...s.input, cursor:'pointer' }} value={form.available} onChange={e => setForm(f => ({ ...f, available: e.target.value === 'true' }))}>
                    <option value="true">✅ Доступен</option>
                    <option value="false">❌ Скрыт</option>
                  </select>
                </div>
              </div>
              <label style={s.label}>URL изображения</label>
              <input style={s.input} value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://..." />
              <label style={s.label}>Описание</label>
              <textarea style={{ ...s.input, height:100, resize:'vertical', marginBottom:0 }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
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

export default AgentDashboard;
