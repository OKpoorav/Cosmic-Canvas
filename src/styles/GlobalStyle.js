import { createGlobalStyle } from 'styled-components';
import cursorImage from '../assets/cursor.svg';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
    touch-action: none;
  }

  /* Apply custom cursor to all elements except canvas, and only on non-touch devices */
  @media (hover: hover) {
    *:not(canvas) {
      cursor: url(${cursorImage}) 16 16, auto !important;
    }
  }

  body {
    font-family: 'Orbitron', sans-serif;
    background: #000;
    color: #fff;
    overflow: hidden;
    min-height: 100vh;
    min-height: -webkit-fill-available;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overscroll-behavior: none;
  }

  html {
    height: -webkit-fill-available;
  }

  #root {
    width: 100vw;
    height: 100vh;
    height: -webkit-fill-available;
    overflow: hidden;
  }

  button {
    font-family: 'Orbitron', sans-serif;
    -webkit-touch-callout: none;
    user-select: none;
  }

  canvas {
    display: block;
    touch-action: none;
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(79, 172, 254, 0.5);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(79, 172, 254, 0.8);
  }
`;

export default GlobalStyle; 