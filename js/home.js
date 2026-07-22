import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
    collection,
    query,
    where,
    onSnapshot,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const requestList = document.getElementById("requestList");
const requestCount = document.getElementById("requestCount");
const userList = document.getElementById("userList");

let currentUser = null;

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href = "index.html";
        return;

    }

    currentUser = user;

    loadConnectionRequests();

    loadConnectedUsers();

});

function loadConnectionRequests() {

    const q = query(
        collection(db, "connectionRequests"),
        where("toUid", "==", currentUser.uid),
        where("status", "==", "pending")
    );

    onSnapshot(q, async (snapshot) => {

        requestList.innerHTML = "";

        requestCount.textContent = snapshot.size;

        if (snapshot.empty) {

            requestList.innerHTML = `
                <div class="empty-card">
                    No connection requests
                </div>
            `;

            return;

        }

        for (const request of snapshot.docs) {

            const data = request.data();

            const senderRef = doc(db, "users", data.fromUid);

            const senderSnap = await getDoc(senderRef);

            if (!senderSnap.exists()) continue;

            const sender = senderSnap.data();

            const card = document.createElement("div");

            card.className = "request-card";

            card.innerHTML = `
                <img src="${sender.photoURL}" alt="Profile">

                <div class="user-info">

                    <h4>${sender.username}</h4>

                    <p>Wants to connect with you</p>

                    <div class="request-buttons">

                        <button
                            class="acceptBtn"
                            data-id="${request.id}"
                            data-uid="${data.fromUid}">
                            Accept
                        </button>

                        <button
                            class="rejectBtn"
                            data-id="${request.id}">
                            Reject
                        </button>

                    </div>

                </div>
            `;

            requestList.appendChild(card);

        }

        document.querySelectorAll(".acceptBtn").forEach(btn => {

            btn.addEventListener("click", () => {

                acceptRequest(
                    btn.dataset.id,
                    btn.dataset.uid
                );

            });

        });

        document.querySelectorAll(".rejectBtn").forEach(btn => {

            btn.addEventListener("click", () => {

                rejectRequest(
                    btn.dataset.id
                );

            });

        });

    });

}
import {
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    increment,
    collection,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

async function acceptRequest(requestId, senderUid) {

    try {

        await setDoc(
            doc(db, "users", currentUser.uid, "connections", senderUid),
            {
                connected: true,
                connectedAt: serverTimestamp()
            }
        );

        await setDoc(
            doc(db, "users", senderUid, "connections", currentUser.uid),
            {
                connected: true,
                connectedAt: serverTimestamp()
            }
        );

        await updateDoc(
            doc(db, "users", currentUser.uid),
            {
                connectionCount: increment(1)
            }
        );

        await updateDoc(
            doc(db, "users", senderUid),
            {
                connectionCount: increment(1)
            }
        );

        await deleteDoc(
            doc(db, "connectionRequests", requestId)
        );

    } catch (error) {

        console.error(error);
        alert("Unable to accept request.");

    }

}

async function rejectRequest(requestId) {

    try {

        await deleteDoc(
            doc(db, "connectionRequests", requestId)
        );

    } catch (error) {

        console.error(error);
        alert("Unable to reject request.");

    }

}

function loadConnectedUsers() {

    const connectionsRef = collection(
        db,
        "users",
        currentUser.uid,
        "connections"
    );

    onSnapshot(connectionsRef, async (snapshot) => {

        userList.innerHTML = "";

        if (snapshot.empty) {

            userList.innerHTML = `
                <div class="empty-card">
                    No connected users yet
                </div>
            `;

            return;

        }

        for (const connection of snapshot.docs) {

            const otherUid = connection.id;

            const userSnap = await getDoc(
                doc(db, "users", otherUid)
            );

            if (!userSnap.exists()) continue;

            const user = userSnap.data();

            const card = document.createElement("div");

            card.className = "user-card";

            card.innerHTML = `
                <img src="${user.photoURL}" alt="Profile">

                <div class="user-info">

                    <h4>${user.username}</h4>

                    <p>${user.bio || "No bio available"}</p>

                </div>

                <button class="chatBtn">
                    Chat
                </button>
            `;

            card.querySelector("img").onclick = () => {
                window.location.href =
                    "view-profile.html?uid=" + otherUid;
            };

            card.querySelector(".user-info").onclick = () => {
                window.location.href =
                    "view-profile.html?uid=" + otherUid;
            };

            card.querySelector(".chatBtn").onclick = () => {
                window.location.href =
                    "chat.html?uid=" + otherUid;
            };

            userList.appendChild(card);

        }

    });

}
