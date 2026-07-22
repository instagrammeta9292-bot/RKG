import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    query,
    where,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const profileUid = params.get("uid");

const profilePhoto = document.getElementById("profilePhoto");
const username = document.getElementById("username");
const bio = document.getElementById("bio");
const connectionCount = document.getElementById("connectionCount");
const buttonArea = document.getElementById("buttonArea");

let currentUser = null;

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "index.html";
        return;
    }

    currentUser = user;

    loadProfile();
    watchRelationship();

});

async function loadProfile() {

    const profileRef = doc(db, "users", profileUid);

    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {

        username.textContent = "User not found";
        return;

    }

    const data = profileSnap.data();

    profilePhoto.src = data.photoURL || "";
    username.textContent = data.username || "Unknown User";
    bio.textContent = data.bio || "No bio yet.";
    connectionCount.textContent = data.connectionCount || 0;

}

function watchRelationship() {

    const outgoingQuery = query(
        collection(db, "connectionRequests"),
        where("fromUid", "==", currentUser.uid),
        where("toUid", "==", profileUid),
        where("status", "==", "pending")
    );

    onSnapshot(outgoingQuery, (snapshot) => {

        if (!snapshot.empty) {

            buttonArea.innerHTML = `
                <button class="requestedBtn" disabled>
                    Requested ✓
                </button>
            `;

            return;

        }

        checkIncomingRequest();

    });

}

function checkIncomingRequest() {

    const incomingQuery = query(
        collection(db, "connectionRequests"),
        where("fromUid", "==", profileUid),
        where("toUid", "==", currentUser.uid),
        where("status", "==", "pending")
    );

    onSnapshot(incomingQuery, (snapshot) => {

        if (!snapshot.empty) {

            const requestId = snapshot.docs[0].id;

            buttonArea.innerHTML = `
                <button class="acceptBtn" id="acceptBtn">
                    Accept
                </button>

                <button class="rejectBtn" id="rejectBtn">
                    Reject
                </button>
            `;

            document
                .getElementById("acceptBtn")
                .addEventListener("click", () => acceptRequest(requestId));

            document
                .getElementById("rejectBtn")
                .addEventListener("click", () => rejectRequest(requestId));

            return;

        }

        checkConnection();

    });

}

function checkConnection() {

    const connectionRef = doc(
        db,
        "users",
        currentUser.uid,
        "connections",
        profileUid
    );

    onSnapshot(connectionRef, (docSnap) => {

        if (docSnap.exists()) {

            buttonArea.innerHTML = `
                <button class="connectedBtn" disabled>
                    ✓ Connected
                </button>
            `;

        } else {

            buttonArea.innerHTML = `
                <button class="connectBtn" id="connectBtn">
                    Connect
                </button>
            `;

            document
                .getElementById("connectBtn")
                .addEventListener("click", sendRequest);

        }

    });

}
import {
    addDoc,
    deleteDoc,
    updateDoc,
    setDoc,
    increment,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

async function sendRequest() {

    try {

        await addDoc(
            collection(db, "connectionRequests"),
            {
                fromUid: currentUser.uid,
                toUid: profileUid,
                status: "pending",
                createdAt: serverTimestamp()
            }
        );

    } catch (error) {

        console.error(error);
        alert("Unable to send request.");

    }

}

async function acceptRequest(requestId) {

    try {

        await setDoc(
            doc(db, "users", currentUser.uid, "connections", profileUid),
            {
                connected: true,
                connectedAt: serverTimestamp()
            }
        );

        await setDoc(
            doc(db, "users", profileUid, "connections", currentUser.uid),
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
            doc(db, "users", profileUid),
            {
                connectionCount: increment(1)
            }
        );

        await updateDoc(
            doc(db, "connectionRequests", requestId),
            {
                status: "accepted"
            }
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
