import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import styled from 'styled-components';

const GalaxyCanvas = styled.canvas`
  z-index: 2;
  opacity: 0.9;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease-out;
`;

const Galaxy = forwardRef(({ onTransitionComplete }, ref) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef();
  const mouseRef = useRef({ x: 0, y: 0, isDown: false });
  const backgroundGalaxiesRef = useRef([]);
  const transitionStateRef = useRef({
    isTransitioning: false,
    startTime: 0,
    duration: 2000, // 2 seconds for the entire transition
    rotationAcceleration: 0.008,
    maxRotationSpeed: 0.1,
    explosionParticles: [],
    fadeOut: false,
    shockwave: null
  });
  
  const planetsRef = useRef({
    planet1: { 
      x: 0, y: 0, z: 0, 
      angle: 0, 
      scale: 1, 
      color: '#00a8ff', // Bright blue
      trail: [],
      rotationSpeed: 0.008
    },
    planet2: { 
      x: 0, y: 0, z: 0, 
      angle: Math.PI, 
      scale: 1, 
      color: '#ff3399', // Neon pink
      trail: [],
      rotationSpeed: 0.008
    }
  });

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    startTransition: () => {
      if (!transitionStateRef.current.isTransitioning) {
        console.log('Starting transition...');
        transitionStateRef.current.isTransitioning = true;
        transitionStateRef.current.startTime = Date.now();
        planetsRef.current.planet1.rotationSpeed = 0.008;
        planetsRef.current.planet2.rotationSpeed = 0.008;
      }
    }
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: true });
    const orbitRadius = 150;
    const maxTrailLength = 25;
    const verticalTilt = Math.PI / 6;

    // Initialize background galaxies with improved distribution
    const initBackgroundGalaxies = () => {
      const galaxies = [];
      const numGalaxies = 3;
      const rect = canvas.getBoundingClientRect();

      for (let i = 0; i < numGalaxies; i++) {
        const angle = (i * Math.PI * 2) / numGalaxies;
        const radius = rect.width * 0.3;
        const x = rect.width / 2 + Math.cos(angle) * radius;
        const y = rect.height / 2 + Math.sin(angle) * radius;
        
        const galaxy = {
          x: x,
          y: y,
          baseX: x,
          baseY: y,
          size: 300, // Larger size for better spiral visibility
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: 0.001, // Faster rotation
          orbitAngle: angle,
          orbitSpeed: 0.0002,
          particles: [],
        };

        // Generate particles with clear spiral pattern
        const numParticles = 800;
        for (let j = 0; j < numParticles; j++) {
          const particleAngle = Math.random() * Math.PI * 2;
          const particleRadius = Math.sqrt(Math.random()) * galaxy.size;
          const particleSpeed = 0.001 + Math.random() * 0.002;
          
          galaxy.particles.push({
            angle: particleAngle,
            radius: particleRadius,
            speed: particleSpeed,
            size: Math.random() * 1.5,
            color: Math.random() > 0.5
              ? { r: 173, g: 216, b: 230, a: 0.8 } // Light blue
              : { r: 255, g: 182, b: 193, a: 0.8 }, // Light pink
          });
        }

        galaxies.push(galaxy);
      }

      backgroundGalaxiesRef.current = galaxies;
    };

    const drawBackgroundGalaxies = () => {
      backgroundGalaxiesRef.current.forEach(galaxy => {
        // Update galaxy position
        galaxy.orbitAngle += galaxy.orbitSpeed;
        galaxy.x = galaxy.baseX + Math.cos(galaxy.orbitAngle) * 50;
        galaxy.y = galaxy.baseY + Math.sin(galaxy.orbitAngle) * 50;

        ctx.save();
        ctx.translate(galaxy.x, galaxy.y);
        ctx.rotate(galaxy.rotation);

        // Draw spiral galaxy particles
        galaxy.particles.forEach(particle => {
          particle.angle += particle.speed;

          const x = particle.radius * Math.cos(particle.angle);
          const y = particle.radius * Math.sin(particle.angle);

          ctx.beginPath();
          ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${particle.color.a})`;
          ctx.shadowBlur = 10;
          ctx.shadowColor = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${particle.color.a})`;
          ctx.arc(x, y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        });

        // Add central glow
        const centerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, galaxy.size * 0.2);
        centerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        centerGlow.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
        centerGlow.addColorStop(1, 'transparent');
        
        ctx.beginPath();
        ctx.fillStyle = centerGlow;
        ctx.arc(0, 0, galaxy.size * 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Update rotation
        galaxy.rotation += galaxy.rotationSpeed;
        
        ctx.restore();
      });
    };

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      // Set canvas size accounting for device pixel ratio
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      // Scale the context to ensure correct drawing operations
      ctx.scale(dpr, dpr);
      
      // Set canvas CSS size
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      // Reinitialize background galaxies on resize
      initBackgroundGalaxies();
    };

    const handleMouseMove = (e) => {
      if (mouseRef.current.isDown) {
        const rect = canvas.getBoundingClientRect();
        mouseRef.current.x = e.clientX - rect.left;
        mouseRef.current.y = e.clientY - rect.top;
      }
    };

    const handleMouseDown = (e) => {
      mouseRef.current.isDown = true;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    const handleMouseUp = () => {
      mouseRef.current.isDown = false;
    };

    const createExplosionParticles = (x, y, color1, color2, numParticles = 200) => {
      const particles = [];
      
      // Create shockwave particles
      const shockwaveParticles = 50;
      for (let i = 0; i < shockwaveParticles; i++) {
        const angle = (i / shockwaveParticles) * Math.PI * 2;
        particles.push({
          x, y,
          vx: Math.cos(angle) * 8,
          vy: Math.sin(angle) * 8,
          size: 3,
          color: '#ffffff',
          life: 1.0,
          originalLife: 1.0,
          type: 'shockwave'
        });
      }
      
      // Create explosion particles with varying properties
      for (let i = 0; i < numParticles; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 8; // Increased speed range
        const size = 1 + Math.random() * 4; // Increased size range
        const life = 0.5 + Math.random() * 1.0; // Varying lifespans
        
        // Create color gradient between the two planets
        const mixRatio = Math.random();
        const color1Rgb = hexToRgb(color1);
        const color2Rgb = hexToRgb(color2);
        const mixedColor = {
          r: Math.floor(color1Rgb.r * mixRatio + color2Rgb.r * (1 - mixRatio)),
          g: Math.floor(color1Rgb.g * mixRatio + color2Rgb.g * (1 - mixRatio)),
          b: Math.floor(color1Rgb.b * mixRatio + color2Rgb.b * (1 - mixRatio))
        };
        
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size,
          color: `rgb(${mixedColor.r}, ${mixedColor.g}, ${mixedColor.b})`,
          life,
          originalLife: life,
          type: 'particle',
          rotationSpeed: (Math.random() - 0.5) * 0.2
        });
      }
      
      // Add some glowing orbs
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 3;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 5 + Math.random() * 8,
          color: color1,
          life: 1.5,
          originalLife: 1.5,
          type: 'orb',
          glow: true
        });
      }
      
      return particles;
    };

    // Helper function to convert hex color to RGB
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    const createShockwave = (x, y, size = 100) => {
      return {
        x, y,
        radius: 0,
        maxRadius: size,
        alpha: 1,
        color: '#ffffff',
        speed: 15
      };
    };

    const createBigBangParticles = (x, y, color1, color2) => {
      const particles = [];
      const numRings = 3;
      const particlesPerRing = 100;
      
      // Create expanding rings
      for (let ring = 0; ring < numRings; ring++) {
        const ringOffset = (ring * Math.PI * 2) / numRings;
        const ringDelay = ring * 0.2; // Stagger the ring expansions
        
        for (let i = 0; i < particlesPerRing; i++) {
          const angle = (i / particlesPerRing) * Math.PI * 2 + ringOffset;
          const speed = 5 + Math.random() * 5;
          const size = 2 + Math.random() * 4;
          
          // Mix colors for a cosmic effect
          const mixRatio = Math.random();
          const color1Rgb = hexToRgb(color1);
          const color2Rgb = hexToRgb(color2);
          const mixedColor = {
            r: Math.floor(color1Rgb.r * mixRatio + color2Rgb.r * (1 - mixRatio)),
            g: Math.floor(color1Rgb.g * mixRatio + color2Rgb.g * (1 - mixRatio)),
            b: Math.floor(color1Rgb.b * mixRatio + color2Rgb.b * (1 - mixRatio))
          };
          
          particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size,
            color: `rgb(${mixedColor.r}, ${mixedColor.g}, ${mixedColor.b})`,
            life: 2.0,
            originalLife: 2.0,
            delay: ringDelay,
            type: 'bigbang',
            rotationSpeed: (Math.random() - 0.5) * 0.1,
            glowSize: size * 3
          });
        }
      }
      
      return particles;
    };

    const updateExplosionParticles = () => {
      const particles = transitionStateRef.current.explosionParticles;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        if (p.delay > 0) continue;
        
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.01; // Slower fade for big bang effect
        
        if (p.type === 'bigbang') {
          // Add some swirl to big bang particles
          p.vx += Math.sin(p.y * 0.01) * 0.1;
          p.vy += Math.cos(p.x * 0.01) * 0.1;
          p.glowSize *= 0.99;
        } else if (p.type === 'particle') {
          p.vx += (Math.random() - 0.5) * 0.1;
          p.vy += (Math.random() - 0.5) * 0.1;
        }
        
        if (p.life <= 0) {
          particles.splice(i, 1);
        }
      }
    };

    const drawExplosionParticles = () => {
      const particles = transitionStateRef.current.explosionParticles;
      const shockwave = transitionStateRef.current.shockwave;
      
      // Draw shockwave if it exists
      if (shockwave && shockwave.radius < shockwave.maxRadius) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 255, 255, ${shockwave.alpha})`;
        ctx.lineWidth = 2;
        ctx.arc(shockwave.x, shockwave.y, shockwave.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        shockwave.radius += shockwave.speed;
        shockwave.alpha *= 0.98;
      }
      
      particles.forEach(p => {
        if (p.delay > 0) {
          p.delay -= 0.016; // Approximately one frame at 60fps
          return;
        }
        
        ctx.beginPath();
        
        if (p.type === 'bigbang') {
          // Draw big bang particles with extra glow
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.glowSize);
          gradient.addColorStop(0, p.color);
          gradient.addColorStop(0.5, p.color.slice(0, -2) + '66');
          gradient.addColorStop(1, 'transparent');
          
          ctx.fillStyle = gradient;
          ctx.arc(p.x, p.y, p.glowSize, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'shockwave') {
          // Original shockwave drawing
          ctx.strokeStyle = `${p.color}${Math.floor(p.life * 255).toString(16).padStart(2, '0')}`;
          ctx.lineWidth = p.size * (1 - p.life);
          ctx.arc(p.x, p.y, p.size * 50 * (1 - p.life), 0, Math.PI * 2);
          ctx.stroke();
        } else {
          // Original particle drawing with proper alpha
          const alpha = Math.floor(p.life * 255).toString(16).padStart(2, '0');
          ctx.fillStyle = p.color.startsWith('rgb') 
            ? p.color.replace(')', `, ${p.life})`)
            : `${p.color}${alpha}`;
          ctx.shadowBlur = 20;
          ctx.shadowColor = p.color;
          ctx.arc(p.x, p.y, p.size * (1 + (1 - p.life)), 0, Math.PI * 2);
          ctx.fill();
        }
      });
    };

    const updatePlanetPositions = () => {
      const planets = planetsRef.current;
      const rect = canvas.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const transition = transitionStateRef.current;

      if (transition.isTransitioning) {
        const elapsed = Date.now() - transition.startTime;
        const progress = Math.min(elapsed / transition.duration, 1);
        
        // Enhanced acceleration with easing
        const easeInQuad = progress * progress;
        const currentOrbitRadius = orbitRadius * (1 - easeInQuad);
        
        // Accelerate rotation with smooth ramping
        const targetRotationSpeed = transition.maxRotationSpeed;
        planets.planet1.rotationSpeed = planets.planet1.rotationSpeed + 
          (targetRotationSpeed - planets.planet1.rotationSpeed) * 0.1;
        planets.planet2.rotationSpeed = planets.planet1.rotationSpeed;

        // Add spiral motion during approach
        const spiralFactor = progress * Math.PI * 2; // Complete one spiral during transition
        const p1x = centerX + Math.cos(planets.planet1.angle + spiralFactor) * currentOrbitRadius;
        const p1y = centerY + Math.sin(planets.planet1.angle + spiralFactor) * currentOrbitRadius * Math.cos(verticalTilt);
        const p2x = centerX + Math.cos(planets.planet2.angle + spiralFactor) * currentOrbitRadius;
        const p2y = centerY + Math.sin(planets.planet2.angle + spiralFactor) * currentOrbitRadius * Math.cos(verticalTilt);

        // Enhanced collision detection with larger radius
        const distance = Math.hypot(p2x - p1x, p2y - p1y);
        const collisionRadius = 30; // Increased from 10 to 30 for better detection

        if (distance < collisionRadius && !transition.fadeOut) {
          // Create more dramatic explosion
          transition.explosionParticles = [
            ...createExplosionParticles(centerX, centerY, planets.planet1.color, planets.planet2.color, 200),
            ...createBigBangParticles(centerX, centerY, planets.planet1.color, planets.planet2.color)
          ];
          transition.shockwave = createShockwave(centerX, centerY, Math.max(rect.width, rect.height));
          transition.fadeOut = true;
          
          // Add screen flash effect with shorter duration
          const flash = document.createElement('div');
          flash.style.position = 'fixed';
          flash.style.top = '0';
          flash.style.left = '0';
          flash.style.width = '100%';
          flash.style.height = '100%';
          flash.style.backgroundColor = 'white';
          flash.style.opacity = '0.8';
          flash.style.transition = 'opacity 0.3s ease-out';
          flash.style.pointerEvents = 'none';
          flash.style.zIndex = '1000';
          document.body.appendChild(flash);
          
          // Faster flash fade out
          setTimeout(() => {
            flash.style.opacity = '0';
            setTimeout(() => {
              document.body.removeChild(flash);
            }, 300);
          }, 50);
          
          // Update background galaxies
          backgroundGalaxiesRef.current = backgroundGalaxiesRef.current.map(galaxy => ({
            ...galaxy,
            rotationSpeed: galaxy.rotationSpeed * 2,
            particles: galaxy.particles.map(particle => ({
              ...particle,
              speed: particle.speed * 1.5
            }))
          }));
          
          // Trigger transition to canvas immediately after flash starts fading
          setTimeout(() => {
            if (onTransitionComplete) {
              onTransitionComplete();
            }
          }, 100);
        }

        planets.planet1.x = p1x;
        planets.planet1.y = p1y;
        planets.planet2.x = p2x;
        planets.planet2.y = p2y;
      } else {
        // Normal planet movement
        if (mouseRef.current.isDown) {
          const dx = mouseRef.current.x - centerX;
          const dy = mouseRef.current.y - centerY;
          const angle = Math.atan2(dy, dx);
          planets.planet1.angle = angle;
          planets.planet2.angle = angle + Math.PI;
        } else {
          planets.planet1.angle += planets.planet1.rotationSpeed;
          planets.planet2.angle += planets.planet2.rotationSpeed;
        }

        planets.planet1.x = centerX + Math.cos(planets.planet1.angle) * orbitRadius;
        planets.planet1.y = centerY + Math.sin(planets.planet1.angle) * orbitRadius * Math.cos(verticalTilt);
        planets.planet2.x = centerX + Math.cos(planets.planet2.angle) * orbitRadius;
        planets.planet2.y = centerY + Math.sin(planets.planet2.angle) * orbitRadius * Math.cos(verticalTilt);
      }

      // Update trails
      planets.planet1.trail.unshift({ x: planets.planet1.x, y: planets.planet1.y });
      planets.planet2.trail.unshift({ x: planets.planet2.x, y: planets.planet2.y });

      if (planets.planet1.trail.length > maxTrailLength) planets.planet1.trail.pop();
      if (planets.planet2.trail.length > maxTrailLength) planets.planet2.trail.pop();
    };

    const drawPlanet = (x, y, color, scale = 1) => {
      const baseSize = 35; // Slightly smaller for better proportion
      const size = baseSize * scale;
      
      // Enhanced outer glow
      const outerGlow = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
      outerGlow.addColorStop(0, color + '60');
      outerGlow.addColorStop(0.3, color + '30');
      outerGlow.addColorStop(1, 'transparent');
      
      ctx.beginPath();
      ctx.fillStyle = outerGlow;
      ctx.arc(x, y, size * 3, 0, Math.PI * 2);
      ctx.fill();

      // Enhanced core with 3D effect
      const coreGlow = ctx.createRadialGradient(x - size * 0.2, y - size * 0.2, 0, x, y, size);
      coreGlow.addColorStop(0, '#ffffff');
      coreGlow.addColorStop(0.2, color);
      coreGlow.addColorStop(0.5, color + 'cc');
      coreGlow.addColorStop(1, color + '40');

      ctx.beginPath();
      ctx.fillStyle = coreGlow;
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawTrail = (trail, color) => {
      if (trail.length < 2) return;

      ctx.beginPath();
      ctx.moveTo(trail[0].x, trail[0].y);

      // Create smooth curve through trail points
      for (let i = 0; i < trail.length - 1; i++) {
        const xc = (trail[i].x + trail[i + 1].x) / 2;
        const yc = (trail[i].y + trail[i + 1].y) / 2;
        ctx.quadraticCurveTo(trail[i].x, trail[i].y, xc, yc);
      }

      // Enhanced trail gradient
      const gradient = ctx.createLinearGradient(
        trail[0].x, trail[0].y,
        trail[trail.length - 1].x, trail[trail.length - 1].y
      );
      gradient.addColorStop(0, color + 'ff');
      gradient.addColorStop(0.1, color + 'cc');
      gradient.addColorStop(0.5, color + '66');
      gradient.addColorStop(1, 'transparent');

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 12; // Thicker trails
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Add glow effect to trails
      ctx.shadowColor = color;
      ctx.shadowBlur = 15;
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      
      // Adjust background opacity during transition
      const bgAlpha = transitionStateRef.current.fadeOut ? 0.05 : 0.15;
      ctx.fillStyle = `rgba(0, 0, 0, ${bgAlpha})`;
      ctx.fillRect(0, 0, rect.width, rect.height);

      drawBackgroundGalaxies();
      updatePlanetPositions();
      
      const planets = planetsRef.current;
      
      if (!transitionStateRef.current.fadeOut) {
        drawTrail(planets.planet1.trail, planets.planet1.color);
        drawTrail(planets.planet2.trail, planets.planet2.color);
        drawPlanet(planets.planet1.x, planets.planet1.y, planets.planet1.color, planets.planet1.scale);
        drawPlanet(planets.planet2.x, planets.planet2.y, planets.planet2.color, planets.planet2.scale);
      }

      if (transitionStateRef.current.explosionParticles.length > 0) {
        updateExplosionParticles();
        drawExplosionParticles();
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    handleResize();
    initBackgroundGalaxies();
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [onTransitionComplete]);

  return (
    <GalaxyCanvas 
      ref={canvasRef}
      style={{
        opacity: transitionStateRef.current.fadeOut ? 0 : 0.9
      }}
    />
  );
});

export default Galaxy; 