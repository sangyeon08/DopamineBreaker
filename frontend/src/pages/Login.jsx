import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';

const PageContainer = styled.div`
  max-width: 480px;
  margin: 0 auto;
  padding: 24px;
  min-height: 100vh;
  display: flex;
  align-items: center;
`;

const ContentWrapper = styled.div`
  width: 100%;
`;

const Header = styled.div`
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #000000;
  margin-bottom: 10px;
  line-height: 1.4;
`;

const Subtitle = styled.p`
  font-size: 15px;
  font-weight: 400;
  color: #757575;
  line-height: 1.5;
`;

const FormCard = styled.form`
  background-color: #ffffff;
  border-radius: 16px;
  padding: 24px 20px;
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333333;
  margin-bottom: 4px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:focus {
    border-color: #0b84ff;
    box-shadow: 0 0 0 2px rgba(11, 132, 255, 0.12);
  }

  &::placeholder {
    color: #b0b0b0;
  }
`;

const Button = styled.button`
  margin-top: 8px;
  width: 100%;
  padding: 13px 0;
  border: none;
  border-radius: 12px;
  background-color: #0b84ff;
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease, transform 0.06s ease;

  &:hover {
    background-color: #0669cc;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const ErrorMessage = styled.p`
  margin-top: 2px;
  margin-bottom: 4px;
  color: #ff4d4f;
  font-size: 13px;
  text-align: left;
`;

const FooterText = styled.p`
  margin-top: 16px;
  font-size: 13px;
  color: #757575;
  text-align: center;

  a {
    color: #0b84ff;
    font-weight: 500;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
`;

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { ok, message } = await login(username, password);

    if (ok) {
      navigate('/');
    } else {
      setError(
        message || '로그인에 실패했습니다. 닉네임과 비밀번호를 다시 확인해주세요.',
      );
    }
  };

  return (
    <PageContainer>
      <ContentWrapper>
        <Header>
          <Title>
            오늘도 도파민을 관리해볼까요?
          </Title>
        </Header>

        <FormCard onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div>
            <Label>닉네임</Label>
            <Input
              type="text"
              placeholder="닉네임을 입력하세요"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <Label>비밀번호</Label>
            <Input
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit">로그인</Button>
        </FormCard>

        <FooterText>
          아직 계정이 없다면{' '}
          <Link to="/register">회원가입하기</Link>
        </FooterText>
      </ContentWrapper>
    </PageContainer>
  );
}

export default LoginPage;