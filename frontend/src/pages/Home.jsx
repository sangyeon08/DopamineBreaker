import { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const HomeContainer = styled.div`
  max-width: 480px;
  margin: 0 auto;
  padding: 24px;
  padding-bottom: 100px;
`;

const Header = styled.div`
  margin-top: 32px;
`;

const Greeting = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #000000;
  margin-bottom: 28px;
  line-height: 1.4;
`;

const SectionTitle = styled.p`
  font-size: 22px;
  font-weight: 600;
  color: #000000;
  margin-bottom: 16px;
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
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const MissionCardSmall = styled.div`
  background: ${(props) => props.gradient};
  padding: 24px;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: transform 0.15s ease;

  &:hover {
    transform: translateY(-4px);
  }
`;

const MissionTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const MissionDuration = styled.div`
  font-size: 14px;
  opacity: 0.9;
`;

function Home() {
  const navigate = useNavigate();
  const [userName] = useState("사용자");
  const [currentDate, setCurrentDate] = useState("");
  const [usageData, setUsageData] = useState({
    categories: [],
  });

  useEffect(() => {
    // 현재 날짜 설정
    const date = new Date();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    setCurrentDate(`${month}월 ${day}일`);

    // TODO: API에서 사용 기록 가져오기
    // 임시 데이터
    setUsageData({
      categories: [
        { name: "엔터테인먼트", time: 150, color: "#0B84FF" },
        { name: "생산성 및 금융", time: 85, color: "#6AC4DC" },
        { name: "소셜 미디어", time: 107, color: "#FF9F0B" },
      ],
    });
  }, []);

  const quickMissions = [
    {
      id: 1,
      title: "스트레칭",
      duration: "5분",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      id: 2,
      title: "심호흡",
      duration: "10분",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      id: 3,
      title: "산책",
      duration: "15분",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
    {
      id: 4,
      title: "독서",
      duration: "20분",
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    },
  ];

  const handleMissionClick = () => {
    navigate("/mission");
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`;
  };

  return (
    <HomeContainer>
      <Header>
        <Greeting>
          {userName}님<br />
          잠시 쉬어가볼까요?
        </Greeting>
        <SectionTitle>{currentDate} 사용 내용</SectionTitle>
      </Header>

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
        <SectionTitle>오늘의 미션</SectionTitle>
        <MissionGrid>
          {quickMissions.map((mission) => (
            <MissionCardSmall
              key={mission.id}
              gradient={mission.gradient}
              onClick={handleMissionClick}
            >
              <MissionTitle>{mission.title}</MissionTitle>
              <MissionDuration>{mission.duration}</MissionDuration>
            </MissionCardSmall>
          ))}
        </MissionGrid>
      </Section>
    </HomeContainer>
  );
}

export default Home;
