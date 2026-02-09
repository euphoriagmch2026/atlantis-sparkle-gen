import { useState, useCallback, useEffect } from 'react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayOptions {
  amount: number; // in paise
  currency?: string;
  name: string;
  description?: string;
  orderId?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
}

export interface PaymentResult {
  success: boolean;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
  error?: string;
}

export const useRazorpay = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Razorpay script on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => setIsScriptLoaded(true);
      script.onerror = () => setError('Failed to load Razorpay SDK');
      document.body.appendChild(script);

      return () => {
        // Cleanup if component unmounts before script loads
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    } else if (window.Razorpay) {
      setIsScriptLoaded(true);
    }
  }, []);

  const initiatePayment = useCallback(
    async (options: RazorpayOptions): Promise<PaymentResult> => {
      return new Promise((resolve) => {
        if (!isScriptLoaded) {
          resolve({
            success: false,
            error: 'Razorpay SDK not loaded yet. Please try again.',
          });
          return;
        }

        setIsLoading(true);
        setError(null);

        // Note: In production, orderId should come from backend
        // For now, we simulate the flow
        const razorpayOptions = {
          key: 'rzp_test_placeholder', // Will be replaced with actual key from backend
          amount: options.amount,
          currency: options.currency || 'INR',
          name: options.name,
          description: options.description || 'EUPHORIA 2026 Registration',
          order_id: options.orderId, // This should come from backend
          prefill: options.prefill || {},
          notes: options.notes || {},
          theme: {
            color: options.theme?.color || '#14B8A6', // primary teal color
          },
          handler: function (response: any) {
            setIsLoading(false);
            resolve({
              success: true,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
          },
          modal: {
            ondismiss: function () {
              setIsLoading(false);
              resolve({
                success: false,
                error: 'Payment cancelled by user',
              });
            },
          },
        };

        try {
          const razorpay = new window.Razorpay(razorpayOptions);
          razorpay.on('payment.failed', function (response: any) {
            setIsLoading(false);
            resolve({
              success: false,
              error: response.error?.description || 'Payment failed',
            });
          });
          razorpay.open();
        } catch (err) {
          setIsLoading(false);
          const errorMessage = err instanceof Error ? err.message : 'Failed to initiate payment';
          setError(errorMessage);
          resolve({
            success: false,
            error: errorMessage,
          });
        }
      });
    },
    [isScriptLoaded]
  );

  return {
    initiatePayment,
    isLoading,
    isScriptLoaded,
    error,
  };
};
