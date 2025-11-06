import React, { useState } from 'react';
import { makeAuthRequest } from '../utils/supabase-client';
import { X, CheckCircle, XCircle, TrendingDown, Crown } from 'lucide-react';
import { initiateUnlockPayment } from '../utils/razorpay';

interface OfferComparisonProps {
  application: any;
  isPremium: boolean;
  user?: any;
  onClose: () => void;
  onUpgrade: () => void;
}

export function OfferComparison({ application, isPremium, user, onClose, onUpgrade }: OfferComparisonProps) {
  const [unlocking, setUnlocking] = useState(false);
  const [unlocked, setUnlocked] = useState(application.unlocked);

  const eligibleOffers = application.offers?.filter((o: any) => o.eligible) || [];

  const handleUnlock = async () => {
    if (isPremium) {
      // Premium users get instant access
      setUnlocked(true);
      return;
    }

    setUnlocking(true);
    try {
      // Integrate with Razorpay
      await initiateUnlockPayment(
        application.id,
        {
          name: user?.name || 'User',
          email: user?.email || '',
          phone: user?.phone || ''
        },
        async (paymentId) => {
          // Payment successful, now unlock offers
          const response = await makeAuthRequest('/unlock-offers', {
            method: 'POST',
            body: JSON.stringify({
              applicationId: application.id,
              paymentId,
            }),
          });

          const data = await response.json();
          if (response.ok) {
            setUnlocked(true);
            alert('Payment successful! Offers unlocked.');
          } else {
            alert(data.error || 'Failed to unlock offers');
          }
          setUnlocking(false);
        },
        (error) => {
          console.error('Payment failed:', error);
          alert('Payment failed or cancelled');
          setUnlocking(false);
        }
      );
    } catch (error) {
      console.error('Unlock error:', error);
      alert('Failed to initiate payment');
      setUnlocking(false);
    }
  };

  const sortedOffers = [...eligibleOffers].sort((a, b) => 
    parseFloat(a.interestRate) - parseFloat(b.interestRate)
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-5xl my-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 bg-white rounded-full p-2"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 border-b border-border">
          <h2 className="text-primary mb-2">Compare Loan Offers</h2>
          <p className="text-muted-foreground">
            {application.loanType.replace('-', ' ')} Loan - ₹{application.amount.toLocaleString()}
          </p>
        </div>

        {!unlocked ? (
          <div className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Crown className="w-10 h-10 text-accent-foreground" />
              </div>
              <h3 className="text-primary mb-3">
                {eligibleOffers.length} Banks Ready to Offer!
              </h3>
              <p className="text-muted-foreground mb-6">
                Multiple banks have reviewed your application and are ready to make you an offer. 
                Unlock the comparison to see interest rates, EMI, and choose the best deal.
              </p>

              <div className="bg-blue-50 p-6 rounded-xl mb-6 border border-blue-200">
                <h4 className="text-blue-900 mb-2">Unlock Options:</h4>
                <div className="space-y-3 text-left">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-blue-900">One-time unlock: ₹199</p>
                      <p className="text-blue-700">View this comparison once</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Crown className="w-5 h-5 text-accent-foreground mt-0.5" />
                    <div>
                      <p className="text-accent-foreground">Premium Plan: ₹499+</p>
                      <p className="text-blue-700">Unlimited comparisons + Ad-free + Priority support</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleUnlock}
                  disabled={unlocking}
                  className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {unlocking ? 'Processing...' : 'Unlock for ₹199'}
                </button>
                <button
                  onClick={onUpgrade}
                  className="px-8 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-2"
                >
                  <Crown className="w-5 h-5" />
                  Go Premium
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6">
            {/* Best Offer Highlight */}
            {sortedOffers.length > 0 && (
              <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border-2 border-green-500">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="w-5 h-5 text-green-700" />
                  <h3 className="text-green-900">Best Offer</h3>
                </div>
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-green-700">Bank</p>
                    <p className="text-green-900">{sortedOffers[0].bankName}</p>
                  </div>
                  <div>
                    <p className="text-green-700">Interest Rate</p>
                    <p className="text-green-900">{sortedOffers[0].interestRate}%</p>
                  </div>
                  <div>
                    <p className="text-green-700">EMI</p>
                    <p className="text-green-900">₹{sortedOffers[0].emi?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-green-700">Max Amount</p>
                    <p className="text-green-900">₹{sortedOffers[0].maxAmount?.toLocaleString()}</p>
                  </div>
                </div>
                <button className="mt-4 px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors">
                  Proceed with {sortedOffers[0].bankName}
                </button>
              </div>
            )}

            {/* All Offers Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-foreground">Bank</th>
                    <th className="px-4 py-3 text-left text-foreground">Interest Rate</th>
                    <th className="px-4 py-3 text-left text-foreground">EMI</th>
                    <th className="px-4 py-3 text-left text-foreground">Max Amount</th>
                    <th className="px-4 py-3 text-left text-foreground">Eligible</th>
                    <th className="px-4 py-3 text-left text-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sortedOffers.map((offer: any) => (
                    <tr key={offer.id} className="hover:bg-muted/50">
                      <td className="px-4 py-4 text-foreground">{offer.bankName}</td>
                      <td className="px-4 py-4 text-foreground">{offer.interestRate}%</td>
                      <td className="px-4 py-4 text-foreground">₹{offer.emi?.toLocaleString()}</td>
                      <td className="px-4 py-4 text-foreground">₹{offer.maxAmount?.toLocaleString()}</td>
                      <td className="px-4 py-4">
                        {offer.eligible ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            Yes
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600">
                            <XCircle className="w-4 h-4" />
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <button className="px-4 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors">
                          Select
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {eligibleOffers.length === 0 && (
              <div className="p-12 text-center text-muted-foreground">
                No eligible offers at this time. Our team will reach out with alternatives.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
