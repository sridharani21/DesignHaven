# Firebase Deployment Instructions

## The Problem
Firebase Hosting is showing the default welcome page instead of your website because there's a `public` folder with a default `index.html`.

## Solution

### Option 1: Delete the public folder (Recommended)
1. Delete the `public` folder from your project
2. Run: `firebase deploy --only hosting`

### Option 2: Update firebase.json to ignore public folder
The `firebase.json` is already configured to ignore the `public` folder. Just redeploy:

```bash
firebase deploy --only hosting
```

## Steps to Deploy:

1. **Make sure you're in the project directory:**
   ```bash
   cd "C:\Users\Nandu\OneDrive\Desktop\business"
   ```

2. **Login to Firebase (if not already):**
   ```bash
   firebase login
   ```

3. **Deploy your website:**
   ```bash
   firebase deploy --only hosting
   ```

4. **After deployment, your website will be live at:**
   - `https://designhaven-dcda4.web.app`
   - or `https://designhaven-dcda4.firebaseapp.com`

## Verify Deployment:

1. Open your website URL
2. You should see your DesignHaven homepage (not the Firebase welcome page)
3. Check browser console (F12) - should see: `✅ Firebase initialized successfully`

## If you still see the Firebase page:

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Check Firebase Console:**
   - Go to: https://console.firebase.google.com/project/designhaven-dcda4/hosting
   - Make sure the latest deployment shows your files
3. **Delete the public folder** and redeploy

