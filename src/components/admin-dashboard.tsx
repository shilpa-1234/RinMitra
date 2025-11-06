import React, { useState, useEffect } from 'react';
import { makeAuthRequest } from '../utils/supabase-client';
import { Users, Building2, FileText, DollarSign, TrendingUp, UserCheck, Plus, Copy, Check, Edit2, Key, X } from 'lucide-react';

interface AdminDashboardProps {
  user: any;
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'applications' | 'create-account'>('overview');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createdAccount, setCreatedAccount] = useState<any>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [assigningRM, setAssigningRM] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [analyticsRes, usersRes, appsRes] = await Promise.all([
        makeAuthRequest('/admin/analytics'),
        makeAuthRequest('/admin/users'),
        makeAuthRequest('/admin/applications'),
      ]);

      const analyticsData = await analyticsRes.json();
      const usersData = await usersRes.json();
      const appsData = await appsRes.json();

      if (analyticsRes.ok) setAnalytics(analyticsData.analytics);
      if (usersRes.ok) setUsers(usersData.users);
      if (appsRes.ok) setApplications(appsData.applications);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    try {
      const response = await makeAuthRequest('/admin/create-account', {
        method: 'POST',
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password'),
          name: formData.get('name'),
          phone: formData.get('phone'),
          role: formData.get('role'),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setCreatedAccount(data.credentials);
        setShowCreateForm(false);
        loadData();
      } else {
        alert(data.error || 'Failed to create account');
      }
    } catch (error) {
      console.error('Create account error:', error);
      alert('Failed to create account');
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }).catch(err => {
      console.error('Copy failed:', err);
      alert('Failed to copy. Please copy manually: ' + text);
    });
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    try {
      const response = await makeAuthRequest('/admin/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          userId: resetPasswordUser.id,
          newPassword,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Password reset successfully!');
        setResetPasswordUser(null);
        setNewPassword('');
      } else {
        alert(data.error || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      alert('Failed to reset password');
    }
  };

  const handleAssignRM = async (appId: string, rmId: string) => {
    try {
      const response = await makeAuthRequest('/admin/assign-rm', {
        method: 'POST',
        body: JSON.stringify({
          applicationId: appId,
          rmId,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('RM assigned successfully!');
        setAssigningRM(null);
        loadData();
      } else {
        alert(data.error || 'Failed to assign RM');
      }
    } catch (error) {
      console.error('Assign RM error:', error);
      alert('Failed to assign RM');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-primary mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform Overview & Management</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-border">
        <div className="flex gap-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            All Users ({analytics?.totalUsers || 0})
          </button>
          <button
            onClick={() => setActiveTab('create-account')}
            className={`pb-3 px-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'create-account'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Create Account
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`pb-3 px-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'applications'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Applications ({analytics?.totalApplications || 0})
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && analytics && (
        <div>
          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground">Total Users</span>
                <Users className="w-5 h-5 text-primary" />
              </div>
              <p className="text-primary mb-1">{analytics.totalUsers}</p>
              <p className="text-muted-foreground">Active borrowers</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground">Bank Partners</span>
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-primary mb-1">{analytics.totalBanks}</p>
              <p className="text-muted-foreground">Active banks</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground">RMs</span>
                <UserCheck className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-primary mb-1">{analytics.totalRMs || 0}</p>
              <p className="text-muted-foreground">Relationship managers</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground">Applications</span>
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-primary mb-1">{analytics.totalApplications}</p>
              <p className="text-muted-foreground">Loan requests</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground">Total Revenue</span>
                <DollarSign className="w-5 h-5 text-accent-foreground" />
              </div>
              <p className="text-primary mb-1">₹{analytics.totalRevenue?.toLocaleString() || 0}</p>
              <p className="text-muted-foreground">All time earnings</p>
            </div>
          </div>

          {/* Account Management Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
              <h3 className="text-foreground mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Bank Partners
              </h3>
              <p className="text-primary mb-2">{analytics.totalBanks}</p>
              <button
                onClick={() => setActiveTab('create-account')}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Bank
              </button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
              <h3 className="text-foreground mb-4 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-purple-600" />
                Relationship Managers
              </h3>
              <p className="text-primary mb-2">{analytics.totalRMs || 0}</p>
              <button
                onClick={() => setActiveTab('create-account')}
                className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add RM
              </button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
              <h3 className="text-foreground mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Active Users
              </h3>
              <p className="text-primary mb-2">{analytics.totalUsers}</p>
              <p className="text-muted-foreground mt-2">
                Self-registered borrowers
              </p>
            </div>
          </div>

          {/* Premium Stats */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-accent/20 to-accent/10 p-6 rounded-xl border-2 border-accent">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-accent-foreground" />
                <h3 className="text-accent-foreground">Premium Members</h3>
              </div>
              <p className="text-accent-foreground mb-1">{analytics.premiumUsers}</p>
              <p className="text-muted-foreground">
                {((analytics.premiumUsers / Math.max(analytics.totalUsers, 1)) * 100).toFixed(1)}% conversion rate
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
              <h3 className="text-foreground mb-4">Recent Applications</h3>
              <div className="space-y-2">
                {analytics.recentApplications?.slice(0, 5).map((app: any) => (
                  <div key={app.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                    <div>
                      <p className="text-foreground capitalize">{app.loanType.replace('-', ' ')}</p>
                      <p className="text-muted-foreground">₹{app.amount.toLocaleString()}</p>
                    </div>
                    <span className="text-muted-foreground">
                      {app.offers?.length || 0} offers
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Account Tab */}
      {activeTab === 'create-account' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-border p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-primary">Create Bank or RM Account</h2>
                <p className="text-muted-foreground">Add new bank partners or relationship managers</p>
              </div>
            </div>

            {createdAccount && (
              <div className="mb-6 p-6 bg-green-50 rounded-xl border-2 border-green-500">
                <h3 className="text-green-900 mb-4 flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  Account Created Successfully!
                </h3>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-muted-foreground mb-1">Email</p>
                    <div className="flex items-center justify-between">
                      <p className="text-foreground">{createdAccount.email}</p>
                      <button
                        onClick={() => copyToClipboard(createdAccount.email, 'email')}
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                      >
                        {copiedField === 'email' ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-muted-foreground mb-1">Password</p>
                    <div className="flex items-center justify-between">
                      <p className="text-foreground">{createdAccount.password}</p>
                      <button
                        onClick={() => copyToClipboard(createdAccount.password, 'password')}
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                      >
                        {copiedField === 'password' ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="text-green-700">
                    ⚠️ Save these credentials securely. They won't be shown again.
                  </p>
                  <button
                    onClick={() => setCreatedAccount(null)}
                    className="w-full py-2 bg-green-700 text-white rounded-lg hover:bg-green-800"
                  >
                    Create Another Account
                  </button>
                </div>
              </div>
            )}

            {!createdAccount && (
              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div>
                  <label className="block mb-2 text-foreground">Account Type</label>
                  <select
                    name="role"
                    required
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="bank">Bank Partner</option>
                    <option value="rm">Relationship Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-foreground">Full Name / Bank Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="HDFC Bank"
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-foreground">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="hdfc@bank.com"
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-foreground">Password</label>
                  <input
                    type="text"
                    name="password"
                    required
                    placeholder="Create a strong password"
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-foreground">Phone (Optional)</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Create Account
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-foreground">Name</th>
                  <th className="px-4 py-3 text-left text-foreground">Email</th>
                  <th className="px-4 py-3 text-left text-foreground">Phone</th>
                  <th className="px-4 py-3 text-left text-foreground">Role</th>
                  <th className="px-4 py-3 text-left text-foreground">KYC Status</th>
                  <th className="px-4 py-3 text-left text-foreground">Premium</th>
                  <th className="px-4 py-3 text-left text-foreground">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/50">
                    <td className="px-4 py-4 text-foreground">{u.name}</td>
                    <td className="px-4 py-4 text-foreground">{u.email}</td>
                    <td className="px-4 py-4 text-foreground">{u.phone || 'N/A'}</td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded capitalize">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded capitalize ${
                        u.kycStatus === 'verified'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {u.kycStatus || 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {u.isPremium ? (
                        <UserCheck className="w-5 h-5 text-accent-foreground" />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-foreground">Loan Type</th>
                  <th className="px-4 py-3 text-left text-foreground">Amount</th>
                  <th className="px-4 py-3 text-left text-foreground">Tenure</th>
                  <th className="px-4 py-3 text-left text-foreground">Offers</th>
                  <th className="px-4 py-3 text-left text-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-foreground">Unlocked</th>
                  <th className="px-4 py-3 text-left text-foreground">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-muted/50">
                    <td className="px-4 py-4 text-foreground capitalize">
                      {app.loanType.replace('-', ' ')}
                    </td>
                    <td className="px-4 py-4 text-foreground">
                      ₹{app.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-foreground">{app.tenure}m</td>
                    <td className="px-4 py-4 text-foreground">{app.offers?.length || 0}</td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 bg-muted rounded capitalize">
                        {app.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {app.unlocked ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
