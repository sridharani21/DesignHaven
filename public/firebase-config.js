// Firebase Configuration
// Using Firebase v9 compat mode for compatibility with existing code

const firebaseConfig = {
    apiKey: "AIzaSyCQ-2D38sCwbWmFiUFPF-1WN3Tl1xX0luE",
    authDomain: "designhaven-dcda4.firebaseapp.com",
    databaseURL: "https://designhaven-dcda4-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "designhaven-dcda4",
    storageBucket: "designhaven-dcda4.firebasestorage.app",
    messagingSenderId: "827632978118",
    appId: "1:827632978118:web:6835284cb1892595cc6fc7"
};

// Initialize Firebase (using compat mode)
try {
    if (typeof firebase !== 'undefined' && firebase.initializeApp) {
        // Check if already initialized
        if (!firebase.apps || firebase.apps.length === 0) {
            firebase.initializeApp(firebaseConfig);
            console.log('✅ Firebase initialized successfully');
        } else {
            console.log('✅ Firebase already initialized');
        }
    } else {
        console.warn('⚠️ Firebase SDK not loaded - using localStorage only');
    }
} catch (e) {
    console.error('❌ Firebase initialization error:', e);
    console.log('Falling back to localStorage');
}

