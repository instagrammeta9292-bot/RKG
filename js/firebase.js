import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDkRNwlOqQM-MElq7QdUhciNa1U3VWxAn0",
  authDomain: "rhk14-a56ce.firebaseapp.com",
  projectId: "rhk14-a56ce",
  storageBucket: "rhk14-a56ce.firebasestorage.app",
  messagingSenderId: "306477507218",
  appId: "1:306477507218:web:007425b3fc7fa39b32bc4b",
  measurementId: "G-HXQFX1WTF6"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
