import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { IoEye, IoEyeOff } from "react-icons/io5";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";

const ErrorText = ({ children }) => (
  <StyledErrorText>{children}</StyledErrorText>
);

const LoginScreen = () => {
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [nicknameError, setNicknameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const isFormValid = nickname.trim().length > 0 && password.trim().length > 0;

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!nickname.trim()) {
      setNicknameError("닉네임을 입력해주세요.");
      return;
    }
    if (!password.trim()) {
      setPasswordError("비밀번호를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setAuthError("");
    try {
      const { ok, message } = await login(nickname.trim(), password);
      if (ok) {
        navigate("/");
      } else {
        setAuthError(message || "로그인 중 문제가 발생했습니다.");
      }
    } catch (error) {
      console.error("Login error", error);
      const message =
        error?.data?.message ||
        error?.message ||
        "로그인 중 문제가 발생했습니다.";
      setAuthError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNicknameChange = (event) => {
    setNickname(event.target.value);
    setNicknameError("");
    if (authError) setAuthError("");
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
    setPasswordError("");
    if (authError) setAuthError("");
  };

  const handleSignUpPress = () => {
    navigate("/register");
  };

  const submitLabel = isSubmitting ? "로그인 중..." : "로그인";

  return (
    <Container>
      <Card onSubmit={handleLogin}>
        <Content>
          <StepArea>
            <StepTitle>
              <LogoImg src={logo} alt="로고" />
              오늘도 도파민을 관리해볼까요?
            </StepTitle>

            <Field>
              <InputWrapper $hasError={Boolean(nicknameError)}>
                <StyledInput
                  value={nickname}
                  onChange={handleNicknameChange}
                  placeholder="닉네임을 입력해주세요."
                  autoComplete="username"
                />
              </InputWrapper>
              {nicknameError && <ErrorText>{nicknameError}</ErrorText>}
            </Field>

            <Field>
              <InputWrapper $hasError={Boolean(passwordError)}>
                <StyledInput
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="비밀번호를 입력해주세요."
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                />
                <ToggleButton
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                >
                  {showPassword ? <IoEyeOff /> : <IoEye />}
                </ToggleButton>
              </InputWrapper>
              {passwordError && <ErrorText>{passwordError}</ErrorText>}
            </Field>
            {authError && <ErrorText>{authError}</ErrorText>}
          </StepArea>
        </Content>

        <ButtonGroup>
          <PrimaryButton type="submit" disabled={!isFormValid || isSubmitting}>
            {submitLabel}
          </PrimaryButton>
          <LoginPrompt>
            <PromptText>아직 계정이 없으신가요?</PromptText>
            <TextButton type="button" onClick={handleSignUpPress}>
              회원가입
            </TextButton>
          </LoginPrompt>
        </ButtonGroup>
      </Card>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f1f1f1;
  padding: 40px 20px;
`;

const Card = styled.form`
  width: 100%;
  max-width: 420px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  gap: 24px;
  padding-top: 24px;
`;

const StepArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
`;

const LogoImg = styled.img`
  width: 28px;
  height: auto;
  margin-right: 8px;
  vertical-align: middle;
`;

const StepTitle = styled.h1`
  font-size: 20px;
  font-weight: 500;
  margin: 0;
  margin-bottom: 12px;
  color: #3a6ea5;
  font-family: "Paperlogy";
  display: flex;
  align-items: center;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 340px;
  border: 1px solid ${({ $hasError }) => ($hasError ? "#ff4444" : "#ededed")};
  border-radius: 15px;
  padding: 0 14px;
  background-color: #ffffff;
  transition: border-color 0.2s ease;

  &:focus-within {
    border-color: #87a8cb;
  }
`;

const StyledInput = styled.input`
  flex: 1;
  border: none;
  padding: 14px 4px;
  font-size: 16px;
  outline: none;
  background: transparent;
  font-family: "Pretendard";
  font-weight: 400;
  font-size: 16px;

  color: #111111;

  ::placeholder {
    color: #a7a7a7;
  }
`;

const ToggleButton = styled.button`
  border: none;
  background: none;
  color: #a7a7a7;
  font-size: 20px;
  cursor: pointer;
  padding: 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
`;

const StyledErrorText = styled.span`
  color: #ff4444;
  font-size: 14px;
  width: 340px;
  text-align: left;
  display: flex;
  align-items: center;
  padding-left: 2px;
  margin-top: 4px;
`;

const ButtonGroup = styled.div`
  margin-top: auto;
  width: 100%;
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 4px;
`;

const PrimaryButton = styled.button`
  width: 340px;
  padding: 15px;
  background-color: ${({ disabled }) => (disabled ? "#87a8cb" : "#3a6ea5")};
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  border: none;
  border-radius: 16px;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  transition: background-color 0.2s ease, transform 0.2s ease;

  &:hover {
    background-color: ${({ disabled }) => (disabled ? "#87a8cb" : "#205185")};
  }

  &:active {
    transform: ${({ disabled }) => (disabled ? "none" : "translateY(1px)")};
  }
`;

const LoginPrompt = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
`;

const PromptText = styled.span`
  font-size: 14px;
  color: #666666;
`;

const TextButton = styled.button`
  border: none;
  background: none;
  color: #3a6ea5;
  font-size: 14px;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
`;

export default LoginScreen;
