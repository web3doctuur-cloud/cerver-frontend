import  { createContext, useState, useContext, useEffect } from 'react';
import { api, endpoints } from '../services/api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const getApiErrorMessage = (error, fallback) => {
  const data = error.response?.data;
  if (Array.isArray(data?.errors)) return data.errors.join(', ');
  if (typeof data?.message === 'string') return data.message;
  return fallback;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const getIsAdmin = (decoded) => {
    const roles = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || [];
    return roles === 'Admin' || (Array.isArray(roles) && roles.includes('Admin'));
  };

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
        setIsAdmin(getIsAdmin(decoded));
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
        setToken(null);
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await api.post(endpoints.auth.login, { email, password });
      const { token } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      const decoded = jwtDecode(token);
      setUser(decoded);
      const admin = getIsAdmin(decoded);
      setIsAdmin(admin);
      return { success: true, isAdmin: admin };
    } catch (error) {
      return { success: false, error: getApiErrorMessage(error, 'Login failed') };
    }
  };

  const register = async (email, password) => {
    try {
      await api.post(endpoints.auth.register, { email, password });
      return login(email, password);
    } catch (error) {
      return { success: false, error: getApiErrorMessage(error, 'Registration failed') };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAdmin, loading, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};
