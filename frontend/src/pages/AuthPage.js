import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../api';

const AuthPage = () => {
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = tab === 'login'
        ? await authAPI.login({ email: form.email, password: form.password })
        : await authAPI.register(form);
      login(res.data.token, res.data.user);
      navigate('/tours');
    } catch (err) {
      setError(err.response?.data?.message || 'Произошла ошибка');
    } finally { setLoading(false); }
  };

  const s = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a3d62 0%, #1e6091 40%, #0097b2 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, position: 'relative', overflow: 'hidden',
    },
    bubbles: { position: 'absolute', inset: 0, pointerEvents: 'none' },
    card: {
      background: 'white', borderRadius: 24, width: '100%', maxWidth: 440,
      boxShadow: '0 32px 80px rgba(10,61,98,0.4)', overflow: 'hidden', position: 'relative', zIndex: 1,
    },
    hero: {
      background: 'linear-gradient(135deg, #0a3d62, #0097b2)',
      padding: '32px 32px 24px', textAlign: 'center',
    },
    heroEmoji: { fontSize: 48, marginBottom: 8, display: 'block' },
    heroTitle: { fontFamily: "'Playfair Display', serif", fontSize: 28, color: 'white', fontWeight: 700 },
    heroSub: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 4 },
    tabs: { display: 'flex', background: '#f1f5f9', margin: '0 24px', borderRadius: 12, padding: 4, marginBottom: 4, marginTop: 20 },
    tab: {
      flex: 1, padding: '10px', border: 'none', background: 'transparent',
      borderRadius: 8, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif',
      fontWeight: 600, fontSize: 14, color: '#64748b', transition: 'all 0.3s',
    },
    tabActive: { background: 'white', color: '#0a3d62', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
    form: { padding: '20px 24px 28px', display: 'flex', flexDirection: 'column', gap: 16 },
    input: {
      padding: '13px 16px', border: '2px solid #e2e8f0', borderRadius: 10,
      fontFamily: 'Montserrat, sans-serif', fontSize: 14, outline: 'none',
      transition: 'border-color 0.3s', width: '100%',
    },
    label: { fontSize: 12, fontWeight: 600, color: '#0a3d62', marginBottom: 4, display: 'block' },
    btn: {
      background: 'linear-gradient(135deg, #0097b2, #1e6091)',
      color: 'white', border: 'none', borderRadius: 50, padding: '14px',
      fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 15,
      cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 4px 15px rgba(0,151,178,0.4)',
    },
    select: {
      padding: '13px 16px', border: '2px solid #e2e8f0', borderRadius: 10,
      fontFamily: 'Montserrat, sans-serif', fontSize: 14, outline: 'none',
      background: 'white', cursor: 'pointer', width: '100%',
    },
    error: {
      background: '#fee2e2', color: '#991b1b', padding: '10px 14px',
      borderRadius: 8, fontSize: 13, fontWeight: 500,
    },
    wave: {
      position: 'absolute', bottom: 0, left: 0, right: 0, height: 120,
      background: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 120'%3E%3Cpath fill='rgba(255,255,255,0.05)' d='M0,60 C240,100 480,20 720,60 C960,100 1200,20 1440,60 L1440,120 L0,120 Z'/%3E%3C/svg%3E\")",
      backgroundSize: 'cover', backgroundRepeat: 'no-repeat',
    }
  };

  return (
    <div style={s.page}>
      <div style={s.wave} />
      <div style={s.card}>
        <div style={s.hero}>
          <span style={s.heroEmoji}>⛵</span>
          <div style={s.heroTitle}>OceanTravel</div>
          <div style={s.heroSub}>Откройте мир морских путешествий</div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
            {['🏖️', '🐚', '🦀', '🌊', '🐠'].map((e, i) => (
              <span key={i} style={{ fontSize: 18 }}>{e}</span>
            ))}
          </div>
        </div>

        <div style={{ padding: '20px 24px 0' }}>
          <div style={s.tabs}>
            {[['login','Войти'],['register','Регистрация']].map(([key, label]) => (
              <button key={key} style={{ ...s.tab, ...(tab===key ? s.tabActive : {}) }}
                onClick={() => { setTab(key); setError(''); }}>{label}</button>
            ))}
          </div>
        </div>

        <form style={s.form} onSubmit={submit}>
          {error && <div style={s.error}>⚠️ {error}</div>}

          {tab === 'register' && (
            <div>
              <label style={s.label}>Имя</label>
              <input style={s.input} name="name" value={form.name} onChange={handle}
                placeholder="Ваше имя" required />
            </div>
          )}

          <div>
            <label style={s.label}>Email</label>
            <input style={s.input} name="email" type="email" value={form.email} onChange={handle}
              placeholder="example@mail.com" required />
          </div>

          <div>
            <label style={s.label}>Пароль</label>
            <input style={s.input} name="password" type="password" value={form.password} onChange={handle}
              placeholder={tab === 'register' ? 'Минимум 6 символов' : 'Ваш пароль'} required />
          </div>

          {tab === 'register' && (
            <div>
              <label style={s.label}>Роль</label>
              <select style={s.select} name="role" value={form.role} onChange={handle}>
                <option value="user">🧳 Путешественник</option>
                <option value="agent">📋 Тур-агент</option>
                <option value="admin">⚙️ Администратор</option>
              </select>
            </div>
          )}

          <button type="submit" style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? '⌛ Загрузка...' : tab === 'login' ? '🚀 Войти' : '✨ Зарегистрироваться'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#64748b' }}>
            {tab === 'login' ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
            <span style={{ color: '#0097b2', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setError(''); }}>
              {tab === 'login' ? 'Зарегистрироваться' : 'Войти'}
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
