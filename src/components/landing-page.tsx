import React from 'react';
import { Shield, Zap, TrendingUp, Users, CheckCircle, Crown, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 pt-20 pb-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full mb-6 border border-accent">
            <Crown className="w-4 h-4 text-accent-foreground" />
            <span className="text-accent-foreground">India's First Multi-Bank Loan Marketplace</span>
          </div>
          
          <h1 className="text-primary mb-6 max-w-4xl mx-auto">
            Compare Loan Offers from <span className="text-accent-foreground">Multiple Banks</span> in Minutes
          </h1>
          
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Submit your KYC once, get instant offers from 10+ partner banks. Compare rates, choose the best deal, 
            and keep your contact info private until you're ready.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onGetStarted}
              className="px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={onGetStarted}
              className="px-8 py-4 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
            >
              <Crown className="w-5 h-5" />
              View Premium Plans
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-foreground mb-2">Privacy Protected</h3>
            <p className="text-muted-foreground">
              Your contact info stays hidden until you accept an offer
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-foreground mb-2">Instant Offers</h3>
            <p className="text-muted-foreground">
              Get real-time loan offers from multiple banks in one place
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-foreground mb-2">Best Rates</h3>
            <p className="text-muted-foreground">
              Compare interest rates and EMI across all offers
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-foreground mb-2">RM Support</h3>
            <p className="text-muted-foreground">
              Dedicated relationship manager to guide you
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-primary mb-4">How LoanLinker Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get the best loan offers in 3 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h3 className="text-foreground mb-2">Complete KYC Once</h3>
              <p className="text-muted-foreground">
                Submit your Aadhaar, PAN, income details and get verified instantly
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h3 className="text-foreground mb-2">Get Multiple Offers</h3>
              <p className="text-muted-foreground">
                Banks review your profile and submit competitive loan offers
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h3 className="text-foreground mb-2">Choose & Proceed</h3>
              <p className="text-muted-foreground">
                Compare rates, select the best offer, and complete your loan process
              </p>
            </div>
          </div>
        </div>

        {/* Premium Section */}
        {/* <div className="bg-gradient-to-r from-accent/20 to-accent/10 rounded-2xl p-8 border-2 border-accent mb-20">
          <div className="text-center max-w-3xl mx-auto">
            <Crown className="w-12 h-12 text-accent-foreground mx-auto mb-4" />
            <h2 className="text-primary mb-4">Go Premium for More</h2>
            <p className="text-muted-foreground mb-6">
              Unlock unlimited comparisons, ad-free experience, and priority support
            </p>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg">
                <p className="text-foreground">Silver - ₹499</p>
                <p className="text-muted-foreground">3 months</p>
              </div>
              <div className="bg-white p-4 rounded-lg border-2 border-accent">
                <p className="text-accent-foreground">Gold - ₹999</p>
                <p className="text-muted-foreground">6 months • Popular</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-foreground">Platinum - ₹1999</p>
                <p className="text-muted-foreground">12 months</p>
              </div>
            </div>

            <button
              onClick={onGetStarted}
              className="px-8 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors"
            >
              View All Premium Benefits
            </button>
          </div>
        </div> */}

        {/* Trust Indicators */}
        <div className="text-center mb-20">
          <h2 className="text-primary mb-8">Trusted by Thousands</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <p className="text-primary mb-2">10,000+</p>
              <p className="text-muted-foreground">Happy Borrowers</p>
            </div>
            <div>
              <p className="text-primary mb-2">15+</p>
              <p className="text-muted-foreground">Partner Banks</p>
            </div>
            <div>
              <p className="text-primary mb-2">₹500Cr+</p>
              <p className="text-muted-foreground">Loans Facilitated</p>
            </div>
          </div>
        </div>

        {/* Access Information
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-border">
          <h3 className="text-primary mb-6 text-center">Account Access Guide</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-blue-900 mb-2">👤 For Borrowers</h4>
              <p className="text-blue-700 mb-3">
                Sign up directly and start comparing loan offers from multiple banks
              </p>
              <button
                onClick={onGetStarted}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Sign Up Now
              </button>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="text-purple-900 mb-2">🏦 For Banks & RMs</h4>
              <p className="text-purple-700 mb-3">
                Contact platform admin to get your account credentials
              </p>
              <button
                onClick={onGetStarted}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Login Here
              </button>
            </div>

            <div className="p-4 bg-accent/20 rounded-lg border border-accent">
              <h4 className="text-accent-foreground mb-2">👨‍💼 Platform Admin</h4>
              <p className="text-muted-foreground mb-3">
                Default credentials: admin@loanlinker.com
              </p>
              <button
                onClick={onGetStarted}
                className="w-full px-4 py-2 bg-accent text-accent-foreground rounded hover:bg-accent/90"
              >
                Admin Login
              </button>
            </div>
          </div>
        </div> */}
      </div>

      {/* Footer */}
      <div className="bg-primary text-primary-foreground py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="mb-2">LoanLinker - India's First Multi-Bank Loan Marketplace</p>
          <p className="text-primary-foreground/80">
            © 2025 LoanLinker. RBI Compliant | Data Protected with AES-256 Encryption
          </p>
        </div>
      </div>
    </div>
  );
}
