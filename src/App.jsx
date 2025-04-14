import React from 'react';
import styled from 'styled-components';
import Background from './components/Background';
import Galaxy from './components/Galaxy';
import Tesseract from './components/Tesseract';
import Planet3D from './components/Planet3D';
import { GlobalStyle } from './GlobalStyle';

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 2rem;
`;

const Title = styled.h1`
  font-family: 'Orbitron', sans-serif;
  font-size: 4rem;
  font-weight: 700;
  text-align: center;
  margin: 0;
  padding: 2rem;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 20px rgba(79, 172, 254, 0.5);
  letter-spacing: 0.5rem;
  position: relative;
  z-index: 10;
  animation: glow 2s ease-in-out infinite alternate;
  will-change: transform, opacity;

  @keyframes glow {
    from {
      text-shadow: 0 0 20px rgba(79, 172, 254, 0.5);
    }
    to {
      text-shadow: 0 0 30px rgba(79, 172, 254, 0.8);
    }
  }
`;

const ContentContainer = styled.div`
  position: relative;
  width: 100%;
  height: calc(100% - 8rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 2rem;
`;

const InteractiveContainer = styled.div`
  position: relative;
  width: 100%;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  gap: 4rem;
  z-index: 2;
  margin: 2rem 0;
  
  & > * {
    flex-shrink: 0;
  }
`;

const EnterButton = styled.button`
  font-family: 'Orbitron', sans-serif;
  font-size: 1.5rem;
  padding: 1rem 3rem;
  margin-bottom: 2rem;
  background: transparent;
  border: 1px solid rgba(79, 172, 254, 0.5);
  color: #4facfe;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  z-index: 10;
  text-transform: uppercase;
  letter-spacing: 0.2rem;
  overflow: hidden;
  will-change: transform, background-color, box-shadow;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(79, 172, 254, 0.2), rgba(0, 242, 254, 0.2));
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: -1;
  }

  &:hover {
    border-color: #00f2fe;
    box-shadow: 0 0 20px rgba(79, 172, 254, 0.5);
    
    &:before {
      transform: translateX(0);
    }
  }
`;

function App() {
  return (
    <AppContainer>
      <GlobalStyle />
      <Background />
      <Galaxy />
      <ContentContainer>
        <Title>COSMIC CANVAS</Title>
        <InteractiveContainer>
          <Tesseract />
          <Planet3D />
        </InteractiveContainer>
        <EnterButton>PAINT THE COSMOS</EnterButton>
      </ContentContainer>
    </AppContainer>
  );
}

export default App;
