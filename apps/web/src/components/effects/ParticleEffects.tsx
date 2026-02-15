import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

interface ParticleEffectsProps {
  trigger: boolean;
  originX?: number;
  originY?: number;
  count?: number;
}

export function ParticleEffects({
  trigger,
  originX = 50,
  originY = 50,
  count = 12,
}: ParticleEffectsProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (trigger) {
      const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
        id: Date.now() + i,
        x: originX + (Math.random() - 0.5) * 200,
        y: originY + (Math.random() - 0.5) * 200,
        size: Math.random() * 6 + 2,
        duration: Math.random() * 1.5 + 0.5,
        delay: Math.random() * 0.3,
      }));
      setParticles(newParticles);

      const timeout = setTimeout(() => setParticles([]), 2000);
      return () => clearTimeout(timeout);
    }
  }, [trigger, originX, originY, count]);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-arcane-gold"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${originX}%`,
            top: `${originY}%`,
          }}
          initial={{ opacity: 1, scale: 0 }}
          animate={{
            x: particle.x - originX,
            y: particle.y - originY,
            opacity: 0,
            scale: 1.5,
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}
