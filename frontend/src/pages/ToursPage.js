import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toursAPI, browsingAPI } from '../api';

const CATEGORIES = ['Все', 'Пляжный', 'Культурный', 'Приключения'];

const StarRating = ({ value }) => {
  const full = Math.round(value || 4);
  return (
    <span style={{ color: '#C4384F', fontSize: 13, letterSpacing: 1 }}>
      {'★'.repeat(full)}{'☆'.repeat(5 - full)}
      <span style={{ color: '#5A6A7E', fontWeight: 600, marginLeft: 5, fontSize: 12 }}>{Number(value).toFixed(1)}</span>
    </span>
  );
};

const ToursPage = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('Все');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchTours(); }, [search, category, minPrice, maxPrice]);

  const fetchTours = async () => {
    setLoading(true); setError('');
    try {
      const params = {};
      if (search) params.search = search;
      if (category !== 'Все') params.category = category;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      const res = await toursAPI.getAll(params);
      setTours(res.data);
    } catch {
      setError('Не удалось загрузить туры. Проверьте соединение с сервером.');
    } finally { setLoading(false); }
  };

  const handleSearch = (e) => { e.preventDefault(); setSearch(searchInput); };
  const resetSearch = () => { setSearch(''); setSearchInput(''); };

  const openTour = async (tour) => {
    try { await browsingAPI.add(tour.id); } catch {}
    navigate(`/tours/${tour.id}`);
  };

  const s = {
    hero: {
      background: 'linear-gradient(150deg, #071828 0%, #0C2D52 35%, #0E4D82 65%, #1A6EA8 100%)',
      padding: '56px 20px 96px', textAlign: 'center', position: 'relative', overflow: 'hidden',
    },
    heroEyebrow: {
      color: 'rgba(255,255,255,0.65)', fontSize: 11, letterSpacing: 3,
      textTransform: 'uppercase', marginBottom: 12, fontWeight: 600,
    },
    heroTitle: {
      fontFamily: "'Playfair Display', serif",
      fontSize: 44, color: 'white', fontWeight: 700, marginBottom: 10,
      textShadow: '0 2px 20px rgba(0,0,0,0.2)',
    },
    heroSub: { color: 'rgba(255,255,255,0.78)', fontSize: 15, marginBottom: 32 },
    searchWrap: {
      background: 'white', borderRadius: 60, padding: '6px 6px 6px 22px',
      display: 'flex', gap: 8, maxWidth: 580, margin: '0 auto',
      boxShadow: '0 12px 40px rgba(0,0,0,0.28)',
    },
    searchInput: {
      flex: 1, border: 'none', outline: 'none', fontFamily: 'Montserrat, sans-serif',
      fontSize: 14.5, color: '#1E2A38', background: 'transparent',
    },
    searchBtn: {
      background: 'linear-gradient(135deg, #7D1128, #C4384F)',
      color: 'white', border: 'none', borderRadius: 50, padding: '11px 24px',
      fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 13.5, cursor: 'pointer',
      transition: 'all 0.25s',
    },
    wave: {
      position: 'absolute', bottom: 0, left: 0, right: 0, height: 70,
      background: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 70'%3E%3Cpath fill='%23F3F7FA' d='M0,35 C360,70 720,0 1080,35 C1260,52 1380,28 1440,35 L1440,70 L0,70 Z'/%3E%3C/svg%3E\")",
      backgroundSize: 'cover',
    },
    filterBar: {
      background: 'white', borderRadius: 14, padding: '14px 22px',
      boxShadow: '0 2px 12px rgba(30,42,56,0.08)', marginBottom: 24,
      display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center',
    },
    filterLabel: { fontWeight: 700, color: '#4E8098', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
    catBtn: {
      padding: '7px 17px', border: '1.5px solid #E8EDF3', borderRadius: 50,
      cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', fontWeight: 600,
      fontSize: 13, background: 'white', color: '#5A6A7E', transition: 'all 0.2s',
    },
    catBtnActive: {
      background: 'linear-gradient(135deg, #7D1128, #C4384F)',
      color: 'white', borderColor: 'transparent',
    },
    priceInput: {
      padding: '8px 14px', border: '1.5px solid #E8EDF3', borderRadius: 50,
      fontFamily: 'Montserrat, sans-serif', fontSize: 13, outline: 'none',
      width: 155, color: '#1E2A38', transition: 'border-color 0.2s',
    },
    card: {
      background: 'white', borderRadius: 18, overflow: 'hidden',
      boxShadow: '0 4px 18px rgba(30,42,56,0.09)',
      transition: 'transform 0.25s, box-shadow 0.25s',
      display: 'flex', flexDirection: 'column', cursor: 'pointer',
    },
    img: { width: '100%', height: 195, objectFit: 'cover', display: 'block' },
    imgPlaceholder: {
      width: '100%', height: 195,
      background: 'linear-gradient(135deg, #7D1128, #4E8098)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontSize: 13, fontWeight: 600, letterSpacing: 1,
    },
    cardBody: { padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column' },
    catTag: {
      display: 'inline-block', background: '#EEF6FB', color: '#4E8098',
      fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 50,
      marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.6,
    },
    cardTitle: {
      fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700,
      color: '#1E2A38', marginBottom: 5, lineHeight: 1.3,
    },
    location: { color: '#5A6A7E', fontSize: 12.5, marginBottom: 7 },
    cardFooter: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #F4F6F9',
    },
    price: {
      fontFamily: "'Playfair Display', serif", fontSize: 21, fontWeight: 700, color: '#7D1128',
    },
    priceFrom: { fontSize: 10, color: '#5A6A7E', display: 'block', fontWeight: 500 },
    detailBtn: {
      background: 'linear-gradient(135deg, #7D1128, #C4384F)',
      color: 'white', border: 'none', borderRadius: 50, padding: '9px 18px',
      fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 12.5, cursor: 'pointer',
      transition: 'all 0.25s', boxShadow: '0 3px 10px rgba(125,17,40,0.3)',
    },
    countLine: { color: '#5A6A7E', fontSize: 13, fontWeight: 500 },
    emptyWrap: { textAlign: 'center', padding: '70px 20px', color: '#5A6A7E' },
    emptyTitle: { fontSize: 19, fontWeight: 700, color: '#1E2A38', marginBottom: 8 },
    divider: { width: 1, height: 22, background: '#E8EDF3' },
  };

  return (
    <div>
      <div style={s.hero}>
        <div style={s.heroEyebrow}>Tour Agency — International Travel</div>
        <div style={s.heroTitle}>Путешествия к морю</div>
        <div style={s.heroSub}>Выберите тур своей мечты среди лучших направлений мира</div>
        <form onSubmit={handleSearch} style={s.searchWrap}>
          <input style={s.searchInput} value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Страна, город или название тура..." />
          <button type="submit" style={s.searchBtn}>Найти</button>
        </form>
        <div style={s.wave} />
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 20px' }}>
        <div style={s.filterBar}>
          <span style={s.filterLabel}>Категория</span>
          {CATEGORIES.map(cat => (
            <button key={cat} style={{ ...s.catBtn, ...(category === cat ? s.catBtnActive : {}) }}
              onClick={() => setCategory(cat)}>{cat}</button>
          ))}
          <div style={s.divider} />
          <span style={s.filterLabel}>Цена (₽)</span>
          <input style={{ ...s.priceInput, width: 125 }} type="number" placeholder="от"
            value={minPrice} onChange={e => setMinPrice(e.target.value)} />
          <span style={{ color:'#8A9BB0', fontSize:13 }}>—</span>
          <input style={{ ...s.priceInput, width: 125 }} type="number" placeholder="до"
            value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
          {(search || minPrice || maxPrice) && (
            <>
              <div style={s.divider} />
              <button className="btn btn-ghost btn-sm" onClick={() => { resetSearch(); setMinPrice(''); setMaxPrice(''); }}>
                Сбросить фильтры
              </button>
            </>
          )}
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <span style={s.countLine}>{loading ? '' : `Найдено: ${tours.length} ${tours.length === 1 ? 'тур' : tours.length < 5 ? 'тура' : 'туров'}`}</span>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : tours.length === 0 ? (
          <div style={s.emptyWrap}>
            <div style={{ fontSize: 56, marginBottom: 14, opacity: 0.4 }}>[ ]</div>
            <div style={s.emptyTitle}>Туры не найдены</div>
            <div style={{ marginBottom: 20 }}>Попробуйте изменить параметры поиска или сбросить фильтры</div>
            <button className="btn btn-secondary" onClick={() => { resetSearch(); setCategory('Все'); setMaxPrice(''); }}>
              Показать все туры
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 22 }}>
            {tours.map(tour => (
              <div key={tour.id} style={s.card} onClick={() => openTour(tour)}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(30,42,56,0.16)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 18px rgba(30,42,56,0.09)'; }}>
                {tour.image_url
                  ? <img src={tour.image_url} alt={tour.title} style={s.img} onError={e => { e.target.style.display='none'; }} />
                  : <div style={s.imgPlaceholder}>Нет изображения</div>
                }
                <div style={s.cardBody}>
                  {tour.category && <span style={s.catTag}>{tour.category}</span>}
                  <div style={s.cardTitle}>{tour.title}</div>
                  <div style={s.location}>{tour.location}, {tour.country} &nbsp;&middot;&nbsp; {tour.duration}</div>
                  <div style={{ marginBottom: 10 }}><StarRating value={tour.rating} /></div>
                  <div style={s.cardFooter}>
                    <div>
                      <span style={s.priceFrom}>от</span>
                      <span style={s.price}>{Number(tour.price).toLocaleString('ru')} ₽</span>
                    </div>
                    <button style={s.detailBtn} onClick={e => { e.stopPropagation(); openTour(tour); }}>
                      Подробнее
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
