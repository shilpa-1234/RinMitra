import React, { useState } from 'react';
import { makeAuthRequest } from '../utils/supabase-client';
import { Banknote, X, Plus, Trash2 } from 'lucide-react';

interface LoanApplicationFormProps {
  onSuccess: () => void;
  onClose: () => void;
}

interface ExistingLoan {
  loanType: string;
  amount: string;
  tenure: string;
  emi: string;
  remainingTenure: string;
}

export function LoanApplicationForm({ onSuccess, onClose }: LoanApplicationFormProps) {
  const [formData, setFormData] = useState({
    loanType: 'personal',
    amount: '',
    tenure: '12',
    purpose: '',
  });
  const [hasExistingLoans, setHasExistingLoans] = useState(false);
  const [existingLoans, setExistingLoans] = useState<ExistingLoan[]>([
    { loanType: 'personal', amount: '', tenure: '', emi: '', remainingTenure: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addExistingLoan = () => {
    setExistingLoans([...existingLoans, { 
      loanType: 'personal', 
      amount: '', 
      tenure: '', 
      emi: '', 
      remainingTenure: '' 
    }]);
  };

  const removeExistingLoan = (index: number) => {
    if (existingLoans.length > 1) {
      setExistingLoans(existingLoans.filter((_, i) => i !== index));
    }
  };

  const updateExistingLoan = (index: number, field: keyof ExistingLoan, value: string) => {
    const updated = [...existingLoans];
    updated[index][field] = value;
    setExistingLoans(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await makeAuthRequest('/loan-application', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          tenure: parseInt(formData.tenure),
          hasExistingLoans,
          existingLoans: hasExistingLoans ? existingLoans.filter(loan => 
            loan.amount && loan.tenure && loan.emi && loan.remainingTenure
          ) : [],
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Application submission failed');

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg p-8 relative my-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
            <Banknote className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <h2 className="text-primary">Apply for Loan</h2>
            <p className="text-muted-foreground">Get offers from multiple banks</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 text-foreground">Loan Type</label>
            <select
              value={formData.loanType}
              onChange={(e) => setFormData({ ...formData, loanType: e.target.value })}
              className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="personal">Personal Loan</option>
              <option value="home">Home Loan</option>
              <option value="car">Car Loan</option>
              <option value="business">Business Loan</option>
              <option value="education">Education Loan</option>
              <option value="credit-card">Credit Card</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-foreground">Loan Amount (₹)</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="500000"
              min="10000"
              className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-foreground">Tenure (months)</label>
            <select
              value={formData.tenure}
              onChange={(e) => setFormData({ ...formData, tenure: e.target.value })}
              className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="6">6 months</option>
              <option value="12">12 months</option>
              <option value="24">24 months</option>
              <option value="36">36 months</option>
              <option value="48">48 months</option>
              <option value="60">60 months</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-foreground">Purpose</label>
            <textarea
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              placeholder="Brief description of loan purpose"
              rows={3}
              className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              required
            />
          </div>

          {/* Existing Loans Section */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-foreground">Do you have any existing loans?</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="hasExistingLoans"
                    checked={hasExistingLoans === false}
                    onChange={() => setHasExistingLoans(false)}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-foreground">No</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="hasExistingLoans"
                    checked={hasExistingLoans === true}
                    onChange={() => setHasExistingLoans(true)}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-foreground">Yes</span>
                </label>
              </div>
            </div>

            {hasExistingLoans && (
              <div className="space-y-4 mt-4">
                <p className="text-muted-foreground">
                  Please provide details of all your existing loans:
                </p>
                
                {existingLoans.map((loan, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border border-border space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-foreground">Loan {index + 1}</span>
                      {existingLoans.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeExistingLoan(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-1 text-muted-foreground">Loan Type</label>
                        <select
                          value={loan.loanType}
                          onChange={(e) => updateExistingLoan(index, 'loanType', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="personal">Personal Loan</option>
                          <option value="home">Home Loan</option>
                          <option value="car">Car Loan</option>
                          <option value="business">Business Loan</option>
                          <option value="education">Education Loan</option>
                          <option value="credit-card">Credit Card</option>
                        </select>
                      </div>

                      <div>
                        <label className="block mb-1 text-muted-foreground">Total Amount (₹)</label>
                        <input
                          type="number"
                          value={loan.amount}
                          onChange={(e) => updateExistingLoan(index, 'amount', e.target.value)}
                          placeholder="500000"
                          className="w-full px-3 py-2 bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 text-muted-foreground">Total Tenure (months)</label>
                        <input
                          type="number"
                          value={loan.tenure}
                          onChange={(e) => updateExistingLoan(index, 'tenure', e.target.value)}
                          placeholder="24"
                          className="w-full px-3 py-2 bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 text-muted-foreground">Monthly EMI (₹)</label>
                        <input
                          type="number"
                          value={loan.emi}
                          onChange={(e) => updateExistingLoan(index, 'emi', e.target.value)}
                          placeholder="25000"
                          className="w-full px-3 py-2 bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block mb-1 text-muted-foreground">Remaining Tenure (months)</label>
                        <input
                          type="number"
                          value={loan.remainingTenure}
                          onChange={(e) => updateExistingLoan(index, 'remainingTenure', e.target.value)}
                          placeholder="12"
                          className="w-full px-3 py-2 bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addExistingLoan}
                  className="w-full py-2 border-2 border-dashed border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Another Loan
                </button>
              </div>
            )}
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
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
}
