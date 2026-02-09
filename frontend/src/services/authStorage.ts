export const getAuthItem = (key: 'token' | 'usuario') => {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(key) ?? localStorage.getItem(key);
};

export const setAuthItem = (key: 'token' | 'usuario', value: string) => {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(key, value);
  localStorage.removeItem(key);
};

export const clearAuth = () => {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('usuario');
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
};

export const getUsuarioFromStorage = <T = any>() => {
  const raw = getAuthItem('usuario');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export const getTokenFromStorage = () => getAuthItem('token');
