import styled from 'styled-components';

export const Container = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: #000;
`;

export const Background = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  background: linear-gradient(to bottom, #000000, #1a1a2e);
`;

export const ContentWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 10;
`;

export const Title = styled.h1`
  font-size: 4rem;
  color: #fff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  margin-bottom: 2rem;
  opacity: ${props => props.isTransitioning ? 0 : 1};
  transform: ${props => props.isTransitioning ? 'translateY(-20px)' : 'translateY(0)'};
  transition: opacity 1s ease-out, transform 1s ease-out;
  font-family: 'Space Grotesk', sans-serif;
  letter-spacing: 0.2em;
`;

export const EnterButton = styled.button`
  padding: 1rem 2rem;
  font-size: 1.5rem;
  background: transparent;
  border: 2px solid #fff;
  color: #fff;
  cursor: pointer;
  border-radius: 30px;
  transition: all 0.3s ease-out;
  font-family: 'Space Grotesk', sans-serif;
  letter-spacing: 0.1em;
  opacity: ${props => props.isTransitioning ? 0 : 1};
  transform: ${props => props.isTransitioning ? 'translateY(20px)' : 'translateY(0)'};
  transition: all 1s ease-out;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
    transform: ${props => props.isTransitioning ? 'translateY(20px)' : 'translateY(-2px)'};
  }

  &:active {
    transform: ${props => props.isTransitioning ? 'translateY(20px)' : 'translateY(0)'};
  }
`; 