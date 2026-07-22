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

auth.onAuthStateChanged((user) => {
    if (user) {
        window.location.href = "dashboard.html";
    }
});

const signupForm = document.getElementById('signupForm');
const emailInput = document.getElementById('signupEmail');
const passwordInput = document.getElementById('signupPassword');
const statusMessage = document.getElementById('status-message');

signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    statusMessage.textContent = "Creating account...";
    statusMessage.className = "";

    auth.createUserWithEmailAndPassword(email, password)
        .then(() => {
            window.location.href = "dashboard.html";
        })
        .catch((error) => {
            console.error("Signup Error Code:", error.code);
            statusMessage.textContent = error.message;
            statusMessage.className = "error-msg";
        });
});
