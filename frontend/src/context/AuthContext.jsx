import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API_URL = '/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const response = await axios.get(`${API_URL}/auth/me`);
          setUser({ isAuthenticated: true, ...response.data });
        } catch (error) {
          console.error('사용자 정보를 불러오는데 실패했습니다:', error);
          localStorage.removeItem('token');
          setToken(null);
          delete axios.defaults.headers.common['Authorization'];
          setUser(null);
        }
      }
      setLoading(false);
    };

    fetchUserInfo();
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { username, password });
      const { access_token } = response.data;

      if (!access_token) throw new Error('No access token');

      localStorage.setItem('token', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      try {
        const userResponse = await axios.get(`${API_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${access_token}` }
        });
        setUser({ isAuthenticated: true, ...userResponse.data });
        setToken(access_token);
      } catch (err) {
        console.error('사용자 정보를 불러오는데 실패했습니다:', err);
        setUser({ isAuthenticated: true, username });
        setToken(access_token);
      }

      return { ok: true };
    } catch (error) {
      console.error('Login failed:', error);

      localStorage.removeItem('token');
      setToken(null);
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);

      const message = error.response?.data?.message || '로그인에 실패했습니다. 다시 시도해주세요.';
      return { ok: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const register = async (email, username, password) => {
    try {
      await axios.post(`${API_URL}/auth/register`, { email, username, password });
      return { ok: true };
    } catch (error) {
      console.error('Registration failed:', error);
      const message = error.response?.data?.message || '회원가입 중 오류가 발생했습니다.';
      return { ok: false, message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, register, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);