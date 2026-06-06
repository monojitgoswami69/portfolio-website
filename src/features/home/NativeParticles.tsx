"use client";

import { useEffect, useRef } from 'react';

interface NativeParticlesProps {
  count?: number;
  colors?: string[];
  size?: number;
  speed?: number;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  opacity: number; // Fixed opacity, never changes
  size: number; // Fixed size, never changes
}

const NativeParticles: React.FC<NativeParticlesProps> = ({
  count = 60,
  colors = ['#a5f3fc', '#ffa6fb', '#b3b7ff'],
  size = 1.2,
  speed = 0.08,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Initialize particles with grid-based spacing for even distribution
    const initParticles = () => {
      particlesRef.current = [];

      // Calculate grid dimensions for even spacing
      const cols = Math.ceil(Math.sqrt(count * (window.innerWidth / window.innerHeight)));
      const rows = Math.ceil(count / cols);
      const cellWidth = window.innerWidth / cols;
      const cellHeight = window.innerHeight / rows;

      for (let i = 0; i < count; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);

        // Place particle in cell with random offset for natural look
        const x = col * cellWidth + cellWidth * (0.3 + Math.random() * 0.4);
        const y = row * cellHeight + cellHeight * (0.3 + Math.random() * 0.4);

        particlesRef.current.push({
          x,
          y,
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed,
          color: colors[Math.floor(Math.random() * colors.length)],
          opacity: Math.random() * 0.25 + 0.15, // Fixed: 0.15-0.4 (low opacity)
          size: size * (0.8 + Math.random() * 0.4), // Fixed: 0.8x-1.2x base size
        });
      }
    };

    initParticles();

    // Animation loop - simple movement only, NO effects
    const animate = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      particlesRef.current.forEach((particle) => {
        // Update position - very slow, linear movement
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < 0) particle.x = window.innerWidth;
        if (particle.x > window.innerWidth) particle.x = 0;
        if (particle.y < 0) particle.y = window.innerHeight;
        if (particle.y > window.innerHeight) particle.y = 0;

        // Draw particle - simple circle, no effects
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity; // Use fixed opacity
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [count, colors, size, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ zIndex: -5 }}
    />
  );
};

export default NativeParticles;
