import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../api';
import Globe3D from '../components/Globe3D';

/* ── Фоновые облака ──────────────────────────────────────── */
const Clouds = () => (
  <svg viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg"
    style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }}>
    <defs>
      <filter id="blur1"><feGaussianBlur stdDeviation="6" /></filter>
      <filter id="blur2"><feGaussianBlur stdDeviation="4" /></filter>
      <filter id="blur3"><feGaussianBlur stdDeviation="10" /></filter>
    </defs>
    <g fill="white" fillOpacity="0.28" filter="url(#blur3)">
      <ellipse cx="160"  cy="90"  rx="130" ry="48" />
      <ellipse cx="95"   cy="78"  rx="88"  ry="36" />
      <ellipse cx="230"  cy="74"  rx="96"  ry="40" />
      <ellipse cx="1110" cy="120" rx="145" ry="52" />
      <ellipse cx="1055" cy="108" rx="98"  ry="40" />
      <ellipse cx="1215" cy="106" rx="105" ry="42" />
      <ellipse cx="608"  cy="52"  rx="115" ry="42" />
      <ellipse cx="555"  cy="44"  rx="78"  ry="32" />
      <ellipse cx="688"  cy="50"  rx="84"  ry="34" />
      <ellipse cx="355"  cy="182" rx="105" ry="40" />
      <ellipse cx="910"  cy="800" rx="135" ry="50" />
      <ellipse cx="855"  cy="788" rx="92"  ry="38" />
      <ellipse cx="205"  cy="722" rx="115" ry="44" />
      <ellipse cx="1310" cy="752" rx="125" ry="46" />
    </g>
    <g fill="white" fillOpacity="0.20" filter="url(#blur2)">
      <ellipse cx="162"  cy="88"  rx="108" ry="38" />
      <ellipse cx="98"   cy="76"  rx="68"  ry="28" />
      <ellipse cx="232"  cy="72"  rx="76"  ry="30" />
      <ellipse cx="1108" cy="118" rx="118" ry="40" />
      <ellipse cx="608"  cy="50"  rx="92"  ry="32" />
      <ellipse cx="358"  cy="180" rx="82"  ry="30" />
      <ellipse cx="768"  cy="162" rx="98"  ry="36" />
      <ellipse cx="724"  cy="152" rx="65"  ry="26" />
      <ellipse cx="828"  cy="158" rx="72"  ry="28" />
      <ellipse cx="488"  cy="822" rx="104" ry="37" />
      <ellipse cx="1208" cy="242" rx="88"  ry="32" />
      <ellipse cx="82"   cy="402" rx="72"  ry="27" />
      <ellipse cx="1388" cy="502" rx="78"  ry="30" />
    </g>
    <g fill="white" fillOpacity="0.42" filter="url(#blur1)">
      <ellipse cx="158"  cy="86"  rx="80"  ry="26" />
      <ellipse cx="92"   cy="74"  rx="52"  ry="18" />
      <ellipse cx="234"  cy="70"  rx="58"  ry="22" />
      <ellipse cx="1112" cy="116" rx="92"  ry="30" />
      <ellipse cx="1062" cy="108" rx="62"  ry="22" />
      <ellipse cx="1218" cy="104" rx="66"  ry="24" />
      <ellipse cx="612"  cy="48"  rx="70"  ry="24" />
      <ellipse cx="558"  cy="42"  rx="46"  ry="18" />
      <ellipse cx="686"  cy="46"  rx="52"  ry="20" />
      <ellipse cx="362"  cy="178" rx="62"  ry="22" />
      <ellipse cx="772"  cy="160" rx="74"  ry="26" />
      <ellipse cx="730"  cy="150" rx="48"  ry="18" />
      <ellipse cx="492"  cy="820" rx="76"  ry="24" />
      <ellipse cx="452"  cy="810" rx="50"  ry="18" />
      <ellipse cx="912"  cy="800" rx="84"  ry="28" />
      <ellipse cx="862"  cy="790" rx="56"  ry="20" />
      <ellipse cx="212"  cy="720" rx="80"  ry="26" />
      <ellipse cx="1315" cy="750" rx="86"  ry="30" />
    </g>
  </svg>
);

const PlaneLogo = () => (
  <svg width="38" height="38" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="20" fill="rgba(255,255,255,0.18)" />
    <path d="M32 18.5V16L21 10.5V4.5C21 3.4 20.1 2.5 19 2.5C17.9 2.5 17 3.4 17 4.5V10.5L6 16V18.5L17 15V22.5L14.5 24V26L19 24.5L23.5 26V24L21 22.5V15L32 18.5Z"
      fill="#F4A7B5" />
  </svg>
);

const AuthPage = () => {
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = (e) => {
    setError('');
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (tab === 'register') {
      if (!form.name.trim()) { setError('Введите имя'); return; }
      if (form.name.trim().length < 2) { setError('Имя должно содержать не менее 2 символов'); return; }
      if (!form.email.trim()) { setError('Введите email'); return; }
      if (!form.password) { setError('Введите пароль'); return; }
      if (form.password.length < 6) { setError('Пароль должен содержать не менее 6 символов'); return; }
    } else {
      if (!form.email.trim()) { setError('Введите email'); return; }
      if (!form.password) { setError('Введите пароль'); return; }
    }
    setLoading(true);
    try {
      const res = tab === 'login'
        ? await authAPI.login({ email: form.email.trim(), password: form.password.toString() })
        : await authAPI.register({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      login(res.data.token, res.data.user);
      navigate('/tours');
    } catch (err) {
      setError(err.response?.data?.message || 'Произошла ошибка. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  const s = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #C8E8F8 0%, #A8D4F0 25%, #85BFEA 55%, #6AAEE0 80%, #4E96D4 100%)',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      position: 'relative',
      overflow: 'hidden',
    },
    leftPanel: {
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '60px 40px', position: 'relative', zIndex: 2,
    },
    rightPanel: {
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '40px', zIndex: 2, position: 'relative',
    },
    card: {
      background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)',
      borderRadius: 22, width: '100%', maxWidth: 420,
      boxShadow: '0 20px 60px rgba(30,80,140,0.22), 0 4px 16px rgba(0,0,0,0.08)',
      overflow: 'hidden', border: '1px solid rgba(255,255,255,0.7)',
    },
    cardTop: {
      background: 'linear-gradient(135deg, #7D1128 0%, #9B1B30 100%)',
      padding: '26px 32px 22px', textAlign: 'center',
    },
    brand: {
      fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: 'white',
      letterSpacing: 0.5, marginTop: 12,
    },
    brandSub: { color: 'rgba(255,255,255,0.65)', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginTop: 3 },
    tabRow: {
      display: 'flex', background: '#F0F7FC', margin: '0 24px', borderRadius: 10,
      padding: 4, marginTop: 18, marginBottom: 2,
    },
    tab: {
      flex: 1, padding: '9px', border: 'none', background: 'transparent',
      borderRadius: 7, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif',
      fontWeight: 600, fontSize: 13.5, color: '#5A6A7E', transition: 'all 0.25s',
    },
    tabActive: { background: 'white', color: '#7D1128', boxShadow: '0 2px 8px rgba(0,0,0,0.09)' },
    form: { padding: '18px 24px 26px', display: 'flex', flexDirection: 'column', gap: 14 },
    fieldWrap: { display: 'flex', flexDirection: 'column', gap: 5 },
    label: { fontSize: 11, fontWeight: 700, color: '#3A6A8A', textTransform: 'uppercase', letterSpacing: 0.6 },
    input: {
      padding: '11px 14px', border: '1.5px solid #D4E8F5', borderRadius: 8,
      fontFamily: 'Montserrat, sans-serif', fontSize: 14, color: '#1E2A38',
      outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s', width: '100%',
      background: 'rgba(255,255,255,0.9)',
    },
    btn: {
      background: 'linear-gradient(135deg, #7D1128, #C4384F)',
      color: 'white', border: 'none', borderRadius: 50, padding: '13px',
      fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 14.5,
      cursor: 'pointer', transition: 'all 0.25s', boxShadow: '0 4px 16px rgba(125,17,40,0.4)',
    },
    errorBox: {
      background: '#FBF0F2', color: '#7D1128', padding: '10px 14px',
      borderRadius: 8, fontSize: 13, fontWeight: 500, borderLeft: '3px solid #C4384F', lineHeight: 1.5,
    },
    switchText: { textAlign: 'center', fontSize: 12.5, color: '#5A6A7E' },
    switchLink: { color: '#7D1128', cursor: 'pointer', fontWeight: 700, marginLeft: 4 },
    tagline: {
      color: 'rgba(255,255,255,0.96)', fontSize: 15, textAlign: 'center',
      marginTop: 28, lineHeight: 1.85, maxWidth: 310,
      textShadow: '0 2px 8px rgba(20,60,120,0.4)',
      fontWeight: 500,
    },
    dots: { display: 'flex', gap: 8, marginTop: 22, justifyContent: 'center' },
    dot: { height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.45)', transition: 'all 0.3s' },
  };

  return (
    <>
      <style>{`
        @keyframes cloudDrift {
          0%   { transform: translateX(0px); }
          100% { transform: translateX(55px); }
        }
        .auth-cloud-drift { animation: cloudDrift 45s linear infinite alternate; }
        .auth-input:focus {
          border-color: #6B9EB8 !important;
          box-shadow: 0 0 0 3px rgba(107,158,184,0.18) !important;
          background: white !important;
        }
        @media (max-width: 768px) {
          .auth-grid { grid-template-columns: 1fr !important; }
          .auth-left  { display: none !important; }
        }
      `}</style>

      <div style={s.page} className="auth-grid">
        {/* Дрейфующие облака */}
        <div className="auth-cloud-drift"
          style={{ position:'absolute', inset:0, zIndex:1, pointerEvents:'none' }}>
          <Clouds />
        </div>

        {/* Левая панель — 3D Земля */}
        <div style={s.leftPanel} className="auth-left">
          <Globe3D size={360} />
          <div style={s.tagline}>
            Откройте мир путешествий.<br />
            Мальдивы, Греция, Таиланд<br />
            и сотни других направлений.
          </div>
          <div style={s.dots}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                ...s.dot,
                width: i === 0 ? 24 : 8,
                background: i === 0 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
              }} />
            ))}
          </div>
        </div>

        {/* Правая панель — форма */}
        <div style={s.rightPanel}>
          <div style={s.card}>
            <div style={s.cardTop}>
              <PlaneLogo />
              <div style={s.brand}>Tour Agency</div>
              <div style={s.brandSub}>International Travel</div>
            </div>

            <div style={{ padding: '16px 24px 0' }}>
              <div style={s.tabRow}>
                {[['login','Войти'],['register','Регистрация']].map(([key,label]) => (
                  <button key={key}
                    style={{ ...s.tab, ...(tab===key ? s.tabActive : {}) }}
                    onClick={() => { setTab(key); setError(''); setForm({ name:'', email:'', password:'' }); }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <form style={s.form} onSubmit={submit}>
              {error && <div style={s.errorBox}>{error}</div>}

              {tab === 'register' && (
                <div style={s.fieldWrap}>
                  <label style={s.label}>Полное имя</label>
                  <input className="auth-input" style={s.input} name="name" value={form.name}
                    onChange={handle} placeholder="Иван Иванов" autoComplete="name" />
                </div>
              )}

              <div style={s.fieldWrap}>
                <label style={s.label}>Электронная почта</label>
                <input className="auth-input" style={s.input} name="email" type="email"
                  value={form.email} onChange={handle} placeholder="example@mail.com"
                  autoComplete="email" />
              </div>

              <div style={s.fieldWrap}>
                <label style={s.label}>Пароль</label>
                <input className="auth-input" style={s.input} name="password" type="password"
                  value={form.password} onChange={handle}
                  placeholder={tab === 'register' ? 'Минимум 6 символов' : 'Ваш пароль'}
                  autoComplete={tab === 'login' ? 'current-password' : 'new-password'} />
              </div>

              {tab === 'register' && (
                <div style={{ background: '#EEF6FB', borderRadius: 8, padding: '9px 13px', fontSize: 12, color: '#3A6A8A', lineHeight: 1.5 }}>
                  Аккаунт создаётся с ролью "Пользователь". Роль агента назначает администратор.
                </div>
              )}

              <button type="submit" style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
                {loading ? 'Загрузка...' : tab === 'login' ? 'Войти в систему' : 'Создать аккаунт'}
              </button>

              <div style={s.switchText}>
                {tab === 'login' ? 'Нет аккаунта?' : 'Уже зарегистрированы?'}
                <span style={s.switchLink}
                  onClick={() => { setTab(tab==='login'?'register':'login'); setError(''); setForm({name:'',email:'',password:''}); }}>
                  {tab === 'login' ? 'Зарегистрироваться' : 'Войти'}
                </span>
              </div>

              {tab === 'login' && (
                <div style={{ background: '#F0F7FC', borderRadius: 8, padding: '9px 13px', fontSize: 11.5, color: '#5A6A7E', textAlign: 'center', lineHeight: 1.6 }}>
                  Администратор: admin@touragency.com / Admin@2024
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthPage;
