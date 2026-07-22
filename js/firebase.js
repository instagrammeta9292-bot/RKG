// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

// Your Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDkRNwlOqQM-MElq7QdUhciNa1U3VWxAn0",
  authDomain: "rhk14-a56ce.firebaseapp.com",
  projectId: "rhk14-a56ce",
  storageBucket: "rhk14-a56ce.firebasestorage.app",
  messagingSenderId: "306477507218",
  appId: "1:306477507218:web:007425b3fc7fa39b32bc4b",
  measurementId: "G-HXQFX1WTF6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication
const auth = getAuth(app);

// Export Authentication
export { auth };
