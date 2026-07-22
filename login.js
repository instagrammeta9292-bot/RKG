const firebaseConfig = {
  apiKey: "AIzaSyBND3n2ag9qGZG5SJPOKNVYr2dHNLwoD7Y",
  authDomain: "rhk-music-24bbc.firebaseapp.com",
  databaseURL: "https://rhk-music-24bbc-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "rhk-music-24bbc",
  storageBucket: "rhk-music-24bbc.firebasestorage.app",
  messagingSenderId: "571438674805",
  appId: "1:571438674805:web:bcfe7856316b638d08193c",
  measurementId: "G-RF4GEDGP9N"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Check if user is already logged in (Persistence)
auth.onAuthStateChanged((user) => {
    if (user) {
        window.location.href = "dashboard.html";
    }
});

const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const statusMessage = document.getElementById('status-message');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            window.location.href = "dashboard.html";
        })
        .catch((error) => {
            statusMessage.textContent = error.message;
            statusMessage.className = "error-msg";
        });
});

