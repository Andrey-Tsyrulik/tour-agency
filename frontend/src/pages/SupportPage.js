import React, { useState } from 'react';

const FAQ = [
  { q: 'Как отменить бронирование?', a: 'Перейдите в личный кабинет в раздел "Бронирования". Бронирования со статусом "Ожидает" можно отменить бесплатно за 48 часов до начала тура.' },
  { q: 'Какие способы оплаты доступны?', a: 'Принимаем банковские карты (Visa, MasterCard, МИР), оплату через СБП (Систему Быстрых Платежей), а также наличными или картой при заезде.' },
  { q: 'Можно ли изменить даты поездки?', a: 'Изменение дат возможно при наличии свободных мест. Обратитесь к менеджеру не позднее чем за 7 дней до начала тура.' },
  { q: 'Включено ли питание в стоимость?', a: 'Условия питания указаны в описании каждого тура. Как правило, базовый пакет включает завтрак; условия могут варьироваться.' },
  { q: 'Нужна ли виза?', a: 'Визовые требования зависят от страны назначения и гражданства. Актуальную информацию уточняйте у наших менеджеров или на сайте консульства.' },
  { q: 'Что входит в стоимость тура?', a: 'В стоимость включены: проживание в отеле заявленной категории, трансфер из/в аэропорт, медицинская страховка и сопровождение гида.' },
  { q: 'Как связаться с менеджером?', a: 'Вы можете написать нам через форму ниже, позвонить по телефону горячей линии или обратиться в чат Telegram — мы отвечаем в течение 2 часов.' },
  { q: 'Есть ли скидки для групп?', a: 'Да, при бронировании от 4 человек действует скидка 5%, от 8 человек — 10%. Свяжитесь с менеджером для оформления групповой заявки.' },
];

const CONTACTS = [
  { icon: '📞', label: 'Телефон', value: '+7 (800) 555-35-35', sub: 'Бесплатно, ежедневно 8:00–22:00' },
  { icon: '✉', label: 'Email', value: 'support@touragency.ru', sub: 'Ответ в течение 2 часов' },
  { icon: '✈', label: 'Telegram', value: '@TourAgencyBot', sub: 'Онлайн-поддержка 24/7' },
];

const SupportPage = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [form, setForm] = useState({ name:'', email:'', topic:'', message:'' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!form.message.trim()) { setError('Введите сообщение'); return; }
    setSent(true); setError('');
  };

  const s = {
    hero: {
      background:'linear-gradient(135deg,#5C0F1A 0%,#7D1128 45%,#3A6A8A 100%)',
      padding:'52px 20px 90px', textAlign:'center', position:'relative', overflow:'hidden',
    },
    heroTitle: { fontFamily:"'Playfair Display', serif", fontSize:36, color:'white', fontWeight:700, marginBottom:10 },
    wave: {
      position:'absolute', bottom:0, left:0, right:0, height:65,
      background:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 65'%3E%3Cpath fill='%23F3F7FA' d='M0,32 C360,65 720,0 1080,32 C1260,48 1380,22 1440,32 L1440,65 L0,65 Z'/%3E%3C/svg%3E\")",
      backgroundSize:'cover',
    },
    card: { background:'white', borderRadius:18, padding:'26px 28px', boxShadow:'0 4px 18px rgba(30,42,56,0.09)', marginBottom:20 },
    contactCard: {
      display:'flex', alignItems:'center', gap:16,
      background:'white', borderRadius:14, padding:'18px 22px',
      boxShadow:'0 3px 14px rgba(30,42,56,0.08)', flex:1, minWidth:200,
    },
    iconBox: {
      width:46, height:46, borderRadius:10, flexShrink:0,
      background:'linear-gradient(135deg,#7D1128,#C4384F)',
      display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, color:'white',
    },
    faqQ: {
      width:'100%', background:'none', border:'none', padding:'15px 0', textAlign:'left',
      fontFamily:'Montserrat,sans-serif', fontWeight:600, fontSize:14.5, color:'#1E2A38',
      cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center', gap:12,
    },
    input: {
      width:'100%', padding:'11px 14px', border:'1.5px solid #E8EDF3', borderRadius:9,
      fontFamily:'Montserrat,sans-serif', fontSize:14, outline:'none', background:'#FAFBFD',
      transition:'border-color 0.2s',
    },
    label: { fontSize:11, fontWeight:700, color:'#4E8098', display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:0.5 },
  };

  return (
    <div>
      <div style={s.hero}>
        <div style={{ color:'rgba(255,255,255,0.65)', fontSize:11, letterSpacing:3, textTransform:'uppercase', marginBottom:12, fontWeight:600 }}>Tour Agency — Support</div>
        <div style={s.heroTitle}>Служба поддержки</div>
        <div style={{ color:'rgba(255,255,255,0.78)', fontSize:15 }}>Мы готовы помочь с любым вопросом</div>
        <div style={s.wave} />
      </div>

      <div style={{ maxWidth:1050, margin:'0 auto', padding:'30px 20px' }}>
        {/* Contacts */}
        <div style={{ display:'flex', gap:14, marginBottom:30, flexWrap:'wrap' }}>
          {CONTACTS.map(c => (
            <div key={c.label} style={s.contactCard}>
              <div style={s.iconBox}>{c.icon}</div>
              <div>
                <div style={{ fontWeight:700, color:'#1E2A38', fontSize:14.5 }}>{c.value}</div>
                <div style={{ fontSize:12, color:'#5A6A7E', marginTop:2 }}>{c.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, alignItems:'start' }}>
          {/* FAQ */}
          <div>
            <h2 style={{ fontFamily:"'Playfair Display', serif", color:'#1E2A38', marginBottom:18, fontSize:22 }}>Часто задаваемые вопросы</h2>
            <div style={s.card}>
              {FAQ.map((item,i) => (
                <div key={i} style={{ borderBottom: i<FAQ.length-1?'1px solid #F3F7FA':'none' }}>
                  <button style={s.faqQ} onClick={() => setOpenFaq(openFaq===i?null:i)}>
                    <span>{item.q}</span>
                    <span style={{ color:'#7D1128', fontSize:20, fontWeight:400, flexShrink:0, transition:'transform 0.2s', transform:openFaq===i?'rotate(45deg)':'none', display:'inline-block' }}>+</span>
                  </button>
                  {openFaq===i && (
                    <div style={{ paddingBottom:14, color:'#5A6A7E', fontSize:13.5, lineHeight:1.75 }}>{item.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div>
            <h2 style={{ fontFamily:"'Playfair Display', serif", color:'#1E2A38', marginBottom:18, fontSize:22 }}>Написать нам</h2>
            {sent ? (
              <div style={{ ...s.card, textAlign:'center', padding:'40px 28px' }}>
                <div style={{ width:60, height:60, borderRadius:'50%', background:'linear-gradient(135deg,#7D1128,#C4384F)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div style={{ fontFamily:"'Playfair Display', serif", fontSize:21, color:'#1E2A38', fontWeight:700, marginBottom:8 }}>Сообщение отправлено</div>
                <div style={{ color:'#5A6A7E', fontSize:13.5, marginBottom:20, lineHeight:1.6 }}>Мы ответим в течение 2 часов в рабочее время.</div>
                <button className="btn btn-ghost" onClick={() => { setSent(false); setForm({name:'',email:'',topic:'',message:''}); }}>Написать ещё</button>
              </div>
            ) : (
              <form style={s.card} onSubmit={submit}>
                {error && <div className="alert alert-error">{error}</div>}
                {[['name','Имя','text','Иван Иванов'],['email','Email','email','ivan@example.com'],['topic','Тема','text','Вопрос по бронированию']].map(([field,label,type,ph]) => (
                  <div key={field} style={{ marginBottom:14 }}>
                    <label style={s.label}>{label}</label>
                    <input type={type} style={s.input} placeholder={ph}
                      value={form[field]} onChange={e => setForm(f => ({ ...f,[field]:e.target.value }))} required />
                  </div>
                ))}
                <div style={{ marginBottom:18 }}>
                  <label style={s.label}>Сообщение</label>
                  <textarea style={{ ...s.input, height:115, resize:'vertical' }}
                    placeholder="Опишите ваш вопрос подробно..."
                    value={form.message} onChange={e => setForm(f => ({ ...f, message:e.target.value }))} required />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width:'100%' }}>Отправить сообщение</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
