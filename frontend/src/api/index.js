import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateMe: (data) => API.put('/auth/me', data),
};

export const toursAPI = {
  getAll: (params) => API.get('/tours', { params }),
  getAllAdmin: () => API.get('/tours/all'),
  getById: (id) => API.get(`/tours/${id}`),
  create: (data) => API.post('/tours', data),
  update: (id, data) => API.put(`/tours/${id}`, data),
  delete: (id) => API.delete(`/tours/${id}`),
};

export const bookingsAPI = {
  getAll: () => API.get('/bookings'),
  getMy: () => API.get('/bookings/my'),
  create: (data) => API.post('/bookings', data),
  updateStatus: (id, status) => API.put(`/bookings/${id}/status`, { status }),
  cancel: (id) => API.delete(`/bookings/${id}`),
};

export const paymentsAPI = {
  pay: (data) => API.post('/payments', data),
  getMy: () => API.get('/payments/my'),
};

export const usersAPI = {
  getAll: () => API.get('/users'),
  create: (data) => API.post('/users', data),
  update: (id, data) => API.put(`/users/${id}`, data),
  delete: (id) => API.delete(`/users/${id}`),
};

export const browsingAPI = {
  add: (tour_id) => API.post('/browsing', { tour_id }),
  getHistory: () => API.get('/browsing'),
};


export default API;
