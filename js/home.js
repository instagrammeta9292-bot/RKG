import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
    collection,
    query,
    where,
    onSnapshot,
    getDocs,
    getDoc,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    increment
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const searchInput = document.getElementById("searchInput");
const requestList = document.getElementById("requestList");
const requestCount = document.getElementById("requestCount");
const chatList = document.getElementById("chatList");
const profileBtn = document.getElementById("profileBtn");

let currentUser = null;

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.replace("login.html");
        return;

    }

    currentUser = user;

    loadConnectionRequests();

    loadConnectedUsers();

});

profileBtn.addEventListener("click", () => {

    window.location.href = "edit-profile.html";

});
/* ===========================
   SEARCH USERS
=========================== */

searchInput.addEventListener("input", searchUsers);

async function searchUsers() {

    const keyword = searchInput.value.trim().toLowerCase();

    // Show connected users again if search is empty
    if (keyword === "") {

        loadConnectedUsers();
        return;

    }

    chatList.innerHTML = "";

    try {

        const snapshot = await getDocs(collection(db, "users"));

        let found = 0;

        snapshot.forEach((userDoc) => {

            // Don't show yourself
            if (userDoc.id === currentUser.uid) return;

            const user = userDoc.data();

            const username = (user.username || "").toLowerCase();

            if (!username.includes(keyword)) return;

            found++;

            const card = document.createElement("div");

            card.className = "chatCard";

            card.innerHTML = `

                <img
                    class="avatar"
                    src="${user.photoURL || 'https://via.placeholder.com/60'}"
                    alt="Profile">

                <div class="userDetails">

                    <h4>${user.username}</h4>

                    <p>${user.bio || "No bio available"}</p>

                </div>

                <i class="fa-solid fa-chevron-right"></i>

            `;

            card.addEventListener("click", () => {

                window.location.href =
                    "view-profile.html?uid=" + userDoc.id;

            });

            chatList.appendChild(card);

        });

        if (found === 0) {

            chatList.innerHTML = `

                <div class="empty">

                    No users found

                </div>

            `;

        }

    } catch (error) {

        console.error(error);

        chatList.innerHTML = `

            <div class="empty">

                Failed to load users.

            </div>

        `;

    }

}
/* ===========================
   REAL-TIME CONNECTION REQUESTS
=========================== */

function loadConnectionRequests() {

    const requestsQuery = query(
        collection(db, "connectionRequests"),
        where("toUid", "==", currentUser.uid),
        where("status", "==", "pending")
    );

    onSnapshot(requestsQuery, async (snapshot) => {

        requestList.innerHTML = "";

        requestCount.textContent = snapshot.size;

        if (snapshot.empty) {

            requestList.innerHTML = `
                <div class="empty">
                    No connection requests
                </div>
            `;

            return;

        }

        for (const requestDoc of snapshot.docs) {

            const request = requestDoc.data();

            try {

                const senderSnap = await getDoc(
                    doc(db, "users", request.fromUid)
                );

                if (!senderSnap.exists()) continue;

                const sender = senderSnap.data();

                const card = document.createElement("div");

                card.className = "requestCard";

                card.innerHTML = `

                    <img
                        class="avatar"
                        src="${sender.photoURL || 'https://via.placeholder.com/60'}"
                        alt="Profile">

                    <div class="userDetails">

                        <h4>${sender.username}</h4>

                        <p>Wants to connect with you</p>

                        <div class="requestButtons">

                            <button
                                class="acceptBtn"
                                data-request="${requestDoc.id}"
                                data-user="${request.fromUid}">

                                Accept

                            </button>

                            <button
                                class="rejectBtn"
                                data-request="${requestDoc.id}">

                                Reject

                            </button>

                        </div>

                    </div>

                `;

                requestList.appendChild(card);

            } catch (error) {

                console.error(error);

            }

        }

        document.querySelectorAll(".acceptBtn").forEach(button => {

            button.addEventListener("click", () => {

                acceptRequest(

                    button.dataset.request,

                    button.dataset.user

                );

            });

        });

        document.querySelectorAll(".rejectBtn").forEach(button => {

            button.addEventListener("click", () => {

                rejectRequest(

                    button.dataset.request

                );

            });

        });

    });

}
/* ===========================
   ACCEPT CONNECTION REQUEST
=========================== */

async function acceptRequest(requestId, senderUid) {

    try {

        // Add sender to my connections
        await setDoc(

            doc(
                db,
                "users",
                currentUser.uid,
                "connections",
                senderUid
            ),

            {
                uid: senderUid,
                connectedAt: serverTimestamp()
            }

        );

        // Add me to sender's connections
        await setDoc(

            doc(
                db,
                "users",
                senderUid,
                "connections",
                currentUser.uid
            ),

            {
                uid: currentUser.uid,
                connectedAt: serverTimestamp()
            }

        );

        // Increase my connection count
        await updateDoc(

            doc(db, "users", currentUser.uid),

            {
                connectionCount: increment(1)
            }

        );

        // Increase sender's connection count
        await updateDoc(

            doc(db, "users", senderUid),

            {
                connectionCount: increment(1)
            }

        );

        // Delete the pending request
        await deleteDoc(

            doc(
                db,
                "connectionRequests",
                requestId
            )

        );

        alert("Connection accepted!");

    } catch (error) {

        console.error(error);

        alert("Unable to accept request.");

    }

}
/* ===========================
   REJECT CONNECTION REQUEST
=========================== */

async function rejectRequest(requestId) {

    try {

        // Delete the pending request
        await deleteDoc(

            doc(
                db,
                "connectionRequests",
                requestId
            )

        );

        // The onSnapshot listener will automatically
        // remove the request card and update the count.

    } catch (error) {

        console.error(error);

        alert("Unable to reject request.");

    }

}/* ===========================
   LOAD CONNECTED USERS
=========================== */

function loadConnectedUsers() {

    const connectionsRef = collection(
        db,
        "users",
        currentUser.uid,
        "connections"
    );

    onSnapshot(connectionsRef, async (snapshot) => {

        chatList.innerHTML = "";

        if (snapshot.empty) {

            chatList.innerHTML = `
                <div class="empty">
                    No connected users yet
                </div>
            `;
            return;

        }

        for (const connection of snapshot.docs) {

            const otherUid = connection.id;

            try {

                const userSnap = await getDoc(
                    doc(db, "users", otherUid)
                );

                if (!userSnap.exists()) continue;

                const user = userSnap.data();

                const onlineStatus = user.isOnline
                    ? '<span class="online"></span>'
                    : '';

                const card = document.createElement("div");

                card.className = "chatCard";

                card.innerHTML = `

                    <img
                        class="avatar"
                        src="${user.photoURL || 'https://via.placeholder.com/60'}"
                        alt="Profile">

                    <div class="userDetails">

                        <h4>
                            ${user.username}
                            ${onlineStatus}
                        </h4>

                        <p>
                            ${user.bio || "No bio available"}
                        </p>

                    </div>

                    <button
                        class="chatBtn"
                        data-uid="${otherUid}">
                        Chat
                    </button>

                `;

                card.querySelector(".avatar").onclick = () => {

                    window.location.href =
                        "view-profile.html?uid=" + otherUid;

                };

                card.querySelector(".userDetails").onclick = () => {

                    window.location.href =
                        "view-profile.html?uid=" + otherUid;

                };

                card.querySelector(".chatBtn").onclick = () => {

                    window.location.href =
                        "chat.html?uid=" + otherUid;

                };

                chatList.appendChild(card);

            } catch (error) {

                console.error(error);

            }

        }

    });

}
/* ===========================
   ONLINE STATUS
=========================== */

async function updateOnlineStatus(isOnline) {

    if (!currentUser) return;

    try {

        await updateDoc(

            doc(db, "users", currentUser.uid),

            {
                isOnline: isOnline,
                lastSeen: serverTimestamp()
            }

        );

    } catch (error) {

        console.error(error);

    }

}

/* User enters app */

window.addEventListener("load", () => {

    updateOnlineStatus(true);

});

/* User closes app */

window.addEventListener("beforeunload", () => {

    updateOnlineStatus(false);

});

/* App goes to background */

document.addEventListener("visibilitychange", () => {

    if (document.visibilityState === "hidden") {

        updateOnlineStatus(false);

    } else {

        updateOnlineStatus(true);

    }

});

/* ===========================
   REFRESH LAST SEEN
=========================== */

setInterval(() => {

    if (!currentUser) return;

    updateDoc(

        doc(db, "users", currentUser.uid),

        {
            lastSeen: serverTimestamp()
        }

    ).catch(console.error);

},60000);

/* ===========================
   SEARCH BUTTON
=========================== */

const searchBtn = document.getElementById("searchBtn");

if(searchBtn){

searchBtn.onclick=()=>{

searchInput.focus();

};

}

/* ===========================
   ERROR HANDLER
=========================== */

window.addEventListener("error",(e)=>{

console.error(e.error);

});

/* ===========================
   RHK HOME READY
=========================== */

console.log("RHK Home Loaded Successfully");
