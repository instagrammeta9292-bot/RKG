import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

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

        message.style.color = "#8BC34A";
        message.textContent = "Login successful!";

        setTimeout(() => {
            window.location.href = "home.html";
        }, 700);

    } catch (error) {

        switch (error.code) {

            case "auth/invalid-email":
                message.textContent = "Invalid email address.";
                break;

            case "auth/user-not-found":
                message.textContent = "No account found with this email.";
                break;

            case "auth/invalid-credential":
                message.textContent = "Incorrect email or password.";
                break;

            case "auth/wrong-password":
                message.textContent = "Incorrect password.";
                break;

            case "auth/too-many-requests":
                message.textContent = "Too many attempts. Please try again later.";
                break;

            default:
                message.textContent = error.message;
        }

        message.style.color = "#ff6b6b";
    }

});
