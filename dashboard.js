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

const userEmailText = document.getElementById('user-email');
const logoutBtn = document.getElementById('logoutBtn');

// Route protection check
auth.onAuthStateChanged((user) => {
    if (user) {
        userEmailText.textContent = user.email;
    } else {
        window.location.href = "index.html";
    }
});

// Logout action
logoutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
        window.location.href = "index.html";
    });
});
