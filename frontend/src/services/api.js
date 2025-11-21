import { API_BASE_URL } from "../constants";

const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    // JSON 파싱 실패 시 빈 객체로 fallback
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
};

export const missionApi = {
  getPresets: async () => {
    const data = await apiFetch("/missions/presets");
    // API 응답 형식 정규화: 배열 또는 { missions: [] } 형식 모두 처리
    return Array.isArray(data) ? data : data.missions || [];
  },

  complete: async (mission) => {
    return apiFetch("/missions/presets/complete", {
      method: "POST",
      body: JSON.stringify({
        preset_mission_id: mission.id,
        tier: mission.tier,
        title: mission.title || mission.description,
        description: mission.description,
        duration: mission.duration,
      }),
    });
  },

  fail: async (mission) => {
    return apiFetch("/missions/presets/fail", {
      method: "POST",
      body: JSON.stringify({
        preset_mission_id: mission.id,
        tier: mission.tier,
        title: mission.title || mission.description,
        description: mission.description,
      }),
    });
  },

  getMedals: async () => {
    const token = localStorage.getItem("token");
    return apiFetch("/missions/medals", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  getRecent: async (limit = 5) => {
    const token = localStorage.getItem("token");
    const data = await apiFetch(`/missions/recent?limit=${limit}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return data.missions || [];
  },

  getByTier: async (tier) => {
    const token = localStorage.getItem("token");
    const data = await apiFetch(`/missions/by-tier/${tier}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return data.missions || [];
  },
};

export const authApi = {
  login: async (username, password) => {
    return apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  },

  register: async (email, username, password) => {
    return apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, username, password }),
    });
  },

  getCurrentUser: async (token) => {
    return apiFetch("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
