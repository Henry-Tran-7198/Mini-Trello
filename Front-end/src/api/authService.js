import axios from 'axios';

const API_URL = 'http://localhost:8000/api'; // backend API

// Lưu token vào localStorage
export function setToken(token) {
  localStorage.setItem('token', token);
}

// Lấy token
export function getToken() {
  return localStorage.getItem('token');
}

// Xóa token
export function removeToken() {
  localStorage.removeItem('token');
}

// Axios instance có Authorization header
const api = axios.create({
  baseURL: API_URL,
  headers: { Accept: 'application/json' }
});

api.interceptors.request.use(config => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth APIs
export const authService = {
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
  logout: () => api.post('/logout'),
  getUser: () => api.get('/user'),
  uploadAvatar: (formData) => api.post('/user/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};
