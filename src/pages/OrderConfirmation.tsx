import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { CheckCircle, Home, Calendar, Mail } from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { FloatingParticles } from '@/components/landing/FloatingParticles';
import { Button } from '@/components/ui/button';

interface OrderState {
  orderId: string;
  paymentId?: string;
  userDetails: {
    fullName: string;
    email: string;
    phone: string;
    college: string;
  };
}

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as OrderState | null;

  // Redirect if accessed directly without order data
  if (!state) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingParticles />
      <Navbar />

      <main className="relative pt-32 pb-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Animation */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/20 border-2 border-primary animate-pulse-glow">
              <CheckCircle className="w-12 h-12 text-primary" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="font-cinzel text-3xl md:text-4xl font-bold text-foreground mb-4 text-glow">
            Registration Successful!
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Welcome to EUPHORIA 2026, {state.userDetails.fullName}!
          </p>

          {/* Order Details Card */}
          <div className="glass-card rounded-xl p-6 border border-border/50 mb-8 text-left">
            <h2 className="font-cinzel text-lg text-foreground mb-4 text-center">
              Order Details
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-border/30">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-mono text-primary">{state.orderId}</span>
              </div>
              
              {state.paymentId && (
                <div className="flex justify-between py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Payment ID</span>
                  <span className="font-mono text-foreground text-sm">{state.paymentId}</span>
                </div>
              )}
              
              <div className="flex justify-between py-2 border-b border-border/30">
                <span className="text-muted-foreground">Registered Name</span>
                <span className="text-foreground">{state.userDetails.fullName}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-border/30">
                <span className="text-muted-foreground">Email</span>
                <span className="text-foreground">{state.userDetails.email}</span>
              </div>
              
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">College</span>
                <span className="text-foreground">{state.userDetails.college}</span>
              </div>
            </div>
          </div>

          {/* Email Confirmation Notice */}
          <div className="flex items-center justify-center gap-3 p-4 bg-secondary/30 rounded-lg mb-8">
            <Mail className="w-5 h-5 text-primary shrink-0" />
            <p className="text-sm text-muted-foreground">
              A confirmation email has been sent to{' '}
              <span className="text-foreground">{state.userDetails.email}</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="border-primary/50 text-primary hover:bg-primary/10"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <Button
              onClick={() => navigate('/events')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Explore Events
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderConfirmation;
