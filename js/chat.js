import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

/* ===========================
   DOM
=========================== */

const userPhoto = document.getElementById("userPhoto");
const userName = document.getElementById("userName");
const userStatus = document.getElementById("userStatus");

const messages = document.getElementById("messages");

const messageInput = document.getElementById("messageInput");

const sendBtn = document.getElementById("sendBtn");

/* ===========================
   URL
=========================== */

const params = new URLSearchParams(window.location.search);

const otherUid = params.get("uid");

/* ===========================
   VARIABLES
=========================== */

let currentUser = null;

let currentUserData = null;

let otherUserData = null;

let chatId = "";

/* ===========================
   AUTH
=========================== */

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.replace("login.html");

        return;

    }

    currentUser = user;

    if (!otherUid) {

        alert("User not found");

        window.location.href = "home.html";

        return;

    }

    createChatId();

    await loadCurrentUser();

    await loadOtherUser();

});

/* ===========================
   CHAT ID
=========================== */

function createChatId() {

    chatId =

        [currentUser.uid, otherUid]

        .sort()

        .join("_");

}

/* ===========================
   CURRENT USER
=========================== */

async function loadCurrentUser() {

    const snap = await getDoc(

        doc(db, "users", currentUser.uid)

    );

    if (snap.exists()) {

        currentUserData = snap.data();

    }

}

/* ===========================
   OTHER USER
=========================== */

async function loadOtherUser() {

    const snap = await getDoc(

        doc(db, "users", otherUid)

    );

    if (!snap.exists()) {

        alert("User does not exist.");

        window.location.href = "home.html";

        return;

    }

    otherUserData = snap.data();

    userPhoto.src = otherUserData.photoURL;

    userName.textContent = otherUserData.username;

    userStatus.textContent =

        otherUserData.isOnline

        ? "Online"

        : "Offline";

    userStatus.className =

        otherUserData.isOnline

        ? "online"

        : "offline";

    initializeChat();

}

/* ===========================
   INITIALIZE
=========================== */

function initializeChat() {

    messages.innerHTML = `

    <div class="emptyChat">

    Loading messages...

    </div>

    `;

}
collection,
query,
orderBy,
onSnapshot
/* ===========================
   RENDER MESSAGE
=========================== */

function renderMessage(message) {

    const bubble = document.createElement("div");

    const mine = message.senderId === currentUser.uid;

    bubble.className = mine
        ? "myMessage"
        : "otherMessage";

    const time = formatTime(message.createdAt);

    bubble.innerHTML = `

        <div class="messageText">

            ${escapeHtml(message.text)}

        </div>

        <span class="messageTime">

            ${time}

        </span>

    `;

    messages.appendChild(bubble);

}

/* ===========================
   FORMAT TIME
=========================== */

function formatTime(timestamp) {

    if (!timestamp) return "";

    let date;

    if (timestamp.toDate) {

        date = timestamp.toDate();

    } else {

        date = new Date(timestamp);

    }

    return date.toLocaleTimeString([], {

        hour: "2-digit",

        minute: "2-digit"

    });

}

/* ===========================
   AUTO SCROLL
=========================== */

function scrollToBottom() {

    requestAnimationFrame(() => {

        messages.scrollTop = messages.scrollHeight;

    });

}

/* ===========================
   ESCAPE HTML
=========================== */

function escapeHtml(text) {

    if (!text) return "";

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}
/* ===========================
   SEND MESSAGE
=========================== */

sendBtn.addEventListener("click", sendMessage);

messageInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {

        event.preventDefault();

        sendMessage();

    }

});

async function sendMessage() {

    const text = messageInput.value.trim();

    if (!text) return;

    sendBtn.disabled = true;

    try {

        // Save message
        await addDoc(

            collection(
                db,
                "chats",
                chatId,
                "messages"
            ),

            {

                senderId: currentUser.uid,

                receiverId: otherUid,

                text: text,

                createdAt: serverTimestamp()

            }

        );

        // Update chat information
        await setDoc(

            doc(
                db,
                "chats",
                chatId
            ),

            {

                users: [

                    currentUser.uid,

                    otherUid

                ],

                lastMessage: text,

                lastMessageTime: serverTimestamp()

            },

            {

                merge: true

            }

        );

        messageInput.value = "";

        messageInput.focus();

    }

    catch (error) {

        console.error(error);

        alert("Unable to send message.");

    }

    sendBtn.disabled = false;

}

/* ===========================
   CLEANUP
=========================== */

window.addEventListener("beforeunload", () => {

    if (unsubscribeMessages) {

        unsubscribeMessages();

    }

});

/* ===========================
   CHAT READY
=========================== */

console.log("RHK Chat Ready");
