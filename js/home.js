import { auth, db } from "./firebase.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
    collection,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const usersList = document.getElementById("usersList");
const searchInput = document.getElementById("searchInput");

let allUsers = [];

onAuthStateChanged(auth, (user) => {

    if (!user) {
        window.location.href = "index.html";
        return;
    }

    loadUsers(user.uid);

});

function loadUsers(currentUid) {

    const usersRef = collection(db, "users");

    onSnapshot(usersRef, (snapshot) => {

        allUsers = [];

        snapshot.forEach((doc) => {

            const data = doc.data();

            if (data.uid !== currentUid) {

                allUsers.push(data);

            }

        });

        displayUsers(allUsers);

    });

}

function displayUsers(users) {

    usersList.innerHTML = "";

    if (users.length === 0) {

        usersList.innerHTML =
        `<div class="empty">No users found.</div>`;

        return;
    }

    users.forEach((user) => {

        usersList.innerHTML += `

<div class="user-card" onclick="openChat('${user.uid}')">

<img
class="avatar"
src="${user.photoURL}"
alt="Profile">

<div class="user-info">

<div class="user-name">
${user.username}
</div>

<div class="last-message">
Tap to start chatting
</div>

</div>

<div>

<div class="time">
Online
</div>

<div class="online"></div>

</div>

</div>

`;

    });

}

searchInput.addEventListener("input", () => {

    const value = searchInput.value
    .toLowerCase()
    .trim();

    const filtered = allUsers.filter((user) =>

        user.username
        .toLowerCase()
        .includes(value)

    );

    displayUsers(filtered);

});

window.openChat = function(uid){

    window.location.href =
    `chat.html?uid=${uid}`;

};
