import React, { useState, useEffect } from 'react';
import { makeAuthRequest } from '../utils/supabase-client';
import { Users, Phone, Mail, FileText } from 'lucide-react';

interface RMDashboardProps {
  user: any;
}

export function RMDashboard({ user }: RMDashboardProps) {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<any>(null);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      const response = await makeAuthRequest('/rm/leads');
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

  const handleUpdateStatus = async (leadId: string, status: string, notes: string) => {
    try {
      const response = await makeAuthRequest('/rm/update-status', {
        method: 'POST',
        body: JSON.stringify({ applicationId: leadId, status, notes }),
      });

      if (response.ok) {
        loadLeads();
        setSelectedLead(null);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-primary mb-2">RM Dashboard</h1>
        <p className="text-muted-foreground">Welcome, {user.name} - Manage your assigned leads</p>
      </div>

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
            <span className="text-muted-foreground">Under Review</span>
            <FileText className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-primary">
            {leads.filter(l => l.rmStatus === 'Under Review').length}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Approved</span>
            <FileText className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-primary">
            {leads.filter(l => l.rmStatus === 'Approved').length}
          </p>
        </div>
      </div>

      {/* Leads List */}
      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-primary">Assigned Leads</h2>
        </div>

        {loading ? (
          <div className="p-12 text-center text-muted-foreground">
            Loading leads...
          </div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No leads assigned yet
          </div>
        ) : (
          <div className="divide-y divide-border">
            {leads.map((lead) => (
              <div key={lead.id} className="p-6 hover:bg-muted/50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-foreground mb-2 capitalize">
                      {lead.loanType.replace('-', ' ')} Loan
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-muted-foreground">Applicant Details</p>
                        <div className="space-y-1 mt-2">
                          <p className="text-foreground">{lead.applicant?.name}</p>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="w-4 h-4" />
                            <span>{lead.applicant?.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="w-4 h-4" />
                            <span>{lead.applicant?.phone}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-muted-foreground">Loan Details</p>
                        <div className="space-y-1 mt-2 text-foreground">
                          <p>Amount: ₹{lead.amount.toLocaleString()}</p>
                          <p>Tenure: {lead.tenure} months</p>
                          <p>Offers: {lead.offers?.length || 0}</p>
                          <p>Income: ₹{lead.applicant?.kycData?.income?.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    {lead.rmStatus && (
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p className="text-blue-900">Status: {lead.rmStatus}</p>
                        {lead.rmNotes && (
                          <p className="text-blue-700 mt-1">Notes: {lead.rmNotes}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <button
                      onClick={() => setSelectedLead(lead)}
                      className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Update Status
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Update Status Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-primary mb-4">Update Lead Status</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-foreground">Status</label>
                <select
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  defaultValue={selectedLead.rmStatus || ''}
                  onChange={(e) => {
                    const notes = prompt('Add notes (optional):') || '';
                    handleUpdateStatus(selectedLead.id, e.target.value, notes);
                  }}
                >
                  <option value="">Select status</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Documents Verified">Documents Verified</option>
                  <option value="Bank Meeting Scheduled">Bank Meeting Scheduled</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <button
                onClick={() => setSelectedLead(null)}
                className="w-full py-2 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
