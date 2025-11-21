import { TIER_CONFIG } from "../constants";

export const formatTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`;
};

// 초를 MM:SS 형식으로 변환 (타이머 표시용)
export const formatTimeToMMSS = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

export const getTierMeta = (tier) => TIER_CONFIG[tier] || TIER_CONFIG.all;

export const getMissionTitle = (mission) =>
  mission?.title || mission?.description || "미션";

export const requestNotificationPermission = () => {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
};

// 브라우저 알림 전송 (권한이 있을 때만)
export const sendNotification = (title, body, icon = "/icon.png") => {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body, icon });
  }
};
