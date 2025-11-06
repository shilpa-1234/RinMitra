import React, { useState } from 'react';
import { makeAuthRequest } from '../utils/supabase-client';
import { X, CheckCircle, XCircle } from 'lucide-react';

interface BankOfferFormProps {
  lead: any;
  onSuccess: () => void;
  onClose: () => void;
}

export function BankOfferForm({ lead, onSuccess, onClose }: BankOfferFormProps) {
  const [formData, setFormData] = useState({
    eligible: true,
    interestRate: '',
    emi: '',
    maxAmount: lead.amount.toString(),
    remarks: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await makeAuthRequest('/bank/submit-offer', {
        method: 'POST',
        body: JSON.stringify({
          applicationId: lead.id,
          eligible: formData.eligible,
          interestRate: parseFloat(formData.interestRate),
          emi: parseFloat(formData.emi),
          maxAmount: parseFloat(formData.maxAmount),
          remarks: formData.remarks,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to submit offer');

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-8 relative my-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-primary mb-6">Submit Loan Offer</h2>

        {/* Lead Info */}
        <div className="bg-muted p-4 rounded-lg mb-6">
          <h3 className="text-foreground mb-3">Application Details</h3>
          <div className="grid md:grid-cols-3 gap-4 text-foreground mb-4">
            <div>
              <p className="text-muted-foreground">Loan Type</p>
              <p className="capitalize">{lead.loanType.replace('-', ' ')}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Requested Amount</p>
              <p>₹{lead.amount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tenure</p>
              <p>{lead.tenure} months</p>
            </div>
            <div>
              <p className="text-muted-foreground">Income</p>
              <p>₹{lead.applicant.income?.toLocaleString()}/month</p>
            </div>
            <div>
              <p className="text-muted-foreground">Employment</p>
              <p className="capitalize">{lead.applicant.employmentType}</p>
            </div>
            <div>
              <p className="text-muted-foreground">City</p>
              <p>{lead.applicant.city}</p>
            </div>
          </div>

          {/* KYC Details */}
          {lead.applicant.kycData && (
            <div className="border-t border-border pt-4 mt-4">
              <h3 className="text-foreground mb-3">KYC & Verification Details</h3>
              <div className="grid md:grid-cols-3 gap-4 text-foreground">
                <div>
                  <p className="text-muted-foreground">Aadhaar Number</p>
                  <p className="font-mono">{lead.applicant.kycData.aadhaarNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">PAN Number</p>
                  <p className="font-mono uppercase">{lead.applicant.kycData.panNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date of Birth</p>
                  <p>{lead.applicant.kycData.dob}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Address</p>
                  <p>{lead.applicant.kycData.address}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Company Name</p>
                  <p>{lead.applicant.kycData.companyName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Work Experience</p>
                  <p>{lead.applicant.kycData.workExperience || 'N/A'} years</p>
                </div>
              </div>
            </div>
          )}

          {/* Existing Loans */}
          {lead.existingLoans && lead.existingLoans.length > 0 && (
            <div className="border-t border-border pt-4 mt-4">
              <h3 className="text-foreground mb-3">Existing Loans ({lead.existingLoans.length})</h3>
              <div className="space-y-3">
                {lead.existingLoans.map((loan: any, index: number) => (
                  <div key={index} className="bg-white p-3 rounded-lg border border-border">
                    <div className="grid md:grid-cols-5 gap-3 text-foreground">
                      <div>
                        <p className="text-muted-foreground">Type</p>
                        <p className="capitalize">{loan.loanType}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Amount</p>
                        <p>₹{parseFloat(loan.amount).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">EMI</p>
                        <p>₹{parseFloat(loan.emi).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Tenure</p>
                        <p>{loan.tenure} months</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Remaining</p>
                        <p>{loan.remainingTenure} months</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="bg-yellow-50 border border-yellow-200 p-2 rounded">
                  <p className="text-yellow-800">
                    <strong>Total Monthly EMI Burden:</strong> ₹
                    {lead.existingLoans.reduce((sum: number, loan: any) => sum + parseFloat(loan.emi || 0), 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 text-foreground">Eligibility Status</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, eligible: true })}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  formData.eligible
                    ? 'border-green-500 bg-green-50'
                    : 'border-border hover:border-green-500/50'
                }`}
              >
                <CheckCircle className={`w-6 h-6 mx-auto mb-2 ${formData.eligible ? 'text-green-600' : 'text-gray-400'}`} />
                <p className={formData.eligible ? 'text-green-900' : 'text-muted-foreground'}>Eligible</p>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, eligible: false })}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  !formData.eligible
                    ? 'border-red-500 bg-red-50'
                    : 'border-border hover:border-red-500/50'
                }`}
              >
                <XCircle className={`w-6 h-6 mx-auto mb-2 ${!formData.eligible ? 'text-red-600' : 'text-gray-400'}`} />
                <p className={!formData.eligible ? 'text-red-900' : 'text-muted-foreground'}>Not Eligible</p>
              </button>
            </div>
          </div>

          {formData.eligible && (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-foreground">Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.interestRate}
                    onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                    placeholder="9.5"
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-foreground">Monthly EMI (₹)</label>
                  <input
                    type="number"
                    value={formData.emi}
                    onChange={(e) => setFormData({ ...formData, emi: e.target.value })}
                    placeholder="8500"
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-foreground">Maximum Sanctioned Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.maxAmount}
                    onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
                    placeholder={lead.amount}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block mb-2 text-foreground">Remarks / Conditions</label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="Add any special conditions, required documents, or notes"
              rows={4}
              className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Offer'}
          </button>
        </form>
      </div>
    </div>
  );
}
