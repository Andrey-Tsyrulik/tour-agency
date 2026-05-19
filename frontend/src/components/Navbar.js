import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const navLinks = () => {
    if (!user) return [];
    const base = [{ label: '🌊 Туры', path: '/tours' }, { label: '📞 Поддержка', path: '/support' }];
    if (user.role === 'agent') return [...base, { label: '📋 Агент', path: '/agent' }];
    if (user.role === 'admin') return [...base, { label: '⚙️ Админ', path: '/admin' }];
    return base;
  };

  const styles = {
    nav: {
      background: 'linear-gradient(135deg, #0a3d62 0%, #1e6091 100%)',
      boxShadow: '0 4px 20px rgba(10,61,98,0.3)',
      position: 'sticky', top: 0, zIndex: 999,
    },
    inner: {
      maxWidth: 1200, margin: '0 auto', padding: '0 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: 64,
    },
    logo: {
      display: 'flex', alignItems: 'center', gap: 10,
      cursor: 'pointer', textDecoration: 'none',
    },
    logoText: {
      fontFamily: "'Playfair Display', serif",
      fontSize: 22, fontWeight: 700, color: 'white',
    },
    logoSub: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 400, display: 'block' },
    links: { display: 'flex', alignItems: 'center', gap: 8 },
    link: {
      color: 'rgba(255,255,255,0.85)', fontWeight: 600, fontSize: 14,
      textDecoration: 'none', padding: '8px 16px', borderRadius: 50,
      transition: 'all 0.2s', cursor: 'pointer', background: 'transparent',
      border: 'none', fontFamily: 'Montserrat, sans-serif',
    },
    linkActive: { background: 'rgba(255,255,255,0.2)', color: 'white' },
    avatar: {
      width: 38, height: 38, borderRadius: '50%',
      background: 'linear-gradient(135deg, #0097b2, #48cae4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontWeight: 700, fontSize: 16, cursor: 'pointer',
      border: '2px solid rgba(255,255,255,0.4)', overflow: 'hidden',
    },
    userSection: { display: 'flex', alignItems: 'center', gap: 12 },
    userName: { color: 'white', fontWeight: 600, fontSize: 14 },
    logoutBtn: {
      background: 'rgba(255,255,255,0.15)', color: 'white',
      border: '1px solid rgba(255,255,255,0.3)', borderRadius: 50,
      padding: '7px 16px', cursor: 'pointer', fontWeight: 600, fontSize: 13,
      fontFamily: 'Montserrat, sans-serif', transition: 'all 0.2s',
    },
    roleBadge: {
      background: '#f5a623', color: 'white', fontSize: 11, fontWeight: 700,
      padding: '2px 8px', borderRadius: 50, marginLeft: 4,
    }
  };

  const roleLabel = { user: '', agent: 'Агент', admin: 'Админ' };

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        <div style={styles.logo} onClick={() => navigate(user ? '/tours' : '/auth')}>
          <span style={{ fontSize: 28 }}>⚓</span>
          <div>
            <span style={styles.logoText}>OceanTravel</span>
            <span style={styles.logoSub}>Путешествия к морю</span>
          </div>
        </div>

        {user && (
          <div style={styles.links}>
            {navLinks().map(link => (
              <button
                key={link.path}
                style={{
                  ...styles.link,
                  ...(location.pathname === link.path ? styles.linkActive : {})
                }}
                onClick={() => navigate(link.path)}
              >
                {link.label}
              </button>
            ))}
          </div>
        )}

        {user && (
          <div style={styles.userSection}>
            <div
              style={styles.avatar}
              onClick={() => navigate('/profile')}
              title="Личный кабинет"
            >
              {user.avatar
                ? <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : user.name?.[0]?.toUpperCase() || '?'
              }
            </div>
            <div style={{ cursor: 'pointer' }} onClick={() => navigate('/profile')}>
              <span style={styles.userName}>{user.name}</span>
              {roleLabel[user.role] && (
                <span style={styles.roleBadge}>{roleLabel[user.role]}</span>
              )}
            </div>
            <button style={styles.logoutBtn} onClick={handleLogout}>Выйти</button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
