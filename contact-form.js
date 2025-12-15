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

        const submitBtn = submittedForm.querySelector('input[type="submit"], button[type="submit"]');
        let isInput = false;
        let originalBtnText = "SUBMIT";

        if (submitBtn) {
            isInput = submitBtn.tagName === "INPUT";
            // Capture original text
            originalBtnText = isInput ? submitBtn.value : submitBtn.innerText;
            if (!originalBtnText || !originalBtnText.trim()) originalBtnText = "SUBMIT";

            // Set loading state
            if (isInput) {
                submitBtn.value = "Sending...";
            } else {
                submitBtn.innerText = "Sending...";
            }
            submitBtn.disabled = true;
            submitBtn.style.cursor = "not-allowed";
        }

        try {
            await addDoc(collection(db, "contact_messages"), data);
            await sendAdminEmail(data);

            alert("Form submitted successfully");
            submittedForm.reset();

            // Close modal if it's the modal form
            if (submittedForm.id === "contact-modal-form") {
                const modal = document.getElementById("contactModal");
                if (modal) {
                    modal.classList.remove("flex");
                    modal.classList.add("hidden");
                }
            }

        } catch (error) {
            console.error("Error adding document: ", error);
            alert("Something went wrong. Please try again.");
        } finally {
            if (submitBtn) {
                // Restore original text
                if (isInput) {
                    submitBtn.value = originalBtnText;
                } else {
                    submitBtn.innerText = originalBtnText;
                }
                submitBtn.disabled = false;
                submitBtn.style.cursor = "pointer";
            }
        }
    });
});
function sendAdminEmail(data) {
    return emailjs.send(
        "service_5mcsbng",        // SMTP service ID
        "template_5g28u7k",  // EmailJS template ID
        {
            name: data.name,
            email: data.email,
            phone: data.phone,
            subject: data.subject,
            message: data.message
        }
    );
}

