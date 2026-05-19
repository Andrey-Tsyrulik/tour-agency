import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../api';

const Globe = () => (
  <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
    <defs>
      <radialGradient id="globeGrad" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#7AADD4" stopOpacity="0.9" />
        <stop offset="40%" stopColor="#4E8098" stopOpacity="0.85" />
        <stop offset="75%" stopColor="#3A6A8A" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#1E3A4F" stopOpacity="0.95" />
      </radialGradient>
      <radialGradient id="shineGrad" cx="30%" cy="25%" r="50%">
        <stop offset="0%" stopColor="white" stopOpacity="0.25" />
        <stop offset="100%" stopColor="white" stopOpacity="0" />
      </radialGradient>
      <clipPath id="globeClip">
        <circle cx="200" cy="200" r="175" />
      </clipPath>
    </defs>
    {/* Ocean base */}
    <circle cx="200" cy="200" r="175" fill="url(#globeGrad)" />
    {/* Continents */}
    <g clipPath="url(#globeClip)" fill="#9B1B30" fillOpacity="0.55">
      <ellipse cx="155" cy="150" rx="55" ry="38" transform="rotate(-15 155 150)" />
      <ellipse cx="148" cy="185" rx="30" ry="42" transform="rotate(5 148 185)" />
      <ellipse cx="255" cy="130" rx="45" ry="28" transform="rotate(10 255 130)" />
      <ellipse cx="270" cy="155" rx="25" ry="18" transform="rotate(-5 270 155)" />
      <ellipse cx="240" cy="230" rx="22" ry="35" transform="rotate(20 240 230)" />
      <ellipse cx="175" cy="270" rx="18" ry="14" transform="rotate(-10 175 270)" />
      <ellipse cx="310" cy="220" rx="28" ry="16" transform="rotate(15 310 220)" />
      <ellipse cx="120" cy="240" rx="20" ry="12" />
      <ellipse cx="330" cy="170" rx="16" ry="10" transform="rotate(-20 330 170)" />
    </g>
    {/* Latitude lines */}
    <g clipPath="url(#globeClip)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" fill="none">
      <ellipse cx="200" cy="200" rx="175" ry="52" />
      <ellipse cx="200" cy="145" rx="155" ry="40" />
      <ellipse cx="200" cy="255" rx="155" ry="40" />
      <ellipse cx="200" cy="96" rx="112" ry="28" />
      <ellipse cx="200" cy="304" rx="112" ry="28" />
    </g>
    {/* Longitude lines */}
    <g clipPath="url(#globeClip)" stroke="rgba(255,255,255,0.10)" strokeWidth="1" fill="none">
      <line x1="200" y1="25" x2="200" y2="375" />
      <path d="M200,25 Q280,200 200,375" />
      <path d="M200,25 Q120,200 200,375" />
      <path d="M200,25 Q330,200 200,375" />
      <path d="M200,25 Q70,200 200,375" />
    </g>
    {/* Shine */}
    <circle cx="200" cy="200" r="175" fill="url(#shineGrad)" />
    {/* Border */}
    <circle cx="200" cy="200" r="175" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
    {/* Atmosphere glow */}
    <circle cx="200" cy="200" r="182" fill="none" stroke="rgba(168,200,222,0.3)" strokeWidth="6" />
  </svg>
);

const PlaneLogo = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="20" fill="rgba(255,255,255,0.15)" />
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
        ? await authAPI.login({ email: form.email.trim(), password: form.password })
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
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      background: 'linear-gradient(135deg, #5C0F1A 0%, #7D1128 40%, #4E8098 100%)',
    },
    leftPanel: {
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '60px 40px', position: 'relative', overflow: 'hidden',
    },
    globeWrap: {
      width: 340, height: 340, position: 'relative', flexShrink: 0,
      filter: 'drop-shadow(0 20px 60px rgba(78,128,152,0.6))',
      animation: 'floatGlobe 6s ease-in-out infinite',
    },
    rightPanel: {
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '40px',
    },
    card: {
      background: 'white', borderRadius: 22, width: '100%', maxWidth: 420,
      boxShadow: '0 32px 80px rgba(30,42,56,0.35)', overflow: 'hidden',
    },
    cardTop: {
      background: 'linear-gradient(135deg, #7D1128 0%, #9B1B30 100%)',
      padding: '28px 32px 24px', textAlign: 'center',
    },
    brand: {
      fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: 'white',
      letterSpacing: 0.5, marginTop: 12,
    },
    brandSub: { color: 'rgba(255,255,255,0.65)', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginTop: 3 },
    tabRow: {
      display: 'flex', background: '#F3F7FA', margin: '0 24px', borderRadius: 10,
      padding: 4, marginTop: 20, marginBottom: 2,
    },
    tab: {
      flex: 1, padding: '9px', border: 'none', background: 'transparent',
      borderRadius: 7, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif',
      fontWeight: 600, fontSize: 13.5, color: '#5A6A7E', transition: 'all 0.25s',
    },
    tabActive: { background: 'white', color: '#7D1128', boxShadow: '0 2px 8px rgba(0,0,0,0.09)' },
    form: { padding: '20px 24px 28px', display: 'flex', flexDirection: 'column', gap: 14 },
    fieldWrap: { display: 'flex', flexDirection: 'column', gap: 5 },
    label: { fontSize: 11, fontWeight: 700, color: '#4E8098', textTransform: 'uppercase', letterSpacing: 0.6 },
    input: {
      padding: '11px 14px', border: '1.5px solid #E8EDF3', borderRadius: 8,
      fontFamily: 'Montserrat, sans-serif', fontSize: 14, color: '#1E2A38',
      outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s', width: '100%',
      background: '#FAFBFD',
    },
    btn: {
      background: 'linear-gradient(135deg, #7D1128, #C4384F)',
      color: 'white', border: 'none', borderRadius: 50, padding: '13px',
      fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 14.5,
      cursor: 'pointer', transition: 'all 0.25s',
      boxShadow: '0 4px 16px rgba(125,17,40,0.4)',
    },
    errorBox: {
      background: '#FBF0F2', color: '#7D1128', padding: '10px 14px',
      borderRadius: 8, fontSize: 13, fontWeight: 500, borderLeft: '3px solid #C4384F', lineHeight: 1.5,
    },
    switchText: { textAlign: 'center', fontSize: 12.5, color: '#5A6A7E' },
    switchLink: { color: '#7D1128', cursor: 'pointer', fontWeight: 700, marginLeft: 4 },
    tagline: {
      color: 'rgba(255,255,255,0.75)', fontSize: 14, textAlign: 'center',
      marginTop: 28, lineHeight: 1.7, maxWidth: 300,
    },
    dots: {
      display: 'flex', gap: 8, marginTop: 28, justifyContent: 'center',
    },
    dot: {
      width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.35)',
    },
    dotActive: { background: 'rgba(255,255,255,0.8)', transform: 'scale(1.3)' },
  };

  return (
    <>
      <style>{`
        @keyframes floatGlobe {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
        }
        .auth-input:focus {
          border-color: #6B9EB8 !important;
          box-shadow: 0 0 0 3px rgba(107,158,184,0.16) !important;
          background: white !important;
        }
        @media (max-width: 768px) {
          .auth-grid { grid-template-columns: 1fr !important; }
          .auth-left { display: none !important; }
        }
      `}</style>
      <div style={s.page} className="auth-grid">
        {/* Left — Globe */}
        <div style={s.leftPanel} className="auth-left">
          <div style={s.globeWrap}><Globe /></div>
          <div style={s.tagline}>
            Откройте мир морских путешествий.<br />
            Мальдивы, Греция, Таиланд и сотни<br />
            других направлений ждут вас.
          </div>
          <div style={s.dots}>
            {[0,1,2].map(i => <div key={i} style={{ ...s.dot, ...(i===0?s.dotActive:{}) }} />)}
          </div>
        </div>

        {/* Right — Form */}
        <div style={s.rightPanel}>
          <div style={s.card}>
            <div style={s.cardTop}>
              <PlaneLogo />
              <div style={s.brand}>Tour Agency</div>
              <div style={s.brandSub}>International Travel</div>
            </div>

            <div style={{ padding: '18px 24px 0' }}>
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
                <label style={s.label}>Адрес электронной почты</label>
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
                <div style={{ background: '#EEF6FB', borderRadius: 8, padding: '10px 13px', fontSize: 12, color: '#4E8098', lineHeight: 1.5 }}>
                  Аккаунт будет создан с ролью "Пользователь". Роль агента назначает администратор.
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
                <div style={{ background: '#F3F7FA', borderRadius: 8, padding: '10px 13px', fontSize: 11.5, color: '#5A6A7E', textAlign: 'center', lineHeight: 1.6 }}>
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
