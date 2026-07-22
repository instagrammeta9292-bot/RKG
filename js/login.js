import { auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const form = document.getElementById("loginForm");
const email = document.getElementById("email");
const password = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const message = document.getElementById("loginMessage");

/* Auto Login */

onAuthStateChanged(auth, async (user) => {

    if (!user) return;

    try {

        const profileRef = doc(db, "users", user.uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {

            window.location.replace("home.html");

        } else {

            window.location.replace("create-profile.html");

        }

    } catch (e) {

        console.error(e);

    }

});

/* Login */

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    message.textContent = "";

    loginBtn.disabled = true;
    loginBtn.classList.add("loading");
    loginBtn.textContent = "Logging in...";

    try {

        const result = await signInWithEmailAndPassword(

            auth,

            email.value.trim(),

            password.value

        );

        const uid = result.user.uid;

        const profileRef = doc(db, "users", uid);

        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {

            window.location.replace("home.html");

        } else {

            window.location.replace("create-profile.html");

        }

    } catch (error) {

        switch (error.code) {

            case "auth/invalid-credential":
            case "auth/wrong-password":
            case "auth/user-not-found":

                message.textContent = "Incorrect email or password.";
                break;

            case "auth/invalid-email":

                message.textContent = "Invalid email address.";
                break;

            case "auth/too-many-requests":

                message.textContent = "Too many attempts. Try again later.";
                break;

            default:

                message.textContent = error.message;

        }

    }

    loginBtn.disabled = false;
    loginBtn.classList.remove("loading");
    loginBtn.textContent = "Login";

});
