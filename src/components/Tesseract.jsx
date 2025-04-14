import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import gsap from 'gsap';

const PlanetContainer = styled.div`
  perspective: 1200px;
  width: 200px;
  height: 200px;
  margin: 3rem auto;
  cursor: grab;
  will-change: transform;
  transform-style: preserve-3d;

  &:active {
    cursor: grabbing;
  }
`;

const PlanetWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: filter 0.3s ease;
`;

const Planet = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%,
    #6441a5 0%,
    #2a0845 50%,
    #1a0b2e 100%
  );
  box-shadow: 
    inset -20px -20px 50px rgba(0, 0, 0, 0.5),
    inset 10px 10px 30px rgba(255, 255, 255, 0.2),
    0 0 50px rgba(100, 65, 165, 0.3);
  overflow: hidden;
  transform-style: preserve-3d;
`;

const Atmosphere = styled.div`
  position: absolute;
  width: 120%;
  height: 120%;
  top: -10%;
  left: -10%;
  border-radius: 50%;
  background: radial-gradient(circle at center,
    rgba(100, 65, 165, 0.2) 0%,
    rgba(42, 8, 69, 0.1) 50%,
    transparent 70%
  );
  filter: blur(8px);
  pointer-events: none;
`;

const Rings = styled.div`
  position: absolute;
  width: 200%;
  height: 40px;
  top: 50%;
  left: -50%;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(100, 65, 165, 0.2) 20%,
    rgba(100, 65, 165, 0.4) 40%,
    rgba(100, 65, 165, 0.4) 60%,
    rgba(100, 65, 165, 0.2) 80%,
    transparent 100%
  );
  transform: rotateX(75deg);
  transform-style: preserve-3d;
  filter: blur(2px);
  pointer-events: none;
`;

const Surface = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: 
    radial-gradient(circle at 70% 70%,
      rgba(255, 255, 255, 0.1) 0%,
      transparent 50%
    ),
    repeating-conic-gradient(
      from 0deg,
      rgba(100, 65, 165, 0.2) 0deg 10deg,
      rgba(42, 8, 69, 0.3) 10deg 20deg
    );
  filter: blur(4px);
  mix-blend-mode: overlay;
`;

const Tesseract = () => {
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState({ x: 15, y: 0 });
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const autoRotationRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const wrapper = wrapperRef.current;
    
    autoRotationRef.current = gsap.to(wrapper, {
      rotationY: '+=360',
      duration: 40,
      repeat: -1,
      ease: "none",
      paused: true
    });

    autoRotationRef.current.play();

    return () => {
      if (autoRotationRef.current) {
        autoRotationRef.current.kill();
      }
    };
  }, []);

  const handleMouseDown = (e) => {
    if (autoRotationRef.current) {
      autoRotationRef.current.pause();
    }
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - rotation.y,
      y: e.clientY - rotation.x
    };
    setLastPosition({
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastPosition.x;
    const deltaY = e.clientY - lastPosition.y;

    const newRotation = {
      x: rotation.x + deltaY * 0.5,
      y: rotation.y + deltaX * 0.5
    };

    setRotation(newRotation);
    setLastPosition({
      x: e.clientX,
      y: e.clientY
    });

    gsap.set(wrapperRef.current, {
      rotationX: newRotation.x,
      rotationY: newRotation.y,
      transformPerspective: 1000
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (autoRotationRef.current) {
      gsap.to(wrapperRef.current, {
        rotationX: 15,
        duration: 1,
        ease: "power2.out",
        onComplete: () => {
          setRotation(prev => ({ ...prev, x: 15 }));
          autoRotationRef.current.resume();
        }
      });
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp();
    }
  };

  const handleDoubleClick = () => {
    gsap.to(wrapperRef.current, {
      rotationX: 15,
      rotationY: 0,
      duration: 1,
      ease: "power2.out",
      onComplete: () => {
        setRotation({ x: 15, y: 0 });
        if (autoRotationRef.current) {
          autoRotationRef.current.resume();
        }
      }
    });
  };

  return (
    <PlanetContainer
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onDoubleClick={handleDoubleClick}
    >
      <PlanetWrapper 
        ref={wrapperRef}
        style={{
          filter: isDragging ? 'brightness(1.3) drop-shadow(0 0 30px rgba(100, 65, 165, 0.6))' : 'none',
          transformStyle: 'preserve-3d'
        }}
      >
        <Planet>
          <Surface />
          <Atmosphere />
        </Planet>
        <Rings />
      </PlanetWrapper>
    </PlanetContainer>
  );
};

export default Tesseract; 