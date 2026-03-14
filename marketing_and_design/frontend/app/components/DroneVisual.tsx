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

const DRONE_COUNT = 150;

export const DroneVisual: React.FC = () => {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [formation, setFormation] = useState<'random' | 'billboard' | 'circle'>('random');
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
        if (prev === 'random') return 'billboard';
        if (prev === 'billboard') return 'circle';
        return 'random';
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setDrones(prev => prev.map(drone => {
      let tx, ty;
      if (formation === 'billboard') {
        // Form a grid
        const cols = 15;
        const row = Math.floor(drone.id / cols);
        const col = drone.id % cols;
        tx = 30 + (col * 3);
        ty = 30 + (row * 4);
      } else if (formation === 'circle') {
        const angle = (drone.id / DRONE_COUNT) * Math.PI * 2;
        tx = 50 + Math.cos(angle) * 20;
        ty = 50 + Math.sin(angle) * 20;
      } else {
        tx = Math.random() * 100;
        ty = Math.random() * 100;
      }
      return { ...drone, targetX: tx, targetY: ty };
    }));
  }, [formation]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none opacity-60">
      {drones.map(drone => (
        <motion.div
          key={drone.id}
          className="absolute w-1 h-1 bg-white rounded-full drone-light"
          animate={{
            left: `${drone.targetX}%`,
            top: `${drone.targetY}%`,
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            ease: "easeInOut"
          }}
        />
      ))}
      
      {/* Background Stars */}
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={`star-${i}`}
          className="absolute w-0.5 h-0.5 bg-white opacity-20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}
    </div>
  );
};
