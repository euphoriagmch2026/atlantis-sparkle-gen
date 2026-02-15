import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ScheduleSection } from "@/components/landing/ScheduleSection";

const Schedule = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <ScheduleSection />
      </div>
      <Footer />
    </div>
  );
};
export default Schedule;
