import { auth } from "./firebase.js";

import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const signupForm = document.getElementById("signupForm");
const message = document.getElementById("message");

signupForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        message.style.color = "red";
        message.textContent = "Passwords do not match.";
        return;
    }

    message.style.color = "#ffd54f";
    message.textContent = "Creating account...";

    try {

        await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        message.style.color = "lime";
        message.textContent = "Account created successfully!";

      
            await createUserWithEmailAndPassword(auth, email, password);

setTimeout(() => {
    window.location.replace("create-profile.html");
}, 500);

    } catch (error) {

        let errorMessage = "Unable to create account.";

        switch (error.code) {

            case "auth/email-already-in-use":
                errorMessage = "Email already exists.";
                break;

            case "auth/invalid-email":
                errorMessage = "Invalid email address.";
                break;

            case "auth/weak-password":
                errorMessage = "Password must be at least 6 characters.";
                break;

            case "auth/network-request-failed":
                errorMessage = "Check your internet connection.";
                break;

            default:
                errorMessage = error.message;
        }

        message.style.color = "red";
        message.textContent = errorMessage;
    }

});
