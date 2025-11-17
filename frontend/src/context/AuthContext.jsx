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
    const fetchUserInfo = async () => {
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          // 서버에서 현재 로그인한 사용자 정보 가져오기
          const response = await axios.get(`${API_URL}/auth/me`);
          setUser({
            isAuthenticated: true,
            ...response.data
          });
        } catch (error) {
          console.error('사용자 정보를 불러오는데 실패했습니다:', error);
          // 토큰이 만료되었거나 잘못된 경우 로그아웃 처리
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

      // 토큰 저장 및 헤더 설정
      localStorage.setItem('token', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      // 사용자 정보 가져오기 (헤더 명시적으로 추가)
      try {
        const userResponse = await axios.get(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        });
        setUser({
          isAuthenticated: true,
          ...userResponse.data
        });
        setToken(access_token);
      } catch (err) {
        console.error('사용자 정보를 불러오는데 실패했습니다:', err);
        // 사용자 정보 로드 실패해도 로그인은 성공으로 처리
        setUser({ isAuthenticated: true, username });
        setToken(access_token);
      }

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