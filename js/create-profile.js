import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const form = document.getElementById("profileForm");
const imageInput = document.getElementById("profileImage");
const username = document.getElementById("username");
const bio = document.getElementById("bio");
const saveBtn = document.getElementById("saveBtn");
const message = document.getElementById("message");

let currentUser = null;

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.replace("login.html");
        return;

    }

    currentUser = user;

    // Skip profile creation if it already exists
    const profile = await getDoc(doc(db, "users", user.uid));

    if (profile.exists()) {

        window.location.replace("home.html");

    }

});

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    message.style.color = "#EF4444";
    message.textContent = "";

    if (!currentUser) return;

    const name = username.value.trim();

    if (name.length < 3) {

        message.textContent = "Username must be at least 3 characters.";
        return;

    }

    if (imageInput.files.length === 0) {

        message.textContent = "Please choose a profile photo.";
        return;

    }

    saveBtn.disabled = true;
    saveBtn.textContent = "Creating Profile...";

    try {

        // Check username availability
        const q = query(
            collection(db, "users"),
            where("username", "==", name)
        );

        const result = await getDocs(q);

        if (!result.empty) {

            message.textContent = "Username already exists.";

            saveBtn.disabled = false;
            saveBtn.textContent = "Save Profile";
            return;

        }

        // Upload image to Cloudinary
        const file = imageInput.files[0];

        const formData = new FormData();

        formData.append("file", file);
        formData.append("upload_preset", "rhk_upload");

        const upload = await fetch(
            "https://api.cloudinary.com/v1_1/nhy9lfkt/image/upload",
            {
                method: "POST",
                body: formData
            }
        );

        const cloudinary = await upload.json();

        if (!cloudinary.secure_url) {

            throw new Error("Image upload failed.");

        }

        // Save Firestore profile
        await setDoc(doc(db, "users", currentUser.uid), {

            uid: currentUser.uid,

            email: currentUser.email,

            username: name,

            bio: bio.value.trim(),

            photoURL: cloudinary.secure_url,

            connectionCount: 0,

            createdAt: serverTimestamp(),

            isOnline: true,

            lastSeen: serverTimestamp()

        });

        window.location.replace("home.html");

    } catch (error) {

        console.error(error);

        message.textContent = error.message;

    }

    saveBtn.disabled = false;
    saveBtn.textContent = "Save Profile";

});
