import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    query,
    orderBy,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);

const otherUid = params.get("uid");

const chatProfile = document.getElementById("chatProfile");
const chatUsername = document.getElementById("chatUsername");
const chatStatus = document.getElementById("chatStatus");

const messages = document.getElementById("messages");

const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

let currentUser = null;

let chatId = "";

onAuthStateChanged(auth, async (user)=>{

    if(!user){

        window.location.href="index.html";
        return;

    }

    currentUser=user;

    if(user.uid < otherUid){

        chatId=user.uid+"_"+otherUid;

    }else{

        chatId=otherUid+"_"+user.uid;

    }

    const otherUserRef=doc(db,"users",otherUid);

    const otherSnap=await getDoc(otherUserRef);

    if(otherSnap.exists()){

        const data=otherSnap.data();

        chatProfile.src=data.photoURL;
        chatUsername.textContent=data.username;

        chatStatus.textContent="Online";

    }

    loadMessages();

});

function loadMessages(){

    const messagesRef=collection(
        db,
        "chats",
        chatId,
        "messages"
    );

    const q=query(
        messagesRef,
        orderBy("timestamp","asc")
    );

    onSnapshot(q,(snapshot)=>{

        messages.innerHTML="";

        snapshot.forEach((doc)=>{

            const msg=doc.data();

            const bubble=document.createElement("div");

            bubble.className=
            msg.sender===currentUser.uid
            ?"message sent"
            :"message received";

            bubble.innerHTML=`
                ${msg.text}
                <div class="time">
                    ${formatTime(msg.timestamp)}
                </div>
            `;

            messages.appendChild(bubble);

        });

        messages.scrollTop=messages.scrollHeight;

    });

}

function formatTime(timestamp){

    if(!timestamp) return "";

    const date=timestamp.toDate();

    return date.toLocaleTimeString([],{
        hour:"2-digit",
        minute:"2-digit"
    });

}
import {
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

async function sendMessage() {

    const text = messageInput.value.trim();

    if (!text || !currentUser) return;

    try {

        await addDoc(

            collection(
                db,
                "chats",
                chatId,
                "messages"
            ),

            {
                text: text,
                sender: currentUser.uid,
                receiver: otherUid,
                timestamp: serverTimestamp()
            }

        );

        messageInput.value = "";
        messageInput.focus();

    } catch (error) {

        console.error(error);
        alert("Unable to send message.");

    }

}

sendBtn.addEventListener("click", sendMessage);

messageInput.addEventListener("keypress", (e) => {

    if (e.key === "Enter") {

        e.preventDefault();
        sendMessage();

    }

});
