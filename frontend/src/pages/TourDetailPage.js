import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toursAPI, bookingsAPI, paymentsAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';

const CITIES = ['Москва','Санкт-Петербург','Новосибирск','Екатеринбург','Казань','Нижний Новгород','Краснодар','Ростов-на-Дону','Самара','Уфа','Омск','Воронеж','Пермь','Красноярск','Волгоград'];
const TRANSPORT = [
  { type: 'plane', label: '✈️ Самолёт', desc: 'Быстро и комфортно', add: 5000 },
  { type: 'train', label: '🚂 Поезд', desc: 'Живописный маршрут', add: 2000 },
  { type: 'bus', label: '🚌 Автобус', desc: 'Бюджетный вариант', add: 800 },
  { type: 'car', label: '🚗 Автомобиль', desc: 'Самостоятельно', add: 0 },
];

const WEEKDAYS = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
const MONTHS = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];

const Calendar = ({ label, selected, onChange, minDate }) => {
  const [viewDate, setViewDate] = useState(() => {
    const d = minDate ? new Date(minDate) : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const today = new Date(); today.setHours(0,0,0,0);
  const min = minDate ? new Date(minDate) : today;

  const getDays = () => {
    const year = viewDate.getFullYear(), month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const offset = (firstDay + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < offset; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
    return days;
  };

  const selDate = selected ? new Date(selected) : null;
  const days = getDays();

  return (
    <div>
      <div style={{ marginBottom: 8, fontWeight: 600, color: '#0a3d62', fontSize: 14 }}>{label}</div>
      <div style={{ background: 'white', borderRadius: 16, border: '2px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg, #0a3d62, #0097b2)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth()-1, 1))}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontSize: 14 }}>‹</button>
          <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>
            {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
          </span>
          <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth()+1, 1))}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontSize: 14 }}>›</button>
        </div>
        <div style={{ padding: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 6 }}>
            {WEEKDAYS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#64748b', padding: '4px 0' }}>{d}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
            {days.map((day, i) => {
              if (!day) return <div key={`e-${i}`} />;
              const isDisabled = day < min;
              const isSelected = selDate && day.toDateString() === selDate.toDateString();
              const isToday = day.toDateString() === today.toDateString();
              return (
                <div key={i} onClick={() => !isDisabled && onChange(day.toISOString().split('T')[0])}
                  style={{
                    aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 8, fontSize: 13, fontWeight: isSelected ? 700 : 500,
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    background: isSelected ? '#0097b2' : 'transparent',
                    color: isDisabled ? '#ccc' : isSelected ? 'white' : '#0a3d62',
                    border: isToday && !isSelected ? '2px solid #0097b2' : '2px solid transparent',
                    textDecoration: isDisabled ? 'line-through' : 'none',
                    transition: 'all 0.15s',
                  }}>
                  {day.getDate()}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const TourDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0); // 0=detail, 1=origin, 2=transport, 3=calendar, 4=payment, 5=success
  const [form, setForm] = useState({ origin: '', transport_type: 'plane', travel_class: 'economy', arrival_date: '', departure_date: '', guests: 1 });
  const [booking, setBooking] = useState(null);
  const [payMethod, setPayMethod] = useState('card');
  const [cardNum, setCardNum] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    toursAPI.getById(id).then(res => { setTour(res.data); setLoading(false); }).catch(() => { setLoading(false); setError('Тур не найден'); });
  }, [id]);

  const calcPrice = () => {
    if (!tour) return 0;
    const transport = TRANSPORT.find(t => t.type === form.transport_type);
    const add = transport ? transport.add : 0;
    const classM = form.travel_class === 'business' ? 1.8 : 1;
    return Math.round((Number(tour.price) + add * form.guests) * classM * form.guests);
  };

  const createBooking = async () => {
    if (!form.arrival_date || !form.departure_date) { setError('Выберите даты'); return; }
    if (new Date(form.departure_date) <= new Date(form.arrival_date)) { setError('Дата отъезда должна быть позже прибытия'); return; }
    setError(''); setProcessing(true);
    try {
      const res = await bookingsAPI.create({ ...form, tour_id: tour.id });
      setBooking(res.data); setStep(4);
    } catch (err) { setError(err.response?.data?.message || 'Ошибка создания бронирования'); }
    finally { setProcessing(false); }
  };

  const payBooking = async () => {
    if (payMethod === 'card') {
      if (!cardNum || cardNum.replace(/\s/g,'').length < 16) { setError('Введите номер карты (16 цифр)'); return; }
      if (!cardExp || !/^\d{2}\/\d{2}$/.test(cardExp)) { setError('Введите срок действия карты (ММ/ГГ)'); return; }
      const [mm, yy] = cardExp.split('/');
      const expDate = new Date(2000+Number(yy), Number(mm)-1, 1);
      if (expDate < new Date()) { setError('Срок действия карты истёк'); return; }
      if (!cardCvv || cardCvv.length < 3) { setError('Введите CVV (3 цифры)'); return; }
      if (!cardName.trim()) { setError('Введите имя держателя карты'); return; }
    }
    setError(''); setProcessing(true);
    try {
      await paymentsAPI.pay({ booking_id: booking.id, method: payMethod });
      setStep(5);
    } catch (err) { setError(err.response?.data?.message || 'Ошибка оплаты'); }
    finally { setProcessing(false); }
  };

  const s = {
    hero: {
      height: 380, position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(135deg, #0a3d62, #0097b2)',
    },
    heroImg: { width: '100%', height: '100%', objectFit: 'cover' },
    heroOverlay: {
      position: 'absolute', inset: 0,
      background: 'linear-gradient(to top, rgba(10,61,98,0.85) 0%, rgba(10,61,98,0.2) 60%)',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 32,
    },
    heroTitle: { fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, color: 'white', marginBottom: 8 },
    step: {
      background: 'white', borderRadius: 20, padding: 32,
      boxShadow: '0 8px 32px rgba(10,61,98,0.12)', maxWidth: 700, margin: '0 auto',
    },
    stepTitle: { fontFamily: "'Playfair Display', serif", fontSize: 24, color: '#0a3d62', fontWeight: 700, marginBottom: 8 },
    stepDesc: { color: '#64748b', fontSize: 14, marginBottom: 24 },
    optionCard: {
      border: '2px solid #e2e8f0', borderRadius: 14, padding: '16px 20px',
      cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 16,
    },
    optionCardActive: { borderColor: '#0097b2', background: '#f0faff' },
    priceBlock: {
      background: 'linear-gradient(135deg, #0a3d62, #1e6091)',
      borderRadius: 16, padding: 20, color: 'white', marginBottom: 24,
    },
    payBtn: {
      width: '100%', background: 'linear-gradient(135deg, #f5a623, #ffd166)',
      color: 'white', border: 'none', borderRadius: 50, padding: 16,
      fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 16, cursor: 'pointer',
      boxShadow: '0 4px 20px rgba(245,166,35,0.4)', transition: 'all 0.3s',
    },
    navBtns: { display: 'flex', gap: 12, marginTop: 24, justifyContent: 'space-between' },
    backBtn: {
      background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 50,
      padding: '12px 24px', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: 14,
    },
    nextBtn: {
      background: 'linear-gradient(135deg, #0097b2, #1e6091)',
      color: 'white', border: 'none', borderRadius: 50, padding: '12px 28px',
      cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 14,
      boxShadow: '0 4px 15px rgba(0,151,178,0.4)',
    },
    successIcon: { fontSize: 80, textAlign: 'center', marginBottom: 16, display: 'block' },
    cardInput: {
      width: '100%', padding: '13px 16px', border: '2px solid #e2e8f0', borderRadius: 10,
      fontFamily: 'Montserrat, sans-serif', fontSize: 14, outline: 'none',
      transition: 'border-color 0.3s',
    },
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!tour && error) return <div style={{ textAlign: 'center', padding: 60 }}><div style={{ fontSize: 48 }}>😔</div><div>{error}</div></div>;
  if (!tour) return null;

  const stepLabels = ['Тур', 'Откуда', 'Транспорт', 'Даты', 'Оплата'];

  const stepIndicator = step > 0 && step < 5 ? (
    <div style={{ display: 'flex', gap: 0, marginBottom: 24, maxWidth: 700, margin: '0 auto 24px' }}>
      {stepLabels.map((l, i) => (
        <div key={i} style={{
          flex: 1, textAlign: 'center', padding: '10px 4px', fontSize: 12, fontWeight: 600,
          borderBottom: `3px solid ${i < step ? '#0a3d62' : i === step ? '#0097b2' : '#e2e8f0'}`,
          color: i < step ? '#0a3d62' : i === step ? '#0097b2' : '#94a3b8',
        }}>{i + 1}. {l}</div>
      ))}
    </div>
  ) : null;

  return (
    <div>
      {step === 0 && (
        <>
          <div style={s.hero}>
            {tour.image_url && <img src={tour.image_url} alt={tour.title} style={s.heroImg} onError={e => e.target.style.display='none'} />}
            <div style={s.heroOverlay}>
              {tour.category && <span style={{ background: '#f5a623', color: 'white', fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 50, marginBottom: 8, display: 'inline-block' }}>{tour.category}</span>}
              <div style={s.heroTitle}>{tour.title}</div>
              <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15 }}>📍 {tour.location}, {tour.country} · {tour.duration}</div>
              <div style={{ color: '#ffd166', fontSize: 14, marginTop: 4 }}>{'★'.repeat(Math.round(tour.rating || 4))} {Number(tour.rating).toFixed(1)}</div>
            </div>
          </div>
          <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
              <div>
                <div style={{ background: 'white', borderRadius: 20, padding: 28, boxShadow: '0 4px 20px rgba(10,61,98,0.1)', marginBottom: 20 }}>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", color: '#0a3d62', marginBottom: 16 }}>О туре</h2>
                  <p style={{ color: '#475569', lineHeight: 1.7, fontSize: 15 }}>{tour.description || 'Описание тура'}</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {[['🗓', 'Длительность', tour.duration],['📍','Место',tour.location],['🌍','Страна',tour.country]].map(([icon, l, v]) => (
                    <div key={l} style={{ background: 'white', borderRadius: 14, padding: 16, textAlign: 'center', boxShadow: '0 4px 12px rgba(10,61,98,0.08)' }}>
                      <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
                      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>{l}</div>
                      <div style={{ fontWeight: 700, color: '#0a3d62', marginTop: 2 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ background: 'linear-gradient(135deg, #0a3d62, #0097b2)', borderRadius: 20, padding: 28, color: 'white', position: 'sticky', top: 80 }}>
                  <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>Цена тура от</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, marginBottom: 4 }}>{Number(tour.price).toLocaleString('ru')} ₽</div>
                  <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 24 }}>за человека</div>
                  <button style={s.payBtn} onClick={() => setStep(1)}>🚀 Забронировать тур</button>
                  <div style={{ marginTop: 16, fontSize: 12, opacity: 0.7, textAlign: 'center' }}>Бесплатная отмена за 48 часов</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {step > 0 && step < 5 && (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px' }}>
          {stepIndicator}
          {error && <div className="alert alert-error" style={{ maxWidth: 700, margin: '0 auto 16px' }}>{error}</div>}

          {step === 1 && (
            <div style={s.step}>
              <div style={s.stepTitle}>📍 Откуда вы едете?</div>
              <div style={s.stepDesc}>Выберите ваш город отправления</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginBottom: 24 }}>
                {CITIES.map(city => (
                  <button key={city} onClick={() => setForm(f => ({ ...f, origin: city }))}
                    style={{
                      padding: '10px 14px', borderRadius: 10, border: '2px solid',
                      borderColor: form.origin === city ? '#0097b2' : '#e2e8f0',
                      background: form.origin === city ? '#f0faff' : 'white',
                      color: form.origin === city ? '#0097b2' : '#475569',
                      fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: 13,
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}>
                    {city}
                  </button>
                ))}
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#0a3d62', display: 'block', marginBottom: 6 }}>Количество гостей</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button onClick={() => setForm(f => ({ ...f, guests: Math.max(1, f.guests - 1) }))}
                    style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: 18, fontWeight: 700, color: '#0097b2' }}>−</button>
                  <span style={{ fontWeight: 700, fontSize: 20, color: '#0a3d62', minWidth: 24, textAlign: 'center' }}>{form.guests}</span>
                  <button onClick={() => setForm(f => ({ ...f, guests: Math.min(20, f.guests + 1) }))}
                    style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: 18, fontWeight: 700, color: '#0097b2' }}>+</button>
                  <span style={{ color: '#64748b', fontSize: 13 }}>человек</span>
                </div>
              </div>
              <div style={s.navBtns}>
                <button style={s.backBtn} onClick={() => setStep(0)}>← Назад</button>
                <button style={{ ...s.nextBtn, opacity: !form.origin ? 0.5 : 1 }}
                  disabled={!form.origin} onClick={() => { setError(''); setStep(2); }}>
                  Далее →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={s.step}>
              <div style={s.stepTitle}>🚀 Способ добраться</div>
              <div style={s.stepDesc}>Выберите вид транспорта и класс обслуживания</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {TRANSPORT.map(t => (
                  <div key={t.type} style={{ ...s.optionCard, ...(form.transport_type === t.type ? s.optionCardActive : {}) }}
                    onClick={() => setForm(f => ({ ...f, transport_type: t.type }))}>
                    <span style={{ fontSize: 28 }}>{t.label.split(' ')[0]}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: '#0a3d62' }}>{t.label.split(' ').slice(1).join(' ')}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{t.desc}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: '#0097b2' }}>
                      {t.add > 0 ? `+${t.add.toLocaleString('ru')} ₽` : 'Бесплатно'}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontWeight: 700, color: '#0a3d62', marginBottom: 12, fontSize: 14 }}>Класс обслуживания</div>
                <div style={{ display: 'flex', gap: 12 }}>
                  {[['economy','🪑 Эконом','Стандартный комфорт'],['business','💼 Бизнес','×1.8 к цене — Повышенный комфорт']].map(([cls, label, desc]) => (
                    <div key={cls} style={{ ...s.optionCard, flex: 1, ...(form.travel_class === cls ? s.optionCardActive : {}) }}
                      onClick={() => setForm(f => ({ ...f, travel_class: cls }))}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0a3d62', fontSize: 15 }}>{label}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={s.navBtns}>
                <button style={s.backBtn} onClick={() => setStep(1)}>← Назад</button>
                <button style={s.nextBtn} onClick={() => { setError(''); setStep(3); }}>Далее →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={s.step}>
              <div style={s.stepTitle}>📅 Выберите даты</div>
              <div style={s.stepDesc}>Даты в прошлом недоступны. Дата отъезда должна быть позже прибытия.</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                <Calendar label="📥 Дата приезда" selected={form.arrival_date}
                  onChange={d => { setForm(f => ({ ...f, arrival_date: d, departure_date: '' })); setError(''); }}
                  minDate={new Date().toISOString().split('T')[0]} />
                <Calendar label="📤 Дата отъезда" selected={form.departure_date}
                  onChange={d => {
                    if (form.arrival_date && d <= form.arrival_date) {
                      setError('Дата отъезда должна быть позже даты приезда'); return;
                    }
                    setError(''); setForm(f => ({ ...f, departure_date: d }));
                  }}
                  minDate={form.arrival_date || new Date().toISOString().split('T')[0]} />
              </div>
              {form.arrival_date && form.departure_date && (
                <div style={{ background: '#f0faff', borderRadius: 12, padding: 16, marginBottom: 20, display: 'flex', justifyContent: 'space-between' }}>
                  <div><span style={{ fontSize: 12, color: '#64748b' }}>Прибытие</span><div style={{ fontWeight: 700, color: '#0a3d62' }}>{form.arrival_date}</div></div>
                  <div style={{ fontSize: 24, color: '#0097b2' }}>→</div>
                  <div><span style={{ fontSize: 12, color: '#64748b' }}>Отъезд</span><div style={{ fontWeight: 700, color: '#0a3d62' }}>{form.departure_date}</div></div>
                  <div><span style={{ fontSize: 12, color: '#64748b' }}>Ночей</span><div style={{ fontWeight: 700, color: '#0a3d62' }}>{Math.ceil((new Date(form.departure_date)-new Date(form.arrival_date))/(1000*60*60*24))}</div></div>
                </div>
              )}
              <div style={s.navBtns}>
                <button style={s.backBtn} onClick={() => { setError(''); setStep(2); }}>← Назад</button>
                <button style={{ ...s.nextBtn, opacity: (!form.arrival_date || !form.departure_date || processing) ? 0.5 : 1 }}
                  disabled={!form.arrival_date || !form.departure_date || processing}
                  onClick={createBooking}>{processing ? '⌛ Создаётся...' : 'К оплате →'}</button>
              </div>
            </div>
          )}

          {step === 4 && booking && (
            <div style={s.step}>
              <div style={s.stepTitle}>💳 Оплата</div>
              <div style={s.priceBlock}>
                <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>Итого к оплате</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 38, fontWeight: 700 }}>{Number(booking.total_price).toLocaleString('ru')} ₽</div>
                <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <span>📍 {tour.title}</span>
                  <span>👥 {form.guests} чел.</span>
                  <span>🗓 {form.arrival_date} → {form.departure_date}</span>
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 700, color: '#0a3d62', marginBottom: 12, fontSize: 14 }}>Способ оплаты</div>
                <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                  {[['card','💳 Карта'],['sbp','📱 СБП'],['cash','💵 При заезде']].map(([m, l]) => (
                    <button key={m} onClick={() => { setPayMethod(m); setError(''); }}
                      style={{ flex: 1, padding: '10px', border: `2px solid ${payMethod===m?'#0097b2':'#e2e8f0'}`,
                        borderRadius: 10, background: payMethod===m?'#f0faff':'white',
                        color: payMethod===m?'#0097b2':'#475569', fontFamily:'Montserrat,sans-serif',
                        fontWeight:600, fontSize:13, cursor:'pointer', transition:'all 0.2s' }}>{l}</button>
                  ))}
                </div>
                {payMethod === 'card' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#0a3d62', display: 'block', marginBottom: 6 }}>Номер карты</label>
                      <input style={s.cardInput} placeholder="0000 0000 0000 0000" maxLength={19}
                        value={cardNum} onChange={e => { const v=e.target.value.replace(/\D/g,'').slice(0,16); setCardNum(v.replace(/(.{4})/g,'$1 ').trim()); }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#0a3d62', display: 'block', marginBottom: 6 }}>Срок (ММ/ГГ)</label>
                        <input style={s.cardInput} placeholder="12/28" maxLength={5}
                          value={cardExp} onChange={e => { let v=e.target.value.replace(/\D/g,''); if(v.length>2)v=v.slice(0,2)+'/'+v.slice(2,4); setCardExp(v); }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#0a3d62', display: 'block', marginBottom: 6 }}>CVV</label>
                        <input style={s.cardInput} placeholder="•••" maxLength={3} type="password"
                          value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g,'').slice(0,3))} />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#0a3d62', display: 'block', marginBottom: 6 }}>Имя держателя</label>
                      <input style={s.cardInput} placeholder="IVAN IVANOV"
                        value={cardName} onChange={e => setCardName(e.target.value.toUpperCase())} />
                    </div>
                  </div>
                )}
                {payMethod === 'sbp' && (
                  <div style={{ background: '#f0faff', borderRadius: 12, padding: 20, textAlign: 'center' }}>
                    <div style={{ fontSize: 48, marginBottom: 8 }}>📱</div>
                    <div style={{ fontWeight: 700, color: '#0a3d62', marginBottom: 4 }}>Оплата через СБП</div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>Подтвердите платёж в приложении банка</div>
                  </div>
                )}
                {payMethod === 'cash' && (
                  <div style={{ background: '#f0faff', borderRadius: 12, padding: 20, textAlign: 'center' }}>
                    <div style={{ fontSize: 48, marginBottom: 8 }}>🏨</div>
                    <div style={{ fontWeight: 700, color: '#0a3d62', marginBottom: 4 }}>Оплата при заезде</div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>Оплатите тур наличными или картой при прибытии</div>
                  </div>
                )}
              </div>
              <button style={{ ...s.payBtn, opacity: processing ? 0.7 : 1 }} disabled={processing} onClick={payBooking}>
                {processing ? '⌛ Обработка...' : `💳 Оплатить ${Number(booking.total_price).toLocaleString('ru')} ₽`}
              </button>
              <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: '#64748b' }}>🔒 Безопасная оплата</div>
            </div>
          )}
        </div>
      )}

      {step === 5 && (
        <div style={{ maxWidth: 600, margin: '60px auto', padding: '0 20px' }}>
          <div style={{ ...s.step, textAlign: 'center' }}>
            <span style={s.successIcon}>🎉</span>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#0a3d62', fontWeight: 700, marginBottom: 12 }}>
              Бронирование подтверждено!
            </div>
            <div style={{ color: '#64748b', fontSize: 15, marginBottom: 24 }}>
              Ваше путешествие в <strong>{tour.title}</strong> ждёт вас!<br />
              Детали отправлены на ваш email.
            </div>
            <div style={{ background: '#f0faff', borderRadius: 16, padding: 20, marginBottom: 24, textAlign: 'left' }}>
              {[['🏝', 'Тур', tour.title], ['📅', 'Прибытие', form.arrival_date], ['📅', 'Отъезд', form.departure_date],
                ['👥', 'Гостей', form.guests], ['💰', 'Оплачено', `${booking ? Number(booking.total_price).toLocaleString('ru') : ''} ₽`]].map(([icon, label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b', fontSize: 14 }}>{icon} {label}</span>
                  <span style={{ fontWeight: 700, color: '#0a3d62', fontSize: 14 }}>{value}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => navigate('/profile')}>Мои бронирования</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate('/tours')}>Другие туры</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TourDetailPage;
