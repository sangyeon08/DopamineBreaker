import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../context/AuthContext";
import ProfileImg from "../assets/Profile.png";
import { TIER_CONFIG } from "../constants";
import { missionApi } from "../services/api";

const ProfileContainer = styled.div`
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  padding: 24px 24px 0px 24px;
`;

const PageTitle = styled.h1`
  margin-top: 32px;
  padding: 0px 0px 28px 0px;
  font-size: 24px;
  font-weight: 700;
  color: #000000;
  line-height: 1.4;
  margin-bottom: 4px;
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 0px 0px 0px 12px;
  margin-bottom: 32px;
`;

const Avatar = styled.img`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 16px;
  flex-shrink: 0;
`;

const Section = styled.section`
  background-color: #ffffff;
  border-radius: 16px 16px 0px 0px;
  padding: 28px;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const UserName = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #333333;
  margin: 0;
`;

const UserId = styled.p`
  font-size: 15px;
  color: #333333;
  font-weight: 500;
  margin: 0;
`;

const MedalSection = styled.section`
  margin-bottom: 48px;
`;

const SectionTitle = styled.h2`
  font-size: 21px;
  font-weight: 600;
  color: #333333;
  margin-top: 6px;
  margin-bottom: 24px;
`;

const MedalGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MedalCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:active {
    transform: scale(0.98);
  }
`;

const MedalImageIcon = styled.img`
  width: 52px;
  height: 52px;
  object-fit: contain;
`;

const MedalTextInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-left: 4px;
`;

const MedalCount = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #333333;
`;

const MedalLabel = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #333333;
`;

const ArrowIcon = styled.span`
  font-family: "Font Awesome 5 Pro";
  font-weight: 400;
  font-size: 28px;
  color: #333333;
  cursor: pointer;
`;

const RecentMissions = styled.section``;

const MissionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MissionItem = styled.div`
  border-radius: 12px;
  padding: 8px 0px;
  display: flex;
  gap: 16px;
  align-items: center;
`;

const MissionMedalIcon = styled.img`
  width: 42px;
  height: 42px;
  object-fit: contain;
`;

const MissionContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const MissionTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #333333;
`;

const MissionDescription = styled.p`
  font-size: 14.6px;
  color: #757575;
`;

const LogoutButton = styled.button`
  width: 100%;
  margin-top: 32px;
  padding: 16px;
  background-color: #f5f5f5;
  color: #333333;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background-color: #eeeeee;
  }

  &:active {
    transform: scale(0.98);
    background-color: #e0e0e0;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background-color: #ffffff;
  border-radius: 16px;
  max-width: 432px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  padding: 32px;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ModalTitle = styled.h2`
  font-size: 22px;
  font-weight: 700;
  color: #333333;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CloseButton = styled.button`
  font-size: 28px;
  color: #757575;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  line-height: 1;

  &:hover {
    color: #333333;
  }
`;

const ModalMissionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const EmptyMessage = styled.p`
  text-align: center;
  color: #757575;
  padding: 40px 20px;
  font-size: 15px;
`;

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [medalStats, setMedalStats] = useState({
    bronze: 0,
    silver: 0,
    gold: 0,
  });
  const [recentMissions, setRecentMissions] = useState([]);
  const [selectedTier, setSelectedTier] = useState(null);
  const [tierMissions, setTierMissions] = useState([]);
  const [isLoadingTier, setIsLoadingTier] = useState(false);
  const userName = user?.username || "사용자";
  const userId = user?.email || "@user";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // 메달 클릭 시 해당 티어의 완료한 미션 목록을 모달로 표시
  const handleMedalClick = async (tier) => {
    setSelectedTier(tier);
    setIsLoadingTier(true);
    try {
      const missions = await missionApi.getByTier(tier);
      setTierMissions(missions);
    } catch (error) {
      console.error(`${tier} 미션 불러오기 실패:`, error);
      setTierMissions([]);
    } finally {
      setIsLoadingTier(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedTier(null);
    setTierMissions([]);
  };

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // 메달 통계와 최근 미션을 병렬로 가져와 성능 최적화
        const [medalsData, recentData] = await Promise.all([
          missionApi.getMedals(),
          missionApi.getRecent(5),
        ]);
        setMedalStats(medalsData.medals);
        setRecentMissions(recentData);
      } catch (error) {
        console.error("데이터 불러오기 실패:", error);
        setMedalStats({ bronze: 0, silver: 0, gold: 0 });
        setRecentMissions([]);
      }
    };

    fetchData();
  }, [user]);

  return (
    <ProfileContainer>
      <PageTitle>프로필</PageTitle>
      <ProfileHeader>
        <Avatar src={ProfileImg} alt="프로필" />
        <UserInfo>
          <UserName>{userName}</UserName>
          <UserId>{userId}</UserId>
        </UserInfo>
      </ProfileHeader>
      <Section>
        <MedalSection>
          <SectionTitle>획득한 메달</SectionTitle>
          <MedalGrid>
            {Object.entries(TIER_CONFIG)
              .filter(([tier]) => tier !== "all")
              .map(([tier, config]) => (
                <MedalCard key={tier} onClick={() => handleMedalClick(tier)}>
                  <MedalImageIcon src={config.medal} alt={config.label} />
                  <MedalTextInfo>
                    <MedalCount>{medalStats[tier]}개의</MedalCount>
                    <MedalLabel>{config.label} 메달 획득</MedalLabel>
                  </MedalTextInfo>
                  <ArrowIcon>{">"}</ArrowIcon>
                </MedalCard>
              ))}
          </MedalGrid>
        </MedalSection>

        <RecentMissions>
          <SectionTitle>최근 클리어한 미션</SectionTitle>
          <MissionList>
            {recentMissions.length > 0 ? (
              recentMissions.map((mission) => {
                const tierMeta = TIER_CONFIG[mission.tier];
                return (
                  <MissionItem key={mission.id}>
                    <MissionMedalIcon
                      src={tierMeta?.medal}
                      alt={tierMeta?.label || "메달"}
                    />
                    <MissionContent>
                      <MissionTitle>{mission.title}</MissionTitle>
                      <MissionDescription>
                        {mission.description}
                      </MissionDescription>
                    </MissionContent>
                  </MissionItem>
                );
              })
            ) : (
              <MissionDescription
                style={{ textAlign: "center", padding: "20px" }}
              >
                아직 클리어한 미션이 없습니다.
              </MissionDescription>
            )}
          </MissionList>
        </RecentMissions>
        <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
      </Section>

      {selectedTier && (
        <ModalOverlay onClick={handleCloseModal}>
          <ModalContainer onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {TIER_CONFIG[selectedTier]?.label} 메달 미션
              </ModalTitle>
              <CloseButton onClick={handleCloseModal}>×</CloseButton>
            </ModalHeader>

            {isLoadingTier ? (
              <EmptyMessage>미션을 불러오는 중...</EmptyMessage>
            ) : tierMissions.length > 0 ? (
              <ModalMissionList>
                {tierMissions.map((mission, index) => (
                  <MissionItem key={mission.id || index}>
                    <MissionMedalIcon
                      src={TIER_CONFIG[selectedTier]?.medal}
                      alt={TIER_CONFIG[selectedTier]?.label}
                    />
                    <MissionContent>
                      <MissionTitle>
                        {mission.title || mission.description}
                      </MissionTitle>
                      <MissionDescription>
                        {mission.description}
                      </MissionDescription>
                    </MissionContent>
                  </MissionItem>
                ))}
              </ModalMissionList>
            ) : (
              <EmptyMessage>
                아직 {TIER_CONFIG[selectedTier]?.label} 미션을 완료하지
                않았습니다.
              </EmptyMessage>
            )}
          </ModalContainer>
        </ModalOverlay>
      )}
    </ProfileContainer>
  );
}

export default Profile;
