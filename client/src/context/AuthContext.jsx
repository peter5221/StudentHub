import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('sh_token'));
  const [loading, setLoading] = useState(true);

  // Set axios default header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load user on mount
  useEffect(() => {
    if (token) {
      axios.get('/api/auth/me')
        .then(r => setUser(r.data.user))
        .catch(() => { localStorage.removeItem('sh_token'); setToken(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = useCallback(async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password });
    localStorage.setItem('sh_token', data.token);
    setToken(data.token);
    setUser(data.user);
    // Trigger geolocation capture after login
    captureLocation(data.token);
    return data.user;
  }, []);

  const signup = useCallback(async (fields) => {
    const { data } = await axios.post('/api/auth/signup', fields);
    localStorage.setItem('sh_token', data.token);
    setToken(data.token);
    setUser(data.user);
    captureLocation(data.token);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('sh_token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  const updateUserLocation = useCallback((locationData) => {
    setUser(prev => prev ? { ...prev, ...locationData } : prev);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, updateUserLocation, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// ─── Geolocation Capture ──────────────────────────────────────────────────────
export async function captureLocation(token) {
  if (!navigator.geolocation) {
    return fallbackToIP(token);
  }
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const { data } = await axios.get(`/api/geocode?lat=${latitude}&lng=${longitude}`);
        await axios.patch('/api/auth/location', data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.warn('Geolocation update failed:', err.message);
      }
    },
    () => fallbackToIP(token)
  );
}

async function fallbackToIP(token) {
  try {
    const { data } = await axios.get('/api/geocode/ip');
    await axios.patch('/api/auth/location', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    console.warn('IP fallback failed:', err.message);
  }
}
