import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toursAPI, bookingsAPI, paymentsAPI } from '../api';

const CITIES = ['Москва','Санкт-Петербург','Новосибирск','Екатеринбург','Казань','Нижний Новгород','Краснодар','Ростов-на-Дону','Самара','Уфа','Омск','Воронеж','Пермь','Красноярск','Волгоград','Сочи','Калининград'];
const TRANSPORT = [
  { type: 'plane', label: 'Самолёт', desc: 'Быстро и комфортно', add: 5000 },
  { type: 'train', label: 'Поезд', desc: 'Живописный маршрут', add: 2000 },
  { type: 'bus', label: 'Автобус', desc: 'Бюджетный вариант', add: 800 },
  { type: 'car', label: 'Автомобиль', desc: 'Самостоятельно', add: 0 },
];
const MONTHS = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const WEEKDAYS = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

const Calendar = ({ label, selected, onChange, minDate }) => {
  const minD = minDate ? new Date(minDate) : new Date();
  minD.setHours(0,0,0,0);
  const [view, setView] = useState(() => new Date(minD.getFullYear(), minD.getMonth(), 1));
  const today = new Date(); today.setHours(0,0,0,0);

  const days = () => {
    const y = view.getFullYear(), m = view.getMonth();
    const first = (new Date(y, m, 1).getDay() + 6) % 7;
    const total = new Date(y, m+1, 0).getDate();
    const arr = [];
    for (let i = 0; i < first; i++) arr.push(null);
    for (let d = 1; d <= total; d++) arr.push(new Date(y, m, d));
    return arr;
  };

  const selDate = selected ? new Date(selected + 'T00:00:00') : null;

  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 12, color: '#4E8098', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 7 }}>{label}</div>
      <div style={{ background: 'white', borderRadius: 14, border: '1.5px solid #E8EDF3', overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg, #7D1128, #9B1B30)', padding: '11px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => setView(new Date(view.getFullYear(), view.getMonth()-1, 1))}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: 6, width: 26, height: 26, cursor: 'pointer', fontSize: 15, lineHeight: 1 }}>‹</button>
          <span style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>{MONTHS[view.getMonth()]} {view.getFullYear()}</span>
          <button onClick={() => setView(new Date(view.getFullYear(), view.getMonth()+1, 1))}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: 6, width: 26, height: 26, cursor: 'pointer', fontSize: 15, lineHeight: 1 }}>›</button>
        </div>
        <div style={{ padding: '10px 10px 12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 4 }}>
            {WEEKDAYS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#8A9BB0', padding: '3px 0' }}>{d}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
            {days().map((day, i) => {
              if (!day) return <div key={`e${i}`} />;
              const isDisabled = day < minD;
              const isSel = selDate && day.toDateString() === selDate.toDateString();
              const isToday = day.toDateString() === today.toDateString();
              return (
                <div key={i} onClick={() => !isDisabled && onChange(day.toISOString().split('T')[0])}
                  style={{
                    aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 7, fontSize: 12.5, fontWeight: isSel ? 700 : 500,
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    background: isSel ? '#7D1128' : 'transparent',
                    color: isDisabled ? '#CDD6E0' : isSel ? 'white' : '#1E2A38',
                    border: isToday && !isSel ? '1.5px solid #7D1128' : '1.5px solid transparent',
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
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
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
    toursAPI.getById(id)
      .then(res => { setTour(res.data); setLoading(false); })
      .catch(() => { setLoading(false); setError('Тур не найден'); });
  }, [id]);

  const calcPrice = () => {
    if (!tour) return 0;
    const t = TRANSPORT.find(t => t.type === form.transport_type);
    const classM = form.travel_class === 'business' ? 1.8 : 1;
    return Math.round((Number(tour.price) + (t?.add || 0) * form.guests) * classM * form.guests);
  };

  const createBooking = async () => {
    setError(''); setProcessing(true);
    try {
      const res = await bookingsAPI.create({ ...form, tour_id: tour.id });
      setBooking(res.data); setStep(4);
    } catch (err) { setError(err.response?.data?.message || 'Ошибка при создании бронирования'); }
    finally { setProcessing(false); }
  };

  const payBooking = async () => {
    if (payMethod === 'card') {
      const digits = cardNum.replace(/\s/g,'');
      if (digits.length < 16) { setError('Введите корректный номер карты (16 цифр)'); return; }
      if (!/^\d{2}\/\d{2}$/.test(cardExp)) { setError('Введите срок действия в формате ММ/ГГ'); return; }
      const [mm, yy] = cardExp.split('/');
      if (new Date(2000+Number(yy), Number(mm)-1, 1) < new Date()) { setError('Срок действия карты истёк'); return; }
      if (cardCvv.length < 3) { setError('Введите CVV-код (3 цифры)'); return; }
      if (!cardName.trim()) { setError('Введите имя держателя карты'); return; }
    }
    setError(''); setProcessing(true);
    try {
      await paymentsAPI.pay({ booking_id: booking.id, method: payMethod });
      setStep(5);
    } catch (err) { setError(err.response?.data?.message || 'Ошибка при оплате'); }
    finally { setProcessing(false); }
  };

  const s = {
    page: { maxWidth: 1100, margin: '0 auto', padding: '28px 20px' },
    stepCard: {
      background: 'white', borderRadius: 20, padding: '32px 36px',
      boxShadow: '0 6px 24px rgba(30,42,56,0.10)', maxWidth: 720, margin: '0 auto',
    },
    stepTitle: { fontFamily: "'Playfair Display', serif", fontSize: 24, color: '#1E2A38', fontWeight: 700, marginBottom: 6 },
    stepDesc: { color: '#5A6A7E', fontSize: 13.5, marginBottom: 24, lineHeight: 1.6 },
    optionCard: {
      border: '1.5px solid #E8EDF3', borderRadius: 12, padding: '14px 18px',
      cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 14,
    },
    optionActive: { borderColor: '#7D1128', background: '#FBF0F2' },
    navRow: { display: 'flex', gap: 12, marginTop: 28, justifyContent: 'space-between' },
    backBtn: {
      padding: '11px 24px', border: '1.5px solid #E8EDF3', borderRadius: 50,
      background: 'white', color: '#5A6A7E', fontFamily: 'Montserrat, sans-serif',
      fontWeight: 600, fontSize: 13.5, cursor: 'pointer', transition: 'all 0.2s',
    },
    nextBtn: {
      background: 'linear-gradient(135deg, #7D1128, #C4384F)', color: 'white',
      border: 'none', borderRadius: 50, padding: '11px 28px',
      fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 13.5, cursor: 'pointer',
      boxShadow: '0 4px 14px rgba(125,17,40,0.35)', transition: 'all 0.2s',
    },
    priceBox: {
      background: 'linear-gradient(135deg, #5C0F1A, #7D1128)',
      borderRadius: 14, padding: '18px 22px', color: 'white', marginBottom: 22,
    },
    payInput: {
      width: '100%', padding: '11px 14px', border: '1.5px solid #E8EDF3', borderRadius: 9,
      fontFamily: 'Montserrat, sans-serif', fontSize: 14, outline: 'none',
      transition: 'border-color 0.2s', background: '#FAFBFD',
    },
    cityBtn: {
      padding: '9px 14px', borderRadius: 9, border: '1.5px solid',
      fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: 12.5,
      cursor: 'pointer', transition: 'all 0.2s',
    },
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!tour) return <div style={{ textAlign:'center', padding:60 }}><div style={{ color:'#5A6A7E' }}>{error || 'Тур не найден'}</div></div>;

  const STEPS = ['Тур', 'Откуда', 'Транспорт', 'Даты', 'Оплата'];

  const StepBar = () => step > 0 && step < 5 ? (
    <div style={{ display:'flex', maxWidth:720, margin:'0 auto 24px' }}>
      {STEPS.map((l,i) => (
        <div key={i} style={{
          flex:1, textAlign:'center', padding:'9px 4px', fontSize:11.5, fontWeight:700,
          borderBottom:`3px solid ${i<step?'#4E8098':i===step?'#7D1128':'#E8EDF3'}`,
          color: i<step?'#4E8098':i===step?'#7D1128':'#8A9BB0', letterSpacing:0.3,
        }}>{i+1}. {l}</div>
      ))}
    </div>
  ) : null;

  return (
    <div style={s.page}>
      {/* Step 0 — Tour detail */}
      {step === 0 && (
        <div>
          <button onClick={() => navigate('/tours')} style={{ ...s.backBtn, marginBottom: 20, display:'inline-flex', alignItems:'center', gap:6 }}>
            ← Назад к турам
          </button>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:24, alignItems:'start' }}>
            <div>
              {/* Hero */}
              <div style={{ borderRadius:20, overflow:'hidden', height:340, position:'relative', background:'linear-gradient(135deg,#7D1128,#4E8098)', marginBottom:22 }}>
                {tour.image_url && <img src={tour.image_url} alt={tour.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => e.target.style.display='none'} />}
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(30,42,56,0.75) 0%, transparent 55%)', padding:'24px 28px', display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
                  {tour.category && <span style={{ display:'inline-block', background:'rgba(255,255,255,0.2)', color:'white', fontSize:10, fontWeight:700, padding:'3px 11px', borderRadius:50, marginBottom:8, textTransform:'uppercase', letterSpacing:1, width:'fit-content' }}>{tour.category}</span>}
                  <div style={{ fontFamily:"'Playfair Display', serif", fontSize:30, fontWeight:700, color:'white', marginBottom:5 }}>{tour.title}</div>
                  <div style={{ color:'rgba(255,255,255,0.8)', fontSize:14 }}>{tour.location}, {tour.country} &nbsp;&middot;&nbsp; {tour.duration}</div>
                </div>
              </div>
              {/* Description */}
              <div style={{ background:'white', borderRadius:16, padding:'24px 28px', boxShadow:'0 2px 12px rgba(30,42,56,0.08)', marginBottom:16 }}>
                <h2 style={{ fontFamily:"'Playfair Display', serif", color:'#1E2A38', marginBottom:14, fontSize:20 }}>Об этом туре</h2>
                <p style={{ color:'#5A6A7E', lineHeight:1.8, fontSize:14.5 }}>{tour.description || 'Описание тура не добавлено.'}</p>
              </div>
              {/* Info cards */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
                {[['Длительность', tour.duration],['Направление', tour.location],['Страна', tour.country]].map(([l,v]) => (
                  <div key={l} style={{ background:'white', borderRadius:12, padding:'16px', textAlign:'center', boxShadow:'0 2px 10px rgba(30,42,56,0.07)', borderTop:'3px solid #C4384F' }}>
                    <div style={{ fontSize:10, color:'#5A6A7E', fontWeight:700, textTransform:'uppercase', letterSpacing:0.5, marginBottom:5 }}>{l}</div>
                    <div style={{ fontWeight:700, color:'#1E2A38', fontSize:14 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Sidebar */}
            <div style={{ position:'sticky', top:80 }}>
              <div style={{ background:'linear-gradient(135deg,#5C0F1A,#7D1128)', borderRadius:20, padding:'28px', color:'white' }}>
                <div style={{ fontSize:12, opacity:0.7, marginBottom:3 }}>Стоимость тура от</div>
                <div style={{ fontFamily:"'Playfair Display', serif", fontSize:38, fontWeight:700, marginBottom:3 }}>{Number(tour.price).toLocaleString('ru')} ₽</div>
                <div style={{ fontSize:12, opacity:0.65, marginBottom:24 }}>за одного человека</div>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:20 }}>
                  <span style={{ color:'#C4384F', fontSize:14 }}>{'★'.repeat(Math.round(tour.rating||4))}</span>
                  <span style={{ fontSize:13, opacity:0.8 }}>{Number(tour.rating).toFixed(1)} / 5.0</span>
                </div>
                <button className="btn btn-lg" style={{ width:'100%', background:'linear-gradient(135deg,#C4384F,#E05070)', boxShadow:'0 6px 20px rgba(196,56,79,0.45)', border:'none', borderRadius:50, color:'white', fontWeight:700, fontSize:15, cursor:'pointer' }} onClick={() => setStep(1)}>
                  Забронировать
                </button>
                <div style={{ marginTop:14, fontSize:11.5, opacity:0.6, textAlign:'center' }}>Бесплатная отмена за 48 часов</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Steps 1–4 */}
      {step > 0 && step < 5 && (
        <div>
          <StepBar />
          {error && <div className="alert alert-error" style={{ maxWidth:720, margin:'0 auto 16px' }}>{error}</div>}

          {/* Step 1 — Origin */}
          {step === 1 && (
            <div style={s.stepCard}>
              <div style={s.stepTitle}>Откуда вы едете?</div>
              <div style={s.stepDesc}>Выберите город отправления. Это поможет рассчитать стоимость транспорта.</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:9, marginBottom:24 }}>
                {CITIES.map(city => (
                  <button key={city} onClick={() => setForm(f => ({ ...f, origin: city }))}
                    style={{ ...s.cityBtn, borderColor: form.origin===city?'#7D1128':'#E8EDF3', background: form.origin===city?'#FBF0F2':'white', color: form.origin===city?'#7D1128':'#5A6A7E' }}>
                    {city}
                  </button>
                ))}
              </div>
              <div style={{ marginBottom:20 }}>
                <div style={{ fontWeight:700, fontSize:13, color:'#1E2A38', marginBottom:10 }}>Количество гостей</div>
                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <button onClick={() => setForm(f => ({ ...f, guests: Math.max(1,f.guests-1) }))}
                    style={{ width:34, height:34, borderRadius:'50%', border:'1.5px solid #E8EDF3', background:'white', cursor:'pointer', fontSize:18, color:'#7D1128', fontWeight:700 }}>−</button>
                  <span style={{ fontWeight:700, fontSize:20, color:'#1E2A38', minWidth:24, textAlign:'center' }}>{form.guests}</span>
                  <button onClick={() => setForm(f => ({ ...f, guests: Math.min(20,f.guests+1) }))}
                    style={{ width:34, height:34, borderRadius:'50%', border:'1.5px solid #E8EDF3', background:'white', cursor:'pointer', fontSize:18, color:'#7D1128', fontWeight:700 }}>+</button>
                  <span style={{ color:'#5A6A7E', fontSize:13 }}>человек</span>
                </div>
              </div>
              <div style={s.navRow}>
                <button style={s.backBtn} onClick={() => setStep(0)}>← Назад</button>
                <button style={{ ...s.nextBtn, opacity: !form.origin ? 0.5 : 1 }} disabled={!form.origin} onClick={() => { setError(''); setStep(2); }}>Далее →</button>
              </div>
            </div>
          )}

          {/* Step 2 — Transport */}
          {step === 2 && (
            <div style={s.stepCard}>
              <div style={s.stepTitle}>Способ добраться</div>
              <div style={s.stepDesc}>Выберите вид транспорта и класс обслуживания.</div>
              <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:22 }}>
                {TRANSPORT.map(t => (
                  <div key={t.type} style={{ ...s.optionCard, ...(form.transport_type===t.type?s.optionActive:{}) }}
                    onClick={() => setForm(f => ({ ...f, transport_type: t.type }))}>
                    <div style={{ width:42, height:42, borderRadius:10, background: form.transport_type===t.type?'#7D1128':'#F3F7FA', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <span style={{ fontSize:20 }}>{t.type==='plane'?'✈':t.type==='train'?'🚂':t.type==='bus'?'🚌':'🚗'}</span>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, color:'#1E2A38', fontSize:14.5 }}>{t.label}</div>
                      <div style={{ fontSize:12, color:'#5A6A7E' }}>{t.desc}</div>
                    </div>
                    <div style={{ fontWeight:700, color: form.transport_type===t.type?'#7D1128':'#4E8098', fontSize:13.5 }}>
                      {t.add > 0 ? `+${t.add.toLocaleString('ru')} ₽` : 'Включено'}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom:22 }}>
                <div style={{ fontWeight:700, color:'#1E2A38', marginBottom:10, fontSize:13.5 }}>Класс обслуживания</div>
                <div style={{ display:'flex', gap:10 }}>
                  {[['economy','Эконом','Стандартный комфорт'],['business','Бизнес','Повышенный комфорт · ×1.8 к цене']].map(([cls,label,desc]) => (
                    <div key={cls} style={{ ...s.optionCard, flex:1, ...(form.travel_class===cls?s.optionActive:{}) }}
                      onClick={() => setForm(f => ({ ...f, travel_class: cls }))}>
                      <div>
                        <div style={{ fontWeight:700, color:'#1E2A38', fontSize:14 }}>{label}</div>
                        <div style={{ fontSize:11.5, color:'#5A6A7E' }}>{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background:'#EEF6FB', borderRadius:10, padding:'12px 16px', fontSize:13, color:'#4E8098', fontWeight:500 }}>
                Предварительная стоимость: <strong style={{ color:'#7D1128', fontSize:16 }}>{calcPrice().toLocaleString('ru')} ₽</strong>
              </div>
              <div style={s.navRow}>
                <button style={s.backBtn} onClick={() => { setError(''); setStep(1); }}>← Назад</button>
                <button style={s.nextBtn} onClick={() => { setError(''); setStep(3); }}>Далее →</button>
              </div>
            </div>
          )}

          {/* Step 3 — Calendar */}
          {step === 3 && (
            <div style={s.stepCard}>
              <div style={s.stepTitle}>Выберите даты</div>
              <div style={s.stepDesc}>Даты прошлого недоступны. Дата отъезда должна быть позже даты прибытия.</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginBottom:20 }}>
                <Calendar label="Дата прибытия" selected={form.arrival_date}
                  onChange={d => { setError(''); setForm(f => ({ ...f, arrival_date: d, departure_date: '' })); }}
                  minDate={new Date().toISOString().split('T')[0]} />
                <Calendar label="Дата отъезда" selected={form.departure_date}
                  onChange={d => {
                    if (form.arrival_date && d <= form.arrival_date) { setError('Дата отъезда должна быть позже даты прибытия'); return; }
                    setError(''); setForm(f => ({ ...f, departure_date: d }));
                  }}
                  minDate={form.arrival_date || new Date().toISOString().split('T')[0]} />
              </div>
              {form.arrival_date && form.departure_date && (
                <div style={{ background:'#EEF6FB', borderRadius:12, padding:'14px 18px', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:10 }}>
                  <div><div style={{ fontSize:10, color:'#5A6A7E', fontWeight:700, textTransform:'uppercase' }}>Прибытие</div><div style={{ fontWeight:700, color:'#1E2A38' }}>{form.arrival_date}</div></div>
                  <div style={{ color:'#7D1128', fontWeight:700, fontSize:18 }}>→</div>
                  <div><div style={{ fontSize:10, color:'#5A6A7E', fontWeight:700, textTransform:'uppercase' }}>Отъезд</div><div style={{ fontWeight:700, color:'#1E2A38' }}>{form.departure_date}</div></div>
                  <div><div style={{ fontSize:10, color:'#5A6A7E', fontWeight:700, textTransform:'uppercase' }}>Ночей</div><div style={{ fontWeight:700, color:'#7D1128', fontSize:18 }}>{Math.ceil((new Date(form.departure_date)-new Date(form.arrival_date))/(86400000))}</div></div>
                  <div><div style={{ fontSize:10, color:'#5A6A7E', fontWeight:700, textTransform:'uppercase' }}>Итого</div><div style={{ fontWeight:700, color:'#7D1128', fontSize:16 }}>{calcPrice().toLocaleString('ru')} ₽</div></div>
                </div>
              )}
              <div style={s.navRow}>
                <button style={s.backBtn} onClick={() => { setError(''); setStep(2); }}>← Назад</button>
                <button style={{ ...s.nextBtn, opacity:(!form.arrival_date||!form.departure_date||processing)?0.5:1 }}
                  disabled={!form.arrival_date||!form.departure_date||processing} onClick={createBooking}>
                  {processing ? 'Создание...' : 'К оплате →'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4 — Payment */}
          {step === 4 && booking && (
            <div style={s.stepCard}>
              <div style={s.stepTitle}>Оплата бронирования</div>
              <div style={s.priceBox}>
                <div style={{ fontSize:12, opacity:0.75, marginBottom:3 }}>Итого к оплате</div>
                <div style={{ fontFamily:"'Playfair Display', serif", fontSize:36, fontWeight:700 }}>{Number(booking.total_price).toLocaleString('ru')} ₽</div>
                <div style={{ fontSize:12, opacity:0.65, marginTop:8, display:'flex', gap:16, flexWrap:'wrap' }}>
                  <span>{tour.title}</span>
                  <span>{form.guests} чел.</span>
                  <span>{form.arrival_date} — {form.departure_date}</span>
                </div>
              </div>
              <div style={{ marginBottom:20 }}>
                <div style={{ fontWeight:700, fontSize:13, color:'#1E2A38', marginBottom:10 }}>Способ оплаты</div>
                <div style={{ display:'flex', gap:9, marginBottom:20 }}>
                  {[['card','Банковская карта'],['sbp','СБП'],['cash','При заезде']].map(([m,l]) => (
                    <button key={m} onClick={() => { setPayMethod(m); setError(''); }}
                      style={{ flex:1, padding:'9px 8px', border:`1.5px solid ${payMethod===m?'#7D1128':'#E8EDF3'}`,
                        borderRadius:9, background:payMethod===m?'#FBF0F2':'white', color:payMethod===m?'#7D1128':'#5A6A7E',
                        fontFamily:'Montserrat,sans-serif', fontWeight:600, fontSize:12.5, cursor:'pointer', transition:'all 0.2s' }}>{l}</button>
                  ))}
                </div>
                {payMethod === 'card' && (
                  <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    <div>
                      <label style={{ fontSize:11, fontWeight:700, color:'#4E8098', display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:0.5 }}>Номер карты</label>
                      <input style={s.payInput} placeholder="0000 0000 0000 0000" maxLength={19}
                        value={cardNum} onChange={e => { const v=e.target.value.replace(/\D/g,'').slice(0,16); setCardNum(v.replace(/(.{4})/g,'$1 ').trim()); }} />
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      <div>
                        <label style={{ fontSize:11, fontWeight:700, color:'#4E8098', display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:0.5 }}>Срок действия</label>
                        <input style={s.payInput} placeholder="ММ/ГГ" maxLength={5}
                          value={cardExp} onChange={e => { let v=e.target.value.replace(/\D/g,''); if(v.length>2)v=v.slice(0,2)+'/'+v.slice(2,4); setCardExp(v); }} />
                      </div>
                      <div>
                        <label style={{ fontSize:11, fontWeight:700, color:'#4E8098', display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:0.5 }}>CVV</label>
                        <input style={s.payInput} placeholder="•••" maxLength={3} type="password"
                          value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g,'').slice(0,3))} />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize:11, fontWeight:700, color:'#4E8098', display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:0.5 }}>Имя держателя</label>
                      <input style={s.payInput} placeholder="IVAN IVANOV"
                        value={cardName} onChange={e => setCardName(e.target.value.toUpperCase())} />
                    </div>
                  </div>
                )}
                {payMethod === 'sbp' && (
                  <div style={{ background:'#EEF6FB', borderRadius:12, padding:20, textAlign:'center' }}>
                    <div style={{ fontWeight:700, color:'#4E8098', marginBottom:4 }}>Оплата через СБП</div>
                    <div style={{ fontSize:13, color:'#5A6A7E' }}>Подтвердите платёж в приложении вашего банка</div>
                  </div>
                )}
                {payMethod === 'cash' && (
                  <div style={{ background:'#EEF6FB', borderRadius:12, padding:20, textAlign:'center' }}>
                    <div style={{ fontWeight:700, color:'#4E8098', marginBottom:4 }}>Оплата при заезде</div>
                    <div style={{ fontSize:13, color:'#5A6A7E' }}>Оплата наличными или картой на месте</div>
                  </div>
                )}
              </div>
              <button className="btn btn-primary btn-lg" style={{ width:'100%', opacity:processing?0.7:1 }} disabled={processing} onClick={payBooking}>
                {processing ? 'Обработка...' : `Оплатить ${Number(booking.total_price).toLocaleString('ru')} ₽`}
              </button>
              <div style={{ textAlign:'center', marginTop:10, fontSize:12, color:'#5A6A7E' }}>Безопасная оплата. Данные зашифрованы.</div>
            </div>
          )}
        </div>
      )}

      {/* Step 5 — Success */}
      {step === 5 && (
        <div style={{ ...s.stepCard, textAlign:'center', maxWidth:560 }}>
          <div style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,#7D1128,#C4384F)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', boxShadow:'0 8px 24px rgba(125,17,40,0.3)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div style={{ fontFamily:"'Playfair Display', serif", fontSize:26, color:'#1E2A38', fontWeight:700, marginBottom:10 }}>Бронирование подтверждено!</div>
          <div style={{ color:'#5A6A7E', fontSize:14.5, marginBottom:24, lineHeight:1.7 }}>
            Ваше путешествие в <strong>{tour.title}</strong> успешно забронировано.<br />Детали отправлены на ваш email.
          </div>
          {booking && (
            <div style={{ background:'#F3F7FA', borderRadius:14, padding:'16px 20px', marginBottom:24, textAlign:'left' }}>
              {[['Тур', tour.title],['Прибытие', form.arrival_date],['Отъезд', form.departure_date],['Гостей', form.guests],['Оплачено', `${Number(booking.total_price).toLocaleString('ru')} ₽`]].map(([l,v]) => (
                <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid #E8EDF3', fontSize:13.5 }}>
                  <span style={{ color:'#5A6A7E' }}>{l}</span>
                  <span style={{ fontWeight:700, color:'#1E2A38' }}>{v}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ display:'flex', gap:12 }}>
            <button className="btn btn-ghost" style={{ flex:1 }} onClick={() => navigate('/profile')}>Мои бронирования</button>
            <button className="btn btn-primary" style={{ flex:1 }} onClick={() => navigate('/tours')}>Другие туры</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TourDetailPage;
