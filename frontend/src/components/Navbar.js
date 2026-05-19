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
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/auth'); setMenuOpen(false); };

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

  const handleNav = (path) => { navigate(path); setMenuOpen(false); };

  const s = {
    nav: {
      background: 'linear-gradient(135deg, #5C0F1A 0%, #7D1128 60%, #9B1B30 100%)',
      boxShadow: '0 3px 16px rgba(92,15,26,0.35)',
      position: 'sticky', top: 0, zIndex: 999,
    },
    inner: {
      maxWidth: 1200, margin: '0 auto', padding: '0 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 62,
    },
    logo: {
      display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', textDecoration: 'none',
    },
    logoCircle: {
      width: 36, height: 36, borderRadius: '50%',
      background: 'rgba(255,255,255,0.15)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: '1.5px solid rgba(255,255,255,0.3)', flexShrink: 0,
    },
    logoText: {
      fontFamily: "'Playfair Display', serif",
      fontSize: 18, fontWeight: 700, color: 'white', letterSpacing: 0.3,
    },
    logoSub: { fontSize: 9, color: 'rgba(255,255,255,0.6)', fontWeight: 400, display: 'block', letterSpacing: 0.5 },
    links: { display: 'flex', alignItems: 'center', gap: 4 },
    link: {
      color: 'rgba(255,255,255,0.82)', fontWeight: 600, fontSize: 13.5,
      textDecoration: 'none', padding: '7px 14px', borderRadius: 50,
      transition: 'all 0.2s', cursor: 'pointer', background: 'transparent',
      border: 'none', fontFamily: 'Montserrat, sans-serif', letterSpacing: 0.2,
    },
    linkActive: { background: 'rgba(255,255,255,0.18)', color: 'white' },
    avatar: {
      width: 34, height: 34, borderRadius: '50%',
      background: 'rgba(255,255,255,0.2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer',
      border: '2px solid rgba(255,255,255,0.35)', overflow: 'hidden',
      transition: 'all 0.2s', flexShrink: 0,
    },
    userSection: { display: 'flex', alignItems: 'center', gap: 9 },
    userName: { color: 'white', fontWeight: 600, fontSize: 13 },
    rolePill: {
      background: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.85)',
      fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 50,
      letterSpacing: 0.5, textTransform: 'uppercase',
    },
    logoutBtn: {
      background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)',
      border: '1px solid rgba(255,255,255,0.25)', borderRadius: 50,
      padding: '7px 14px', cursor: 'pointer', fontWeight: 600, fontSize: 12,
      fontFamily: 'Montserrat, sans-serif', transition: 'all 0.2s', letterSpacing: 0.2,
    },
    burger: {
      display: 'none', flexDirection: 'column', gap: 5, cursor: 'pointer',
      background: 'none', border: 'none', padding: 6,
    },
    burgerLine: {
      width: 24, height: 2, background: 'white', borderRadius: 2,
      transition: 'all 0.25s',
    },
    mobileMenu: {
      display: 'none', flexDirection: 'column', gap: 0,
      background: 'linear-gradient(180deg,#7D1128,#5C0F1A)',
      padding: '12px 0 16px', borderTop: '1px solid rgba(255,255,255,0.12)',
    },
    mobileLink: {
      color: 'rgba(255,255,255,0.88)', fontWeight: 600, fontSize: 14,
      padding: '13px 24px', border: 'none', background: 'transparent',
      textAlign: 'left', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
    },
    mobileUserRow: {
      display: 'flex', alignItems: 'center', gap: 12, padding: '14px 24px',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
    },
  };

  return (
    <nav style={s.nav}>
      <div style={s.inner}>
        <div style={s.logo} onClick={() => handleNav(user ? '/tours' : '/auth')}>
          <div style={s.logoCircle}>
            <PlaneIcon size={18} color="white" />
          </div>
          <div>
            <span style={s.logoText}>Tour Agency</span>
            <span style={s.logoSub}>INTERNATIONAL TRAVEL</span>
          </div>
        </div>

        {/* Desktop nav */}
        {user && (
          <div style={s.links} className="nav-desktop">
            {navLinks().map(link => (
              <button key={link.path}
                style={{ ...s.link, ...(location.pathname.startsWith(link.path) ? s.linkActive : {}) }}
                onClick={() => navigate(link.path)}>
                {link.label}
              </button>
            ))}
          </div>
        )}

        {/* Desktop user section */}
        {user && (
          <div style={s.userSection} className="nav-desktop">
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

        {/* Mobile hamburger */}
        {user && (
          <button
            className="nav-mobile"
            style={{ ...s.burger, display: 'flex' }}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Меню"
          >
            <span style={{ ...s.burgerLine, transform: menuOpen ? 'rotate(45deg) translate(5px,5px)' : '' }} />
            <span style={{ ...s.burgerLine, opacity: menuOpen ? 0 : 1 }} />
            <span style={{ ...s.burgerLine, transform: menuOpen ? 'rotate(-45deg) translate(5px,-5px)' : '' }} />
          </button>
        )}
      </div>

      {/* Mobile menu dropdown */}
      {user && menuOpen && (
        <div className="nav-mobile" style={{ ...s.mobileMenu, display: 'flex' }}>
          <div style={s.mobileUserRow}>
            <div style={{ ...s.avatar, width: 38, height: 38 }} onClick={() => handleNav('/profile')}>
              {user.avatar
                ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span>{user.name?.[0]?.toUpperCase()}</span>
              }
            </div>
            <div onClick={() => handleNav('/profile')} style={{ cursor: 'pointer' }}>
              <div style={s.userName}>{user.name}</div>
              <div style={s.rolePill}>{roleLabel[user.role]}</div>
            </div>
          </div>
          {navLinks().map(link => (
            <button key={link.path} style={s.mobileLink} onClick={() => handleNav(link.path)}>
              {link.label}
            </button>
          ))}
          <button style={s.mobileLink} onClick={() => handleNav('/profile')}>Личный кабинет</button>
          <button style={{ ...s.mobileLink, color: '#F9A8B4', borderBottom: 'none' }} onClick={handleLogout}>Выйти</button>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile  { display: flex !important; }
        }
        @media (min-width: 769px) {
          .nav-mobile  { display: none !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
