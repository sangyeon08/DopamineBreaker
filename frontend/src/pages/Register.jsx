import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

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

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState(''); // 닉네임 = username
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    const { ok, message } = await register(email, username, password);

    if (ok) {
      alert('회원가입에 성공했습니다! 로그인 페이지로 이동합니다.');
      navigate('/login');
    } else {
      setError(message || '회원가입 중 오류가 발생했습니다.');
    }
  };

  return (
    <PageContainer>
      <ContentWrapper>
        <Header>
          <Title>
            반가워요!<br />
            도파민 브레이커에 처음 오셨군요.
          </Title>
        </Header>

        <FormCard onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div>
            <Label>이메일</Label>
            <Input
              type="email"
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

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

          <div>
            <Label>비밀번호 확인</Label>
            <Input
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit">회원가입 완료</Button>
        </FormCard>

        <FooterText>
          이미 계정이 있다면{' '}
          <Link to="/login">로그인하기</Link>
        </FooterText>
      </ContentWrapper>
    </PageContainer>
  );
}

export default RegisterPage;