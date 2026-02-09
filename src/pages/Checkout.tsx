import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { FloatingParticles } from '@/components/landing/FloatingParticles';
import { CheckoutForm, CheckoutFormData } from '@/components/checkout/CheckoutForm';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useRazorpay } from '@/hooks/useRazorpay';
import { useToast } from '@/hooks/use-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, totalAmount, clearCart } = useCart();
  const { initiatePayment, isLoading } = useRazorpay();
  const { toast } = useToast();

  // Redirect to passes if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/passes');
    }
  }, [cartItems.length, navigate]);

  const handleSubmit = async (data: CheckoutFormData & { teamMembers: string[] }) => {
    // Prepare payment options
    const paymentOptions = {
      amount: totalAmount * 100, // Convert to paise
      name: 'EUPHORIA 2026',
      description: `Registration for ${cartItems.length} item(s)`,
      prefill: {
        name: data.fullName,
        email: data.email,
        contact: data.phone,
      },
      notes: {
        college: data.college,
        teamMembers: data.teamMembers.join(', '),
      },
    };

    // Note: In production, you would first call your backend to create a Razorpay order
    // and get the order_id before initiating payment
    
    const result = await initiatePayment(paymentOptions);

    if (result.success) {
      // Clear cart and navigate to confirmation
      clearCart();
      navigate('/order-confirmation', {
        state: {
          orderId: result.razorpay_order_id || `EUPH-${Date.now()}`,
          paymentId: result.razorpay_payment_id,
          userDetails: data,
        },
      });
    } else {
      toast({
        title: 'Payment Failed',
        description: result.error || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Show nothing while redirecting
  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingParticles />
      <Navbar />

      <main className="relative pt-28 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Button>

          {/* Page Header */}
          <div className="text-center mb-10">
            <h1 className="font-cinzel text-3xl md:text-4xl font-bold text-foreground mb-3 text-glow">
              Checkout
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Complete your registration for EUPHORIA 2026. Fill in your details below.
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left - Form (3 columns) */}
            <div className="lg:col-span-3">
              <CheckoutForm onSubmit={handleSubmit} isLoading={isLoading} />
            </div>

            {/* Right - Order Summary (2 columns) */}
            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-28">
                <OrderSummary />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
