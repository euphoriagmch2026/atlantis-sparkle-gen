import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 pb-20 px-4 max-w-4xl mx-auto">
        <h1 className="font-cinzel text-4xl font-bold text-center mb-12 text-glow">
          Contact Us
        </h1>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-primary">Get in Touch</h3>
            <p className="text-muted-foreground">
              Government Medical College & Hospital
              <br />
              Chandigarh - 160030
            </p>
            <p className="text-muted-foreground">euphoriagmch2026@gmail.com</p>
          </div>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="First Name" />
              <Input placeholder="Last Name" />
            </div>
            <Input placeholder="Email" type="email" />
            <Textarea placeholder="Message" className="min-h-[150px]" />
            <Button className="w-full">Send Message</Button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default Contact;
