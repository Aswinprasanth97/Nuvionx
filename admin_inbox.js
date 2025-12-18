import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs,
    getDoc,
    doc,
    query,
    orderBy,
    addDoc,
    deleteDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import {
    getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

/* Firebase config */
const firebaseConfig = {
    apiKey: "AIzaSyB4r7C2WPEWR0361_m55obk_GGxvfx6cys",
    authDomain: "nuvionx-product-list.firebaseapp.com",
    projectId: "nuvionx-product-list",
    storageBucket: "nuvionx-product-list.firebasestorage.app",
    messagingSenderId: "558926489948",
    appId: "1:558926489948:web:1f2a5c3af7ad0ee2887999",
    measurementId: "G-DM3MMR75FR"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/* DOM Elements */
const loginSection = document.getElementById("login-section");
const inboxContainer = document.getElementById("inbox-container");
const loginForm = document.getElementById("loginForm");
const logoutBtn = document.getElementById("logoutBtn");
const inbox = document.getElementById("inbox");

/* Auth check */
onAuthStateChanged(auth, async user => {
    if (user) {
        // User logged in (Rules will handle permission)
        loginSection.classList.add("hidden");
        inboxContainer.classList.remove("hidden");
        loadMessages();
    } else {
        // Not logged in
        loginSection.classList.remove("hidden");
        inboxContainer.classList.add("hidden");
        inbox.innerHTML = "";
    }
});

/* Login Handler */
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;
        const errorMsg = document.getElementById("login-error");

        try {
            await signInWithEmailAndPassword(auth, email, password);
            if (errorMsg) errorMsg.classList.add('hidden');
        } catch (error) {
            console.error("Login failed", error);
            if (errorMsg) {
                errorMsg.textContent = "Invalid email or password";
                errorMsg.classList.remove('hidden');
            }
        }
    });
}

/* Logout Handler */
if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout failed", error);
        }
    });
}

/* EmailJS Init */
emailjs.init("4R6iAwpwyUaGKdAkW");

/* Reply Logic */
const replyModal = document.getElementById("replyModal");
const replyForm = document.getElementById("replyForm");
const replyToInput = document.getElementById("reply-to");
const replySubjectInput = document.getElementById("reply-subject");
const replyMessageInput = document.getElementById("reply-message");
const closeReplyBtn = document.getElementById("closeReplyBtn");
let currentReplyId = null;

window.openReplyModal = (id, email, subject) => {
    currentReplyId = id;
    replyToInput.value = email;
    replySubjectInput.value = "Re: " + subject;
    replyMessageInput.value = "";
    replyModal.classList.remove("hidden");
    replyModal.classList.add("flex");
};

if (closeReplyBtn) {
    closeReplyBtn.addEventListener("click", () => {
        replyModal.classList.add("hidden");
        replyModal.classList.remove("flex");
    });
}

if (replyForm) {
    replyForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const sendBtn = document.getElementById("sendReplyBtn");
        const originalText = sendBtn.innerText;

        sendBtn.innerText = "Sending...";
        sendBtn.disabled = true;

        try {
            await emailjs.send("service_5mcsbng", "template_5g28u7k", {
                email: replyToInput.value,
                subject: replySubjectInput.value,
                message: replyMessageInput.value,
                reply_to: replyToInput.value
            });

            // Mark as replied in Firestore
            if (currentReplyId) {
                const ref = doc(db, "contact_messages", currentReplyId);
                await updateDoc(ref, {
                    repliedAt: new Date()
                });
            }

            alert("Reply sent successfully!");
            replyModal.classList.add("hidden");
            replyModal.classList.remove("flex");
            loadMessages();

        } catch (error) {
            console.error("Failed to send reply:", error);
            alert("Failed to send reply. Please try again.");
        } finally {
            sendBtn.innerText = originalText;
            sendBtn.disabled = false;
        }
    });
}

/* Load messages */
async function loadMessages() {
    inbox.innerHTML = "<p class='text-gray-500'>Loading...</p>";

    try {
        const q = query(
            collection(db, "contact_messages"),
            orderBy("createdAt", "desc")
        );

        const snap = await getDocs(q);
        inbox.innerHTML = "";

        if (snap.empty) {
            inbox.innerHTML = "<p class='text-gray-500'>No messages found</p>";
            return;
        }

        snap.forEach(docSnap => {
            const msg = docSnap.data();
            const id = docSnap.id;
            const repliedClass = msg.repliedAt ? "border-green-500" : "";

            inbox.innerHTML += `
      <div class="bg-white p-4 rounded-lg shadow border ${repliedClass}
        ${msg.isRead ? "opacity-75" : "border-blue-500"}">

        <div class="flex justify-between">
          <div>
            <p class="font-semibold">${msg.name} ${msg.repliedAt ? '<span class="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded ml-2">Replied</span>' : ''}</p>
            <p class="text-sm text-gray-500">${msg.email}</p>
          </div>
          <span class="text-xs text-gray-400">
            ${msg.createdAt?.toDate?.().toLocaleString() || ""}
          </span>
        </div>

        <p class="mt-2 font-medium">${msg.subject}</p>
        <p class="mt-1 text-sm text-gray-700 whitespace-pre-wrap">${msg.message}</p>

        <div class="mt-4 flex gap-3 flex-wrap">
          <button
            onclick="markRead('${id}')"
            class="text-sm px-3 py-1 rounded border hover:bg-gray-50">
            ${msg.isRead ? "Mark Unread" : "Mark Read"}
          </button>

          <button
            onclick="openReplyModal('${id}', '${msg.email}', '${msg.subject.replace(/'/g, "\\'")}')"
            class="text-sm px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700">
            Reply
          </button>

          <button
            onclick="deleteMessage('${id}')"
            class="text-sm px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700">
            Delete
          </button>
        </div>
      </div>
    `;
        });
    } catch (err) {
        console.error(err);
        inbox.innerHTML = "<p class='text-red-600'>Failed to load messages (Permission Denied or Network Error)</p>";
    }
}

/* Mark read/unread */
window.markRead = async (id) => {
    try {
        const docRef = doc(db, "contact_messages", id);
        // Toggle logic requires reading first, but for now we just mark read as per original code
        // Or strictly strictly follow standard
        const snap = await getDoc(docRef);
        if (snap.exists()) {
            await updateDoc(docRef, { isRead: !snap.data().isRead });
            loadMessages();
        }
    } catch (err) {
        console.error(err);
        alert("Error updating message");
    }
};

/* Delete */
window.deleteMessage = async (id) => {
    if (!confirm("Delete this message?")) return;
    try {
        await deleteDoc(doc(db, "contact_messages", id));
        loadMessages();
    } catch (err) {
        alert("Error deleting message");
    }
};
