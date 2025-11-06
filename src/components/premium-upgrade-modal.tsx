import React, { useState } from 'react';
import { makeAuthRequest } from '../utils/supabase-client';
import { X, Crown, Check, Zap, Shield, Headphones } from 'lucide-react';
import { initiatePremiumPayment } from '../utils/razorpay';

interface PremiumUpgradeModalProps {
  user?: any;
  onSuccess: () => void;
  onClose: () => void;
}

export function PremiumUpgradeModal({ user, onSuccess, onClose }: PremiumUpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'silver' | 'gold' | 'platinum'>('gold');
  const [processing, setProcessing] = useState(false);

  const plans = [
    {
      id: 'silver',
      name: 'Silver',
      price: 499,
      duration: '3 months',
      features: ['Unlimited comparisons', 'Ad-free experience', 'Email support', '3 months validity'],
    },
    {
      id: 'gold',
      name: 'Gold',
      price: 999,
      duration: '6 months',
      features: ['All Silver features', 'Priority bank response', 'RM assistance', '6 months validity'],
      popular: true,
    },
    {
      id: 'platinum',
      name: 'Platinum',
      price: 1999,
      duration: '12 months',
      features: ['All Gold features', 'Exclusive bank offers', 'Dedicated RM', '12 months validity'],
    },
  ];

  const handleUpgrade = async () => {
    setProcessing(true);
    try {
      // In production, integrate with Razorpay/Stripe here
      const paymentId = `pay_premium_${Date.now()}`;

      const response = await makeAuthRequest('/upgrade-premium', {
        method: 'POST',
        body: JSON.stringify({
          plan: selectedPlan,
          paymentId,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        onSuccess();
      } else {
        alert(data.error || 'Failed to upgrade');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Failed to upgrade');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl my-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 text-center border-b border-border">
          <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-accent-foreground" />
          </div>
          <h2 className="text-primary mb-2">Upgrade to Premium</h2>
          <p className="text-muted-foreground">
            Unlock unlimited access and exclusive features
          </p>
        </div>

        {/* Benefits */}
        <div className="p-8 bg-muted/50 border-b border-border">
          <div className="grid md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <p className="text-foreground">Unlimited Comparisons</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <p className="text-foreground">Ad-Free Experience</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Headphones className="w-6 h-6 text-primary" />
              </div>
              <p className="text-foreground">Priority Support</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Crown className="w-6 h-6 text-primary" />
              </div>
              <p className="text-foreground">Exclusive Offers</p>
            </div>
          </div>
        </div>

        {/* Plans */}
        <div className="p-8">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id as any)}
                className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedPlan === plan.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                } ${plan.popular ? 'ring-2 ring-accent' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent text-accent-foreground rounded-full">
                    Popular
                  </div>
                )}

                <div className="text-center mb-4">
                  <h3 className="text-foreground mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-primary">₹{plan.price}</span>
                  </div>
                  <p className="text-muted-foreground">{plan.duration}</p>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-foreground">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={handleUpgrade}
              disabled={processing}
              className="px-12 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {processing ? 'Processing...' : `Upgrade to ${plans.find(p => p.id === selectedPlan)?.name} - ₹${plans.find(p => p.id === selectedPlan)?.price}`}
            </button>
            <p className="text-muted-foreground mt-4">
              Secure payment powered by Razorpay
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
