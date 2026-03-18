import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
});

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('lms-auth');
  if (raw) {
    const parsed = JSON.parse(raw);
    if (parsed.token) {
      // eslint-disable-next-line no-param-reassign
      config.headers.Authorization = `Bearer ${parsed.token}`;
    }
  }
  return config;
});

export default api;

