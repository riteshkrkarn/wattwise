import React, { useEffect, useRef } from 'react';
import './AnimatedBackground.css';

interface EnergyNode {
  x: number;
  y: number;
  connections: number[];
}

export const AnimatedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create energy circuit nodes
    const nodes: EnergyNode[] = [
      { x: 0.1, y: 0.2, connections: [1, 3] },
      { x: 0.3, y: 0.15, connections: [2, 4] },
      { x: 0.5, y: 0.25, connections: [3, 5] },
      { x: 0.2, y: 0.45, connections: [4] },
      { x: 0.7, y: 0.35, connections: [5, 6] },
      { x: 0.8, y: 0.55, connections: [6] },
      { x: 0.9, y: 0.7, connections: [] },
    ];

    let energyOffset = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw circuit connections
      nodes.forEach(node => {
        const startX = node.x * canvas.width;
        const startY = node.y * canvas.height;

        node.connections.forEach(targetIndex => {
          const target = nodes[targetIndex];
          const targetX = target.x * canvas.width;
          const targetY = target.y * canvas.height;

          // Draw subtle circuit line
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(targetX, targetY);
          ctx.strokeStyle = 'rgba(0, 217, 255, 0.08)';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Draw energy flow
          const progress = (energyOffset % 100) / 100;
          const flowX = startX + (targetX - startX) * progress;
          const flowY = startY + (targetY - startY) * progress;

          // Energy dot
          ctx.beginPath();
          ctx.arc(flowX, flowY, 2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 217, 255, 0.6)';
          ctx.fill();

          // Energy glow
          const gradient = ctx.createRadialGradient(flowX, flowY, 0, flowX, flowY, 8);
          gradient.addColorStop(0, 'rgba(0, 217, 255, 0.3)');
          gradient.addColorStop(1, 'rgba(0, 217, 255, 0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(flowX, flowY, 8, 0, Math.PI * 2);
          ctx.fill();
        });

        // Draw node
        ctx.beginPath();
        ctx.arc(startX, startY, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(167, 139, 250, 0.4)';
        ctx.fill();
      });

      energyOffset += 0.5;
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div className="animated-background">
      <canvas ref={canvasRef} className="particles-canvas" />
      <div className="grid-overlay" />
      <div className="gradient-orb orb-1" />
      <div className="gradient-orb orb-2" />
      
      {/* Energy pulse indicators */}
      <div className="energy-indicator top-left">
        <div className="pulse-ring"></div>
        <div className="pulse-core"></div>
      </div>
      <div className="energy-indicator bottom-right">
        <div className="pulse-ring"></div>
        <div className="pulse-core"></div>
      </div>
    </div>
  );
};
