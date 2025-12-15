import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import {
    getAuth
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

/* Form logic */
const forms = document.querySelectorAll("#contact-main-form, #contact-modal-form");
console.log("Contact form script loaded. Forms found:", forms.length);

forms.forEach(form => {
    form?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const submittedForm = e.target;
        const formData = new FormData(submittedForm);
        let hasData = false;

        for (const [, value] of formData.entries()) {
            if (value.toString().trim() !== "") {
                hasData = true;
                break;
            }
        }

        if (!hasData) {
            alert("Please fill out at least one field before submitting.");
            return;
        }

        const data = {
            name: formData.get("name")?.trim() || "",
            email: formData.get("email")?.trim() || "",
            phone: formData.get("phone")?.trim() || "",
            subject: formData.get("subject")?.trim() || "",
            message: formData.get("message")?.trim() || "",
            createdAt: serverTimestamp()
        };

        try {
            await addDoc(collection(db, "contact_messages"), data);

            alert("Form submitted successfully");
            submittedForm.reset();

        } catch (error) {
            console.error("Error adding document: ", error);
            alert("Something went wrong. Please try again.");
        }
    });
});
