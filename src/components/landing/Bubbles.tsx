import { useEffect, useState } from 'react';

interface Bubble {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
}

export const Bubbles = () => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    const generated: Bubble[] = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 8 + 4,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 10,
    }));
    setBubbles(generated);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute bottom-0 rounded-full border border-primary/30 bg-primary/5"
          style={{
            left: `${bubble.x}%`,
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            animation: `bubble ${bubble.duration}s ease-in-out infinite`,
            animationDelay: `${bubble.delay}s`,
          }}
        />
      ))}
    </div>
  );
};
