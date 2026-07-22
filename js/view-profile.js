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
import {
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

/* ===========================
   CHECK RELATIONSHIP
=========================== */

async function checkRelationship() {

    actionArea.innerHTML = "";

    try {

        /* Already Connected */

        const connectionSnap = await getDoc(

            doc(
                db,
                "users",
                currentUser.uid,
                "connections",
                profileUid
            )

        );

        if (connectionSnap.exists()) {

            actionArea.innerHTML = `

                <div class="connected">

                    <i class="fa-solid fa-circle-check"></i>

                    Connected

                </div>

                <button
                    class="primaryBtn"
                    id="chatBtn">

                    Chat

                </button>

            `;

            document
                .getElementById("chatBtn")
                .onclick = () => {

                    window.location.href =
                        "chat.html?uid=" + profileUid;

                };

            return;

        }

        /* Outgoing Request */

        const outgoingQuery = query(

            collection(db, "connectionRequests"),

            where("fromUid", "==", currentUser.uid),

            where("toUid", "==", profileUid),

            where("status", "==", "pending")

        );

        const outgoing = await getDocs(outgoingQuery);

        if (!outgoing.empty) {

            actionArea.innerHTML = `

                <button
                    class="secondaryBtn"
                    disabled>

                    Request Sent

                </button>

            `;

            return;

        }

        /* Incoming Request */

        const incomingQuery = query(

            collection(db, "connectionRequests"),

            where("fromUid", "==", profileUid),

            where("toUid", "==", currentUser.uid),

            where("status", "==", "pending")

        );

        const incoming = await getDocs(incomingQuery);

        if (!incoming.empty) {

            const requestId = incoming.docs[0].id;

            actionArea.innerHTML = `

                <button
                    class="acceptBtn"
                    id="acceptBtn">

                    Accept

                </button>

                <button
                    class="rejectBtn"
                    id="rejectBtn">

                    Reject

                </button>

            `;

            document
                .getElementById("acceptBtn")
                .onclick = () => {

                    acceptRequest(requestId);

                };

            document
                .getElementById("rejectBtn")
                .onclick = () => {

                    rejectRequest(requestId);

                };

            return;

        }

        /* No Relationship */

        actionArea.innerHTML = `

            <button
                class="primaryBtn"
                id="connectBtn">

                Connect

            </button>

        `;

        document
            .getElementById("connectBtn")
            .onclick = sendConnectionRequest;

    }

    catch (error) {

        console.error(error);

    }

                }
/* ===========================
   SEND CONNECTION REQUEST
=========================== */

import {
    addDoc,
    updateDoc,
    deleteDoc,
    setDoc,
    serverTimestamp,
    increment
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

async function sendConnectionRequest() {

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

        checkRelationship();

    } catch (error) {

        console.error(error);

        alert("Unable to send request.");

    }

}

/* ===========================
   ACCEPT REQUEST
=========================== */

async function acceptRequest(requestId) {

    try {

        // Add connection for current user
        await setDoc(

            doc(
                db,
                "users",
                currentUser.uid,
                "connections",
                profileUid
            ),

            {

                uid: profileUid,

                connectedAt: serverTimestamp()

            }

        );

        // Add connection for other user
        await setDoc(

            doc(
                db,
                "users",
                profileUid,
                "connections",
                currentUser.uid
            ),

            {

                uid: currentUser.uid,

                connectedAt: serverTimestamp()

            }

        );

        // Update connection count
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

        // Remove request
        await deleteDoc(

            doc(
                db,
                "connectionRequests",
                requestId
            )

        );

        checkRelationship();

    }

    catch (error) {

        console.error(error);

        alert("Unable to accept request.");

    }

}

/* ===========================
   REJECT REQUEST
=========================== */

async function rejectRequest(requestId) {

    try {

        await deleteDoc(

            doc(
                db,
                "connectionRequests",
                requestId
            )

        );

        checkRelationship();

    }

    catch (error) {

        console.error(error);

        alert("Unable to reject request.");

    }

}
/* =====================================
   REAL-TIME PROFILE & RELATIONSHIP
===================================== */

import {
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

let unsubscribeProfile = null;
let unsubscribeConnections = null;

function startRealtimeListeners() {

    if (!profileUid) return;

    // Live profile updates
    unsubscribeProfile = onSnapshot(

        doc(db, "users", profileUid),

        (snapshot) => {

            if (!snapshot.exists()) return;

            const user = snapshot.data();

            profilePhoto.src = user.photoURL || "";

            username.textContent = user.username || "Unknown User";

            bio.textContent = user.bio || "No bio available.";

            aboutText.textContent = user.bio || "No bio available.";

            connections.textContent =
                user.connectionCount || 0;

        }

    );

    // Live connection status updates
    unsubscribeConnections = onSnapshot(

        collection(
            db,
            "connectionRequests"
        ),

        () => {

            checkRelationship();

        }

    );

}

/* =====================================
   CLEANUP
===================================== */

window.addEventListener("beforeunload", () => {

    if (unsubscribeProfile) {

        unsubscribeProfile();

    }

    if (unsubscribeConnections) {

        unsubscribeConnections();

    }

});

/* =====================================
   INITIALIZE
===================================== */

startRealtimeListeners();

/* =====================================
   GLOBAL ERROR HANDLER
===================================== */

window.addEventListener("error", (event) => {

    console.error("View Profile Error:", event.error);

});

console.log("RHK View Profile Ready");
