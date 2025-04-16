import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Background from './components/Background';
import Galaxy from './components/Galaxy';
import DrawingCanvas from './components/DrawingCanvas';
import GlobalStyle from './styles/GlobalStyle';

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
  background: #000;
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
  opacity: ${props => props.isTransitioning ? 0 : 1};
  transition: opacity 0.5s ease-out;

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
  z-index: 10;
`;

const EnterButton = styled.button`
  font-family: 'Orbitron', sans-serif;
  font-size: 1.5rem;
  padding: 1rem 2rem;
  border: 2px solid rgba(79, 172, 254, 0.5);
  border-radius: 30px;
  background: rgba(0, 0, 0, 0.5);
  color: #4facfe;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  z-index: 10;
  opacity: ${props => props.isTransitioning ? 0 : 1};
  transform: translateY(${props => props.isTransitioning ? '20px' : '0'});

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(79, 172, 254, 0.2),
      transparent
    );
    transition: 0.5s;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 20px rgba(79, 172, 254, 0.3);
    border-color: rgba(79, 172, 254, 0.8);

    &:before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(-1px);
  }
`;

// Landing Page Component
const LandingPage = () => {
  const navigate = useNavigate();
  const galaxyRef = React.useRef(null);
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  const handleEnterClick = () => {
    setIsTransitioning(true);
    if (galaxyRef.current) {
      galaxyRef.current.startTransition();
    }
  };

  return (
    <AppContainer>
      <Background isTransitioning={isTransitioning} />
      <Galaxy 
        ref={galaxyRef} 
        onTransitionComplete={() => {
          navigate('/canvas');
        }}
      />
      <ContentContainer>
        <Title isTransitioning={isTransitioning}>
          COSMIC CANVAS
        </Title>
        <EnterButton 
          onClick={handleEnterClick}
          isTransitioning={isTransitioning}
        >
          PAINT THE COSMOS
        </EnterButton>
      </ContentContainer>
    </AppContainer>
  );
};

// Main App Component
const App = () => {
  return (
    <Router>
      <GlobalStyle />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/canvas" element={<DrawingCanvas />} />
      </Routes>
    </Router>
  );
};

export default App;
