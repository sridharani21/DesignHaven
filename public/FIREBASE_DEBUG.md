# Firebase Debugging Guide

## Check if Firebase is Working

### Step 1: Open Browser Console
1. Open your website
2. Press F12 to open Developer Tools
3. Go to "Console" tab

### Step 2: Look for These Messages

**✅ Good Signs:**
- `✅ Firebase initialized successfully`
- `✅ Firebase connected - using cloud database for cross-device sync`
- `📡 Database URL: https://...`
- `👂 Listening for real-time updates from Firebase`
- `💾 Saving to Firebase...`
- `✅ Data saved to Firebase - will sync to all devices`

**❌ Bad Signs:**
- `⚠️ Firebase SDK not loaded - using localStorage only`
- `❌ Firebase initialization error:`
- `❌ Firebase save error:`

### Step 3: Check Firebase Console
1. Go to: https://console.firebase.google.com/project/designhaven-dcda4/database
2. Click "Realtime Database"
3. You should see data in:
   - `categories`
   - `products`
   - `orders`
   - `offerBanner`

### Step 4: Check Database Rules
1. In Firebase Console > Realtime Database > Rules
2. Should be:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### Step 5: Test Cross-Device Sync
1. On Device 1 (laptop): Login as admin, add a product
2. Check console: Should see `✅ Data saved to Firebase`
3. On Device 2 (phone): Open website
4. Check console: Should see `🔄 Products updated from Firebase`
5. Product should appear automatically!

## Common Issues

### Issue: "Firebase SDK not loaded"
**Fix:** Check that these scripts are in your HTML:
```html
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>
<script src="firebase-config.js"></script>
```

### Issue: "Firebase save error: permission-denied"
**Fix:** Update database rules to allow read/write (see Step 4)

### Issue: Data not syncing
**Fix:** 
1. Check console for errors
2. Verify database rules
3. Make sure both devices are online
4. Check Firebase Console to see if data is being saved


