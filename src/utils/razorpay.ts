// Razorpay Integration for LoanLinker
// Make sure to add RAZORPAY_KEY_ID to your environment variables

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayOptions {
  amount: number; // in rupees
  currency?: string;
  name: string;
  description: string;
  orderId?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, any>;
  theme?: {
    color?: string;
  };
}

// Load Razorpay script
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// Create Razorpay payment
export const createRazorpayPayment = async (
  options: RazorpayOptions,
  onSuccess: (paymentId: string, orderId: string, signature: string) => void,
  onFailure: (error: any) => void
): Promise<void> => {
  const res = await loadRazorpayScript();

  if (!res) {
    alert('Razorpay SDK failed to load. Please check your internet connection.');
    return;
  }

  const razorpayOptions = {
    key: process.env.RAZORPAY_KEY_ID || 'rzp_test_PLACEHOLDER', // Replace with your key
    amount: options.amount * 100, // Razorpay accepts amount in paise
    currency: options.currency || 'INR',
    name: options.name || 'LoanLinker',
    description: options.description,
    image: '/logo.png', // Optional: Add your logo
    order_id: options.orderId, // Order ID from backend
    handler: function (response: any) {
      onSuccess(
        response.razorpay_payment_id,
        response.razorpay_order_id,
        response.razorpay_signature
      );
    },
    prefill: options.prefill || {},
    notes: options.notes || {},
    theme: {
      color: options.theme?.color || '#0047AB', // Royal Blue
    },
    modal: {
      ondismiss: function() {
        onFailure({ code: 'payment_cancelled', description: 'Payment cancelled by user' });
      }
    }
  };

  const paymentObject = new window.Razorpay(razorpayOptions);
  paymentObject.open();
};

// Quick payment for unlock feature (₹199)
export const initiateUnlockPayment = async (
  applicationId: string,
  userDetails: { name: string; email: string; phone: string },
  onSuccess: (paymentId: string) => void,
  onFailure: (error: any) => void
) => {
  await createRazorpayPayment(
    {
      amount: 199,
      name: 'LoanLinker',
      description: 'Unlock Loan Offers',
      notes: {
        applicationId,
        type: 'unlock'
      },
      prefill: userDetails,
      theme: { color: '#0047AB' }
    },
    (paymentId) => {
      onSuccess(paymentId);
    },
    onFailure
  );
};

// Premium membership payment
export const initiatePremiumPayment = async (
  plan: 'silver' | 'gold' | 'platinum',
  userDetails: { name: string; email: string; phone: string },
  onSuccess: (paymentId: string) => void,
  onFailure: (error: any) => void
) => {
  const prices = {
    silver: 499,
    gold: 999,
    platinum: 1999
  };

  const planNames = {
    silver: 'Silver Plan - 3 Months',
    gold: 'Gold Plan - 6 Months',
    platinum: 'Platinum Plan - 12 Months'
  };

  await createRazorpayPayment(
    {
      amount: prices[plan],
      name: 'LoanLinker Premium',
      description: planNames[plan],
      notes: {
        plan,
        type: 'premium'
      },
      prefill: userDetails,
      theme: { color: '#FFD700' } // Gold color for premium
    },
    (paymentId) => {
      onSuccess(paymentId);
    },
    onFailure
  );
};
