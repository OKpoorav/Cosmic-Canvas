import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const CanvasContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgb(0, 0, 0);
  overflow: hidden;
`;

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: none;

  &:active {
    cursor: none;
  }
`;

const ControlsContainer = styled.div`
  position: fixed;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 20px;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.8);
  padding: 20px;
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);

  @media (max-width: 768px) {
    left: 0;
    right: 0;
    bottom: 0;
    top: auto;
    transform: none;
    flex-direction: row;
    align-items: center;
    padding: 15px;
    gap: 15px;
    border-radius: 15px 15px 0 0;
    border-bottom: none;
  }
`;

const ColorPaletteContainer = styled.div`
  @media (max-width: 768px) {
    max-width: 50%;
    overflow-x: scroll;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding: 5px;
    margin: 0 -5px;
    touch-action: pan-x;
    
    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const ColorPalette = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  @media (max-width: 768px) {
    flex-direction: row;
    min-width: max-content;
    padding-right: 15px;
    gap: 10px;
    touch-action: none;
  }
`;

const ColorButton = styled.button`
  width: 40px;
  height: 40px;
  min-width: 40px;
  min-height: 40px;
  border-radius: 50%;
  border: 2px solid ${props => props.$isSelected ? '#fff' : 'transparent'};
  background: ${props => props.$color};
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 0 10px ${props => props.$color}80;
  touch-action: manipulation;
  
  @media (max-width: 768px) {
    margin: 0 5px;
    &:first-child {
      margin-left: 0;
    }
    &:last-child {
      margin-right: 0;
    }
  }
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 0 15px ${props => props.$color};
  }

  &:active {
    transform: scale(0.95);
  }
`;

const BrushControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  @media (max-width: 768px) {
    flex-direction: row;
    align-items: center;
    gap: 15px;
    min-width: 120px;
  }
`;

const BrushSlider = styled.input`
  -webkit-appearance: none;
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: linear-gradient(to right, #4facfe, #00f2fe);
  outline: none;
  margin: 10px 0;
  cursor: pointer;

  @media (max-width: 768px) {
    width: 120px;
    margin: 0;
    height: 6px;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    cursor: pointer;
    transition: all 0.2s ease;

    @media (max-width: 768px) {
      width: 24px;
      height: 24px;
      box-shadow: 0 0 15px rgba(79, 172, 254, 0.5);
    }
  }

  &::-webkit-slider-thumb:hover {
    transform: scale(1.1);
  }
`;

const BrushSizeDisplay = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    font-size: 0.8rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
`;

const TopControls = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
  z-index: 1000;

  @media (max-width: 768px) {
    top: 10px;
    right: 10px;
    gap: 5px;
  }
`;

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 8px;
  color: white;
  padding: 8px 16px;
  cursor: pointer;
  font-family: 'Orbitron', sans-serif;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 0.9rem;
  }
`;

const EffectsControls = styled.div`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.8);
  padding: 10px;
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);

  @media (max-width: 768px) {
    bottom: 100px;
  }
`;

const EffectButton = styled(ActionButton)`
  background: ${props => props.$isActive ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  font-size: 12px;
`;

const LogoButton = styled.button`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'Orbitron', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  z-index: 1000;
  padding: 10px 20px;
  text-shadow: 0 0 10px rgba(79, 172, 254, 0.5);
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 0.2rem;

  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 8px 12px;
    top: 10px;
    left: 10px;
    transform: none;
    letter-spacing: 0.1rem;
  }

  &:hover {
    transform: translateX(-50%) scale(1.05);
    text-shadow: 0 0 20px rgba(79, 172, 254, 0.8);

    @media (max-width: 768px) {
      transform: scale(1.05);
    }
  }

  &:active {
    transform: translateX(-50%) scale(0.95);

    @media (max-width: 768px) {
      transform: scale(0.95);
    }
  }
`;

const BrushPreview = styled.div`
  position: fixed;
  pointer-events: none;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  border: 2px solid ${props => props.$color};
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.2s, height 0.2s;
  z-index: 9999;
  opacity: 0.5;
  box-shadow: 0 0 10px ${props => props.$color};
  display: ${props => props.$isDrawing ? 'none' : 'block'};
  background: ${props => props.$isDrawing ? props.$color : 'transparent'};
`;

const CustomCursor = styled.div`
  position: fixed;
  pointer-events: none;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.2s, height 0.2s;
  z-index: 9999;
  mix-blend-mode: difference;
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 4px;
    height: 4px;
    background: white;
    border-radius: 50%;
  }
`;

const COLORS = [
  '#00a8ff', // Bright blue
  '#ff3399', // Neon pink
  '#9b59b6', // Purple
  '#2ecc71', // Emerald
  '#f1c40f', // Yellow
  '#e74c3c', // Red
  '#ffffff', // White
];

const DrawingCanvas = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const particleCanvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(5);
  const [effects, setEffects] = useState({
    glow: true,
    particles: true,
    motionBlur: false
  });
  const particlesRef = useRef([]);
  const animationFrameRef = useRef(null);
  const dprRef = useRef(window.devicePixelRatio || 1);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const colorPaletteRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollStartXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const particleCanvas = particleCanvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const particleCtx = particleCanvas.getContext('2d', { willReadFrequently: true });
    
    const resizeCanvas = () => {
      dprRef.current = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      // Set the canvas size in pixels
      canvas.width = rect.width * dprRef.current;
      canvas.height = rect.height * dprRef.current;
      particleCanvas.width = rect.width * dprRef.current;
      particleCanvas.height = rect.height * dprRef.current;
      
      // Reset the context after resize
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      particleCtx.lineCap = 'round';
      particleCtx.lineJoin = 'round';
      particleCtx.imageSmoothingEnabled = true;
      particleCtx.imageSmoothingQuality = 'high';
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const getEventPoint = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const dpr = dprRef.current;
    
    // Handle both mouse and touch events
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    return {
      x: (clientX - rect.left) * dpr,
      y: (clientY - rect.top) * dpr
    };
  }, []);

  const createParticles = useCallback((x, y, color) => {
    const numParticles = Math.min(5, Math.floor(brushSize / 2));
    const dpr = dprRef.current;
    
    for (let i = 0; i < numParticles; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 2;
      particlesRef.current.push({
        x: x / dpr,
        y: y / dpr,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color,
        size: (1 + Math.random() * 2) * dpr
      });
    }
  }, [brushSize]);

  const updateParticles = useCallback(() => {
    if (!particleCanvasRef.current) return;
    
    const ctx = particleCanvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, particleCanvasRef.current.width, particleCanvasRef.current.height);

    particlesRef.current = particlesRef.current.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;

      if (p.life <= 0) return false;

      ctx.beginPath();
      ctx.fillStyle = p.color + Math.floor(p.life * 255).toString(16).padStart(2, '0');
      ctx.shadowBlur = 20;
      ctx.shadowColor = p.color;
      ctx.arc(p.x * dprRef.current, p.y * dprRef.current, p.size, 0, Math.PI * 2);
      ctx.fill();

      return true;
    });

    animationFrameRef.current = requestAnimationFrame(updateParticles);
  }, []);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(updateParticles);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [updateParticles]);

  const handleStart = useCallback((e) => {
    e.preventDefault(); // Prevent scrolling on mobile
    isDrawingRef.current = true;
    lastPointRef.current = getEventPoint(e);
  }, [getEventPoint]);

  const handleMove = useCallback((e) => {
    e.preventDefault(); // Prevent scrolling on mobile
    const point = getEventPoint(e);
    setCursorPos({ x: e.touches ? e.touches[0].clientX : e.clientX, y: e.touches ? e.touches[0].clientY : e.clientY });
    
    if (isDrawingRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      ctx.beginPath();
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = brushSize * dprRef.current;
      
      if (effects.glow) {
        ctx.shadowBlur = brushSize * 2;
        ctx.shadowColor = selectedColor;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      } else {
        ctx.shadowBlur = 0;
      }

      if (effects.motionBlur) {
        ctx.globalAlpha = 0.8;
      } else {
        ctx.globalAlpha = 1;
      }

      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();

      if (effects.particles) {
        createParticles(point.x, point.y, selectedColor);
      }

      lastPointRef.current = point;
    }
  }, [selectedColor, brushSize, effects, createParticles, getEventPoint]);

  const handleEnd = useCallback(() => {
    isDrawingRef.current = false;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    
    // Add touch event listeners
    canvas.addEventListener('touchstart', handleStart, { passive: false });
    canvas.addEventListener('touchmove', handleMove, { passive: false });
    canvas.addEventListener('touchend', handleEnd);
    canvas.addEventListener('touchcancel', handleEnd);

    // Add mouse event listeners
    canvas.addEventListener('mousedown', handleStart);
    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mouseup', handleEnd);
    canvas.addEventListener('mouseleave', handleEnd);

    return () => {
      // Remove touch event listeners
      canvas.removeEventListener('touchstart', handleStart);
      canvas.removeEventListener('touchmove', handleMove);
      canvas.removeEventListener('touchend', handleEnd);
      canvas.removeEventListener('touchcancel', handleEnd);

      // Remove mouse event listeners
      canvas.removeEventListener('mousedown', handleStart);
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('mouseup', handleEnd);
      canvas.removeEventListener('mouseleave', handleEnd);
    };
  }, [handleStart, handleMove, handleEnd]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particlesRef.current = [];
  };

  const saveArtwork = () => {
    const link = document.createElement('a');
    link.download = 'cosmic-artwork.png';
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const toggleEffect = (effectName) => {
    setEffects(prev => ({
      ...prev,
      [effectName]: !prev[effectName]
    }));
  };

  // Add these new handlers for color palette scrolling
  const handlePaletteStart = useCallback((e) => {
    if (!colorPaletteRef.current) return;
    setIsScrolling(true);
    const pageX = e.touches ? e.touches[0].pageX : e.pageX;
    scrollStartXRef.current = pageX - colorPaletteRef.current.offsetLeft;
    scrollLeftRef.current = colorPaletteRef.current.scrollLeft;
  }, []);

  const handlePaletteMove = useCallback((e) => {
    if (!isScrolling || !colorPaletteRef.current) return;
    e.preventDefault();
    const pageX = e.touches ? e.touches[0].pageX : e.pageX;
    const x = pageX - colorPaletteRef.current.offsetLeft;
    const scroll = scrollLeftRef.current - (x - scrollStartXRef.current);
    colorPaletteRef.current.scrollLeft = scroll;
  }, [isScrolling]);

  const handlePaletteEnd = useCallback(() => {
    setIsScrolling(false);
  }, []);

  // Add effect for color palette touch events
  useEffect(() => {
    const container = colorPaletteRef.current;
    if (!container) return;

    const touchStart = (e) => {
      handlePaletteStart(e);
    };

    const touchMove = (e) => {
      handlePaletteMove(e);
    };

    const touchEnd = () => {
      handlePaletteEnd();
    };

    container.addEventListener('touchstart', touchStart, { passive: false });
    container.addEventListener('touchmove', touchMove, { passive: false });
    container.addEventListener('touchend', touchEnd);
    container.addEventListener('touchcancel', touchEnd);

    return () => {
      container.removeEventListener('touchstart', touchStart);
      container.removeEventListener('touchmove', touchMove);
      container.removeEventListener('touchend', touchEnd);
      container.removeEventListener('touchcancel', touchEnd);
    };
  }, [handlePaletteStart, handlePaletteMove, handlePaletteEnd]);

  return (
    <CanvasContainer>
      <Canvas
        ref={particleCanvasRef}
        style={{ zIndex: 1 }}
      />
      <Canvas
        ref={canvasRef}
        style={{ zIndex: 2 }}
      />
      
      {!('ontouchstart' in window) && (
        <BrushPreview
          $size={brushSize * 2}
          $color={selectedColor}
          $isDrawing={isDrawingRef.current}
          style={{
            left: cursorPos.x,
            top: cursorPos.y,
          }}
        />
      )}

      <LogoButton onClick={() => navigate('/')}>
        COSMIC CANVAS
      </LogoButton>

      <TopControls>
        <ActionButton onClick={saveArtwork}>Save</ActionButton>
        <ActionButton onClick={clearCanvas}>Clear</ActionButton>
      </TopControls>

      <ControlsContainer>
        <ColorPaletteContainer ref={colorPaletteRef}>
          <ColorPalette>
            {COLORS.map((color) => (
              <ColorButton
                key={color}
                $color={color}
                $isSelected={selectedColor === color}
                onClick={() => !isScrolling && setSelectedColor(color)}
              />
            ))}
          </ColorPalette>
        </ColorPaletteContainer>
        
        <BrushControls>
          <BrushSlider
            type="range"
            min="1"
            max="50"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
          />
          <BrushSizeDisplay>
            {brushSize}
          </BrushSizeDisplay>
        </BrushControls>
      </ControlsContainer>

      <EffectsControls>
        <EffectButton
          $isActive={effects.glow}
          onClick={() => toggleEffect('glow')}
        >
          Glow
        </EffectButton>
        <EffectButton
          $isActive={effects.particles}
          onClick={() => toggleEffect('particles')}
        >
          Particles
        </EffectButton>
        <EffectButton
          $isActive={effects.motionBlur}
          onClick={() => toggleEffect('motionBlur')}
        >
          Motion Blur
        </EffectButton>
      </EffectsControls>

      <CustomCursor 
        size={brushSize * 2}
        style={{
          left: cursorPos.x,
          top: cursorPos.y,
          backgroundColor: isDrawingRef.current ? `${selectedColor}33` : 'transparent'
        }}
      />
    </CanvasContainer>
  );
};

export default DrawingCanvas; 