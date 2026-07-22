import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const profilePhoto = document.getElementById("profilePhoto");
const username = document.getElementById("username");
const bio = document.getElementById("bio");
const aboutText = document.getElementById("aboutText");
const connections = document.getElementById("connections");
const actionArea = document.getElementById("actionArea");

const params = new URLSearchParams(window.location.search);

const profileUid = params.get("uid");

let currentUser = null;
let viewedUser = null;

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.replace("login.html");
        return;

    }

    currentUser = user;

    if (!profileUid) {

        username.textContent = "User not found";
        return;

    }

    await loadProfile();

});

async function loadProfile() {

    try {

        const snap = await getDoc(
            doc(db, "users", profileUid)
        );

        if (!snap.exists()) {

            username.textContent = "User not found";
            return;

        }

        viewedUser = snap.data();

        profilePhoto.src = viewedUser.photoURL || "";

        username.textContent = viewedUser.username || "Unknown User";

        bio.textContent = viewedUser.bio || "No bio available.";

        aboutText.textContent = viewedUser.bio || "No bio available.";

        connections.textContent =
            viewedUser.connectionCount || 0;

        // Viewing your own profile
        if (profileUid === currentUser.uid) {

            actionArea.innerHTML = `
                <button
                    class="primaryBtn"
                    onclick="window.location.href='edit-profile.html'">
                    Edit Profile
                </button>
            `;

            return;

        }

        // Load relationship status
        checkRelationship();

    } catch (error) {

        console.error(error);

        username.textContent = "Failed to load profile.";

    }

}
