import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const logoutBtn = document.getElementById("logoutBtn");

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "index.html";
        return;
    }

    const profileRef = doc(db, "users", user.uid);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
        window.location.href = "create-profile.html";
        return;
    }

    const profile = profileSnap.data();

    const username = document.getElementById("username");
    const profileImage = document.getElementById("profileImage");

    if (username) {
        username.textContent = profile.username;
    }

    if (profileImage) {
        profileImage.src = profile.photoURL;
    }

});

if (logoutBtn) {

    logoutBtn.addEventListener("click", async () => {

        await signOut(auth);

        window.location.href = "index.html";

    });

}
