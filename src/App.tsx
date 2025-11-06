import React, { useState, useEffect } from 'react';
import { supabase, makeAuthRequest } from './utils/supabase-client';
import { LandingPage } from './components/landing-page';
import { AuthForm } from './components/auth-form';
import { KYCForm } from './components/kyc-form';
import { UserDashboard } from './components/user-dashboard';
import { BankDashboard } from './components/bank-dashboard';
import { AdminDashboard } from './components/admin-dashboard';
import { RMDashboard } from './components/rm-dashboard';
import { LogOut, Menu, X } from 'lucide-react';

function App() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showKYC, setShowKYC] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session) {
          await loadUserData();
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        await loadUserData();
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const response = await makeAuthRequest('/me');
      const data = await response.json();
      if (response.ok && data.user) {
        setUser(data.user);
        
        // Show KYC form if user hasn't completed it
        if (data.user.role === 'user' && data.user.kycStatus !== 'verified') {
          setShowKYC(true);
        }
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setShowAuth(false);
    setShowKYC(false);
  };

  const handleAuthSuccess = async () => {
    setShowAuth(false);
    await loadUserData();
  };

  const handleKYCSuccess = async () => {
    setShowKYC(false);
    await loadUserData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading LoanLinker...</p>
        </div>
      </div>
    );
  }

  // Not logged in - show landing page
  if (!session || !user) {
    return (
      <>
        <LandingPage onGetStarted={() => setShowAuth(true)} />
        {showAuth && (
          <AuthForm onSuccess={handleAuthSuccess} onClose={() => setShowAuth(false)} />
        )}
      </>
    );
  }

  // Show KYC form if user needs to complete it
  if (showKYC && user.role === 'user') {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <KYCForm onSuccess={handleKYCSuccess} />
      </div>
    );
  }

  // Logged in - show appropriate dashboard based on role
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground">LL</span>
              </div>
              <span className="text-primary">LoanLinker</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <div className="text-foreground">
                {user.name}
                {user.isPremium && (
                  <span className="ml-2 px-2 py-1 bg-accent/20 text-accent-foreground rounded">
                    Premium
                  </span>
                )}
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-foreground"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border">
              <div className="space-y-2">
                <div className="px-4 py-2 text-foreground">
                  {user.name}
                  {user.isPremium && (
                    <span className="ml-2 px-2 py-1 bg-accent/20 text-accent-foreground rounded">
                      Premium
                    </span>
                  )}
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-4 py-2 text-muted-foreground hover:bg-muted transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Dashboard Content */}
      <main>
        {user.role === 'user' && <UserDashboard user={user} onRefresh={loadUserData} />}
        {user.role === 'bank' && <BankDashboard user={user} />}
        {user.role === 'admin' && <AdminDashboard user={user} />}
        {user.role === 'rm' && <RMDashboard user={user} />}
      </main>
    </div>
  );
}

export default App;
