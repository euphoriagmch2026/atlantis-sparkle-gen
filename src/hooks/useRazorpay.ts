import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface PaymentResult {
  success: boolean;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
  error?: string;
}

interface CartItemForOrder {
  id: string;
  quantity: number;
  type: 'pass' | 'event';
}

interface UserDetails {
  fullName: string;
  email: string;
  phone: string;
  college: string;
  teamMembers: string[];
}

export const useRazorpay = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => setIsScriptLoaded(true);
      script.onerror = () => setError('Failed to load Razorpay SDK');
      document.body.appendChild(script);
      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    } else if (window.Razorpay) {
      setIsScriptLoaded(true);
    }
  }, []);

  const initiatePayment = useCallback(
    async (cartItems: CartItemForOrder[], userDetails: UserDetails): Promise<PaymentResult> => {
      if (!isScriptLoaded) {
        return { success: false, error: 'Razorpay SDK not loaded yet. Please try again.' };
      }

      setIsLoading(true);
      setError(null);

      try {
        // Step 1: Create order via edge function
        const { data: orderData, error: fnError } = await supabase.functions.invoke(
          'create-razorpay-order',
          {
            body: { cartItems, userDetails },
          }
        );

        if (fnError || orderData?.error) {
          throw new Error(orderData?.error || fnError?.message || 'Failed to create order');
        }

        // Step 2: Open Razorpay checkout
        return new Promise<PaymentResult>((resolve) => {
          const razorpayOptions = {
            key: orderData.keyId,
            amount: orderData.amount,
            currency: orderData.currency,
            name: 'EUPHORIA 2026',
            description: `Registration for ${cartItems.length} item(s)`,
            order_id: orderData.orderId,
            prefill: {
              name: userDetails.fullName,
              email: userDetails.email,
              contact: userDetails.phone,
            },
            theme: { color: '#14B8A6' },
            handler: async (response: any) => {
              // Step 3: Verify payment
              try {
                const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
                  'verify-razorpay-payment',
                  {
                    body: {
                      razorpay_order_id: response.razorpay_order_id,
                      razorpay_payment_id: response.razorpay_payment_id,
                      razorpay_signature: response.razorpay_signature,
                    },
                  }
                );

                setIsLoading(false);

                if (verifyError || !verifyData?.verified) {
                  resolve({
                    success: false,
                    error: verifyData?.error || 'Payment verification failed',
                  });
                } else {
                  resolve({
                    success: true,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature,
                  });
                }
              } catch {
                setIsLoading(false);
                resolve({ success: false, error: 'Payment verification failed' });
              }
            },
            modal: {
              ondismiss: () => {
                setIsLoading(false);
                resolve({ success: false, error: 'Payment cancelled by user' });
              },
            },
          };

          try {
            const razorpay = new window.Razorpay(razorpayOptions);
            razorpay.on('payment.failed', (response: any) => {
              setIsLoading(false);
              resolve({
                success: false,
                error: response.error?.description || 'Payment failed',
              });
            });
            razorpay.open();
          } catch (err) {
            setIsLoading(false);
            resolve({
              success: false,
              error: err instanceof Error ? err.message : 'Failed to open payment',
            });
          }
        });
      } catch (err) {
        setIsLoading(false);
        const msg = err instanceof Error ? err.message : 'Failed to initiate payment';
        setError(msg);
        return { success: false, error: msg };
      }
    },
    [isScriptLoaded]
  );

  return { initiatePayment, isLoading, isScriptLoaded, error };
};
