# Fix Firebase Permission Error

## The Problem
You're seeing: `permission_denied at /categories: Client doesn't have permission to access the desired data`

This means your Firebase Database rules are blocking access.

## Solution: Update Database Rules

### Step 1: Go to Firebase Console
1. Open: https://console.firebase.google.com/project/designhaven-dcda4/database
2. Click on **"Realtime Database"** in the left sidebar
3. Click on the **"Rules"** tab at the top

### Step 2: Update the Rules
Replace the existing rules with this:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### Step 3: Publish
1. Click the **"Publish"** button
2. Confirm the changes

### Step 4: Test
1. Refresh your website
2. Check browser console (F12)
3. You should see: `✅ Firebase connected` (no more permission errors!)

## Important Notes

⚠️ **Security Warning:** These rules allow anyone to read/write your database. This is fine for testing, but for production you should add authentication-based rules later.

## Alternative: More Secure Rules (Optional)

If you want to add basic security later, you can use:

```json
{
  "rules": {
    "categories": {
      ".read": true,
      ".write": true
    },
    "products": {
      ".read": true,
      ".write": true
    },
    "orders": {
      ".read": true,
      ".write": true
    },
    "offerBanner": {
      ".read": true,
      ".write": true
    }
  }
}
```

But for now, the simple rules above will work perfectly!

