import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../context/AuthContext";
import ProfileImg from "../assets/Profile.png";
import DongMedal from "../assets/DongMedal.png";
import EunMedal from "../assets/EunMedal.png";
import GeumMedal from "../assets/GeumMedal.png";

const ProfileContainer = styled.div`
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
`;

const Header = styled.div`
  padding: 48px 32px 8px 32px;
  font-size: 24px;
  font-weight: 700;
  color: #000000;
  margin-bottom: 28px;
  line-height: 1.4;
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 0px 32px 0px 32px;
  margin-bottom: 32px;
`;

const Avatar = styled.img`
  width: 72px;
  height: 72px;
  border-radius: 50% 0% 0% 50%;
  object-fit: cover;
  margin-right: 16px;
  flex-shrink: 0;
`;

const Section = styled.section`
  background-color: #ffffff;
  border-radius: 16px;
  padding: 36px 28px;
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
  font-size: 22px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 22px;
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
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:active {
    transform: scale(0.98);
  }
`;

const MedalImageIcon = styled.img`
  width: 54px;
  height: 54px;
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
  line-height: 1.4;
`;

const MedalLabel = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #333333;
  line-height: 1.4;
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
  padding: 20px;
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
  margin-top: 24px;
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

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const tierConfig = {
  bronze: { label: "브론즈", color: "#CD7F32", medal: DongMedal },
  silver: { label: "실버", color: "#C0C0C0", medal: EunMedal },
  gold: { label: "골드", color: "#FFD700", medal: GeumMedal },
};

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [medalStats, setMedalStats] = useState({
    bronze: 0,
    silver: 0,
    gold: 0,
  });
  const [recentMissions, setRecentMissions] = useState([]);

  // 사용자 정보 기본값 설정
  const userName = user?.username || "사용자";
  const userId = user?.email || "@user";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const fetchMedals = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/missions/medals`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        setMedalStats(data.medals);
      } catch (error) {
        console.error("메달 정보를 불러오지 못했습니다:", error);
        // 오류 시 0으로 초기화
        setMedalStats({
          bronze: 0,
          silver: 0,
          gold: 0,
        });
      }
    };

    const fetchRecentMissions = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/missions/recent?limit=5`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await response.json();
        setRecentMissions(data.missions);
      } catch (error) {
        console.error("최근 미션을 불러오지 못했습니다:", error);
        setRecentMissions([]);
      }
    };

    // 사용자 정보가 로드된 후에만 데이터 가져오기
    if (user) {
      fetchMedals();
      fetchRecentMissions();
    }
  }, [user]);

  return (
    <ProfileContainer>
      <Header>프로필</Header>
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
            {Object.entries(tierConfig).map(([tier, config]) => (
              <MedalCard key={tier}>
                <MedalImageIcon src={config.medal} alt={config.label} />
                <MedalTextInfo>
                  <MedalCount>{medalStats[tier]}개의</MedalCount>
                  <MedalLabel>{config.label} 메달 획득</MedalLabel>
                </MedalTextInfo>
                <ArrowIcon>›</ArrowIcon>
              </MedalCard>
            ))}
          </MedalGrid>
        </MedalSection>

        <RecentMissions>
          <SectionTitle>최근 클리어한 미션</SectionTitle>
          <MissionList>
            {recentMissions.length > 0 ? (
              recentMissions.map((mission) => (
                <MissionItem key={mission.id}>
                  <MissionMedalIcon
                    src={tierConfig[mission.tier]?.medal || DongMedal}
                    alt={tierConfig[mission.tier]?.label || "메달"}
                  />
                  <MissionContent>
                    <MissionTitle>{mission.title}</MissionTitle>
                    <MissionDescription>
                      {mission.description}
                    </MissionDescription>
                  </MissionContent>
                </MissionItem>
              ))
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
    </ProfileContainer>
  );
}

export default Profile;
