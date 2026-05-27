import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8082/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;

    // Debug: log every API error to console
    console.error(
      `[API Error] ${err.config?.method?.toUpperCase()} ${err.config?.url}`,
      `→ Status: ${status ?? 'Network Error'}`,
      err.response?.data ?? err.message
    );

    // 401 = unauthenticated, 403 = forbidden (Spring Security also returns
    // 403 when the JWT token is expired or invalid — not just 401)
    if (status === 401 || status === 403) {
      localStorage.clear();
      window.location.href = '/login';
    }

    return Promise.reject(err);
  }
);

export default API;
