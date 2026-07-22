import { auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const loginForm = document.getElementById("loginForm");
const email = document.getElementById("email");
const password = document.getElementById("password");

const message = document.getElementById("message");

const loader = document.getElementById("loader");
const loginText = document.getElementById("loginText");

const togglePassword = document.getElementById("togglePassword");
const eyeIcon = document.getElementById("eyeIcon");

// Show / Hide Password

togglePassword.addEventListener("click", () => {

    if (password.type === "password") {

        password.type = "text";

        eyeIcon.classList.remove("fa-eye");
        eyeIcon.classList.add("fa-eye-slash");

    } else {

        password.type = "password";

        eyeIcon.classList.remove("fa-eye-slash");
        eyeIcon.classList.add("fa-eye");

    }

});

// Login

loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    message.textContent = "";
    message.style.color = "#FFD54F";

    loader.style.display = "block";
    loginText.style.display = "none";

    try {

        const userCredential = await signInWithEmailAndPassword(
            auth,
            email.value.trim(),
            password.value
        );

        const user = userCredential.user;

        const profileRef = doc(db, "users", user.uid);

        const profileSnap = await getDoc(profileRef);

        message.style.color = "#7CFC8A";
        message.textContent = "Login Successful";

        setTimeout(() => {

            if (profileSnap.exists()) {

                window.location.href = "home.html";

            } else {

                window.location.href = "create-profile.html";

            }

        }, 800);

    } catch (error) {

        loader.style.display = "none";
        loginText.style.display = "inline";

        switch (error.code) {

            case "auth/invalid-email":
                message.textContent = "Invalid email address.";
                break;

            case "auth/invalid-credential":
                message.textContent = "Incorrect email or password.";
                break;

            case "auth/user-disabled":
                message.textContent = "This account is disabled.";
                break;

            case "auth/network-request-failed":
                message.textContent = "No internet connection.";
                break;

            case "auth/too-many-requests":
                message.textContent = "Too many attempts. Try again later.";
                break;

            default:
                message.textContent = error.message;

        }

        message.style.color = "#ff6b6b";

        return;

    }

});

window.addEventListener("pageshow", () => {

    loader.style.display = "none";
    loginText.style.display = "inline";

});
