"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  opacitySpeed: number;
}

export function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let stars: Star[] = [];
    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const initStars = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      stars = [];
      const numStars = Math.floor((width * height) / 3000); // Responsive star count

      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.5 + 0.5,
          speed: prefersReducedMotion ? 0 : Math.random() * 0.2 + 0.05,
          opacity: Math.random(),
          opacitySpeed: prefersReducedMotion ? 0 : (Math.random() * 0.02) - 0.01,
        });
      }
    };

    const drawStars = () => {
      ctx.clearRect(0, 0, width, height);

      // Create a subtle deep space gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "#000000");
      gradient.addColorStop(1, "#0A0A0E");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      stars.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        
        // Randomly add a gold tint to some stars
        const isGold = Math.random() > 0.95;
        const rgb = isGold ? "212, 175, 55" : "255, 255, 255";
        
        ctx.fillStyle = `rgba(${rgb}, ${star.opacity})`;
        ctx.fill();

        if (!prefersReducedMotion) {
          // Move stars upwards slowly
          star.y -= star.speed;
          if (star.y < 0) {
            star.y = height;
            star.x = Math.random() * width;
          }

          // Twinkle effect
          star.opacity += star.opacitySpeed;
          if (star.opacity < 0.2 || star.opacity > 1) {
            star.opacitySpeed *= -1;
          }
        }
      });

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(drawStars);
      }
    };

    initStars();
    drawStars();

    const handleResize = () => {
      initStars();
      if (prefersReducedMotion) {
        drawStars();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-10 bg-space-dark"
      aria-hidden="true"
    />
  );
}
