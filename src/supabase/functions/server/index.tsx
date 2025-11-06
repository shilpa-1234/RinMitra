import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Helper function to generate unique IDs
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Initialize default admin account on server startup
async function initializeDefaultAdmin() {
  try {
    const defaultAdminEmail = 'admin@loanlinker.com';
    const defaultAdminPassword = 'Admin@123';
    
    // Check if admin already exists
    const existingAdmin = await kv.getByPrefix('user:');
    const adminExists = existingAdmin.some(u => u.email === defaultAdminEmail);
    
    if (!adminExists) {
      console.log('Creating default admin account...');
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: defaultAdminEmail,
        password: defaultAdminPassword,
        user_metadata: { name: 'Platform Admin', role: 'admin' },
        email_confirm: true
      });

      if (authError) {
        console.log('Failed to create default admin:', authError);
        return;
      }

      // Store admin data in KV
      await kv.set(`user:${authData.user.id}`, {
        id: authData.user.id,
        email: defaultAdminEmail,
        name: 'Platform Admin',
        phone: '',
        role: 'admin',
        isPremium: true,
        premiumPlan: 'platinum',
        createdAt: new Date().toISOString(),
        kycStatus: 'verified',
        kycData: null
      });

      console.log('Default admin account created successfully');
      console.log('Email:', defaultAdminEmail);
      console.log('Password:', defaultAdminPassword);
    }
  } catch (error) {
    console.log('Error initializing default admin:', error);
  }
}

// Initialize on startup
initializeDefaultAdmin();

// ==================== AUTH ROUTES ====================

// Sign Up (Only for regular users)
app.post('/make-server-98e3e7a7/signup', async (c) => {
  try {
    const { email, password, name, phone } = await c.req.json();

    // Only allow user role signup
    const role = 'user';

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (authError) {
      console.log('Signup error:', authError);
      return c.json({ error: authError.message }, 400);
    }

    // Store user data in KV
    const userId = authData.user.id;
    await kv.set(`user:${userId}`, {
      id: userId,
      email,
      name,
      phone,
      role,
      isPremium: false,
      premiumPlan: null,
      createdAt: new Date().toISOString(),
      kycStatus: 'pending',
      kycData: null
    });

    return c.json({ success: true, userId });
  } catch (error) {
    console.log('Signup error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get Current User
app.get('/make-server-98e3e7a7/me', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    return c.json({ user: userData });
  } catch (error) {
    console.log('Get user error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ==================== KYC ROUTES ====================

// Submit KYC
app.post('/make-server-98e3e7a7/kyc', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const kycData = await c.req.json();
    
    const userData = await kv.get(`user:${user.id}`);
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Update user with KYC data
    await kv.set(`user:${user.id}`, {
      ...userData,
      kycData,
      kycStatus: 'verified', // In real app, this would be pending verification
      kycSubmittedAt: new Date().toISOString()
    });

    return c.json({ success: true, message: 'KYC submitted successfully' });
  } catch (error) {
    console.log('KYC submission error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ==================== LOAN APPLICATION ROUTES ====================

// Submit Loan Application
app.post('/make-server-98e3e7a7/loan-application', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { loanType, amount, purpose, tenure, hasExistingLoans, existingLoans } = await c.req.json();
    
    const userData = await kv.get(`user:${user.id}`);
    if (!userData || userData.kycStatus !== 'verified') {
      return c.json({ error: 'KYC verification required' }, 400);
    }
    
    const appId = generateId();
    const application = {
      id: appId,
      userId: user.id,
      loanType,
      amount,
      purpose,
      tenure,
      hasExistingLoans: hasExistingLoans || false,
      existingLoans: existingLoans || [],
      status: 'pending',
      offers: [],
      createdAt: new Date().toISOString(),
      unlocked: false
    };

    await kv.set(`loan_app:${appId}`, application);

    // Add to user's applications list
    const userApps = await kv.get(`user_apps:${user.id}`) || [];
    userApps.push(appId);
    await kv.set(`user_apps:${user.id}`, userApps);

    return c.json({ success: true, applicationId: appId, application });
  } catch (error) {
    console.log('Loan application error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get User's Loan Applications
app.get('/make-server-98e3e7a7/my-applications', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const appIds = await kv.get(`user_apps:${user.id}`) || [];
    const applications = [];

    for (const appId of appIds) {
      const app = await kv.get(`loan_app:${appId}`);
      if (app) {
        applications.push(app);
      }
    }

    return c.json({ applications });
  } catch (error) {
    console.log('Get applications error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ==================== BANK ROUTES ====================

// Get All Leads (for Bank Partners)
app.get('/make-server-98e3e7a7/bank/leads', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    if (!userData || userData.role !== 'bank') {
      return c.json({ error: 'Access denied' }, 403);
    }

    // Get all loan applications
    const allApps = await kv.getByPrefix('loan_app:');
    const leads = [];

    for (const app of allApps) {
      // Get user data (anonymized for bank)
      const applicant = await kv.get(`user:${app.userId}`);
      
      if (applicant && applicant.kycStatus === 'verified') {
        leads.push({
          id: app.id,
          loanType: app.loanType,
          amount: app.amount,
          tenure: app.tenure,
          purpose: app.purpose,
          createdAt: app.createdAt,
          // Anonymized user info
          applicant: {
            income: applicant.kycData?.income,
            employmentType: applicant.kycData?.employmentType,
            creditScore: applicant.kycData?.creditScore || 'N/A',
            city: applicant.kycData?.city,
            // Contact hidden until user accepts offer
            masked: true
          },
          hasOfferedByMe: app.offers?.some(o => o.bankId === user.id) || false
        });
      }
    }

    return c.json({ leads });
  } catch (error) {
    console.log('Get bank leads error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Submit Bank Offer
app.post('/make-server-98e3e7a7/bank/submit-offer', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    if (!userData || userData.role !== 'bank') {
      return c.json({ error: 'Access denied' }, 403);
    }

    const { applicationId, eligible, interestRate, emi, maxAmount, remarks } = await c.req.json();

    const application = await kv.get(`loan_app:${applicationId}`);
    if (!application) {
      return c.json({ error: 'Application not found' }, 404);
    }

    const offer = {
      id: generateId(),
      bankId: user.id,
      bankName: userData.name,
      applicationId,
      eligible,
      interestRate,
      emi,
      maxAmount,
      remarks,
      submittedAt: new Date().toISOString()
    };

    // Add offer to application
    application.offers = application.offers || [];
    application.offers.push(offer);
    await kv.set(`loan_app:${applicationId}`, application);

    return c.json({ success: true, offer });
  } catch (error) {
    console.log('Submit offer error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ==================== PROFILE ROUTES ====================

// Update Bank Profile
app.post('/make-server-98e3e7a7/bank/update-profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    if (!userData || userData.role !== 'bank') {
      return c.json({ error: 'Access denied' }, 403);
    }

    const { name, phone, address } = await c.req.json();

    userData.name = name || userData.name;
    userData.phone = phone || userData.phone;
    userData.address = address || userData.address;
    userData.updatedAt = new Date().toISOString();

    await kv.set(`user:${user.id}`, userData);

    return c.json({ success: true, user: userData });
  } catch (error) {
    console.log('Update bank profile error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Update User Profile
app.post('/make-server-98e3e7a7/user/update-profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    if (!userData || userData.role !== 'user') {
      return c.json({ error: 'Access denied' }, 403);
    }

    const { phone, kycData } = await c.req.json();

    userData.phone = phone || userData.phone;
    if (kycData) {
      userData.kycData = { ...userData.kycData, ...kycData };
    }
    userData.updatedAt = new Date().toISOString();

    await kv.set(`user:${user.id}`, userData);

    return c.json({ success: true, user: userData });
  } catch (error) {
    console.log('Update user profile error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Update Loan Application
app.post('/make-server-98e3e7a7/user/update-application', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { applicationId, loanType, amount, tenure, purpose, hasExistingLoans, existingLoans } = await c.req.json();

    const application = await kv.get(`loan_app:${applicationId}`);
    if (!application || application.userId !== user.id) {
      return c.json({ error: 'Application not found' }, 404);
    }

    // Check if any offers have been submitted
    if (application.offers && application.offers.length > 0) {
      return c.json({ error: 'Cannot edit application with existing offers' }, 403);
    }

    application.loanType = loanType || application.loanType;
    application.amount = amount || application.amount;
    application.tenure = tenure || application.tenure;
    application.purpose = purpose || application.purpose;
    application.hasExistingLoans = hasExistingLoans;
    application.existingLoans = existingLoans || [];
    application.updatedAt = new Date().toISOString();

    await kv.set(`loan_app:${applicationId}`, application);

    return c.json({ success: true, application });
  } catch (error) {
    console.log('Update application error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ==================== PAYMENT & UNLOCK ROUTES ====================

// Unlock Offers (Payment)
app.post('/make-server-98e3e7a7/unlock-offers', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { applicationId, paymentId } = await c.req.json();

    const application = await kv.get(`loan_app:${applicationId}`);
    if (!application || application.userId !== user.id) {
      return c.json({ error: 'Application not found' }, 404);
    }

    // In production, verify payment with Razorpay/Stripe
    // For demo, we'll just mark as unlocked

    application.unlocked = true;
    application.unlockedAt = new Date().toISOString();
    await kv.set(`loan_app:${applicationId}`, application);

    // Record transaction
    const txId = generateId();
    await kv.set(`transaction:${txId}`, {
      id: txId,
      userId: user.id,
      type: 'unlock',
      amount: 199,
      applicationId,
      paymentId,
      status: 'completed',
      createdAt: new Date().toISOString()
    });

    return c.json({ success: true, offers: application.offers });
  } catch (error) {
    console.log('Unlock offers error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Upgrade to Premium
app.post('/make-server-98e3e7a7/upgrade-premium', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { plan, paymentId } = await c.req.json();

    const userData = await kv.get(`user:${user.id}`);
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Update user to premium
    await kv.set(`user:${user.id}`, {
      ...userData,
      isPremium: true,
      premiumPlan: plan,
      premiumSince: new Date().toISOString()
    });

    // Record transaction
    const txId = generateId();
    const planPrices = { silver: 499, gold: 999, platinum: 1999 };
    await kv.set(`transaction:${txId}`, {
      id: txId,
      userId: user.id,
      type: 'premium',
      amount: planPrices[plan] || 499,
      plan,
      paymentId,
      status: 'completed',
      createdAt: new Date().toISOString()
    });

    return c.json({ success: true, message: 'Upgraded to premium successfully' });
  } catch (error) {
    console.log('Premium upgrade error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ==================== ADMIN ROUTES ====================

// Get All Users (Admin)
app.get('/make-server-98e3e7a7/admin/users', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    if (!userData || userData.role !== 'admin') {
      return c.json({ error: 'Access denied' }, 403);
    }

    const allUsers = await kv.getByPrefix('user:');
    return c.json({ users: allUsers });
  } catch (error) {
    console.log('Get users error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get All Applications (Admin)
app.get('/make-server-98e3e7a7/admin/applications', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    if (!userData || userData.role !== 'admin') {
      return c.json({ error: 'Access denied' }, 403);
    }

    const allApps = await kv.getByPrefix('loan_app:');
    return c.json({ applications: allApps });
  } catch (error) {
    console.log('Get applications error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get Analytics (Admin)
app.get('/make-server-98e3e7a7/admin/analytics', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    if (!userData || userData.role !== 'admin') {
      return c.json({ error: 'Access denied' }, 403);
    }

    const allUsers = await kv.getByPrefix('user:');
    const allApps = await kv.getByPrefix('loan_app:');
    const allTransactions = await kv.getByPrefix('transaction:');

    const stats = {
      totalUsers: allUsers.filter(u => u.role === 'user').length,
      totalBanks: allUsers.filter(u => u.role === 'bank').length,
      totalRMs: allUsers.filter(u => u.role === 'rm').length,
      totalApplications: allApps.length,
      premiumUsers: allUsers.filter(u => u.isPremium).length,
      totalRevenue: allTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0),
      recentApplications: allApps.slice(-10).reverse()
    };

    return c.json({ analytics: stats });
  } catch (error) {
    console.log('Get analytics error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Create Bank or RM Account (Admin only)
app.post('/make-server-98e3e7a7/admin/create-account', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    if (!userData || userData.role !== 'admin') {
      return c.json({ error: 'Access denied' }, 403);
    }

    const { email, password, name, phone, role } = await c.req.json();

    // Only allow bank and rm roles
    if (role !== 'bank' && role !== 'rm') {
      return c.json({ error: 'Invalid role. Only bank and rm accounts can be created.' }, 400);
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      email_confirm: true
    });

    if (authError) {
      console.log('Account creation error:', authError);
      return c.json({ error: authError.message }, 400);
    }

    // Store user data in KV
    const newUserId = authData.user.id;
    await kv.set(`user:${newUserId}`, {
      id: newUserId,
      email,
      name,
      phone: phone || '',
      role,
      isPremium: false,
      premiumPlan: null,
      createdAt: new Date().toISOString(),
      kycStatus: 'verified', // Auto-verify bank and RM accounts
      kycData: null
    });

    return c.json({ 
      success: true, 
      message: `${role === 'bank' ? 'Bank' : 'RM'} account created successfully`,
      accountId: newUserId,
      credentials: { email, password }
    });
  } catch (error) {
    console.log('Create account error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Reset User Password (Admin)
app.post('/make-server-98e3e7a7/admin/reset-password', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    if (!userData || userData.role !== 'admin') {
      return c.json({ error: 'Access denied' }, 403);
    }

    const { userId, newPassword } = await c.req.json();

    // Update user password in Supabase Auth
    const { data, error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (updateError) {
      console.log('Password reset error:', updateError);
      return c.json({ error: updateError.message }, 400);
    }

    return c.json({ 
      success: true, 
      message: 'Password reset successfully' 
    });
  } catch (error) {
    console.log('Reset password error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Assign RM to Application
app.post('/make-server-98e3e7a7/admin/assign-rm', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    if (!userData || userData.role !== 'admin') {
      return c.json({ error: 'Access denied' }, 403);
    }

    const { applicationId, rmId } = await c.req.json();

    const application = await kv.get(`loan_app:${applicationId}`);
    if (!application) {
      return c.json({ error: 'Application not found' }, 404);
    }

    application.assignedRM = rmId;
    application.rmAssignedAt = new Date().toISOString();
    await kv.set(`loan_app:${applicationId}`, application);

    return c.json({ success: true });
  } catch (error) {
    console.log('Assign RM error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ==================== RM ROUTES ====================

// Get RM's Assigned Leads
app.get('/make-server-98e3e7a7/rm/leads', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    if (!userData || userData.role !== 'rm') {
      return c.json({ error: 'Access denied' }, 403);
    }

    const allApps = await kv.getByPrefix('loan_app:');
    const myLeads = allApps.filter(app => app.assignedRM === user.id);

    // Get full user details for assigned leads
    const leadsWithDetails = [];
    for (const lead of myLeads) {
      const applicant = await kv.get(`user:${lead.userId}`);
      leadsWithDetails.push({
        ...lead,
        applicant: {
          name: applicant?.name,
          email: applicant?.email,
          phone: applicant?.phone,
          kycData: applicant?.kycData
        }
      });
    }

    return c.json({ leads: leadsWithDetails });
  } catch (error) {
    console.log('Get RM leads error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Update Lead Status (RM)
app.post('/make-server-98e3e7a7/rm/update-status', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    if (!userData || userData.role !== 'rm') {
      return c.json({ error: 'Access denied' }, 403);
    }

    const { applicationId, status, notes } = await c.req.json();

    const application = await kv.get(`loan_app:${applicationId}`);
    if (!application || application.assignedRM !== user.id) {
      return c.json({ error: 'Access denied' }, 403);
    }

    application.rmStatus = status;
    application.rmNotes = notes;
    application.lastUpdated = new Date().toISOString();
    await kv.set(`loan_app:${applicationId}`, application);

    return c.json({ success: true });
  } catch (error) {
    console.log('Update status error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

console.log('LoanLinker server started');

Deno.serve(app.fetch);
