export const SponsorsSection = () => {
  // Placeholder sponsor slots
  const sponsorSlots = Array.from({ length: 6 }, (_, i) => i + 1);

  return (
    <section className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="text-accent text-sm tracking-[0.3em] uppercase mb-4 block">
            Our Partners
          </span>
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-foreground mb-4">
            <span className="text-accent text-glow-gold">Royal</span> Sponsors
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Backed by the finest patrons who believe in the spirit of celebration and innovation.
          </p>
        </div>

        {/* Sponsors grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {sponsorSlots.map((slot) => (
            <div
              key={slot}
              className="glass-card rounded-xl p-8 flex items-center justify-center min-h-[120px] border border-accent/20 hover:border-accent/50 transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--accent)/0.2)] group"
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-lg bg-accent/10 flex items-center justify-center mb-2 group-hover:bg-accent/20 transition-colors">
                  <span className="text-accent/50 font-cinzel text-xl">S{slot}</span>
                </div>
                <span className="text-muted-foreground text-xs">Sponsor Slot</span>
              </div>
            </div>
          ))}
        </div>

        {/* Become a sponsor CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Interested in partnering with EUPHORIA 2026?
          </p>
          <a 
            href="#contact" 
            className="inline-block px-6 py-2 border border-accent/50 rounded-full text-accent hover:bg-accent/10 transition-all duration-300 text-sm tracking-wider"
          >
            Become a Sponsor
          </a>
        </div>
      </div>
    </section>
  );
};
