# UPSC AI Mentor - Role-Based Setup Guide

## Step 1: Deploy Database Schema

Run the following SQL files in your Supabase SQL Editor:

1. **schema_roles.sql** - Creates users table with role field
2. **rls_roles.sql** - Sets up role-based security policies

## Step 2: Create Admin User

After running the schema, create an admin user by running:

```sql
-- Replace with actual admin email
UPDATE users 
SET role = '\''admin'\''
WHERE email = '\''admin@upscaimentor.com'\'';
```

## Step 3: Test Role-Based Access

### For Learners:
- Can only access their own data
- Limited to learning features
- Query limits enforced
- Cannot access admin features

### For Admins:
- Full access to all user data
- Can manage subscriptions
- Can view analytics
- Can moderate content
- Can reset user limits

## Step 4: Subscription Plans Configuration

The app supports these subscription plans:
- Trial: 1 day, 10 queries
- 1 Month: ₹499 + 18% GST, 75 queries
- 3 Months: ₹999 + 18% GST, 150 queries
- 6 Months: ₹1999 + 18% GST, 250 queries
- 12 Months: ₹3999 + 18% GST, 400 queries

## Step 5: Testing the Separation

1. **Create a learner account** and verify:
   - Can access learning features
   - Cannot access admin dashboard
   - Query limits are enforced
   - Only sees own data

2. **Create an admin account** and verify:
   - Can access admin dashboard
   - Can view all users
   - Can manage subscriptions
   - Can access all analytics

## Step 6: Deploy Edge Functions

Deploy the Supabase Edge Functions:
- ingest
- search  
- orchestrator
- render-request
- builds

## Step 7: Configure GitHub Actions

Ensure all GitHub secrets are set for the CI/CD pipelines to work properly.

## Security Features Implemented

✅ **Role-Based Access Control**
✅ **Row Level Security (RLS)**
✅ **Query Limits Enforcement**
✅ **Admin-Only Features Isolation**
✅ **Secure Authentication Flow**

The app now has complete separation between learner and admin panels with proper security controls.
