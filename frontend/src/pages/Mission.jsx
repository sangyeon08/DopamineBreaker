import { useState } from "react";
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
  margin-bottom: 32px;
`;

const ToggleButton = styled.button`
  flex: 1;
  padding: 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.15s ease;
  background-color: ${(props) => (props.active ? "#FFFFFF" : "transparent")};
  color: ${(props) => (props.active ? "#000000" : "#757575")};

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
  font-weight: 600;
  color: ${(props) => props.tierColor};
  width: fit-content;
`;

const MissionDuration = styled.div`
  font-size: 0.85rem;
  font-weight: 450;
  white-space: nowrap;
`;

const MissionDescription = styled.p`
  font-size: 14px;
  color: #757575;
`;

const MedalIcon = styled.img`
  width: 40px;
  height: 40px;
  object-fit: contain;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px;
  color: #757575;
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
  width: 200px;
  height: 200px;
  object-fit: contain;
  margin-bottom: 24px;
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
  background-color: #6c63ff;
  color: white;
  padding: 16px 48px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  transition: all 0.15s ease;

  &:hover {
    background-color: #5a52d5;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(108, 99, 255, 0.3);
  }
`;

const missions = [
  {
    id: 1,
    description: "간단한 목과 어깨 스트레칭으로 긴장을 풀어보세요",
    duration: 5,
    tier: "bronze",
    category: "physical",
  },
  {
    id: 2,
    description: "깊은 호흡으로 마음을 안정시켜보세요",
    duration: 10,
    tier: "bronze",
    category: "mental",
  },
  {
    id: 3,
    description: "물 한 잔을 천천히 마시며 수분을 보충하세요",
    duration: 3,
    tier: "bronze",
    category: "health",
  },
  {
    id: 4,
    description: "좋아하는 책을 읽으며 휴식을 취해보세요",
    duration: 20,
    tier: "silver",
    category: "mental",
  },
  {
    id: 5,
    description: "밖에 나가서 짧은 산책을 즐겨보세요",
    duration: 15,
    tier: "silver",
    category: "physical",
  },
  {
    id: 6,
    description: "기본 요가 동작으로 몸과 마음을 정돈하세요",
    duration: 30,
    tier: "gold",
    category: "physical",
  },
  {
    id: 7,
    description: "긴 시간 동안 집중 명상을 해보세요",
    duration: 25,
    tier: "gold",
    category: "mental",
  },
];

const tierConfig = {
  all: { label: "전체", medal: null },
  bronze: { label: "브론즈", medal: DongMedal },
  silver: { label: "실버", medal: EunMedal },
  gold: { label: "골드", medal: GeumMedal },
};

function Mission() {
  const [selectedTier, setSelectedTier] = useState("all");
  const [activeMission, setActiveMission] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [completedMission, setCompletedMission] = useState(null);

  const filteredMissions =
    selectedTier === "all"
      ? missions
      : missions.filter((m) => m.tier === selectedTier);

  const handleStartMission = (mission) => {
    setActiveMission(mission);
  };

  const handleCompleteMission = () => {
    // TODO: API로 미션 완료 기록 전송
    setCompletedMission(activeMission);
    setActiveMission(null);
    setShowSuccessModal(true);
  };

  const handleCancelMission = () => {
    setActiveMission(null);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setCompletedMission(null);
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
              active={selectedTier === tier}
              onClick={() => setSelectedTier(tier)}
            >
              {config.label}
            </ToggleButton>
          ))}
        </ToggleContainer>

        <MissionList>
          {filteredMissions.length > 0 ? (
            filteredMissions.map((mission) => (
              <MissionCard
                key={mission.id}
                onClick={() => handleStartMission(mission)}
              >
                <MissionHeader>
                  <MissionTitleSection>
                    {tierConfig[mission.tier].medal && (
                      <MedalIcon
                        src={tierConfig[mission.tier].medal}
                        alt={`${tierConfig[mission.tier].label} 메달`}
                      />
                    )}
                    <MissionContent>
                      <MissionBadge tierColor={tierConfig[mission.tier].color}>
                        {tierConfig[mission.tier].label + " 메달 미션"}
                      </MissionBadge>
                      <MissionDescription>
                        {mission.description}
                      </MissionDescription>
                    </MissionContent>
                  </MissionTitleSection>
                  <MissionDuration tierColor={tierConfig[mission.tier].color}>
                    {mission.duration}분
                  </MissionDuration>
                </MissionHeader>
              </MissionCard>
            ))
          ) : (
            <EmptyState>해당 난이도의 미션이 없습니다</EmptyState>
          )}
        </MissionList>
      </MissionContainer>

      {showSuccessModal && completedMission && (
        <SuccessOverlay onClick={handleCloseSuccessModal}>
          <SuccessModal onClick={(e) => e.stopPropagation()}>
            <SuccessImage src={MisionSuccess} alt="미션 성공" />
            <SuccessTitle>미션 완료!</SuccessTitle>
            <SuccessMessage>
              {completedMission.title} 미션을 성공적으로 완료했습니다!
              <br />
              {completedMission.duration}분 동안 집중하셨네요!
            </SuccessMessage>
            {tierConfig[completedMission.tier].medal && (
              <MedalIcon
                src={tierConfig[completedMission.tier].medal}
                alt={`${tierConfig[completedMission.tier].label} 메달`}
                style={{ margin: "0 auto 24px" }}
              />
            )}
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
