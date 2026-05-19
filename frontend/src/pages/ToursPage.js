import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toursAPI, browsingAPI } from '../api';

const categories = ['Все', 'Пляжный', 'Культурный', 'Приключения'];

const ToursPage = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Все');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();

  const fetchTours = async () => {
    setLoading(true); setError('');
    try {
      const params = {};
      if (search) params.search = search;
      if (category !== 'Все') params.category = category;
      if (maxPrice) params.maxPrice = maxPrice;
      const res = await toursAPI.getAll(params);
      setTours(res.data);
    } catch {
      setError('Не удалось загрузить туры. Проверьте соединение.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchTours(); }, [search, category, maxPrice]);

  const handleSearch = (e) => { e.preventDefault(); setSearch(searchInput); };

  const openTour = async (tour) => {
    try { await browsingAPI.add(tour.id); } catch {}
    navigate(`/tours/${tour.id}`);
  };

  const stars = (r) => '⭐'.repeat(Math.round(r || 4));

  const s = {
    hero: {
      background: 'linear-gradient(135deg, #0a3d62 0%, #1e6091 50%, #0097b2 100%)',
      padding: '60px 20px 100px', textAlign: 'center', position: 'relative', overflow: 'hidden',
    },
    heroTitle: {
      fontFamily: "'Playfair Display', serif", fontSize: 42, color: 'white',
      fontWeight: 700, marginBottom: 12, textShadow: '0 2px 20px rgba(0,0,0,0.2)',
    },
    heroSub: { color: 'rgba(255,255,255,0.85)', fontSize: 16, marginBottom: 32 },
    searchBox: {
      background: 'white', borderRadius: 60, padding: '6px 6px 6px 20px',
      display: 'flex', gap: 8, maxWidth: 600, margin: '0 auto',
      boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
    },
    searchInput: {
      flex: 1, border: 'none', outline: 'none', fontFamily: 'Montserrat, sans-serif',
      fontSize: 15, color: '#0a3d62', background: 'transparent',
    },
    searchBtn: {
      background: 'linear-gradient(135deg, #f5a623, #ffd166)',
      color: 'white', border: 'none', borderRadius: 50, padding: '12px 24px',
      fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer',
    },
    wave: {
      position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
      background: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 80'%3E%3Cpath fill='%23e8f4fd' d='M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z'/%3E%3C/svg%3E\")",
      backgroundSize: 'cover',
    },
    filters: {
      background: 'white', borderRadius: 16, padding: '16px 24px',
      boxShadow: '0 4px 16px rgba(10,61,98,0.1)', marginBottom: 24,
      display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center',
    },
    filterLabel: { fontWeight: 700, color: '#0a3d62', fontSize: 14 },
    catBtn: {
      padding: '8px 18px', border: '2px solid #e2e8f0', borderRadius: 50,
      cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', fontWeight: 600,
      fontSize: 13, background: 'white', color: '#64748b', transition: 'all 0.2s',
    },
    catBtnActive: { background: '#0097b2', color: 'white', borderColor: '#0097b2' },
    card: {
      background: 'white', borderRadius: 20, overflow: 'hidden', cursor: 'pointer',
      boxShadow: '0 8px 24px rgba(10,61,98,0.1)', transition: 'all 0.3s',
      display: 'flex', flexDirection: 'column',
    },
    img: { width: '100%', height: 200, objectFit: 'cover', display: 'block' },
    imgPlaceholder: {
      width: '100%', height: 200,
      background: 'linear-gradient(135deg, #0a3d62, #0097b2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 48,
    },
    cardBody: { padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' },
    category: {
      display: 'inline-block', background: '#e8f4fd', color: '#0097b2',
      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 50,
      marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5,
    },
    cardTitle: { fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#0a3d62', marginBottom: 6 },
    location: { color: '#64748b', fontSize: 13, marginBottom: 8 },
    rating: { fontSize: 13, marginBottom: 12, color: '#64748b' },
    footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #f1f5f9' },
    price: { fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#0a3d62' },
    priceLabel: { fontSize: 11, color: '#64748b', display: 'block' },
    bookBtn: {
      background: 'linear-gradient(135deg, #f5a623, #ffd166)',
      color: 'white', border: 'none', borderRadius: 50, padding: '10px 20px',
      fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(245,166,35,0.4)', transition: 'all 0.3s',
    },
    priceInput: {
      padding: '8px 14px', border: '2px solid #e2e8f0', borderRadius: 50,
      fontFamily: 'Montserrat, sans-serif', fontSize: 13, outline: 'none',
      width: 140, color: '#0a3d62',
    },
    count: { color: '#64748b', fontSize: 14, fontWeight: 500 },
  };

  return (
    <div>
      <div style={s.hero}>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 8, letterSpacing: 3, textTransform: 'uppercase' }}>
          🌊 Откройте мир
        </div>
        <div style={s.heroTitle}>Путешествия к морю</div>
        <div style={s.heroSub}>Выберите тур своей мечты среди сотен направлений</div>
        <form onSubmit={handleSearch} style={s.searchBox}>
          <span style={{ fontSize: 18 }}>🔍</span>
          <input style={s.searchInput} value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Страна, город, название тура..." />
          <button type="submit" style={s.searchBtn}>Найти</button>
        </form>
        <div style={s.wave} />
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px' }}>
        <div style={s.filters}>
          <span style={s.filterLabel}>🗂 Категория:</span>
          {categories.map(cat => (
            <button key={cat} style={{ ...s.catBtn, ...(category === cat ? s.catBtnActive : {}) }}
              onClick={() => setCategory(cat)}>{cat}</button>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={s.filterLabel}>💰 Макс. цена:</span>
            <input style={s.priceInput} type="number" placeholder="Без ограничений"
              value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={s.count}>{loading ? '' : `Найдено туров: ${tours.length}`}</span>
          {search && (
            <button className="btn btn-outline btn-sm" onClick={() => { setSearch(''); setSearchInput(''); }}>
              ✕ Сбросить поиск
            </button>
          )}
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : tours.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🔭</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#0a3d62', marginBottom: 8 }}>Туры не найдены</div>
            <div>Попробуйте изменить параметры поиска</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {tours.map(tour => (
              <div key={tour.id} style={s.card}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(10,61,98,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(10,61,98,0.1)'; }}
                onClick={() => openTour(tour)}>
                {tour.image_url
                  ? <img src={tour.image_url} alt={tour.title} style={s.img} onError={e => e.target.style.display='none'} />
                  : <div style={s.imgPlaceholder}>🏝️</div>
                }
                <div style={s.cardBody}>
                  {tour.category && <span style={s.category}>{tour.category}</span>}
                  <div style={s.cardTitle}>{tour.title}</div>
                  <div style={s.location}>📍 {tour.location}, {tour.country}</div>
                  <div style={s.rating}>
                    <span style={{ color: '#f5a623' }}>{'★'.repeat(Math.round(tour.rating || 4))}</span>
                    <span> {Number(tour.rating).toFixed(1)} · {tour.duration}</span>
                  </div>
                  <div style={s.footer}>
                    <div>
                      <span style={s.priceLabel}>от</span>
                      <span style={s.price}>{Number(tour.price).toLocaleString('ru')} ₽</span>
                    </div>
                    <button style={s.bookBtn}
                      onClick={e => { e.stopPropagation(); openTour(tour); }}>
                      Подробнее →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ToursPage;
