import axios from 'axios';

const envUrl = import.meta.env.VITE_API_BASE_URL;

// If accessing the frontend via a LAN IP (like 10.x.x.x or 192.168.x.x on mobile)
// but the .env is hardcoded to localhost, swap localhost for the actual mobile-accessed IP.
const dynamicBaseURL = (envUrl.includes('localhost') && window.location.hostname !== 'localhost')
  ? `http://${window.location.hostname}:5001/api`
  : envUrl;

const api = axios.create({
  baseURL: dynamicBaseURL,
  timeout: 600000 // 10 minutes timeout for large video uploads
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

