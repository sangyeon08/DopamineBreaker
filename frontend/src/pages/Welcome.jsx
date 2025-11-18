import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 12px;
  background-color: #f1f1f1;
`;

const LogoContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Logo = styled.img`
  width: 120px;
  height: auto;
  object-fit: contain;
`;

const LogoText = styled.h1`
  font-size: 20px;
  font-weight: 500;
  color: #3a6ea5;
  font-family: "Paperlogy";
  margin-top: 24px;
`;

const ButtonSection = styled.div`
  width: 100%;
  max-width: 340px;
  margin-top: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const PrimaryButton = styled.button`
  width: 100%;
  background-color: #3a6ea5;
  color: #ffffff;
  font-weight: 600;
  font-size: 18px;
  padding: 15px;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #205185;
  }
`;

const LoginContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 6px;
  margin-bottom: 44px;
`;

const LoginText = styled.span`
  font-size: 14px;
  color: #666666;
`;

const LoginLink = styled.button`
  background: none;
  border: none;
  color: #3a6ea5;
  font-size: 14px;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
`;

const Welcome = () => {
  const navigate = useNavigate();

  const handleSignUp = () => {
    navigate("/register");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <Container>
      <LogoContainer>
        <Logo src={logo} alt="DopamineBreaker" />
        <LogoText>오늘의 도파민을 관리해볼까요?</LogoText>
      </LogoContainer>
      <ButtonSection>
        <PrimaryButton type="button" onClick={handleSignUp}>
          시작하기
        </PrimaryButton>
        <LoginContainer>
          <LoginText>만약 계정이 있다면?</LoginText>
          <LoginLink type="button" onClick={handleLogin}>
            로그인하기
          </LoginLink>
        </LoginContainer>
      </ButtonSection>
    </Container>
  );
};

export default Welcome;
