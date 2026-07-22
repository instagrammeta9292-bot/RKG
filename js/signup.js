import { auth } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const signupForm = document.getElementById("signupForm");
const email = document.getElementById("email");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");
const signupBtn = document.getElementById("signupBtn");
const signupMessage = document.getElementById("signupMessage");

// If already logged in
onAuthStateChanged(auth, (user) => {

    if (user) {

        window.location.replace("create-profile.html");

    }

});

// Signup

signupForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    signupMessage.style.color = "#EF4444";
    signupMessage.textContent = "";

    const emailValue = email.value.trim();
    const passwordValue = password.value;
    const confirmValue = confirmPassword.value;

    if (passwordValue !== confirmValue) {

        signupMessage.textContent = "Passwords do not match.";
        return;

    }

    if (passwordValue.length < 6) {

        signupMessage.textContent = "Password must be at least 6 characters.";
        return;

    }

    signupBtn.disabled = true;
    signupBtn.textContent = "Creating Account...";

    try {

        await createUserWithEmailAndPassword(

            auth,
            emailValue,
            passwordValue

        );

        signupMessage.style.color = "#22C55E";
        signupMessage.textContent = "Account created successfully.";

        setTimeout(() => {

            window.location.replace("create-profile.html");

        }, 800);

    } catch (error) {

        switch (error.code) {

            case "auth/email-already-in-use":

                signupMessage.textContent =
                    "This email is already registered.";
                break;

            case "auth/invalid-email":

                signupMessage.textContent =
                    "Invalid email address.";
                break;

            case "auth/weak-password":

                signupMessage.textContent =
                    "Password is too weak.";
                break;

            default:

                signupMessage.textContent =
                    error.message;

        }

    }

    signupBtn.disabled = false;
    signupBtn.textContent = "Create Account";

});
