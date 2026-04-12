import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ScheduleSection } from "@/components/landing/ScheduleSection";

const Schedule = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Event Schedule | EUPHORIA 2026</title>
        <meta
          name="description"
          content="View the day-by-day event schedule for EUPHORIA 2026 at GMCH Chandigarh."
        />
      </Helmet>
      <Navbar />
      <div className="pt-20">
        <ScheduleSection />
      </div>
      <Footer />
    </div>
  );
};
export default Schedule;
