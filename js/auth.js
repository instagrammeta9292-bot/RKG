import { auth } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const logoutBtn = document.getElementById("logoutBtn");
const userEmail = document.getElementById("userEmail");

onAuthStateChanged(auth, (user) => {

    if (user) {

        if (userEmail) {
            userEmail.textContent = user.email;
        }

    } else {

        window.location.href = "index.html";

    }

});

if (logoutBtn) {

    logoutBtn.addEventListener("click", async () => {

        await signOut(auth);

        window.location.href = "index.html";

    });

}
