import { auth } from "./firebase.js";

import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const signupForm = document.getElementById("signupForm");

const email = document.getElementById("email");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");

const message = document.getElementById("message");

const signupText = document.getElementById("signupText");
const loader = document.getElementById("loader");

const togglePassword = document.getElementById("togglePassword");
const eyeIcon = document.getElementById("eyeIcon");

// Show / Hide Password

togglePassword.addEventListener("click", () => {

    if (password.type === "password") {

        password.type = "text";
        eyeIcon.classList.replace("fa-eye", "fa-eye-slash");

    } else {

        password.type = "password";
        eyeIcon.classList.replace("fa-eye-slash", "fa-eye");

    }

});

signupForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    message.textContent = "";
    message.style.color = "#FFD54F";

    if (password.value !== confirmPassword.value) {

        message.style.color = "#ff6b6b";
        message.textContent = "Passwords do not match.";
        return;

    }

    if (password.value.length < 6) {

        message.style.color = "#ff6b6b";
        message.textContent = "Password must be at least 6 characters.";
        return;

    }

    signupText.style.display = "none";
    loader.style.display = "block";

    try {

        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email.value.trim(),
            password.value
        );

        if (userCredential.user) {

            message.style.color = "#7CFC8A";
            message.textContent = "Account created successfully.";

            setTimeout(() => {

                window.location.href = "create-profile.html";

            }, 800);

        }

    } catch (error) {

        signupText.style.display = "inline";
        loader.style.display = "none";

        switch (error.code) {

            case "auth/email-already-in-use":
                message.textContent = "Email already registered.";
                break;

            case "auth/invalid-email":
                message.textContent = "Invalid email address.";
                break;

            case "auth/weak-password":
                message.textContent = "Password is too weak.";
                break;

            case "auth/network-request-failed":
                message.textContent = "Check your internet connection.";
                break;

            default:
                message.textContent = error.message;

        }

        message.style.color = "#ff6b6b";

        return;

    }

});

window.addEventListener("pageshow", () => {

    signupText.style.display = "inline";
    loader.style.display = "none";

});
