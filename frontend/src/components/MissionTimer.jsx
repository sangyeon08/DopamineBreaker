import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import {
  formatTimeToMMSS,
  getMissionTitle,
  requestNotificationPermission,
  sendNotification,
} from "../utils/helpers";

const TimerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 85vh;
  gap: 48px;
`;

const MissionTitle = styled.h2`
  font-size: 28px;
  margin-top: 24px;
  font-weight: 700;
  color: #333333;
  text-align: center;
`;

const TimerDisplay = styled.div`
  width: 280px;
  height: 280px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Time = styled.div`
  font-size: 3.5rem;
  font-weight: 700;
  color: #333333;
  z-index: 1;
  font-variant-numeric: tabular-nums;
  position: absolute;
`;

const MissionDescription = styled.p`
  font-size: 18px;
  margin-top: 12px;
  color: #757575;
  text-align: center;
  max-width: 500px;
  line-height: 1.6;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 24px;
  margin-top: 24px;
`;

const Button = styled.button`
  padding: 14px 40px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  transition: opacity 0.2s ease;
`;

const CancelButton = styled(Button)`
  background-color: #f5f5f5;
  color: #333333;
  border: none;

  &:hover {
    opacity: 0.8;
  }
`;

const CompleteButton = styled(Button)`
  background-color: #3a6ea5;
  color: white;
  border: none;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const FocusAlert = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #ffffff;
  padding: 42px 48px;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  text-align: center;
  z-index: 1000;
  display: ${(props) => (props.show ? "block" : "none")};

  h3 {
    font-size: 24px;
    color: #3a6ea5;
    margin-bottom: 16px;
  }

  p {
    font-size: 16px;
    line-height: 1.5;
    color: #757575;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: ${(props) => (props.show ? "block" : "none")};
`;

function MissionTimer({ mission, onComplete, onCancel }) {
  const [timeLeft, setTimeLeft] = useState(mission.duration * 60);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFocusAlert, setShowFocusAlert] = useState(false);
  const intervalRef = useRef(null);
  const alertTimeoutRef = useRef(null);
  // visibility 이벤트 핸들러에서 stale closure 문제를 방지하기 위해 ref 사용
  const isPausedRef = useRef(false);
  const missionTitle = getMissionTitle(mission);
  const totalTime = mission.duration * 60;

  useEffect(() => {
    requestNotificationPermission();

    const startTimer = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setIsCompleted(true);
            sendNotification(
              "미션 완료!",
              `${missionTitle} 미션을 완료했습니다!`
            );
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    const clearAlertTimer = () => {
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
        alertTimeoutRef.current = null;
      }
    };

    // 탭 전환 감지: 사용자가 다른 탭으로 이동하면 타이머 일시정지, 돌아오면 재개
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // 탭 이탈 시 타이머 일시정지
        setIsCompleted((currentCompleted) => {
          if (!currentCompleted) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            isPausedRef.current = true;
            clearAlertTimer();
          }
          return currentCompleted;
        });
        setShowFocusAlert(true);
      } else {
        // 탭 복귀 시 타이머 재개 및 1.5초간 집중 알림 표시
        setIsCompleted((currentCompleted) => {
          if (!currentCompleted && isPausedRef.current) {
            isPausedRef.current = false;
            clearAlertTimer();
            startTimer();

            alertTimeoutRef.current = setTimeout(() => {
              setShowFocusAlert(false);
              alertTimeoutRef.current = null;
            }, 1500);
          } else if (alertTimeoutRef.current === null && !isPausedRef.current) {
            setShowFocusAlert(false);
          }
          return currentCompleted;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    startTimer();

    return () => {
      clearInterval(intervalRef.current);
      clearAlertTimer();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [missionTitle]);

  const handleComplete = () => {
    clearInterval(intervalRef.current);
    onComplete();
  };

  const handleCancel = () => {
    clearInterval(intervalRef.current);
    onCancel();
  };

  // SVG 원형 프로그레스바 계산: 경과 시간에 따라 원의 둘레를 채워나감
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const circumference = 2 * Math.PI * 130;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <>
      <TimerContainer>
        <MissionTitle>{missionTitle}</MissionTitle>

        <TimerDisplay>
          <svg width="280" height="280" style={{ transform: "rotate(-90deg)" }}>
            <circle
              cx="140"
              cy="140"
              r="130"
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="20"
            />
            <circle
              cx="140"
              cy="140"
              r="130"
              fill="none"
              stroke="#3a6ea5"
              strokeWidth="20"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <Time>{formatTimeToMMSS(timeLeft)}</Time>
        </TimerDisplay>

        <MissionDescription>{mission.description}</MissionDescription>

        <ButtonGroup>
          <CancelButton onClick={handleCancel}>취소</CancelButton>
          <CompleteButton onClick={handleComplete} disabled={!isCompleted}>
            {isCompleted ? "완료하기" : "진행 중..."}
          </CompleteButton>
        </ButtonGroup>
      </TimerContainer>

      <Overlay show={showFocusAlert} />
      <FocusAlert show={showFocusAlert}>
        <h3>집중 모드 중입니다!</h3>
        <p>화면을 이탈하면 타이머가 흐르지 않아요</p>
        <p>앱으로 다시 돌아와주세요</p>
      </FocusAlert>
    </>
  );
}

export default MissionTimer;
