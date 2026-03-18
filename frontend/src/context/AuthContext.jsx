import React, { createContext, useContext, useEffect, useState } from 'react';
import { getStoredAuth, setStoredAuth, clearStoredAuth } from '../utils/storage.js';
import { loginApi, meApi } from '../services/authApi.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const stored = getStoredAuth();
      if (stored?.token) {
        setToken(stored.token);
        try {
          const me = await meApi();
          setUser({ _id: me._id, profileId: me.profileId, role: me.role, email: stored.email, firstName: me.firstName, lastName: me.lastName });
        } catch {
          clearStoredAuth();
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const authenticateUser = async ({ token, role, email, _id }) => {
    setToken(token);
    setUser({ _id, role, email });
    setStoredAuth({ token, role, email });
    try {
      const me = await meApi();
      setUser(prev => ({ 
        ...prev, 
        profileId: me.profileId, 
        firstName: me.firstName, 
        lastName: me.lastName 
      }));
    } catch (err) {
      // Fallback already set above
    }
  };

  const login = async (email, password) => {
    const res = await loginApi(email, password);
    authenticateUser({ token: res.token, role: res.role, email, _id: res._id });
    return res;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    clearStoredAuth();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, authenticateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);

