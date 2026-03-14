'use client';
import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';

interface Drone {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  color: string;
}

const DRONE_COUNT = 300;

type Formation = 'random' | 'billboard' | 'spiral' | 'heart' | 'wave';

export const DroneVisual: React.FC = () => {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [formation, setFormation] = useState<Formation>('random');
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialDrones = Array.from({ length: DRONE_COUNT }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      targetX: Math.random() * 100,
      targetY: Math.random() * 100,
      color: '#FFFFFF'
    }));
    setDrones(initialDrones);

    const interval = setInterval(() => {
      setFormation(prev => {
        const sequence: Formation[] = ['random', 'billboard', 'spiral', 'heart', 'wave'];
        const currentIndex = sequence.indexOf(prev);
        return sequence[(currentIndex + 1) % sequence.length];
      });
    }, 6000);

    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    setDrones(prev => prev.map(drone => {
      let tx, ty, color;
      const i = drone.id;

      if (formation === 'billboard') {
        const cols = 20;
        const row = Math.floor(i / cols);
        const col = i % cols;
        tx = 25 + (col * 2.5);
        ty = 30 + (row * 3.5);
        color = '#3DA9FF';
      } else if (formation === 'spiral') {
        const angle = 0.2 * i;
        const radius = 0.15 * i;
        tx = 50 + (radius * Math.cos(angle)) * 0.5;
        ty = 50 + (radius * Math.sin(angle)) * 0.5;
        color = '#FFFFFF';
      } else if (formation === 'heart') {
        const t = (i / DRONE_COUNT) * Math.PI * 2;
        // Parametric heart equation
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        tx = 50 + x * 1.5;
        ty = 45 + y * 1.5;
        color = '#8A5CFF';
      } else if (formation === 'wave') {
        tx = (i / DRONE_COUNT) * 100;
        ty = 50 + Math.sin(tx * 0.2 + Date.now() * 0.001) * 15;
        color = i % 2 === 0 ? '#3DA9FF' : '#8A5CFF';
      } else {
        tx = Math.random() * 100;
        ty = Math.random() * 100;
        color = '#FFFFFF';
      }

      // Add mouse repulsion
      const dx = tx - mousePos.x;
      const dy = ty - mousePos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 15) {
        const force = (15 - dist) / 15;
        tx += (dx / dist) * force * 10;
        ty += (dy / dist) * force * 10;
      }

      return { ...drone, targetX: tx, targetY: ty, color };
    }));
  }, [formation, mousePos]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none opacity-80">
      {drones.map(drone => (
        <motion.div
          key={drone.id}
          className={`absolute w-1 h-1 rounded-full ${
            drone.color === '#3DA9FF' ? 'drone-light-blue' : 
            drone.color === '#8A5CFF' ? 'drone-light-purple' : 'drone-light'
          }`}
          style={{ backgroundColor: drone.color }}
          animate={{
            left: `${drone.targetX}%`,
            top: `${drone.targetY}%`,
          }}
          transition={{
            duration: formation === 'random' ? 4 : 2,
            ease: "circOut"
          }}
        />
      ))}
      
      {/* Dynamic Ambient Light */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-tr from-sky-blue/5 to-sky-purple/5"
        animate={{
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 5, repeat: Infinity }}
      />
    </div>
  );
};
