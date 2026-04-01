import { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { CheckCircle, Home, Calendar, Mail, Search, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { FloatingParticles } from '@/components/landing/FloatingParticles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

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

interface OrderSummaryData {
  order: {
    razorpay_order_id: string;
    full_name: string;
    email: string;
    college: string;
    total_amount: number;
    status: string;
    created_at: string;
  };
  items: { item_name: string; item_type: string; price: number; quantity: number }[];
}

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as OrderState | null;

  const [lookupOrderId, setLookupOrderId] = useState('');
  const [lookupEmail, setLookupEmail] = useState('');
  const [lookupData, setLookupData] = useState<OrderSummaryData | null>(null);
  const [lookupError, setLookupError] = useState('');
  const [isLooking, setIsLooking] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');
    setIsLooking(true);
    const { data, error } = await supabase.rpc('get_order_summary', {
      p_order_id: lookupOrderId,
      p_email: lookupEmail,
    });
    setIsLooking(false);
    if (error || !data || (data as any).error) {
      setLookupError('Order not found. Please check your Order ID and email.');
      return;
    }
    setLookupData(data as unknown as OrderSummaryData);
  };

  // If we have navigation state, show the success view
  if (state) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        <FloatingParticles />
        <Navbar />
        <main className="relative pt-32 pb-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/20 border-2 border-primary animate-pulse-glow">
                <CheckCircle className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h1 className="font-cinzel text-3xl md:text-4xl font-bold text-foreground mb-4 text-glow">
              Registration Successful!
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Welcome to EUPHORIA 2026, {state.userDetails.fullName}!
            </p>
            <div className="glass-card rounded-xl p-6 border border-border/50 mb-8 text-left">
              <h2 className="font-cinzel text-lg text-foreground mb-4 text-center">Order Details</h2>
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
                  <span className="text-muted-foreground">Name</span>
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
            <div className="flex items-center justify-center gap-3 p-4 bg-secondary/30 rounded-lg mb-8">
              <Mail className="w-5 h-5 text-primary shrink-0" />
              <p className="text-sm text-muted-foreground">
                A confirmation email will be sent to <span className="text-foreground">{state.userDetails.email}</span>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/')} variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                <Home className="w-4 h-4 mr-2" /> Back to Home
              </Button>
              <Button onClick={() => navigate('/events')} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Calendar className="w-4 h-4 mr-2" /> Explore Events
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Lookup form when no state
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingParticles />
      <Navbar />
      <main className="relative pt-32 pb-20 px-4">
        <div className="max-w-lg mx-auto">
          {!lookupData ? (
            <div className="glass-card rounded-xl p-8 border border-border/50">
              <div className="text-center mb-6">
                <Search className="w-10 h-10 text-primary mx-auto mb-3" />
                <h1 className="font-cinzel text-2xl font-bold text-foreground text-glow">Find Your Order</h1>
                <p className="text-muted-foreground text-sm mt-2">Enter your Order ID and email to view your registration details.</p>
              </div>
              <form onSubmit={handleLookup} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Order ID</Label>
                  <Input placeholder="order_..." value={lookupOrderId}
                    onChange={e => setLookupOrderId(e.target.value)} required
                    className="bg-secondary/30 border-border/50 font-mono" />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Email</Label>
                  <Input type="email" placeholder="your.email@example.com" value={lookupEmail}
                    onChange={e => setLookupEmail(e.target.value)} required
                    className="bg-secondary/30 border-border/50" />
                </div>
                {lookupError && <p className="text-sm text-destructive">{lookupError}</p>}
                <Button type="submit" disabled={isLooking} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  {isLooking ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Looking up...</> : "Find Order"}
                </Button>
              </form>
            </div>
          ) : (
            <div className="text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 border-2 border-primary">
                  <CheckCircle className="w-10 h-10 text-primary" />
                </div>
              </div>
              <h1 className="font-cinzel text-2xl font-bold text-foreground mb-2 text-glow">Order Found</h1>
              <p className="text-muted-foreground mb-6">Status: <span className="text-primary font-semibold capitalize">{lookupData.order.status}</span></p>
              <div className="glass-card rounded-xl p-6 border border-border/50 mb-6 text-left">
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-border/30">
                    <span className="text-muted-foreground">Order ID</span>
                    <span className="font-mono text-primary text-sm">{lookupData.order.razorpay_order_id}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/30">
                    <span className="text-muted-foreground">Name</span>
                    <span className="text-foreground">{lookupData.order.full_name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/30">
                    <span className="text-muted-foreground">College</span>
                    <span className="text-foreground">{lookupData.order.college}</span>
                  </div>
                  {lookupData.items.length > 0 && (
                    <>
                      <h3 className="font-cinzel text-sm text-foreground pt-2">Items</h3>
                      {lookupData.items.map((item, i) => (
                        <div key={i} className="flex justify-between py-1 text-sm">
                          <span className="text-muted-foreground">{item.item_name} x{item.quantity}</span>
                          <span className="text-foreground">₹{(item.price / 100).toFixed(0)}</span>
                        </div>
                      ))}
                    </>
                  )}
                  <div className="flex justify-between py-2 border-t border-border/30 font-semibold">
                    <span className="text-foreground">Total</span>
                    <span className="text-accent text-glow-gold">₹{(lookupData.order.total_amount / 100).toFixed(0)}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => navigate('/')} variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                  <Home className="w-4 h-4 mr-2" /> Home
                </Button>
                <Button onClick={() => navigate('/events')} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Calendar className="w-4 h-4 mr-2" /> Events
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderConfirmation;
