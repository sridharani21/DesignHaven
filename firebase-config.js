// Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyCQ-2D38sCwbWmFiUFPF-1WN3Tl1xX0luE",
    authDomain: "designhaven-dcda4.firebaseapp.com",
    databaseURL: "https://designhaven-dcda4-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "designhaven-dcda4",
    storageBucket: "designhaven-dcda4.firebasestorage.app",
    messagingSenderId: "827632978118",
    appId: "1:827632978118:web:6835284cb1892595cc6fc7"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

// Initialize Firebase (only if config is filled)
try {
    if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY") {
        firebase.initializeApp(firebaseConfig);
        console.log('Firebase initialized successfully');
    } else {
        console.log('Firebase not configured - using localStorage only');
    }
} catch (e) {
    console.error('Firebase initialization error:', e);
}

