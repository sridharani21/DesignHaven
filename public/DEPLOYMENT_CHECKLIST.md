# Deployment Checklist

## ✅ Pre-Deployment Checks

### 1. Firebase Configuration
- [x] Firebase config is set in `firebase-config.js`
- [x] Database URL is correct
- [x] All Firebase SDK scripts are loaded in HTML files

### 2. Firebase Database Rules
Go to Firebase Console > Realtime Database > Rules and set:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### 3. Files to Upload
Upload ALL these files to your hosting:
- ✅ All `.html` files (index, admin, products, cart, checkout, etc.)
- ✅ `script.js`
- ✅ `styles.css`
- ✅ `firebase-config.js`
- ✅ `FIREBASE_SETUP.md` (optional, for reference)

### 4. Testing After Deployment
1. Open your website
2. Open browser console (F12)
3. Look for: `✅ Firebase initialized successfully`
4. Login as admin (sridharani / xyz@@21)
5. Add a product
6. Open website on phone - product should appear!

## 🔧 Troubleshooting

### If Firebase page opens:
- Check browser console for errors
- Verify Firebase SDK scripts are loading
- Check that `firebase-config.js` is accessible

### If data doesn't sync:
- Check Firebase Console > Realtime Database to see if data is being saved
- Verify database rules allow read/write
- Check browser console for Firebase errors

### If website doesn't load:
- Verify all files are uploaded
- Check file paths are correct
- Ensure `index.html` is in root directory

## 📱 Cross-Device Testing
1. Add product on laptop (as admin)
2. Open website on phone
3. Product should appear within seconds!

