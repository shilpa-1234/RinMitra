import React, { useState, useEffect } from 'react';
import { makeAuthRequest } from '../utils/supabase-client';
import { Crown, TrendingUp, Clock, CheckCircle2, AlertCircle, UserCircle, Edit2, Save, X } from 'lucide-react';
import { LoanApplicationForm } from './loan-application-form';
import { OfferComparison } from './offer-comparison';
import { PremiumUpgradeModal } from './premium-upgrade-modal';

interface UserDashboardProps {
  user: any;
  onRefresh: () => void;
}

export function UserDashboard({ user, onRefresh }: UserDashboardProps) {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'applications' | 'profile'>('applications');
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingApplication, setEditingApplication] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    phone: user.phone || '',
    income: user.kycData?.income || '',
    address: user.kycData?.address || '',
    companyName: user.kycData?.companyName || '',
  });

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const response = await makeAuthRequest('/my-applications');
      const data = await response.json();
      if (response.ok) {
        setApplications(data.applications || []);
      }
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationSuccess = () => {
    setShowLoanForm(false);
    loadApplications();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOfferCount = (app: any) => {
    return app.offers?.filter((o: any) => o.eligible).length || 0;
  };

  const handleProfileUpdate = async () => {
    try {
      const response = await makeAuthRequest('/user/update-profile', {
        method: 'POST',
        body: JSON.stringify({
          phone: profileData.phone,
          kycData: {
            income: parseFloat(profileData.income),
            address: profileData.address,
            companyName: profileData.companyName,
          }
        }),
      });
      
      if (response.ok) {
        alert('Profile updated successfully!');
        setEditingProfile(false);
        onRefresh();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      alert('Failed to update profile');
    }
  };

  const handleApplicationUpdate = async (appId: string) => {
    const app = applications.find(a => a.id === appId);
    if (!app) return;

    try {
      const response = await makeAuthRequest('/user/update-application', {
        method: 'POST',
        body: JSON.stringify({
          applicationId: appId,
          ...app
        }),
      });
      
      if (response.ok) {
        alert('Application updated successfully!');
        setEditingApplication(null);
        loadApplications();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update application');
      }
    } catch (error) {
      console.error('Application update error:', error);
      alert('Failed to update application');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-primary mb-2">Welcome, {user.name}! 👋</h1>
            <p className="text-muted-foreground">Manage your loan applications and compare offers</p>
          </div>
          <div className="flex gap-3">
            {!user.isPremium && (
              <button
                onClick={() => setShowPremiumModal(true)}
                className="px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-2"
              >
                <Crown className="w-5 h-5" />
                Upgrade to Premium
              </button>
            )}
            <button
              onClick={() => setShowLoanForm(true)}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              + New Application
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-border">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('applications')}
            className={`pb-3 px-2 border-b-2 transition-colors ${
              activeTab === 'applications'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Applications
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-2 border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <UserCircle className="w-4 h-4 inline mr-2" />
            Profile
          </button>
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl shadow-sm border border-border p-8 max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-primary">My Profile</h2>
            {!editingProfile ? (
              <button
                onClick={() => setEditingProfile(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleProfileUpdate}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingProfile(false);
                    setProfileData({
                      phone: user.phone || '',
                      income: user.kycData?.income || '',
                      address: user.kycData?.address || '',
                      companyName: user.kycData?.companyName || '',
                    });
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-foreground">Full Name</label>
              <input
                type="text"
                value={user.name}
                disabled
                className="w-full px-4 py-3 bg-gray-100 border border-border rounded-lg opacity-60 cursor-not-allowed"
              />
              <p className="text-muted-foreground mt-1">Name cannot be changed</p>
            </div>

            <div>
              <label className="block mb-2 text-foreground">Email</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-4 py-3 bg-gray-100 border border-border rounded-lg opacity-60 cursor-not-allowed"
              />
              <p className="text-muted-foreground mt-1">Contact admin to change email</p>
            </div>

            <div>
              <label className="block mb-2 text-foreground">Phone Number</label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                disabled={!editingProfile}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block mb-2 text-foreground">Monthly Income (₹)</label>
              <input
                type="number"
                value={profileData.income}
                onChange={(e) => setProfileData({ ...profileData, income: e.target.value })}
                disabled={!editingProfile}
                placeholder="50000"
                className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block mb-2 text-foreground">Address</label>
              <textarea
                value={profileData.address}
                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                disabled={!editingProfile}
                placeholder="Full address"
                rows={3}
                className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 resize-none"
              />
            </div>

            <div>
              <label className="block mb-2 text-foreground">Company Name</label>
              <input
                type="text"
                value={profileData.companyName}
                onChange={(e) => setProfileData({ ...profileData, companyName: e.target.value })}
                disabled={!editingProfile}
                placeholder="Company name"
                className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
              />
            </div>
          </div>
        </div>
      )}

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <>
          {/* Premium Status */}
          {user.isPremium && (
            <div className="mb-6 p-6 bg-gradient-to-r from-accent/20 to-accent/10 rounded-2xl border-2 border-accent">
              <div className="flex items-center gap-3">
                <Crown className="w-8 h-8 text-accent-foreground" />
                <div>
                  <h3 className="text-accent-foreground">Premium Member</h3>
                  <p className="text-muted-foreground">Plan: {user.premiumPlan?.toUpperCase()} • Unlimited comparisons</p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Total Applications</span>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <p className="text-primary">{applications.length}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Pending Review</span>
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-primary">
            {applications.filter(a => a.status === 'pending').length}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Total Offers</span>
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-primary">
            {applications.reduce((sum, app) => sum + getOfferCount(app), 0)}
          </p>
        </div>
      </div>

          {/* Applications List */}
          <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-primary">Your Applications</h2>
        </div>

        {loading ? (
          <div className="p-12 text-center text-muted-foreground">
            Loading applications...
          </div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No applications yet</p>
            <button
              onClick={() => setShowLoanForm(true)}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Create Your First Application
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {applications.map((app) => {
              const offerCount = getOfferCount(app);
              const canUnlock = offerCount >= 3 && !app.unlocked;

              return (
                <div key={app.id} className="p-6 hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-foreground capitalize">
                          {app.loanType.replace('-', ' ')} Loan
                        </h3>
                        <span className={`px-3 py-1 rounded-full border ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-muted-foreground">
                        <span>Amount: ₹{app.amount.toLocaleString()}</span>
                        <span>•</span>
                        <span>Tenure: {app.tenure} months</span>
                        <span>•</span>
                        <span>Offers: {offerCount}</span>
                      </div>
                      <p className="text-muted-foreground mt-2">
                        Applied on {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {canUnlock && (
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="px-6 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors"
                        >
                          Unlock Offers ({offerCount})
                        </button>
                      )}
                      {app.unlocked && (
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          View Comparison
                        </button>
                      )}
                      {offerCount < 3 && (
                        <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                          Waiting for {3 - offerCount} more offers
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
          </div>
        </>
      )}

      {/* Modals */}
      {showLoanForm && (
        <LoanApplicationForm
          onSuccess={handleApplicationSuccess}
          onClose={() => setShowLoanForm(false)}
        />
      )}

      {selectedApp && (
        <OfferComparison
          application={selectedApp}
          isPremium={user.isPremium}
          user={user}
          onClose={() => {
            setSelectedApp(null);
            loadApplications();
          }}
          onUpgrade={() => {
            setSelectedApp(null);
            setShowPremiumModal(true);
          }}
        />
      )}

      {showPremiumModal && (
        <PremiumUpgradeModal
          onSuccess={() => {
            setShowPremiumModal(false);
            onRefresh();
          }}
          onClose={() => setShowPremiumModal(false)}
        />
      )}
    </div>
  );
}
