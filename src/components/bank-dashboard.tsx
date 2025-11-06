import React, { useState, useEffect } from 'react';
import { makeAuthRequest } from '../utils/supabase-client';
import { Users, TrendingUp, CheckCircle, Plus, UserCircle, Edit2, Save, X } from 'lucide-react';
import { BankOfferForm } from './bank-offer-form';

interface BankDashboardProps {
  user: any;
}

export function BankDashboard({ user }: BankDashboardProps) {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'new' | 'offered'>('all');
  const [activeTab, setActiveTab] = useState<'leads' | 'profile'>('leads');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user.name || '',
    phone: user.phone || '',
    email: user.email || '',
    address: '',
  });

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      const response = await makeAuthRequest('/bank/leads');
      const data = await response.json();
      if (response.ok) {
        setLeads(data.leads || []);
      }
    } catch (error) {
      console.error('Failed to load leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    if (filter === 'new') return !lead.hasOfferedByMe;
    if (filter === 'offered') return lead.hasOfferedByMe;
    return true;
  });

  const handleOfferSuccess = () => {
    setSelectedLead(null);
    loadLeads();
  };

  const handleProfileUpdate = async () => {
    try {
      const response = await makeAuthRequest('/bank/update-profile', {
        method: 'POST',
        body: JSON.stringify(profileData),
      });
      
      if (response.ok) {
        alert('Profile updated successfully!');
        setEditingProfile(false);
        // Update local user data
        user.name = profileData.name;
        user.phone = profileData.phone;
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      alert('Failed to update profile');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-primary mb-2">Bank Partner Dashboard</h1>
        <p className="text-muted-foreground">Welcome, {user.name}</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-border">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('leads')}
            className={`pb-3 px-2 border-b-2 transition-colors ${
              activeTab === 'leads'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Leads
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
            <h2 className="text-primary">Bank Profile</h2>
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
                      name: user.name || '',
                      phone: user.phone || '',
                      email: user.email || '',
                      address: profileData.address,
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
              <label className="block mb-2 text-foreground">Bank Name</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                disabled={!editingProfile}
                className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block mb-2 text-foreground">Email</label>
              <input
                type="email"
                value={profileData.email}
                disabled
                className="w-full px-4 py-3 bg-gray-100 border border-border rounded-lg opacity-60 cursor-not-allowed"
              />
              <p className="text-muted-foreground mt-1">Email cannot be changed</p>
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
              <label className="block mb-2 text-foreground">Bank Address</label>
              <textarea
                value={profileData.address}
                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                disabled={!editingProfile}
                placeholder="Bank headquarters address"
                rows={3}
                className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Leads Tab */}
      {activeTab === 'leads' && (
        <>
          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Total Leads</span>
            <Users className="w-5 h-5 text-primary" />
          </div>
          <p className="text-primary">{leads.length}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">New Leads</span>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-primary">
            {leads.filter(l => !l.hasOfferedByMe).length}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Offers Submitted</span>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-primary">
            {leads.filter(l => l.hasOfferedByMe).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-primary">Available Leads</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                All ({leads.length})
              </button>
              <button
                onClick={() => setFilter('new')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'new'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                New ({leads.filter(l => !l.hasOfferedByMe).length})
              </button>
              <button
                onClick={() => setFilter('offered')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'offered'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Offered ({leads.filter(l => l.hasOfferedByMe).length})
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-muted-foreground">
            Loading leads...
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No leads available
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-foreground">Loan Type</th>
                  <th className="px-4 py-3 text-left text-foreground">Amount</th>
                  <th className="px-4 py-3 text-left text-foreground">Tenure</th>
                  <th className="px-4 py-3 text-left text-foreground">Income</th>
                  <th className="px-4 py-3 text-left text-foreground">Employment</th>
                  <th className="px-4 py-3 text-left text-foreground">City</th>
                  <th className="px-4 py-3 text-left text-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-muted/50">
                    <td className="px-4 py-4 text-foreground capitalize">
                      {lead.loanType.replace('-', ' ')}
                    </td>
                    <td className="px-4 py-4 text-foreground">
                      ₹{lead.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-foreground">
                      {lead.tenure}m
                    </td>
                    <td className="px-4 py-4 text-foreground">
                      ₹{lead.applicant.income?.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-foreground capitalize">
                      {lead.applicant.employmentType}
                    </td>
                    <td className="px-4 py-4 text-foreground">
                      {lead.applicant.city}
                    </td>
                    <td className="px-4 py-4">
                      {lead.hasOfferedByMe ? (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full border border-green-200">
                          Offered
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full border border-blue-200">
                          New
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        {lead.hasOfferedByMe ? 'Update Offer' : 'Make Offer'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
        </>
      )}

      {/* Offer Form Modal */}
      {selectedLead && (
        <BankOfferForm
          lead={selectedLead}
          onSuccess={handleOfferSuccess}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
}
