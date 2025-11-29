# DesignHaven - Deployment Notes

## Important: Cross-Device Data Sync Limitation

**Current Setup:** This website uses browser localStorage to store data. This means:

✅ **Works:**
- Data syncs across tabs/windows in the same browser
- Changes reflect immediately within the same browser
- Data persists after page refresh

❌ **Doesn't Work:**
- Data does NOT sync across different devices (phone, laptop, tablet)
- Data does NOT sync across different browsers
- Each device/browser has its own separate data

## For True Cross-Device Sync

To make admin changes reflect across ALL devices and users, you need a backend server with a database. Options:

1. **Firebase** (Easiest)
   - Free tier available
   - Real-time database
   - Easy to integrate

2. **Node.js + MongoDB/PostgreSQL**
   - Full control
   - Requires server hosting

3. **Supabase** (Recommended)
   - Free tier
   - PostgreSQL database
   - Real-time subscriptions
   - Easy API integration

## Current Behavior

- Admin changes save to localStorage
- Changes reflect immediately in same browser/tabs
- Each device maintains its own data
- Default categories/products have been removed - admin must add them

## Admin Login

- Username: `sridharani`
- Password: `xyz@@21`

