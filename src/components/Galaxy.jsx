import { useEffect, useRef } from 'react';
import styled from 'styled-components';

const GalaxyCanvas = styled.canvas`
  z-index: 2;
  opacity: 0.9;
  pointer-events: none;
  position: fixed;
  top: 0;
  left: 0;
`;

const Galaxy = () => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationFrameRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: true });
    const particles = [];
    const numParticles = 1200;
    let centerX = 0;
    let centerY = 0;
    const rotationSpeed = 0.0001;
    let angle = 0;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      centerX = canvas.width / 2;
      centerY = canvas.height / 2;
      createParticles();
    };

    const createParticles = () => {
      particles.length = 0;
      for (let i = 0; i < numParticles; i++) {
        const armCount = 2;
        const armIndex = Math.floor(Math.random() * armCount);
        const baseArmAngle = (armIndex / armCount) * Math.PI * 2;
        const spiralTightness = 0.3;
        
        const distanceFromCenter = Math.pow(Math.random(), 0.3); // More spread out distribution
        const spiralAngle = baseArmAngle + (distanceFromCenter * Math.PI * 6 * spiralTightness);
        const distance = Math.pow(distanceFromCenter, 0.5) * 500; // Larger radius
        const baseSpeed = (1 - Math.pow(distanceFromCenter, 0.5)) * 0.002;

        // Create colors based on distance from center for a gradient effect
        let hue, saturation, brightness, alpha;
        const distanceRatio = distance / 500;

        if (distanceRatio < 0.3) {
          // Inner region - cyan/blue
          hue = 180 + Math.random() * 20;
          saturation = 100;
          brightness = 70 + Math.random() * 30;
          alpha = 0.6 + Math.random() * 0.4;
        } else if (distanceRatio < 0.6) {
          // Middle region - blue
          hue = 200 + Math.random() * 20;
          saturation = 100;
          brightness = 60 + Math.random() * 30;
          alpha = 0.4 + Math.random() * 0.4;
        } else {
          // Outer region - darker blue
          hue = 220 + Math.random() * 20;
          saturation = 90;
          brightness = 50 + Math.random() * 30;
          alpha = 0.2 + Math.random() * 0.3;
        }
        
        particles.push({
          x: Math.cos(spiralAngle) * distance,
          y: Math.sin(spiralAngle) * distance,
          radius: Math.random() * (distance < 200 ? 2 : 1.2),
          baseColor: `hsla(${~~hue}, ${~~saturation}%, ${~~brightness}%, ${alpha})`,
          angle: spiralAngle,
          distance: distance,
          speed: baseSpeed * (1 + Math.random() * 0.2),
          glowSize: Math.random() * 3 + 2,
          hue: ~~hue,
          saturation: ~~saturation,
          brightness: ~~brightness
        });
      }
    };

    const drawParticle = (particle) => {
      const x = centerX + particle.x;
      const y = centerY + particle.y;

      // Base particle
      ctx.beginPath();
      ctx.arc(x, y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = particle.baseColor;
      ctx.fill();

      // Enhanced glow effect
      const gradient = ctx.createRadialGradient(
        x, y, 0,
        x, y, particle.radius * particle.glowSize
      );
      gradient.addColorStop(0, `hsla(${particle.hue}, ${particle.saturation}%, ${particle.brightness}%, 0.3)`);
      gradient.addColorStop(0.5, `hsla(${particle.hue}, ${particle.saturation}%, ${particle.brightness}%, 0.1)`);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fill();
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      angle += rotationSpeed;
      
      particles.forEach(particle => {
        particle.angle += particle.speed;
        particle.x = Math.cos(particle.angle) * particle.distance;
        particle.y = Math.sin(particle.angle) * particle.distance;
        drawParticle(particle);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return <GalaxyCanvas ref={canvasRef} />;
};

export default Galaxy; 