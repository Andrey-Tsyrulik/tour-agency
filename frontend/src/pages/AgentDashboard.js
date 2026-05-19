import React, { useState, useEffect } from 'react';
import { toursAPI, bookingsAPI } from '../api';

const EMPTY = { title:'', description:'', price:'', location:'', country:'', image_url:'', rating:4.5, category:'Пляжный', available:true };

const StatusBadge = ({ status }) => {
  const map = { pending:['#FFF3CD','#856404','Ожидает'], confirmed:['#D1FAE5','#065F46','Подтверждено'], cancelled:['#FBF0F2','#7D1128','Отменено'], completed:['#EEF6FB','#3A6A8A','Завершено'] };
  const [bg,color,label] = map[status]||['#F3F7FA','#5A6A7E',status];
  return <span style={{ background:bg, color, fontSize:11, fontWeight:700, padding:'3px 11px', borderRadius:50 }}>{label}</span>;
};

const AgentDashboard = () => {
  const [tab, setTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editTour, setEditTour] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (tab==='bookings') loadBookings();
    if (tab==='tours') loadTours();
  }, [tab]);

  const loadBookings = async () => { setLoading(true); try { const r = await bookingsAPI.getAll(); setBookings(r.data); } catch {} finally { setLoading(false); } };
  const loadTours = async () => { setLoading(true); try { const r = await toursAPI.getAllAdmin(); setTours(r.data); } catch {} finally { setLoading(false); } };

  const openCreate = () => { setEditTour(null); setForm(EMPTY); setError(''); setSuccess(''); setShowModal(true); };
  const openEdit = (t) => { setEditTour(t); setForm({...t}); setError(''); setSuccess(''); setShowModal(true); };

  const saveTour = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      if (!form.title || !form.price) { setError('Название и цена обязательны'); setSaving(false); return; }
      const payload = { ...form, price: Number(form.price), rating: Number(form.rating) };
      if (editTour) await toursAPI.update(editTour.id, payload);
      else await toursAPI.create(payload);
      setSuccess(editTour ? 'Тур обновлён' : 'Тур создан');
      loadTours(); setTimeout(() => { setShowModal(false); setSuccess(''); }, 1200);
    } catch (err) { setError(err.response?.data?.message || 'Ошибка при сохранении'); }
    finally { setSaving(false); }
  };

  const updateStatus = async (id, status) => {
    try { await bookingsAPI.updateStatus(id, status); loadBookings(); } catch {}
  };

  const filtered = filterStatus==='all' ? bookings : bookings.filter(b => b.status===filterStatus);
  const stats = { total:bookings.length, pending:bookings.filter(b=>b.status==='pending').length, confirmed:bookings.filter(b=>b.status==='confirmed').length };

  const s = {
    hero: {
      background:'linear-gradient(135deg,#5C0F1A 0%,#7D1128 45%,#3A6A8A 100%)',
      padding:'44px 20px 80px', textAlign:'center', position:'relative', overflow:'hidden',
    },
    wave: {
      position:'absolute', bottom:0, left:0, right:0, height:60,
      background:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 60'%3E%3Cpath fill='%23F3F7FA' d='M0,30 C360,60 720,0 1080,30 C1260,45 1380,20 1440,30 L1440,60 L0,60 Z'/%3E%3C/svg%3E\")",
      backgroundSize:'cover',
    },
    statCard: { background:'white', borderRadius:14, padding:'20px', textAlign:'center', boxShadow:'0 2px 12px rgba(30,42,56,0.08)' },
    row: { background:'white', borderRadius:14, padding:'18px 22px', boxShadow:'0 2px 12px rgba(30,42,56,0.08)', marginBottom:10 },
    tourRow: {
      background:'white', borderRadius:14, overflow:'hidden', boxShadow:'0 2px 12px rgba(30,42,56,0.08)',
      display:'flex', marginBottom:10,
    },
    input: {
      width:'100%', padding:'10px 14px', border:'1.5px solid #E8EDF3', borderRadius:9,
      fontFamily:'Montserrat,sans-serif', fontSize:13.5, outline:'none', background:'#FAFBFD',
    },
    label: { fontSize:11, fontWeight:700, color:'#4E8098', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:0.5, marginTop:12 },
    overlay: { position:'fixed', inset:0, background:'rgba(30,42,56,0.52)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20, backdropFilter:'blur(5px)' },
    modal: { background:'white', borderRadius:22, width:'100%', maxWidth:600, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 28px 70px rgba(30,42,56,0.25)' },
    modalHead: { background:'linear-gradient(135deg,#7D1128,#9B1B30)', padding:'18px 26px', display:'flex', justifyContent:'space-between', alignItems:'center', borderRadius:'22px 22px 0 0' },
    filterBtn: {
      padding:'7px 15px', border:'1.5px solid', borderRadius:50,
      fontFamily:'Montserrat,sans-serif', fontWeight:600, fontSize:12.5, cursor:'pointer', transition:'all 0.2s',
    },
    actionBtn: { padding:'6px 13px', border:'none', borderRadius:8, cursor:'pointer', fontWeight:700, fontSize:12, fontFamily:'Montserrat,sans-serif', transition:'all 0.2s' },
  };

  return (
    <div>
      <div style={s.hero}>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.65)', letterSpacing:3, textTransform:'uppercase', marginBottom:12, fontWeight:600 }}>Tour Agency</div>
        <div style={{ fontFamily:"'Playfair Display', serif", fontSize:32, color:'white', fontWeight:700 }}>Панель агента</div>
        <div style={{ color:'rgba(255,255,255,0.78)', fontSize:14.5, marginTop:6 }}>Управление турами и бронированиями</div>
        <div style={s.wave} />
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'24px 20px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:24 }}>
          {[['Всего бронирований',stats.total,'#7D1128'],['Ожидают обработки',stats.pending,'#856404'],['Подтверждено',stats.confirmed,'#065F46']].map(([label,val,color]) => (
            <div key={label} style={{ ...s.statCard, borderTop:`3px solid ${color}` }}>
              <div style={{ fontFamily:"'Playfair Display', serif", fontSize:32, fontWeight:700, color }}>{val}</div>
              <div style={{ color:'#5A6A7E', fontSize:12.5, marginTop:2 }}>{label}</div>
            </div>
          ))}
        </div>

        <div className="tabs">
          {[['bookings','Бронирования'],['tours','Туры']].map(([key,label]) => (
            <button key={key} className={`tab${tab===key?' active':''}`} onClick={() => setTab(key)}>{label}</button>
          ))}
        </div>

        {loading && <div className="loading-center"><div className="spinner" /></div>}

        {!loading && tab==='bookings' && (
          <>
            <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
              {[['all','Все'],['pending','Ожидают'],['confirmed','Подтверждено'],['cancelled','Отменено'],['completed','Завершено']].map(([val,label]) => (
                <button key={val} onClick={() => setFilterStatus(val)}
                  style={{ ...s.filterBtn, borderColor:filterStatus===val?'#7D1128':'#E8EDF3', background:filterStatus===val?'#7D1128':'white', color:filterStatus===val?'white':'#5A6A7E' }}>
                  {label}
                </button>
              ))}
            </div>
            {filtered.length===0 ? (
              <div style={{ textAlign:'center', padding:60, color:'#5A6A7E' }}>Нет бронирований по выбранному фильтру</div>
            ) : filtered.map(b => (
              <div key={b.id} style={s.row}>
                <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:14 }}>
                  <div>
                    <div style={{ fontWeight:700, color:'#1E2A38', fontSize:15, marginBottom:4 }}>#{b.id} — {b.tour_title}</div>
                    <div style={{ fontSize:12.5, color:'#5A6A7E', marginBottom:3 }}>{b.user_name} ({b.user_email})</div>
                    <div style={{ fontSize:12.5, color:'#5A6A7E', marginBottom:3 }}>{b.arrival_date} — {b.departure_date} &nbsp;&middot;&nbsp; {b.guests} чел. &nbsp;&middot;&nbsp; {b.transport_type}, {b.travel_class}</div>
                    <div style={{ fontWeight:700, color:'#7D1128', fontSize:14 }}>{Number(b.total_price).toLocaleString('ru')} ₽</div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end' }}>
                    <StatusBadge status={b.status} />
                    <div style={{ display:'flex', gap:6 }}>
                      {b.status==='pending' && <button style={{ ...s.actionBtn, background:'#D1FAE5', color:'#065F46' }} onClick={() => updateStatus(b.id,'confirmed')}>Подтвердить</button>}
                      {(b.status==='pending'||b.status==='confirmed') && <button style={{ ...s.actionBtn, background:'#FBF0F2', color:'#7D1128' }} onClick={() => updateStatus(b.id,'cancelled')}>Отменить</button>}
                      {b.status==='confirmed' && <button style={{ ...s.actionBtn, background:'#EEF6FB', color:'#3A6A8A' }} onClick={() => updateStatus(b.id,'completed')}>Завершить</button>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {!loading && tab==='tours' && (
          <>
            <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:18 }}>
              <button className="btn btn-primary" onClick={openCreate}>+ Добавить тур</button>
            </div>
            {tours.map(t => (
              <div key={t.id} style={s.tourRow}>
                {t.image_url
                  ? <img src={t.image_url} alt="" style={{ width:110, height:90, objectFit:'cover', flexShrink:0 }} onError={e => e.target.style.display='none'} />
                  : <div style={{ width:110, height:90, background:'linear-gradient(135deg,#7D1128,#4E8098)', flexShrink:0 }} />
                }
                <div style={{ flex:1, padding:'14px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
                  <div>
                    <div style={{ fontWeight:700, color:'#1E2A38', fontSize:15, marginBottom:3 }}>{t.title}</div>
                    <div style={{ fontSize:12.5, color:'#5A6A7E', marginBottom:3 }}>{t.location}, {t.country} &nbsp;&middot;&nbsp; {t.duration}</div>
                    <div style={{ fontWeight:700, color:'#7D1128', fontSize:14 }}>{Number(t.price).toLocaleString('ru')} ₽</div>
                  </div>
                  <div style={{ display:'flex', gap:9, alignItems:'center' }}>
                    <span style={{ background:t.available?'#D1FAE5':'#FBF0F2', color:t.available?'#065F46':'#7D1128', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:50 }}>
                      {t.available?'Активен':'Скрыт'}
                    </span>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(t)}>Редактировать</button>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {showModal && (
        <div style={s.overlay} onClick={e => e.target===e.currentTarget && setShowModal(false)}>
          <div style={s.modal}>
            <div style={s.modalHead}>
              <span style={{ color:'white', fontWeight:700, fontSize:17 }}>{editTour ? 'Редактировать тур' : 'Новый тур'}</span>
              <button onClick={() => setShowModal(false)} style={{ background:'rgba(255,255,255,0.18)', border:'none', color:'white', borderRadius:'50%', width:30, height:30, cursor:'pointer', fontSize:16 }}>✕</button>
            </div>
            <form style={{ padding:24 }} onSubmit={saveTour}>
              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div style={{ gridColumn:'1/-1' }}>
                  <label style={s.label}>Название *</label>
                  <input style={s.input} required value={form.title} onChange={e => setForm(f => ({ ...f, title:e.target.value }))} />
                </div>
                {[['price','Цена (₽) *','number'],['location','Город','text'],['country','Страна','text'],['rating','Рейтинг (1–5)','number']].map(([field,label,type]) => (
                  <div key={field}>
                    <label style={s.label}>{label}</label>
                    <input type={type} style={s.input} step={field==='rating'?0.1:1} min={field==='rating'?1:0} max={field==='rating'?5:undefined}
                      required={field==='price'} value={form[field]} onChange={e => setForm(f => ({ ...f, [field]:e.target.value }))} />
                  </div>
                ))}
                <div>
                  <label style={s.label}>Категория</label>
                  <select style={{ ...s.input, cursor:'pointer' }} value={form.category} onChange={e => setForm(f => ({ ...f, category:e.target.value }))}>
                    {['Пляжный','Культурный','Приключения'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={s.label}>Статус</label>
                  <select style={{ ...s.input, cursor:'pointer' }} value={String(form.available)} onChange={e => setForm(f => ({ ...f, available:e.target.value==='true' }))}>
                    <option value="true">Активен</option>
                    <option value="false">Скрыт</option>
                  </select>
                </div>
              </div>
              <label style={s.label}>URL изображения</label>
              <input style={s.input} value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url:e.target.value }))} placeholder="https://..." />
              <label style={s.label}>Описание</label>
              <textarea style={{ ...s.input, height:90, resize:'vertical', marginBottom:0 }} value={form.description} onChange={e => setForm(f => ({ ...f, description:e.target.value }))} />
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

export default AgentDashboard;
