import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = 'http://localhost:5001/api'; // 백엔드 API 주소

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // 앱 시작/새로고침 시 토큰 있으면 axios 헤더 세팅 + user 복원
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // 실제로는 /api/auth/me 같은 API에서 유저 정보를 다시 가져오는 게 좋지만
      // 지금은 간단하게 로그인됨 상태만 표시
      setUser({ isAuthenticated: true });
    }
    setLoading(false);
  }, [token]);

  // 로그인
  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        username,
        password,
      });

      const { access_token } = response.data;

      if (!access_token) {
        throw new Error('No access token');
      }

      // 토큰 저장
      localStorage.setItem('token', access_token);
      setToken(access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      // 간단한 사용자 정보 저장 (필요하면 확장 가능)
      setUser({ isAuthenticated: true, username });

      return { ok: true };
    } catch (error) {
      console.error('Login failed:', error);

      // 실패 시 혹시 남아있을 수 있는 인증 정보들 정리
      localStorage.removeItem('token');
      setToken(null);
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);

      const message =
        error.response?.data?.message || '로그인에 실패했습니다. 다시 시도해주세요.';

      return { ok: false, message };
    }
  };

  // 로그아웃
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // 회원가입
  const register = async (email, username, password) => {
    try {
      await axios.post(`${API_URL}/auth/register`, {
        email,
        username,
        password,
      });
      return { ok: true };
    } catch (error) {
      console.error('Registration failed:', error);
      const message =
        error.response?.data?.message || '회원가입 중 오류가 발생했습니다.';
      return { ok: false, message };
    }
  };

  const authContextValue = {
    user,
    token,
    login,
    logout,
    register,
    loading,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};