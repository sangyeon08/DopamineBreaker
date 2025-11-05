import { createGlobalStyle } from "styled-components";
// 글로벌 스타일

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    height: 100%;
    font-family: 'Pretendard';
    font-size: 16px;
    color: #000000;
    background-color: #F3F3F3;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    background: none;
    outline: none;
  }

  input, textarea {
    font-family: inherit;
    border: none;
    outline: none;
  }

  ul, ol {
    list-style: none;
  }

  img {
    max-width: 100%;
    height: auto;
    display: block;
  }

  /* 스크롤바 스타일링 */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #F8F9FA;
  }

  ::-webkit-scrollbar-thumb {
    background: #E0E0E0;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #757575;
  }
`;

export default GlobalStyle;
