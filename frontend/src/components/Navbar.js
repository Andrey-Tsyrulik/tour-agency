import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PlaneIcon = ({ size = 22, color = '#C4384F' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z"
      fill={color} />
  </svg>
);

const roleLabel = { user: 'Пользователь', agent: 'Агент', admin: 'Администратор' };

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/auth'); };

  const navLinks = () => {
    if (!user) return [];
    const base = [
      { label: 'Туры', path: '/tours' },
      { label: 'Поддержка', path: '/support' },
    ];
    if (user.role === 'agent') return [...base, { label: 'Панель агента', path: '/agent' }];
    if (user.role === 'admin') return [...base, { label: 'Панель агента', path: '/agent' }, { label: 'Администрирование', path: '/admin' }];
    return base;
  };

  const s = {
    nav: {
      background: 'linear-gradient(135deg, #5C0F1A 0%, #7D1128 60%, #9B1B30 100%)',
      boxShadow: '0 3px 16px rgba(92,15,26,0.35)',
      position: 'sticky', top: 0, zIndex: 999,
    },
    inner: {
      maxWidth: 1200, margin: '0 auto', padding: '0 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 62,
    },
    logo: {
      display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', textDecoration: 'none',
    },
    logoCircle: {
      width: 36, height: 36, borderRadius: '50%',
      background: 'rgba(255,255,255,0.15)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: '1.5px solid rgba(255,255,255,0.3)',
    },
    logoText: {
      fontFamily: "'Playfair Display', serif",
      fontSize: 19, fontWeight: 700, color: 'white', letterSpacing: 0.3,
    },
    logoSub: { fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 400, display: 'block', letterSpacing: 0.5 },
    links: { display: 'flex', alignItems: 'center', gap: 4 },
    link: {
      color: 'rgba(255,255,255,0.82)', fontWeight: 600, fontSize: 13.5,
      textDecoration: 'none', padding: '7px 15px', borderRadius: 50,
      transition: 'all 0.2s', cursor: 'pointer', background: 'transparent',
      border: 'none', fontFamily: 'Montserrat, sans-serif', letterSpacing: 0.2,
    },
    linkActive: { background: 'rgba(255,255,255,0.18)', color: 'white' },
    avatar: {
      width: 36, height: 36, borderRadius: '50%',
      background: 'rgba(255,255,255,0.2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontWeight: 700, fontSize: 15, cursor: 'pointer',
      border: '2px solid rgba(255,255,255,0.35)', overflow: 'hidden',
      transition: 'all 0.2s',
    },
    userSection: { display: 'flex', alignItems: 'center', gap: 10 },
    userName: { color: 'white', fontWeight: 600, fontSize: 13.5 },
    rolePill: {
      background: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.85)',
      fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 50,
      letterSpacing: 0.5, textTransform: 'uppercase',
    },
    logoutBtn: {
      background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)',
      border: '1px solid rgba(255,255,255,0.25)', borderRadius: 50,
      padding: '7px 15px', cursor: 'pointer', fontWeight: 600, fontSize: 12.5,
      fontFamily: 'Montserrat, sans-serif', transition: 'all 0.2s', letterSpacing: 0.2,
    },
  };

  return (
    <nav style={s.nav}>
      <div style={s.inner}>
        <div style={s.logo} onClick={() => navigate(user ? '/tours' : '/auth')}>
          <div style={s.logoCircle}>
            <PlaneIcon size={18} color="white" />
          </div>
          <div>
            <span style={s.logoText}>Tour Agency</span>
            <span style={s.logoSub}>INTERNATIONAL TRAVEL</span>
          </div>
        </div>

        {user && (
          <div style={s.links}>
            {navLinks().map(link => (
              <button key={link.path}
                style={{ ...s.link, ...(location.pathname.startsWith(link.path) ? s.linkActive : {}) }}
                onClick={() => navigate(link.path)}>
                {link.label}
              </button>
            ))}
          </div>
        )}

        {user && (
          <div style={s.userSection}>
            <div style={s.avatar} onClick={() => navigate('/profile')} title="Личный кабинет">
              {user.avatar
                ? <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span>{user.name?.[0]?.toUpperCase() || '?'}</span>
              }
            </div>
            <div style={{ cursor: 'pointer' }} onClick={() => navigate('/profile')}>
              <div style={s.userName}>{user.name}</div>
              <div style={s.rolePill}>{roleLabel[user.role] || user.role}</div>
            </div>
            <button style={s.logoutBtn} onClick={handleLogout}>Выйти</button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
