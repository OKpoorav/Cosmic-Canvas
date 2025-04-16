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
`;

const ColorPalette = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ColorButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid ${props => props.$isSelected ? '#fff' : 'transparent'};
  background: ${props => props.$color};
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 0 10px ${props => props.$color}80;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 0 15px ${props => props.$color};
  }
`;

const BrushControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
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

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  &::-webkit-slider-thumb:hover {
    transform: scale(1.1);
  }
`;

const TopControls = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
  z-index: 1000;
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
`;

const EffectButton = styled(ActionButton)`
  background: ${props => props.$isActive ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  font-size: 12px;
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

  const getCanvasPoint = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const dpr = dprRef.current;
    
    return {
      x: (e.clientX - rect.left) * dpr,
      y: (e.clientY - rect.top) * dpr
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

  const draw = useCallback((e) => {
    if (!isDrawingRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const point = getCanvasPoint(e);
    
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
  }, [selectedColor, brushSize, effects, createParticles, getCanvasPoint]);

  const startDrawing = useCallback((e) => {
    isDrawingRef.current = true;
    lastPointRef.current = getCanvasPoint(e);
  }, [getCanvasPoint]);

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

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

  return (
    <CanvasContainer>
      <Canvas
        ref={particleCanvasRef}
        style={{ zIndex: 1 }}
      />
      <Canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        style={{ zIndex: 2 }}
      />
      
      <TopControls>
        <ActionButton onClick={saveArtwork}>Save</ActionButton>
        <ActionButton onClick={clearCanvas}>Clear</ActionButton>
        <ActionButton onClick={() => navigate('/')}>Back</ActionButton>
      </TopControls>

      <ControlsContainer>
        <ColorPalette>
          {COLORS.map((color) => (
            <ColorButton
              key={color}
              $color={color}
              $isSelected={selectedColor === color}
              onClick={() => setSelectedColor(color)}
            />
          ))}
        </ColorPalette>
        
        <BrushControls>
          <BrushSlider
            type="range"
            min="1"
            max="50"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
          />
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
    </CanvasContainer>
  );
};

export default DrawingCanvas; 