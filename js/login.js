import { auth, db } from "./firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    message.style.color = "#FFD54F";
    message.textContent = "Signing in...";

    try {

        // Login with Firebase Authentication
        const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        const user = userCredential.user;

        // Check if profile exists in Firestore
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        message.style.color = "#4CAF50";
        message.textContent = "Login successful";

        setTimeout(() => {

            if (userSnap.exists()) {

                // Existing user
                window.location.href = "home.html";

            } else {

                // New user
                window.location.href = "create-profile.html";

            }

        }, 800);

    } catch (error) {

        let errorMessage = "Login failed.";

        switch (error.code) {

            case "auth/invalid-email":
                errorMessage = "Invalid email address.";
                break;

            case "auth/invalid-credential":
                errorMessage = "Incorrect email or password.";
                break;

            case "auth/user-disabled":
                errorMessage = "This account has been disabled.";
                break;

            case "auth/network-request-failed":
                errorMessage = "Check your internet connection.";
                break;

            case "auth/too-many-requests":
                errorMessage = "Too many attempts. Try again later.";
                break;

            default:
                errorMessage = error.message;
        }

        message.style.color = "#ff4d4d";
        message.textContent = errorMessage;
    }

});
