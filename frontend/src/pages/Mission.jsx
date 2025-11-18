import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import MissionTimer from "../components/MissionTimer";
import DongMedal from "../assets/DongMedal.png";
import EunMedal from "../assets/EunMedal.png";
import GeumMedal from "../assets/GeumMedal.png";
import MisionSuccess from "../assets/MisionSuccess.png";

const MissionContainer = styled.div`
  max-width: 480px;
  margin: 0 auto;
  padding: 24px;
  padding-bottom: 100px;
`;

const PageTitle = styled.h1`
  margin-top: 32px;
  font-size: 24px;
  font-weight: 700;
  color: #333333;
  margin-bottom: 32px;
`;

const ToggleContainer = styled.div`
  display: flex;
  border-radius: 16px;
  padding: 4px;
  margin-bottom: 16px;
`;

const ToggleButton = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.15s ease;
  background-color: ${(props) => (props.$active ? "#FFFFFF" : "transparent")};
  color: ${(props) => (props.$active ? "#000000" : "#757575")};

  &:hover {
    opacity: 0.8;
  }
`;

const MissionList = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border-radius: 16px;
`;

const MissionCard = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:active {
    transform: scale(0.98);
  }
`;

const MissionHeader = styled.div`
  display: flex;
  gap: 16px;
`;

const MissionTitleSection = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1;
`;

const MissionContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const MissionBadge = styled.span`
  display: inline-block;
  font-size: 14px;
  font-weight: 700;
  color: #333333;
  width: fit-content;
`;

const MissionDuration = styled.div`
  font-size: 0.85rem;
  font-weight: 450;
  white-space: nowrap;
  color: #757575;
`;

const MissionDescription = styled.p`
  font-size: 14.6px;
  color: #757575;
`;

const MedalIcon = styled.img`
  width: 42px;
  height: 42px;
  object-fit: contain;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px;
  color: #757575;
`;

const StatusMessage = styled(EmptyState)`
  background-color: #ffffff;
  border-radius: 16px;
`;

const SuccessOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const SuccessModal = styled.div`
  background-color: #ffffff;
  border-radius: 24px;
  padding: 48px;
  text-align: center;
  max-width: 400px;
  margin: 0 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      transform: translateY(50px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const SuccessImage = styled.img`
  width: 120px;
  height: 120px;
  object-fit: contain;
  margin: 0 auto 24px;
  display: block;
`;

const SuccessTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: #333333;
  margin-bottom: 12px;
`;

const SuccessMessage = styled.p`
  font-size: 16px;
  color: #757575;
  line-height: 1.5;
  margin-bottom: 32px;
`;

const SuccessButton = styled.button`
  background-color: #3a6ea5;
  color: white;
  padding: 16px 48px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  transition: all 0.15s ease;

  &:hover {
    background-color: #205185;
  }

  &:active {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(108, 99, 255, 0.3);
  }
`;

const tierConfig = {
  all: { label: "전체", medal: null, color: "#333333" },
  bronze: { label: "브론즈", medal: DongMedal, color: "#cd7f32" },
  silver: { label: "실버", medal: EunMedal, color: "#b0b0b0" },
  gold: { label: "골드", medal: GeumMedal, color: "#d4af37" },
};

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const getTierMeta = (tier) => tierConfig[tier] || tierConfig.all;
const getMissionTitle = (mission) =>
  mission?.title || mission?.description || "미션";

function Mission() {
  const location = useLocation();
  const [missions, setMissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTier, setSelectedTier] = useState("all");
  const [activeMission, setActiveMission] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [completedMission, setCompletedMission] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchMissions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/missions/presets`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            "미션을 불러오지 못했어요. 잠시 후 다시 시도해주세요."
          );
        }

        const payload = await response.json();
        const data = Array.isArray(payload) ? payload : payload.missions;
        setMissions(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "알 수 없는 오류가 발생했어요.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchMissions();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    // 홈에서 전달된 미션이 있으면 자동 시작
    if (location.state?.autoStartMission) {
      setActiveMission(location.state.autoStartMission);
    }
  }, [location.state]);

  const filteredMissions =
    selectedTier === "all"
      ? missions
      : missions.filter((m) => m.tier === selectedTier);

  const handleStartMission = (mission) => {
    setActiveMission(mission);
  };

  const handleCompleteMission = async () => {
    try {
      // API로 미션 완료 기록 전송
      const response = await fetch(
        `${API_BASE_URL}/missions/presets/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            preset_mission_id: activeMission.id,
            tier: activeMission.tier,
            title: activeMission.title || activeMission.description,
            description: activeMission.description,
            duration: activeMission.duration,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("미션 완료 기록에 실패했습니다.");
      }

      setCompletedMission(activeMission);
      setActiveMission(null);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("미션 완료 처리 중 오류:", error);
      // 오류가 발생해도 UI는 업데이트
      setCompletedMission(activeMission);
      setActiveMission(null);
      setShowSuccessModal(true);
    }
  };

  const handleCancelMission = () => {
    setActiveMission(null);
  };

  const handleCloseSuccessModal = async () => {
    setShowSuccessModal(false);
    setCompletedMission(null);

    // 완료된 미션이 목록에서 사라지도록 미션 목록 다시 불러오기
    try {
      const response = await fetch(`${API_BASE_URL}/missions/presets`);
      if (response.ok) {
        const payload = await response.json();
        const data = Array.isArray(payload) ? payload : payload.missions;
        setMissions(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("미션 목록 새로고침 실패:", error);
    }
  };

  if (activeMission) {
    return (
      <MissionTimer
        mission={activeMission}
        onComplete={handleCompleteMission}
        onCancel={handleCancelMission}
      />
    );
  }

  return (
    <>
      <MissionContainer>
        <PageTitle>오늘의 미션</PageTitle>

        <ToggleContainer>
          {Object.entries(tierConfig).map(([tier, config]) => (
            <ToggleButton
              key={tier}
              $active={selectedTier === tier}
              onClick={() => setSelectedTier(tier)}
            >
              {config.label}
            </ToggleButton>
          ))}
        </ToggleContainer>

        {isLoading ? (
          <StatusMessage>미션을 불러오는 중입니다...</StatusMessage>
        ) : error ? (
          <StatusMessage>{error}</StatusMessage>
        ) : (
          <MissionList>
            {filteredMissions.length > 0 ? (
              filteredMissions.map((mission) => {
                const tierMeta = getTierMeta(mission.tier);
                return (
                  <MissionCard
                    key={mission.id}
                    onClick={() => handleStartMission(mission)}
                  >
                    <MissionHeader>
                      <MissionTitleSection>
                        {tierMeta.medal && (
                          <MedalIcon
                            src={tierMeta.medal}
                            alt={`${tierMeta.label} 메달`}
                          />
                        )}
                        <MissionContent>
                          <MissionBadge tierColor={tierMeta.color}>
                            {tierMeta.label} 메달 미션
                          </MissionBadge>
                          <MissionDescription>
                            {mission.description}
                          </MissionDescription>
                        </MissionContent>
                      </MissionTitleSection>
                      <MissionDuration tierColor={tierMeta.color}>
                        {mission.duration}분
                      </MissionDuration>
                    </MissionHeader>
                  </MissionCard>
                );
              })
            ) : (
              <EmptyState>해당 난이도의 미션이 없습니다</EmptyState>
            )}
          </MissionList>
        )}
      </MissionContainer>

      {showSuccessModal && completedMission && (
        <SuccessOverlay onClick={handleCloseSuccessModal}>
          <SuccessModal onClick={(e) => e.stopPropagation()}>
            <SuccessImage src={MisionSuccess} alt="미션 성공" />
            <SuccessTitle>미션 완료!</SuccessTitle>
            <SuccessMessage>
              {getMissionTitle(completedMission)} 미션을 성공적으로
              완료했습니다!
              <br />
              {completedMission.duration}분 동안 집중하셨네요!
            </SuccessMessage>
            <SuccessButton onClick={handleCloseSuccessModal}>
              확인
            </SuccessButton>
          </SuccessModal>
        </SuccessOverlay>
      )}
    </>
  );
}

export default Mission;
