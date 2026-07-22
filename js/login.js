import { auth } from "./firebase.js";

import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    message.style.color = "#ffd54f";
    message.textContent = "Signing in...";

    try {

        await signInWithEmailAndPassword(auth, email, password);

        message.style.color = "#4CAF50";
        message.textContent = "Login Successful";

        setTimeout(() => {
            window.location.href = "home.html";
        }, 1000);

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
                errorMessage = "Too many login attempts. Try again later.";
                break;

            default:
                errorMessage = error.message;
        }

        message.style.color = "#ff4d4d";
        message.textContent = errorMessage;
    }
});
