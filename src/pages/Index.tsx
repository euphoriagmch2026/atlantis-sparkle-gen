import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { OverviewSection } from '@/components/landing/OverviewSection';
import { LegendSection } from '@/components/landing/LegendSection';
import { EventsPreviewSection } from '@/components/landing/EventsPreviewSection';
import { ScheduleSection } from '@/components/landing/ScheduleSection';
import { SponsorsSection } from '@/components/landing/SponsorsSection';
import { Footer } from '@/components/landing/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <OverviewSection />
        <LegendSection />
        <EventsPreviewSection />
        <ScheduleSection />
        <SponsorsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
