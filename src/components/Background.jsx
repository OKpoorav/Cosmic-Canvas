import { useEffect, useRef } from 'react';
import styled from 'styled-components';

const BackgroundCanvas = styled.canvas`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, #0a0a2a 0%, #000000 100%);
  opacity: ${props => props.isTransitioning ? 0 : 1};
  transition: opacity 1s ease-out;
  z-index: 1;
`;

class Star {
  constructor(canvas) {
    this.canvas = canvas;
    this.reset();
  }

  reset() {
    this.x = Math.random() * this.canvas.width;
    this.y = Math.random() * this.canvas.height;
    this.z = Math.random() * 1000;
    this.opacity = Math.random();
    this.size = Math.random() * 2 + 1;
    
    // More varied star colors with purple hues
    const colorRand = Math.random();
    if (colorRand > 0.8) {
      this.color = '#c499f3'; // Light purple
    } else if (colorRand > 0.6) {
      this.color = '#8e6dce'; // Medium purple
    } else if (colorRand > 0.4) {
      this.color = '#63e1ff'; // Cyan
    } else if (colorRand > 0.2) {
      this.color = '#4facfe'; // Blue
    } else {
      this.color = '#b0f3ff'; // Light blue
    }

    // Add comet effect to some stars
    this.isComet = Math.random() > 0.95;
    this.tailLength = this.isComet ? Math.random() * 50 + 30 : 0;
  }

  update(speed) {
    this.z -= speed;
    if (this.z <= 0) {
      this.reset();
    }

    this.screenX = (this.x - this.canvas.width / 2) * (600 / this.z) + this.canvas.width / 2;
    this.screenY = (this.y - this.canvas.height / 2) * (600 / this.z) + this.canvas.height / 2;
    this.radius = this.size * (600 / this.z);
    this.opacity = Math.min(Math.max((1000 - this.z) / 1000, 0), 1);
  }

  draw(ctx) {
    if (this.isComet) {
      // Draw comet tail
      const gradient = ctx.createLinearGradient(
        this.screenX + this.tailLength, this.screenY,
        this.screenX, this.screenY
      );
      gradient.addColorStop(0, 'transparent');
      gradient.addColorStop(1, `${this.color}${Math.floor(this.opacity * 255).toString(16).padStart(2, '0')}`);
      
      ctx.beginPath();
      ctx.moveTo(this.screenX, this.screenY);
      ctx.lineTo(this.screenX + this.tailLength, this.screenY);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = this.radius;
      ctx.stroke();
    }

    // Draw star
    ctx.beginPath();
    ctx.arc(this.screenX, this.screenY, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `${this.color}${Math.floor(this.opacity * 255).toString(16).padStart(2, '0')}`;
    ctx.fill();
  }
}

class Nebula {
  constructor(canvas, x, y, radius, color1, color2) {
    this.canvas = canvas;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color1 = color1;
    this.color2 = color2;
    this.alpha = 0.3; // Increased opacity for better visibility
  }

  draw(ctx) {
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
    gradient.addColorStop(0, `${this.color1}${Math.floor(this.alpha * 255).toString(16).padStart(2, '0')}`);
    gradient.addColorStop(0.5, `${this.color2}${Math.floor(this.alpha * 0.7 * 255).toString(16).padStart(2, '0')}`);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

const Background = ({ isTransitioning }) => {
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const nebulasRef = useRef([]);
  const requestRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: true });
    const stars = [];
    const nebulas = [];
    const numStars = 800; // Significantly increased star count
    const speed = 0.5;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Create larger nebulas with stronger purple colors
      nebulas.length = 0;
      nebulas.push(
        new Nebula(canvas, canvas.width * 0.3, canvas.height * 0.3, 1000, '#6441a5', '#2a0845'),
        new Nebula(canvas, canvas.width * 0.7, canvas.height * 0.6, 1200, '#7b2ff7', '#4a157c'),
        new Nebula(canvas, canvas.width * 0.5, canvas.height * 0.4, 1400, '#8e2de2', '#4a00e0')
      );
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(13, 6, 25, 0.1)'; // Darker, more purple-tinted background
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw nebulas first
      nebulas.forEach(nebula => nebula.draw(ctx));

      // Draw stars on top
      stars.forEach(star => {
        star.update(speed);
        star.draw(ctx);
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    for (let i = 0; i < numStars; i++) {
      stars.push(new Star(canvas));
    }

    starsRef.current = stars;
    nebulasRef.current = nebulas;
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  return <BackgroundCanvas ref={canvasRef} isTransitioning={isTransitioning} />;
};

export default Background; 