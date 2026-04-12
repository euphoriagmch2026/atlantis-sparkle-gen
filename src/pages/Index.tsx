import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { OverviewSection } from "@/components/landing/OverviewSection";
import { LegendSection } from "@/components/landing/LegendSection";
import { EventsPreviewSection } from "@/components/landing/EventsPreviewSection";
import { ScheduleSection } from "@/components/landing/ScheduleSection";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>EUPHORIA 2026 | GMCH Chandigarh Annual Fest</title>
        <meta
          name="description"
          content="Welcome to EUPHORIA 2026: The Lost City of Atlantis. Join the premier annual inter-college fest of GMCH Chandigarh."
        />
      </Helmet>
      <Navbar />
      <main>
        <HeroSection />
        <OverviewSection />
        <LegendSection />
        <EventsPreviewSection />
        <ScheduleSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
