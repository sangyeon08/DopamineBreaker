import DongMedal from "../assets/DongMedal.png";
import EunMedal from "../assets/EunMedal.png";
import GeumMedal from "../assets/GeumMedal.png";

export const API_BASE_URL = "/api";

export const TIER_CONFIG = {
  all: { label: "전체", medal: null, color: "#333333" },
  bronze: { label: "브론즈", medal: DongMedal, color: "#cd7f32" },
  silver: { label: "실버", medal: EunMedal, color: "#c0c0c0" },
  gold: { label: "골드", medal: GeumMedal, color: "#d4af37" },
};

export const NOTIFICATION_MESSAGES = {
  MISSION_COMPLETE: "미션 완료!",
  MISSION_FAILED: "미션을 완료하지 못했습니다.",
  LOGIN_SUCCESS: "로그인 성공!",
  LOGOUT_SUCCESS: "로그아웃되었습니다.",
};
