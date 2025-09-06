# Portfolio Synchronization Testing Guide

This guide explains how to test that portfolio data synchronizes properly across different devices and browsers for the same user account.

## Prerequisites

1. Supabase project set up with the portfolio database schema
2. Environment variables configured in `.env.local`
3. Application running locally or deployed

## Database Setup

Before testing, ensure you've run the SQL schema in your Supabase SQL Editor:

```sql
-- Run the SQL from SUPABASE_SETUP.md to create the portfolio tables
-- This includes portfolios, portfolio_holdings tables and RLS policies
```

## Testing Cross-Device Synchronization

### Test 1: Basic Portfolio Creation and Sync

1. **Device A (e.g., Chrome browser)**:
   - Sign up/login with a test email account
   - Create a new portfolio named "Test Portfolio 1"
   - Add 2-3 cryptocurrency holdings with different amounts
   - Note the portfolio details

2. **Device B (e.g., Firefox browser or different computer)**:
   - Login with the same email account
   - Verify that "Test Portfolio 1" appears in the portfolio list
   - Check that all holdings are present with correct amounts
   - Verify that the AI insights work and show proper diversification scores

### Test 2: Real-time Updates

1. **Device A**:
   - Add a new holding to "Test Portfolio 1"
   - Edit an existing holding's amount

2. **Device B**:
   - Refresh the page or navigate to the portfolio
   - Verify that the new holding appears
   - Verify that the edited holding shows the updated amount
   - Check that AI insights update with new data

### Test 3: Portfolio Management

1. **Device A**:
   - Create a second portfolio "Test Portfolio 2"
   - Delete a holding from "Test Portfolio 1"

2. **Device B**:
   - Verify both portfolios are visible
   - Confirm the deleted holding is no longer present
   - Test editing portfolio details (name, description)

### Test 4: AI Insights Functionality

1. **Any Device**:
   - Create a portfolio with at least 3 different cryptocurrencies
   - Verify AI insights show:
     - Portfolio health assessment (not "missing data" error)
     - Diversification score > 0
     - Risk assessment
     - Recommendations list
     - Rebalancing suggestions

2. **Test Edge Cases**:
   - Empty portfolio: Should show "Add holdings" message
   - Single holding: Should show low diversification score
   - Multiple holdings: Should show calculated diversification score

## Expected Results

### ✅ Success Criteria

- [ ] Portfolios created on one device appear on all other devices
- [ ] Holdings added/edited/deleted sync across devices
- [ ] AI insights work without "missing data" errors
- [ ] Diversification scores calculate and update properly
- [ ] Portfolio summaries show correct total values and P&L
- [ ] User can only see their own portfolios (data isolation)

### ❌ Common Issues to Check

- **"Portfolio's health cannot be assessed due to missing data"**
  - This indicates current_price data is missing
  - Should be fixed with the AI insights enhancement

- **Diversification score shows 0**
  - This indicates the AI analysis isn't receiving proper data
  - Should be fixed with the portfolio data enrichment

- **Portfolios don't sync across devices**
  - Check Supabase connection and RLS policies
  - Verify user authentication is working

- **Database connection errors**
  - Check environment variables
  - Verify Supabase project is active

## Migration Testing

### Test localStorage Migration

1. **Setup**:
   - Create portfolios using the old localStorage system
   - Clear Supabase database for the test user

2. **Migration Test**:
   - Login to trigger automatic migration
   - Verify all localStorage portfolios appear in database
   - Check that holdings are properly migrated
   - Confirm AI insights work with migrated data

## Troubleshooting

### Database Issues
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('portfolios', 'portfolio_holdings');

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename IN ('portfolios', 'portfolio_holdings');
```

### Application Issues
- Check browser console for errors
- Verify network requests to Supabase are successful
- Check authentication state in browser dev tools

### AI Insights Issues
- Verify Gemini API key is configured
- Check that holdings have valid current_price data
- Look for console errors in AI analysis

## Performance Testing

1. **Large Portfolio Test**:
   - Create a portfolio with 10+ holdings
   - Verify AI insights still work efficiently
   - Check page load times

2. **Multiple Portfolios Test**:
   - Create 5+ portfolios with various holdings
   - Test navigation between portfolios
   - Verify list performance

## Security Testing

1. **Data Isolation**:
   - Create two different user accounts
   - Verify each user only sees their own portfolios
   - Test that one user cannot access another's data

2. **Authentication**:
   - Test logout/login cycles
   - Verify session persistence
   - Test password reset functionality

## Reporting Issues

When reporting issues, include:
- Browser and device information
- Steps to reproduce
- Expected vs actual behavior
- Console errors (if any)
- Network request details from browser dev tools
