import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../api';

/* ── Реалистичная Земля (SVG + CSS) ─────────────────────── */
const RealisticEarth = () => (
  <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"
    style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 0 40px rgba(100,180,255,0.7)) drop-shadow(0 20px 60px rgba(30,80,140,0.5))' }}>
    <defs>
      {/* Основной градиент океана */}
      <radialGradient id="ocean" cx="38%" cy="32%" r="68%">
        <stop offset="0%"  stopColor="#5DADE2" />
        <stop offset="25%" stopColor="#2E86C1" />
        <stop offset="55%" stopColor="#1A5276" />
        <stop offset="80%" stopColor="#154360" />
        <stop offset="100%" stopColor="#0B2D44" />
      </radialGradient>
      {/* Атмосферный ореол */}
      <radialGradient id="atmosphere" cx="50%" cy="50%" r="50%">
        <stop offset="82%" stopColor="transparent" />
        <stop offset="90%" stopColor="#87CEEB" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#B0D9F8" stopOpacity="0" />
      </radialGradient>
      {/* Блик света */}
      <radialGradient id="shine" cx="28%" cy="22%" r="45%">
        <stop offset="0%"  stopColor="white" stopOpacity="0.38" />
        <stop offset="40%" stopColor="white" stopOpacity="0.08" />
        <stop offset="100%" stopColor="white" stopOpacity="0" />
      </radialGradient>
      {/* Тень с обратной стороны */}
      <radialGradient id="shadow" cx="70%" cy="68%" r="55%">
        <stop offset="0%"  stopColor="#020D1A" stopOpacity="0.6" />
        <stop offset="60%" stopColor="#020D1A" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#020D1A" stopOpacity="0" />
      </radialGradient>
      <clipPath id="clip"><circle cx="200" cy="200" r="178" /></clipPath>
      <clipPath id="clipAtm"><circle cx="200" cy="200" r="190" /></clipPath>
    </defs>

    {/* Атмосферный круг (чуть больше планеты) */}
    <circle cx="200" cy="200" r="192" fill="none" stroke="#87CEEB" strokeWidth="14" strokeOpacity="0.25" />
    <circle cx="200" cy="200" r="185" fill="none" stroke="#B0D9F8" strokeWidth="5"  strokeOpacity="0.35" />

    {/* Океан */}
    <circle cx="200" cy="200" r="178" fill="url(#ocean)" />

    {/* ── Материки ──────────────────────────────────────── */}
    <g clipPath="url(#clip)" fill="#2D8A4E" fillOpacity="0.92">
      {/* Евразия */}
      <path d="M 175 72 Q 210 60 250 68 Q 295 72 320 90 Q 345 108 348 130 Q 355 158 340 178 Q 325 195 305 200 Q 280 210 260 205 Q 240 202 225 215 Q 210 228 200 240 Q 188 255 178 250 Q 162 242 155 228 Q 145 212 148 195 Q 152 178 142 165 Q 130 150 135 132 Q 140 112 158 98 Q 168 86 175 72 Z" />
      {/* Скандинавия */}
      <path d="M 190 62 Q 200 48 212 52 Q 220 60 215 75 Q 205 80 195 75 Q 188 70 190 62 Z" />
      {/* Индия */}
      <path d="M 262 205 Q 275 215 278 235 Q 272 255 260 262 Q 248 265 242 252 Q 236 238 240 220 Q 248 208 262 205 Z" />
      {/* Юго-Восточная Азия / острова */}
      <path d="M 305 208 Q 320 205 330 218 Q 325 230 312 228 Q 302 222 305 208 Z" />
      <ellipse cx="340" cy="225" rx="12" ry="8" transform="rotate(20 340 225)" />
      <ellipse cx="328" cy="242" rx="10" ry="6" transform="rotate(15 328 242)" />
      {/* Африка */}
      <path d="M 178 248 Q 200 240 220 245 Q 240 252 245 275 Q 250 300 242 320 Q 232 340 215 352 Q 198 360 182 350 Q 165 338 160 318 Q 154 295 158 272 Q 162 258 178 248 Z" />
      {/* Мадагаскар */}
      <ellipse cx="255" cy="318" rx="8" ry="18" transform="rotate(10 255 318)" />
      {/* Северная Америка */}
      <path d="M 62 88 Q 88 72 115 78 Q 138 85 148 105 Q 158 128 150 155 Q 140 178 120 188 Q 98 196 78 185 Q 55 172 48 148 Q 40 122 52 100 Q 56 92 62 88 Z" />
      {/* Центральная/Южная Америка */}
      <path d="M 100 195 Q 118 190 130 202 Q 140 218 135 240 Q 128 262 115 278 Q 100 292 85 285 Q 68 275 65 255 Q 62 232 72 214 Q 80 200 100 195 Z" />
      {/* Гренландия */}
      <ellipse cx="155" cy="52" rx="18" ry="28" transform="rotate(-15 155 52)" fill="#E8F4FD" fillOpacity="0.85" />
      {/* Антарктида */}
      <path d="M 60 350 Q 120 332 180 335 Q 230 338 280 330 Q 320 325 345 340 Q 370 355 355 372 Q 320 390 270 395 Q 200 400 140 395 Q 90 390 60 372 Q 45 360 60 350 Z" fill="#E8F4FD" fillOpacity="0.9" />
      {/* Австралия */}
      <path d="M 318 268 Q 340 260 358 268 Q 372 278 370 295 Q 366 310 352 316 Q 336 320 322 310 Q 308 298 312 282 Q 314 272 318 268 Z" />
      <ellipse cx="372" cy="302" rx="9" ry="6" transform="rotate(-10 372 302)" />
    </g>

    {/* ── Полярные льды / Арктика ─────────────────────── */}
    <g clipPath="url(#clip)" fill="#D6EAF8" fillOpacity="0.75">
      <ellipse cx="200" cy="46" rx="55" ry="32" />
      <ellipse cx="178" cy="55" rx="22" ry="14" />
    </g>

    {/* ── Облака на глобусе ───────────────────────────── */}
    <g clipPath="url(#clip)" fill="white" fillOpacity="0.62">
      <ellipse cx="148" cy="120" rx="28" ry="10" transform="rotate(-8 148 120)" />
      <ellipse cx="165" cy="115" rx="20" ry="8"  transform="rotate(-5 165 115)" />
      <ellipse cx="260" cy="170" rx="32" ry="11" transform="rotate(5 260 170)" />
      <ellipse cx="240" cy="165" rx="18" ry="8"  />
      <ellipse cx="88"  cy="155" rx="24" ry="9"  transform="rotate(-10 88 155)" />
      <ellipse cx="72"  cy="150" rx="16" ry="7"  />
      <ellipse cx="185" cy="295" rx="30" ry="10" transform="rotate(6 185 295)" />
      <ellipse cx="210" cy="290" rx="18" ry="7"  />
      <ellipse cx="310" cy="230" rx="22" ry="8"  transform="rotate(-5 310 230)" />
      <ellipse cx="330" cy="140" rx="20" ry="7"  transform="rotate(12 330 140)" />
      <ellipse cx="108" cy="250" rx="18" ry="7"  transform="rotate(-8 108 250)" />
    </g>

    {/* Блик (источник света — левый верх) */}
    <circle cx="200" cy="200" r="178" fill="url(#shine)" />
    {/* Тень (правый низ) */}
    <circle cx="200" cy="200" r="178" fill="url(#shadow)" />
    {/* Контур */}
    <circle cx="200" cy="200" r="178" fill="none" stroke="rgba(100,200,255,0.25)" strokeWidth="1.5" />

    {/* Внешнее свечение атмосферы */}
    <circle cx="200" cy="200" r="178" fill="url(#atmosphere)" />
  </svg>
);

/* ── Фоновые облака ──────────────────────────────────────── */
const Clouds = () => (
  <svg viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg"
    style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }}>
    <defs>
      <filter id="blur1"><feGaussianBlur stdDeviation="6" /></filter>
      <filter id="blur2"><feGaussianBlur stdDeviation="4" /></filter>
      <filter id="blur3"><feGaussianBlur stdDeviation="9" /></filter>
    </defs>

    {/* Большие мягкие облака */}
    <g fill="white" fillOpacity="0.32" filter="url(#blur3)">
      <ellipse cx="160"  cy="90"  rx="120" ry="45" />
      <ellipse cx="100"  cy="80"  rx="80"  ry="35" />
      <ellipse cx="220"  cy="75"  rx="90"  ry="38" />
      <ellipse cx="1100" cy="120" rx="140" ry="50" />
      <ellipse cx="1050" cy="110" rx="95"  ry="38" />
      <ellipse cx="1200" cy="105" rx="100" ry="40" />
      <ellipse cx="600"  cy="50"  rx="110" ry="40" />
      <ellipse cx="550"  cy="42"  rx="75"  ry="30" />
      <ellipse cx="680"  cy="48"  rx="80"  ry="32" />
      <ellipse cx="350"  cy="180" rx="100" ry="38" />
      <ellipse cx="900"  cy="800" rx="130" ry="48" />
      <ellipse cx="850"  cy="790" rx="90"  ry="36" />
      <ellipse cx="200"  cy="720" rx="110" ry="42" />
      <ellipse cx="1300" cy="750" rx="120" ry="44" />
    </g>

    {/* Средние чёткие облака */}
    <g fill="white" fillOpacity="0.22" filter="url(#blur2)">
      <ellipse cx="160"  cy="88"  rx="100" ry="36" />
      <ellipse cx="95"   cy="76"  rx="65"  ry="26" />
      <ellipse cx="230"  cy="72"  rx="72"  ry="28" />
      <ellipse cx="1105" cy="118" rx="115" ry="38" />
      <ellipse cx="605"  cy="48"  rx="88"  ry="30" />
      <ellipse cx="355"  cy="178" rx="78"  ry="28" />
      <ellipse cx="760"  cy="160" rx="95"  ry="34" />
      <ellipse cx="720"  cy="150" rx="62"  ry="24" />
      <ellipse cx="820"  cy="155" rx="68"  ry="26" />
      <ellipse cx="480"  cy="820" rx="100" ry="35" />
      <ellipse cx="440"  cy="810" rx="65"  ry="24" />
      <ellipse cx="1200" cy="240" rx="85"  ry="30" />
      <ellipse cx="80"   cy="400" rx="70"  ry="25" />
      <ellipse cx="1380" cy="500" rx="75"  ry="28" />
    </g>

    {/* Маленькие детальные облака (верхний слой) */}
    <g fill="white" fillOpacity="0.45" filter="url(#blur1)">
      <ellipse cx="155"  cy="86"  rx="75"  ry="24" />
      <ellipse cx="90"   cy="74"  rx="48"  ry="17" />
      <ellipse cx="232"  cy="70"  rx="54"  ry="20" />
      <ellipse cx="1108" cy="116" rx="88"  ry="28" />
      <ellipse cx="1060" cy="108" rx="58"  ry="20" />
      <ellipse cx="1210" cy="102" rx="62"  ry="22" />
      <ellipse cx="608"  cy="46"  rx="65"  ry="22" />
      <ellipse cx="555"  cy="40"  rx="42"  ry="16" />
      <ellipse cx="682"  cy="44"  rx="48"  ry="18" />
      <ellipse cx="358"  cy="176" rx="58"  ry="20" />
      <ellipse cx="764"  cy="158" rx="70"  ry="24" />
      <ellipse cx="726"  cy="148" rx="45"  ry="16" />
      <ellipse cx="485"  cy="818" rx="72"  ry="22" />
      <ellipse cx="448"  cy="808" rx="46"  ry="16" />
      <ellipse cx="905"  cy="798" rx="80"  ry="26" />
      <ellipse cx="858"  cy="788" rx="52"  ry="18" />
      <ellipse cx="205"  cy="718" rx="76"  ry="24" />
      <ellipse cx="1305" cy="748" rx="82"  ry="28" />
      <ellipse cx="1205" cy="238" rx="58"  ry="20" />
      <ellipse cx="85"   cy="398" rx="48"  ry="17" />
      <ellipse cx="1385" cy="498" rx="52"  ry="18" />
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
    globeWrap: {
      width: 370, height: 370, position: 'relative', flexShrink: 0,
      animation: 'floatEarth 7s ease-in-out infinite',
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
      color: 'rgba(255,255,255,0.95)', fontSize: 15, textAlign: 'center',
      marginTop: 30, lineHeight: 1.8, maxWidth: 310,
      textShadow: '0 1px 4px rgba(30,80,140,0.35)',
      fontWeight: 500,
    },
    dots: { display: 'flex', gap: 8, marginTop: 22, justifyContent: 'center' },
    dot: { width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.45)', transition: 'all 0.2s' },
    dotActive: { background: 'rgba(255,255,255,0.92)', width: 22, borderRadius: 4 },
  };

  return (
    <>
      <style>{`
        @keyframes floatEarth {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33%  { transform: translateY(-12px) rotate(0.5deg); }
          66%  { transform: translateY(-6px) rotate(-0.5deg); }
        }
        @keyframes cloudDrift {
          0%   { transform: translateX(0); }
          100% { transform: translateX(60px); }
        }
        .auth-cloud-layer {
          animation: cloudDrift 40s linear infinite alternate;
        }
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
        {/* Облака на фоне */}
        <div className="auth-cloud-layer" style={{ position:'absolute', inset:0, zIndex:1 }}>
          <Clouds />
        </div>

        {/* Левая панель — Земля */}
        <div style={s.leftPanel} className="auth-left">
          <div style={s.globeWrap}>
            <RealisticEarth />
          </div>
          <div style={s.tagline}>
            Откройте мир путешествий.<br />
            Мальдивы, Греция, Таиланд<br />
            и сотни других направлений.
          </div>
          <div style={s.dots}>
            {[0,1,2].map(i => <div key={i} style={{ ...s.dot, ...(i===0 ? s.dotActive : {}) }} />)}
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
