export const getStoredAuth = () => {
  try {
    const raw = localStorage.getItem('lms-auth');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setStoredAuth = (value) => {
  localStorage.setItem('lms-auth', JSON.stringify(value));
};

export const clearStoredAuth = () => {
  localStorage.removeItem('lms-auth');
};