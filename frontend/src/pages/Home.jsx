import { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { TIER_CONFIG } from "../constants";
import { formatTime } from "../utils/helpers";
import { missionApi } from "../services/api";

const HomeContainer = styled.div`
  max-width: 480px;
  margin: 0 auto;
  padding: 24px;
  padding-bottom: 24px;
`;

const PageTitle = styled.h1`
  margin-top: 32px;
  padding: 0 0 28px 0;
  font-size: 24px;
  font-weight: 700;
  color: #000000;
  line-height: 1.4;
`;

const SectionTitle = styled.p`
  font-size: 22px;
  font-weight: 600;
  color: #000000;
  margin-bottom: 16px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ViewAllButton = styled.button`
  font-family: "Font Awesome 5 Pro";
  font-weight: 500;
  font-size: 28px;
  color: #333333;
  cursor: pointer;
  padding-right: 8px;
`;

const Section = styled.section`
  margin-bottom: 48px;
`;

const UsageCard = styled.div`
  background-color: #ffffff;
  border-radius: 16px;
  padding: 18px;
`;

const ChartContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0px;
`;

const ChartArea = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 260px;
  gap: 12px;
  padding: 0 16px 3px 16px;
  position: relative;
  background-image: repeating-linear-gradient(
    to top,
    transparent,
    transparent 49px,
    #d6d6d6 49px,
    #d6d6d6 50px
  );
`;

const BarWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  position: relative;
  z-index: 1;
`;

const Bar = styled.div`
  width: 100%;
  max-width: 120px;
  background: ${(props) => props.color};
  border-radius: 8px 8px 0 0;
  height: ${(props) => props.height}px;
  transition: height 0.3s ease;
`;

const BarTime = styled.div`
  font-size: 14px;
  font-weight: 400;
  margin: 0px;
  color: #000000;
`;

const BarLabel = styled.div`
  font-size: 14px;
  margin-top: 8px;
  font-weight: 400;
  color: ${(props) => props.color};
  text-align: center;
  word-break: keep-all;
`;

const MissionGrid = styled.div`
  display: grid;
  background-color: #ffffff;
  border-radius: 16px;
  max-width: 480px;
`;

const MissionCardSmall = styled.div`
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

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userName = user?.username || "사용자";
  const [currentDate, setCurrentDate] = useState("");
  const [usageData, setUsageData] = useState({
    categories: [],
  });
  const [quickMissions, setQuickMissions] = useState([]);

  useEffect(() => {
    const date = new Date();
    setCurrentDate(`${date.getMonth() + 1}월 ${date.getDate()}일`);

    setUsageData({
      categories: [
        { name: "엔터테인먼트", time: 150, color: "#0B84FF" },
        { name: "생산성 및 금융", time: 85, color: "#6AC4DC" },
        { name: "소셜 미디어", time: 107, color: "#FF9F0B" },
      ],
    });

    const fetchMissions = async () => {
      try {
        const data = await missionApi.getPresets();
        setQuickMissions(data.slice(0, 4));
      } catch (error) {
        console.error("미션을 불러오지 못했습니다:", error);
      }
    };

    fetchMissions();
  }, []);

  const handleMissionClick = (mission) => {
    navigate("/mission", { state: { autoStartMission: mission } });
  };

  return (
    <HomeContainer>
      <PageTitle>
        {userName}님<br />
        잠시 쉬어가볼까요?
      </PageTitle>
      <SectionTitle>{currentDate} 사용 내용</SectionTitle>

      <Section>
        <UsageCard>
          <ChartContainer>
            <ChartArea>
              {usageData.categories.map((category, index) => {
                const maxTime = Math.max(
                  ...usageData.categories.map((c) => c.time)
                );
                const maxHeight = 200;
                const barHeight = (category.time / maxTime) * maxHeight;

                return (
                  <BarWrapper key={index}>
                    <Bar color={category.color} height={barHeight} />
                    <BarLabel color={category.color}>{category.name}</BarLabel>
                    <BarTime>{formatTime(category.time)}</BarTime>
                  </BarWrapper>
                );
              })}
            </ChartArea>
          </ChartContainer>
        </UsageCard>
      </Section>

      <Section>
        <SectionHeader>
          <SectionTitle style={{ marginBottom: 0, paddingLeft: "4px" }}>
            오늘의 미션
          </SectionTitle>
          <ViewAllButton onClick={() => navigate("/mission")}>
            {">"}
          </ViewAllButton>
        </SectionHeader>
        <MissionGrid>
          {quickMissions.map((mission) => {
            const tierMeta = TIER_CONFIG[mission.tier];
            return (
              <MissionCardSmall
                key={mission.id}
                onClick={() => handleMissionClick(mission)}
              >
                <MissionHeader>
                  <MissionTitleSection>
                    {tierMeta?.medal && (
                      <MedalIcon
                        src={tierMeta.medal}
                        alt={`${tierMeta.label} 메달`}
                      />
                    )}
                    <MissionContent>
                      <MissionBadge>{tierMeta?.label} 메달 미션</MissionBadge>
                      <MissionDescription>
                        {mission.description}
                      </MissionDescription>
                    </MissionContent>
                  </MissionTitleSection>
                  <MissionDuration>{mission.duration}분</MissionDuration>
                </MissionHeader>
              </MissionCardSmall>
            );
          })}
        </MissionGrid>
      </Section>
    </HomeContainer>
  );
}

export default Home;
