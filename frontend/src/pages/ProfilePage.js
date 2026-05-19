import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, bookingsAPI, paymentsAPI, browsingAPI } from '../api';
import { useNavigate } from 'react-router-dom';

const TABS = [['bookings','🗓 Бронирования'],['history','💳 История оплат'],['browsing','👁 Просмотренные'],['settings','⚙️ Настройки']];

const statusLabel = { pending: '⏳ Ожидает', confirmed: '✅ Подтверждено', cancelled: '❌ Отменено', completed: '🏁 Завершено' };
const statusColor = { pending: '#fff3cd', confirmed: '#d1fae5', cancelled: '#fee2e2', completed: '#dbeafe' };
const statusTextColor = { pending: '#856404', confirmed: '#065f46', cancelled: '#991b1b', completed: '#1e40af' };

const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [browsing, setBrowsing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', currentPassword: '', newPassword: '' });
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    if (tab === 'bookings') loadBookings();
    if (tab === 'history') loadPayments();
    if (tab === 'browsing') loadBrowsing();
  }, [tab]);

  const loadBookings = async () => {
    setLoading(true);
    try { const res = await bookingsAPI.getAll(); setBookings(res.data); } catch {}
    finally { setLoading(false); }
  };
  const loadPayments = async () => {
    setLoading(true);
    try { const res = await paymentsAPI.getMy(); setPayments(res.data); } catch {}
    finally { setLoading(false); }
  };
  const loadBrowsing = async () => {
    setLoading(true);
    try { const res = await browsingAPI.getHistory(); setBrowsing(res.data); } catch {}
    finally { setLoading(false); }
  };

  const cancelBooking = async (id) => {
    if (!window.confirm('Отменить бронирование?')) return;
    try { await bookingsAPI.cancel(id); loadBookings(); } catch {}
  };

  const handleAvatarFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError('Файл слишком большой (макс. 2MB)'); return; }
    const reader = new FileReader();
    reader.onload = ev => setAvatar(ev.target.result);
    reader.readAsDataURL(file);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setSaving(true);
    try {
      const payload = { name: form.name, avatar };
      if (form.newPassword) { payload.currentPassword = form.currentPassword; payload.newPassword = form.newPassword; }
      const res = await authAPI.updateMe(payload);
      updateUser(res.data);
      setSuccess('Профиль обновлён!');
      setForm(f => ({ ...f, currentPassword: '', newPassword: '' }));
    } catch (err) { setError(err.response?.data?.message || 'Ошибка при сохранении'); }
    finally { setSaving(false); }
  };

  const s = {
    header: {
      background: 'linear-gradient(135deg, #0a3d62 0%, #0097b2 100%)',
      padding: '40px 20px 80px', position: 'relative', overflow: 'hidden',
    },
    wave: {
      position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
      background: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 60'%3E%3Cpath fill='%23e8f4fd' d='M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,60 L0,60 Z'/%3E%3C/svg%3E\")",
      backgroundSize: 'cover',
    },
    avatarWrap: {
      width: 100, height: 100, borderRadius: '50%', border: '4px solid white',
      overflow: 'hidden', background: 'linear-gradient(135deg, #0097b2, #48cae4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 36, color: 'white', fontWeight: 700, cursor: 'pointer',
      position: 'relative', flexShrink: 0,
    },
    card: { background: 'white', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(10,61,98,0.1)', marginBottom: 16 },
    bookCard: {
      background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 4px 16px rgba(10,61,98,0.1)',
      display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 16, alignItems: 'center',
      marginBottom: 12, transition: 'all 0.2s',
    },
    imgThumb: { width: 80, height: 80, borderRadius: 12, objectFit: 'cover', background: 'linear-gradient(135deg, #0a3d62, #0097b2)' },
    settingsInput: {
      width: '100%', padding: '12px 16px', border: '2px solid #e2e8f0', borderRadius: 10,
      fontFamily: 'Montserrat, sans-serif', fontSize: 14, outline: 'none', transition: 'border-color 0.3s',
    },
    label: { fontSize: 12, fontWeight: 600, color: '#0a3d62', display: 'block', marginBottom: 6 },
  };

  const activeBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending');
  const pastBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

  return (
    <div>
      <div style={s.header}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={s.avatarWrap} onClick={() => fileRef.current?.click()}>
            {avatar
              ? <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : user?.name?.[0]?.toUpperCase()
            }
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity=1}
              onMouseLeave={e => e.currentTarget.style.opacity=0}>
              <span style={{ color: 'white', fontSize: 20 }}>📷</span>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarFile} />
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: 'white', fontWeight: 700 }}>{user?.name}</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>{user?.email}</div>
            <div style={{ marginTop: 8 }}>
              <span style={{ background: '#f5a623', color: 'white', fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 50 }}>
                {user?.role === 'admin' ? '⚙️ Администратор' : user?.role === 'agent' ? '📋 Тур-агент' : '🧳 Путешественник'}
              </span>
            </div>
          </div>
        </div>
        <div style={s.wave} />
      </div>

      <div style={{ maxWidth: 1000, margin: '-20px auto 0', padding: '0 20px 40px', position: 'relative' }}>
        <div style={{ display: 'flex', gap: 4, background: '#e2e8f0', padding: 4, borderRadius: 50, marginBottom: 24, flexWrap: 'wrap' }}>
          {TABS.map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              style={{
                flex: 1, minWidth: 120, padding: '10px 16px', border: 'none', borderRadius: 50,
                background: tab === key ? 'white' : 'transparent',
                color: tab === key ? '#0a3d62' : '#64748b',
                fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                boxShadow: tab === key ? '0 2px 8px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.3s',
              }}>{label}</button>
          ))}
        </div>

        {loading && <div className="loading-center"><div className="spinner" /></div>}

        {!loading && tab === 'bookings' && (
          <div>
            {activeBookings.length > 0 && (
              <>
                <h3 style={{ color: '#0a3d62', marginBottom: 16, fontFamily: "'Playfair Display', serif" }}>Активные бронирования</h3>
                {activeBookings.map(b => (
                  <div key={b.id} style={s.bookCard}>
                    {b.tour_image
                      ? <img src={b.tour_image} alt="" style={s.imgThumb} onError={e => e.target.style.background='#e8f4fd'} />
                      : <div style={{ ...s.imgThumb, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>🏝️</div>
                    }
                    <div>
                      <div style={{ fontWeight: 700, color: '#0a3d62', marginBottom: 4 }}>{b.tour_title}</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>📍 {b.location} · 📅 {b.arrival_date} → {b.departure_date}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>👥 {b.guests} чел. · {b.transport_type} · {b.travel_class}</div>
                      <div style={{ fontWeight: 700, color: '#0097b2', marginTop: 4 }}>{Number(b.total_price).toLocaleString('ru')} ₽</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                      <span style={{ background: statusColor[b.status], color: statusTextColor[b.status], fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 50 }}>
                        {statusLabel[b.status]}
                      </span>
                      {b.status === 'pending' && (
                        <button onClick={() => cancelBooking(b.id)} style={{ fontSize: 12, color: '#ef476f', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>✕ Отменить</button>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
            {pastBookings.length > 0 && (
              <>
                <h3 style={{ color: '#0a3d62', marginBottom: 16, marginTop: 24, fontFamily: "'Playfair Display', serif" }}>История поездок</h3>
                {pastBookings.map(b => (
                  <div key={b.id} style={{ ...s.bookCard, opacity: 0.75 }}>
                    <div style={{ ...s.imgThumb, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>🏝️</div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0a3d62', marginBottom: 4 }}>{b.tour_title}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>📅 {b.arrival_date} → {b.departure_date} · {Number(b.total_price).toLocaleString('ru')} ₽</div>
                    </div>
                    <span style={{ background: statusColor[b.status], color: statusTextColor[b.status], fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 50 }}>
                      {statusLabel[b.status]}
                    </span>
                  </div>
                ))}
              </>
            )}
            {bookings.length === 0 && (
              <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>🧳</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#0a3d62', marginBottom: 8 }}>Нет бронирований</div>
                <div style={{ marginBottom: 20 }}>Самое время выбрать тур!</div>
                <button className="btn btn-primary" onClick={() => navigate('/tours')}>🌊 Выбрать тур</button>
              </div>
            )}
          </div>
        )}

        {!loading && tab === 'history' && (
          <div>
            {payments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>💳</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#0a3d62', marginBottom: 8 }}>Нет платежей</div>
              </div>
            ) : payments.map(p => (
              <div key={p.id} style={s.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0a3d62' }}>{p.tour_title}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                      🕐 {new Date(p.created_at).toLocaleDateString('ru')} · {p.method} · #{p.transaction_id}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: 20, color: '#0a3d62' }}>{Number(p.amount).toLocaleString('ru')} ₽</div>
                    <span style={{ background: '#d1fae5', color: '#065f46', fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 50 }}>✅ {p.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && tab === 'browsing' && (
          <div>
            {browsing.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>👁</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#0a3d62', marginBottom: 8 }}>История пуста</div>
                <button className="btn btn-primary" onClick={() => navigate('/tours')}>🌊 Смотреть туры</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                {browsing.map(b => (
                  <div key={b.id} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 16px rgba(10,61,98,0.1)', cursor: 'pointer', transition: 'all 0.2s' }}
                    onClick={() => navigate(`/tours/${b.tour_id}`)}>
                    {b.image_url
                      ? <img src={b.image_url} alt="" style={{ width: '100%', height: 130, objectFit: 'cover' }} onError={e => e.target.style.display='none'} />
                      : <div style={{ width: '100%', height: 130, background: 'linear-gradient(135deg, #0a3d62, #0097b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>🏝️</div>
                    }
                    <div style={{ padding: 12 }}>
                      <div style={{ fontWeight: 700, color: '#0a3d62', fontSize: 14, marginBottom: 4 }}>{b.title}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>📍 {b.location}</div>
                      <div style={{ fontWeight: 700, color: '#0097b2', marginTop: 6 }}>{Number(b.price).toLocaleString('ru')} ₽</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'settings' && (
          <div style={{ maxWidth: 540 }}>
            <form style={s.card} onSubmit={saveProfile}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", color: '#0a3d62', marginBottom: 20 }}>Личные данные</h3>
              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}
              <div style={{ marginBottom: 16 }}>
                <label style={s.label}>Фото профиля</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ ...s.avatarWrap_small, width: 60, height: 60, borderRadius: '50%', overflow: 'hidden', border: '2px solid #e2e8f0', background: 'linear-gradient(135deg, #0097b2, #48cae4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: 'white', fontWeight: 700 }}>
                    {avatar ? <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user?.name?.[0]?.toUpperCase()}
                  </div>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => fileRef.current?.click()}>📷 Загрузить фото</button>
                  {avatar && <button type="button" className="btn btn-sm" style={{ background: '#fee2e2', color: '#991b1b' }} onClick={() => setAvatar('')}>✕ Удалить</button>}
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={s.label}>Имя</label>
                <input style={s.settingsInput} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ваше имя" required />
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, color: '#0a3d62', marginBottom: 12, fontSize: 14 }}>Смена пароля</div>
                {[['currentPassword','Текущий пароль'],['newPassword','Новый пароль']].map(([field, label]) => (
                  <div key={field} style={{ marginBottom: 12 }}>
                    <label style={s.label}>{label}</label>
                    <input type="password" style={s.settingsInput} value={form[field]}
                      onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                      placeholder={field === 'newPassword' ? 'Минимум 6 символов' : '••••••'} />
                  </div>
                ))}
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>
                {saving ? '⌛ Сохранение...' : '💾 Сохранить изменения'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
