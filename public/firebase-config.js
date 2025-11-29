// Firebase Configuration
// Using Firebase v9 compat mode for compatibility with existing code

// Make firebaseConfig globally accessible
window.firebaseConfig = {
    apiKey: "AIzaSyCQ-2D38sCwbWmFiUFPF-1WN3Tl1xX0luE",
    authDomain: "designhaven-dcda4.firebaseapp.com",
    databaseURL: "https://designhaven-dcda4-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "designhaven-dcda4",
    storageBucket: "designhaven-dcda4.firebasestorage.app",
    messagingSenderId: "827632978118",
    appId: "1:827632978118:web:6835284cb1892595cc6fc7"
};

// Initialize Firebase when SDK is loaded
(function() {
    function initFirebaseConfig() {
        try {
            if (typeof firebase !== 'undefined' && firebase.initializeApp) {
                // Check if already initialized
                try {
                    const apps = firebase.apps || [];
                    if (apps.length === 0) {
                        firebase.initializeApp(firebaseConfig);
                        console.log('✅ Firebase initialized successfully');
                    } else {
                        console.log('✅ Firebase already initialized');
                    }
                } catch (initError) {
                    if (initError.code !== 'app/duplicate-app') {
                        throw initError;
                    }
                    console.log('✅ Firebase already initialized');
                }
            } else {
                console.warn('⚠️ Firebase SDK not loaded yet');
            }
        } catch (e) {
            console.error('❌ Firebase initialization error:', e);
        }
    }
    
    // Try to initialize immediately
    if (typeof firebase !== 'undefined') {
        initFirebaseConfig();
    } else {
        // Wait for Firebase SDK to load
        window.addEventListener('load', function() {
            setTimeout(initFirebaseConfig, 100);
        });
    }
})();

