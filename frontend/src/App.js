import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function App() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/tours`)
      .then(res => {
        setTours(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Could not load tours. Make sure the backend is running.');
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 800, margin: '40px auto', padding: '0 20px' }}>
      <h1>Tour Agency</h1>
      <p>Welcome! Browse our available tours below.</p>
      {loading && <p>Loading tours...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && tours.length === 0 && (
        <p>No tours available yet.</p>
      )}
      <div>
        {tours.map(tour => (
          <div key={tour.id} style={{
            border: '1px solid #ddd',
            borderRadius: 8,
            padding: 16,
            marginBottom: 16
          }}>
            <h2>{tour.title}</h2>
            <p>{tour.description}</p>
            <p><strong>Price:</strong> ${tour.price}</p>
            <p><strong>Duration:</strong> {tour.duration}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
