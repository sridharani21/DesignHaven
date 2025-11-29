# DesignHaven - E-commerce Website

A responsive e-commerce website with Firebase integration for cross-device synchronization.

## Features

- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Admin panel for managing products and categories
- ✅ Shopping cart and checkout
- ✅ Order tracking
- ✅ Firebase Realtime Database for cross-device sync
- ✅ Payment integration (UPI, COD)

## Firebase Setup

Firebase is already configured! The website will:
- Use Firebase for cross-device sync when available
- Fall back to localStorage if Firebase is not available

## Admin Access

- Username: `sridharani`
- Password: `xyz@@21`

## Deployment

The website is ready to deploy. Simply upload all files to your hosting service.

### Firebase Database Rules

Make sure your Firebase Realtime Database rules allow read/write:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

⚠️ **Note:** These rules allow public access. For production, implement proper authentication rules.

## File Structure

- `index.html` - Home page
- `admin.html` - Admin panel
- `products.html` - Product listing
- `cart.html` - Shopping cart
- `checkout.html` - Checkout page
- `orders.html` - Order history
- `script.js` - Main JavaScript logic
- `styles.css` - All styling
- `firebase-config.js` - Firebase configuration

## Support

For issues or questions, contact: d.artstudio021@gmail.com

