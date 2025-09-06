# Supabase Authentication Setup

This guide will help you set up Supabase authentication for your CryptoTrend AI application.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. Node.js and npm installed

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter a project name (e.g., "cryptotrend-ai")
5. Enter a database password (save this securely)
6. Choose a region close to your users
7. Click "Create new project"

### 2. Get Your Project Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy your Project URL and anon/public key
3. These will be used in your environment variables

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 4. Set Up Authentication

The authentication is already configured in the application. Supabase will automatically:

- Create a `auth.users` table for user management
- Handle email verification
- Manage sessions and tokens
- Provide password reset functionality

### 5. Configure Email Templates (Optional)

1. In your Supabase dashboard, go to Authentication > Email Templates
2. Customize the email templates for:
   - Confirm signup
   - Reset password
   - Magic link

### 6. Set Up Row Level Security (Recommended)

If you plan to store user-specific data, set up RLS policies:

1. Go to Authentication > Policies in your Supabase dashboard
2. Enable RLS on your tables
3. Create policies to control data access

## Features Included

### Authentication Components

- **Login**: Email/password authentication with validation
- **Signup**: User registration with email verification
- **Forgot Password**: Password reset functionality
- **Protected Routes**: Automatic redirection for authenticated/unauthenticated users
- **User Profile**: Display user information and account management

### Security Features

- Form validation with Zod schemas
- Password strength requirements
- Email verification
- Secure session management
- Protected route guards

### UI/UX Features

- Consistent design with your crypto theme
- Glass morphism effects
- Green hover animations
- Loading states
- Error handling
- Success notifications

## Usage

### Authentication Flow

1. **New Users**: Sign up → Email verification → Login
2. **Existing Users**: Login → Access protected routes
3. **Forgot Password**: Request reset → Check email → Set new password

### Navigation

- **Authenticated users**: See full navigation + user dropdown
- **Unauthenticated users**: See login/signup buttons
- **User dropdown**: Profile, settings, sign out options

### Protected Routes

All main application routes require authentication:
- Dashboard (/)
- Market (/market)
- Trending (/trending)
- Analysis (/analysis/:coinId)
- Crypto News (/cryptonews)
- Profile (/profile)

### Public Routes

These routes are accessible without authentication:
- Login (/login)
- Signup (/signup)
- Forgot Password (/forgot-password)

## Development

### Running the Application

```bash
npm install
npm run dev
```

### Testing Authentication

1. Start the development server
2. Navigate to `/signup` to create a test account
3. Check your email for verification (if configured)
4. Login and test protected routes

## Troubleshooting

### Common Issues

1. **Environment variables not loading**: Make sure `.env.local` is in the root directory
2. **CORS errors**: Check your Supabase project URL is correct
3. **Email not sending**: Configure SMTP settings in Supabase dashboard
4. **Authentication not persisting**: Check if cookies are enabled

### Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [React Auth Tutorial](https://supabase.com/docs/guides/auth/auth-helpers/auth-ui)

## Database Schema Setup

### Portfolio Tables

Run the following SQL in your Supabase SQL Editor to create the portfolio tables:

```sql
-- Create portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create portfolio_holdings table
CREATE TABLE IF NOT EXISTS portfolio_holdings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE NOT NULL,
  coin_id VARCHAR(50) NOT NULL,
  coin_symbol VARCHAR(10) NOT NULL,
  coin_name VARCHAR(100) NOT NULL,
  amount DECIMAL(20, 8) NOT NULL CHECK (amount > 0),
  purchase_price DECIMAL(20, 8) NOT NULL CHECK (purchase_price > 0),
  purchase_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_portfolio_id ON portfolio_holdings(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_coin_id ON portfolio_holdings(coin_id);

-- Enable Row Level Security
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_holdings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for portfolios
CREATE POLICY "Users can view their own portfolios" ON portfolios
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own portfolios" ON portfolios
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolios" ON portfolios
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolios" ON portfolios
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for portfolio_holdings
CREATE POLICY "Users can view holdings of their portfolios" ON portfolio_holdings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_holdings.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert holdings to their portfolios" ON portfolio_holdings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_holdings.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update holdings of their portfolios" ON portfolio_holdings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_holdings.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete holdings of their portfolios" ON portfolio_holdings
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_holdings.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_portfolios_updated_at
  BEFORE UPDATE ON portfolios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_holdings_updated_at
  BEFORE UPDATE ON portfolio_holdings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Next Steps

1. Set up user profiles table for additional user data
2. Implement role-based access control
3. Add social authentication (Google, GitHub, etc.)
4. Set up email notifications for crypto alerts
5. Implement user preferences and settings
