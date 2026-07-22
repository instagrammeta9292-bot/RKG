import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    collection,
    query,
    where,
    getDocs,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const form = document.getElementById("profileForm");
const imageInput = document.getElementById("profileImage");
const preview = document.getElementById("previewImage");
const usernameInput = document.getElementById("username");
const message = document.getElementById("message");

let currentUser = null;

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "index.html";
        return;
    }

    currentUser = user;

    const profileRef = doc(db, "users", user.uid);
    const profileSnap = await getDoc(profileRef);

    if (profileSnap.exists()) {
        window.location.href = "home.html";
    }

});

imageInput.addEventListener("change", () => {

    const file = imageInput.files[0];

    if (!file) return;

    preview.src = URL.createObjectURL(file);

});

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    if (!currentUser) return;

    const username = usernameInput.value.trim().toLowerCase();
    const file = imageInput.files[0];

    if (username.length < 3) {
        message.textContent = "Username must be at least 3 characters.";
        return;
    }

    if (!file) {
        message.textContent = "Select a profile picture.";
        return;
    }

    message.textContent = "Checking username...";

    const q = query(
        collection(db, "users"),
        where("username", "==", username)
    );

    const result = await getDocs(q);

    if (!result.empty) {
        message.textContent = "Username already taken.";
        return;
    }

    message.textContent = "Uploading image...";

    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", "rhk_upload");
      try {

        const uploadResponse = await fetch(
            "https://api.cloudinary.com/v1_1/nhy9lfkt/image/upload",
            {
                method: "POST",
                body: formData
            }
        );

        const uploadResult = await uploadResponse.json();

        if (!uploadResult.secure_url) {
            throw new Error("Image upload failed.");
        }

        message.textContent = "Saving profile...";

        await setDoc(doc(db, "users", currentUser.uid), {

            uid: currentUser.uid,
            email: currentUser.email,
            username: username,
            photoURL: uploadResult.secure_url,

            followers: 0,
            following: 0,
            posts: 0,

            createdAt: serverTimestamp()

        });

        message.style.color = "#4CAF50";
        message.textContent = "Profile created successfully!";

        setTimeout(() => {

            window.location.href = "home.html";

        }, 1000);

    } catch (error) {

        console.error(error);

        message.style.color = "#ff4d4d";

        message.textContent =
            "Something went wrong. Please try again.";

    }

});
