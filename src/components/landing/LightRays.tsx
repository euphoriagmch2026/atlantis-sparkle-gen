export const LightRays = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Main light rays from top */}
      <div 
        className="absolute top-0 left-1/4 w-32 h-full bg-gradient-to-b from-primary/10 via-primary/5 to-transparent"
        style={{ transform: 'skewX(-15deg)' }}
      />
      <div 
        className="absolute top-0 left-1/2 w-48 h-full bg-gradient-to-b from-primary/8 via-primary/3 to-transparent"
        style={{ transform: 'skewX(10deg)' }}
      />
      <div 
        className="absolute top-0 right-1/4 w-24 h-full bg-gradient-to-b from-primary/12 via-primary/4 to-transparent"
        style={{ transform: 'skewX(-8deg)' }}
      />
      
      {/* Ambient glow at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-primary/5 to-transparent" />
    </div>
  );
};
