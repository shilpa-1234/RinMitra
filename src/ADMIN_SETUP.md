# Admin Setup & Account Management

## 🔐 Default Admin Account

LoanLinker comes with a **pre-configured admin account** that is automatically created when the server starts:

**Credentials:**
- Email: `admin@loanlinker.com`
- Password: `Admin@123`

⚠️ **Important Notes:**
- This is the **only** admin account for the platform
- Admin accounts **cannot** be created via signup
- Only the platform owner should have access to these credentials
- Change the password after first login in a production environment

## 🎯 Account Creation Rules

### User Accounts (Borrowers)
✅ **Can self-register** via the signup form
- Anyone can create a user account
- Users must complete KYC verification
- Users can apply for loans and compare offers

### Bank Partner Accounts
❌ **Cannot self-register**
✅ **Must be created by admin**

### Relationship Manager Accounts
❌ **Cannot self-register**
✅ **Must be created by admin**

## 👨‍💼 How Admins Create Bank & RM Accounts

### Step-by-Step Process:

1. **Login as Admin**
   - Use credentials: `admin@loanlinker.com` / `Admin@123`

2. **Navigate to "Create Account" Tab**
   - Click on the "Create Account" tab in the admin dashboard

3. **Fill in Account Details**
   - **Account Type**: Choose "Bank Partner" or "Relationship Manager"
   - **Full Name / Bank Name**: e.g., "HDFC Bank" or "John Doe"
   - **Email**: Unique email for the account
   - **Password**: Create a strong password (will be shown once)
   - **Phone**: Optional contact number

4. **Submit & Save Credentials**
   - Click "Create Account"
   - **Important**: Copy the email and password immediately
   - These credentials won't be shown again
   - Share them securely with the bank/RM

5. **Credentials are Ready**
   - The bank partner or RM can now login with these credentials
   - No email verification required (auto-confirmed)
   - Account is immediately active

## 📋 Example: Creating a Bank Account

```
Account Type: Bank Partner
Name: HDFC Bank
Email: hdfc@loanlinker.com
Password: HDFC@Secure123
Phone: +91 98765 43210
```

After creation, share these credentials with the bank's representative:
```
Welcome to LoanLinker!
Your account has been created:

Email: hdfc@loanlinker.com
Password: HDFC@Secure123

Please login at loanlinker.com and change your password.
```

## 🔄 Workflow Summary

```
Regular Users → Self Signup → Complete KYC → Apply for Loans
                ↓
Admin Creates Bank Accounts → Banks Login → View Leads → Submit Offers
                ↓
Multiple Banks Submit Offers → User Unlocks → Compares Offers
                ↓
Admin Assigns RM → RM Manages → Loan Processed
```

## 🛡️ Security Best Practices

1. **Default Admin Password**: Change `Admin@123` immediately after first login
2. **Strong Passwords**: Use complex passwords for all bank and RM accounts
3. **Credential Sharing**: Use secure channels (encrypted email, password managers)
4. **Access Control**: Only give bank/RM access to authorized personnel
5. **Regular Audits**: Monitor the "All Users" tab for unauthorized accounts

## 📊 Managing Created Accounts

### View All Accounts
- Go to "All Users" tab in admin dashboard
- Filter by role: User, Bank, RM, Admin
- View KYC status, creation date, and activity

### Account Information Displayed:
- Name and email
- Phone number
- Account role (User/Bank/RM/Admin)
- KYC verification status
- Premium membership status
- Registration date

## ❓ FAQ

**Q: Can I create multiple admin accounts?**
A: No, there's only one admin account for security reasons.

**Q: What if I forget the admin password?**
A: You'll need to manually reset it in the Supabase authentication panel or contact support.

**Q: Can banks or RMs change their passwords?**
A: Yes, they can use the "Forgot Password" flow in a production environment with email configured.

**Q: How do I delete a bank or RM account?**
A: Currently, you need to delete them from the Supabase authentication panel. A delete feature can be added to the admin panel.

**Q: Can I create user accounts as admin?**
A: No, users must self-register to ensure proper consent and data privacy compliance.

## 🚀 Quick Start for Testing

1. **Login as Admin**: `admin@loanlinker.com` / `Admin@123`
2. **Create 3 Bank Accounts**: HDFC, ICICI, SBI (example)
3. **Sign up as a User**: Create your test borrower account
4. **Complete KYC & Apply**: Submit a loan application
5. **Login to Each Bank**: View the lead and submit offers
6. **Back to User Account**: Unlock and compare the 3 offers
7. **Create an RM**: Assign RM to the selected loan for follow-up

---

**LoanLinker** - Secure Multi-Bank Loan Marketplace
