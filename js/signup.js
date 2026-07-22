import { auth } from "./firebase.js";

import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const signupForm = document.getElementById("signupForm");
const message = document.getElementById("message");

signupForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        message.style.color = "#ff4d4d";
        message.textContent = "Passwords do not match.";
        return;
    }

    if (password.length < 6) {
        message.style.color = "#ff4d4d";
        message.textContent = "Password must be at least 6 characters.";
        return;
    }

    message.style.color = "#ffd54f";
    message.textContent = "Creating your account...";

    try {

        await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        message.style.color = "#8BC34A";
        message.textContent = "Account created successfully!";

        setTimeout(() => {
            window.location.href = "home.html";
        }, 800);

    } catch (error) {

        switch (error.code) {

            case "auth/email-already-in-use":
                message.textContent = "This email is already registered.";
                break;

            case "auth/invalid-email":
                message.textContent = "Please enter a valid email address.";
                break;

            case "auth/weak-password":
                message.textContent = "Password should be at least 6 characters.";
                break;

            case "auth/network-request-failed":
                message.textContent = "Network error. Check your internet connection.";
                break;

            default:
                message.textContent = error.message;
        }

        message.style.color = "#ff4d4d";
    }

});
