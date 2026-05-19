import React, { useState } from 'react';

const FAQ = [
  { q: 'Как отменить бронирование?', a: 'Вы можете отменить бронирование в личном кабинете в разделе "Бронирования". Отмена бесплатна за 48 часов до начала тура.' },
  { q: 'Какие способы оплаты доступны?', a: 'Мы принимаем банковские карты (Visa, MasterCard, МИР), оплату через СБП (Систему Быстрых Платежей), а также наличными при заезде.' },
  { q: 'Можно ли изменить даты поездки?', a: 'Изменение дат возможно при наличии мест. Свяжитесь с нашим менеджером за 7 дней до начала тура.' },
  { q: 'Включено ли питание в стоимость тура?', a: 'Условия питания указаны в описании каждого тура. Обычно базовая стоимость включает завтрак, но это может варьироваться.' },
  { q: 'Нужна ли виза для путешествия?', a: 'Визовые требования зависят от страны назначения. Актуальную информацию уточняйте у наших менеджеров или на официальном сайте консульства.' },
  { q: 'Что входит в цену тура?', a: 'Цена включает проживание в отеле указанной категории, трансфер из аэропорта, медицинскую страховку и сопровождение гида.' },
];

const SupportPage = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', topic: '', message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.message.trim()) { setError('Введите сообщение'); return; }
    setSent(true); setError('');
  };

  const s = {
    hero: {
      background: 'linear-gradient(135deg, #0a3d62 0%, #0097b2 100%)',
      padding: '50px 20px 90px', textAlign: 'center', position: 'relative', overflow: 'hidden',
    },
    heroTitle: { fontFamily: "'Playfair Display', serif", fontSize: 36, color: 'white', fontWeight: 700, marginBottom: 12 },
    wave: {
      position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
      background: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 60'%3E%3Cpath fill='%23e8f4fd' d='M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,60 L0,60 Z'/%3E%3C/svg%3E\")",
      backgroundSize: 'cover',
    },
    card: { background: 'white', borderRadius: 20, padding: 28, boxShadow: '0 4px 20px rgba(10,61,98,0.1)', marginBottom: 24 },
    faqItem: { borderBottom: '1px solid #f1f5f9' },
    faqQ: {
      width: '100%', background: 'none', border: 'none', padding: '16px 0',
      fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: 15,
      color: '#0a3d62', cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', textAlign: 'left',
    },
    input: {
      width: '100%', padding: '13px 16px', border: '2px solid #e2e8f0', borderRadius: 10,
      fontFamily: 'Montserrat, sans-serif', fontSize: 14, outline: 'none', transition: 'border-color 0.3s',
    },
    label: { fontSize: 12, fontWeight: 600, color: '#0a3d62', display: 'block', marginBottom: 6 },
    contactCard: {
      display: 'flex', alignItems: 'center', gap: 16,
      background: 'white', borderRadius: 16, padding: 20,
      boxShadow: '0 4px 16px rgba(10,61,98,0.1)', flex: 1,
    },
    icon: {
      width: 52, height: 52, borderRadius: '50%',
      background: 'linear-gradient(135deg, #0097b2, #48cae4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0,
    },
  };

  const contacts = [
    { icon: '📞', label: 'Телефон', value: '+7 (800) 555-35-35', sub: 'Бесплатно, ежедневно 8:00–22:00' },
    { icon: '📧', label: 'Email', value: 'support@oceantravel.ru', sub: 'Ответ в течение 2 часов' },
    { icon: '💬', label: 'Telegram', value: '@OceanTravelBot', sub: 'Онлайн-чат 24/7' },
  ];

  return (
    <div>
      <div style={s.hero}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🆘</div>
        <div style={s.heroTitle}>Поддержка клиентов</div>
        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16 }}>Мы всегда готовы помочь с любым вопросом</div>
        <div style={s.wave} />
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 20px' }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
          {contacts.map(c => (
            <div key={c.label} style={s.contactCard}>
              <div style={s.icon}>{c.icon}</div>
              <div>
                <div style={{ fontWeight: 700, color: '#0a3d62', fontSize: 15 }}>{c.value}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{c.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: '#0a3d62', marginBottom: 20, fontSize: 24 }}>❓ Часто задаваемые вопросы</h2>
            <div style={s.card}>
              {FAQ.map((item, i) => (
                <div key={i} style={s.faqItem}>
                  <button style={s.faqQ} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span>{item.q}</span>
                    <span style={{ color: '#0097b2', fontSize: 20, transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>+</span>
                  </button>
                  {openFaq === i && (
                    <div style={{ padding: '0 0 16px', color: '#475569', fontSize: 14, lineHeight: 1.7 }}>{item.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: '#0a3d62', marginBottom: 20, fontSize: 24 }}>✉️ Написать нам</h2>
            {sent ? (
              <div style={{ ...s.card, textAlign: 'center', padding: 40 }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#0a3d62', fontWeight: 700, marginBottom: 8 }}>Сообщение отправлено!</div>
                <div style={{ color: '#64748b', marginBottom: 20 }}>Мы ответим в течение 2 часов в рабочее время.</div>
                <button className="btn btn-outline" onClick={() => { setSent(false); setForm({ name: '', email: '', topic: '', message: '' }); }}>Написать ещё</button>
              </div>
            ) : (
              <form style={s.card} onSubmit={handleSubmit}>
                {error && <div className="alert alert-error">{error}</div>}
                {[['name','Имя','text','Иван Иванов'],['email','Email','email','ivan@example.com'],['topic','Тема','text','Вопрос по бронированию']].map(([field, label, type, ph]) => (
                  <div key={field} style={{ marginBottom: 16 }}>
                    <label style={s.label}>{label}</label>
                    <input type={type} style={s.input} placeholder={ph}
                      value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} required />
                  </div>
                ))}
                <div style={{ marginBottom: 20 }}>
                  <label style={s.label}>Сообщение *</label>
                  <textarea style={{ ...s.input, height: 120, resize: 'vertical' }}
                    placeholder="Опишите ваш вопрос подробно..."
                    value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>📨 Отправить сообщение</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
