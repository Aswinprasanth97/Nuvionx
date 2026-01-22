import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs,
    getDoc,
    doc,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-analytics.js";

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

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const analytics = getAnalytics(app);

/* =================================
   FETCH ALL PRODUCTS
================================= */
export async function getProducts() {
    const q = query(
        collection(db, "products"),
        orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    const products = [];

    snapshot.forEach(doc => {
        const data = doc.data();
        products.push({
            id: doc.id,
            name: data.name,
            categories: data.categories || (data.category ? [data.category] : []),
            category: data.category || "Uncategorized",
            description: data.description || "",
            ebayLink: data.ebayLink,
            images: Array.isArray(data.images) && data.images.length
                ? data.images
                : ["https://placehold.co/400x400?text=No+Image"]
        });
    });

    return products;
}

/* =================================
   FETCH SINGLE PRODUCT
================================= */
export async function getProductById(id) {
    if (!id) return null;

    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            name: data.name,
            categories: data.categories || (data.category ? [data.category] : []),
            category: data.category || "Uncategorized",
            description: data.description || "",
            ebayLink: data.ebayLink,
            images: Array.isArray(data.images) && data.images.length
                ? data.images
                : ["https://placehold.co/400x400?text=No+Image"],
            specs: data.specs || null
        };
    } else {
        return null;
    }
}

/* =================================
   LOAD & RENDER (For Listing Page)
================================= */
let allProductsData = [];

if (document.getElementById("product-grid")) {
    loadProductsFromFirebase();
}

async function loadProductsFromFirebase() {
    try {
        allProductsData = await getProducts();
        renderCategorizedSections(allProductsData);
    } catch (error) {
        console.error("Error loading products:", error);
    } finally {
        const loader = document.getElementById("page-loader");
        if (loader) {
            loader.style.opacity = "0";
            setTimeout(() => loader.remove(), 300);
        }
    }
}

function renderCategorizedSections(products) {
    const container = document.getElementById("product-grid");
    if (!container) return;

    if (!products.length) {
        container.innerHTML = `<p class="text-gray-500 text-center">No products available</p>`;
        return;
    }

    // Get unique categories sorted alphabetically
    const allCats = products.flatMap(p => p.categories);
    const uniqueCategories = [...new Set(allCats.filter(c => c))].sort();

    let contentHTML = "";

    uniqueCategories.forEach(category => {
        // Filter products for this category
        const categoryProducts = products.filter(p => p.categories.includes(category));

        if (categoryProducts.length > 0) {
            contentHTML += `
                    <div class="category-section">
                        <h2 class="text-4xl font-semibold text-gray-800 mb-6 font-kumbhSans uppercase kumbhfont  border-b pb-2 border-gray-200 text-center">${category}</h2>
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            ${categoryProducts.map(product => createProductCard(product)).join("")}
                        </div>
                    </div>
                `;
        }
    });

    // Handle "Uncategorized" if any product has NO categories 
    // (Though our logic defaults to "Uncategorized", strictly speaking checking explicit uncategorized might be needed if data is messy, 
    // but 'Uncategorized' should be in uniqueCategories if it exists)

    container.innerHTML = contentHTML;
}

function createProductCard(product) {
    return `
        <div class="bg-white rounded-xl shadow border border-gray-100 overflow-hidden flex flex-col h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
    
          <div class="relative overflow-hidden bg-white aspect-square group" id="carousel-${product.id}">
            <!-- Link Image to Single Product -->
            <a href="./single-product.html?id=${product.id}" class="block w-full h-full relative cursor-pointer">
                ${product.images.map((img, index) => `
                <img src="${img}"
                    class="carousel-slide w-full h-full object-contain  ${index === 0 ? 'block' : 'hidden'}"
                    data-index="${index}"
                    alt="${product.name}">
                `).join("")}
            </a>
    
            ${product.images.length > 1 ? `
              <button onclick="changeSlide('${product.id}', -1)"
                class="absolute top-1/2 -translate-y-1/2 left-2 bg-white/70 rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 z-10">
                <i class="fa-solid fa-chevron-left text-gray-700"></i>
              </button>
    
              <button onclick="changeSlide('${product.id}', 1)"
                class="absolute top-1/2 -translate-y-1/2 right-2 bg-white/70 rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 z-10">
                <i class="fa-solid fa-chevron-right text-gray-700"></i>
              </button>
    
              <div class="absolute bottom-2 w-full flex justify-center gap-1 z-10">
                ${product.images.map((_, i) => `
                  <div class="dot w-1.5 h-1.5 rounded-full cursor-pointer ${i === 0 ? 'bg-primary' : 'bg-gray-300'}"></div>
                `).join("")}
              </div>
            ` : ""}
          </div>
    
          <div class="p-6 flex flex-col flex-grow">
            <!-- Link Title -->
            <a href="./single-product.html?id=${product.id}" class="block">
                <h3 class="font-kumbhSans kumbhfont font-bold text-xl text-text-dark mb-2 text-primary hover:text-secondary-cyan transition-colors cursor-pointer">${product.name}</h3>
            </a>
    
    
            <div class="mt-auto space-y-3">
              ${product.ebayLink && product.ebayLink.trim() !== "" ? `
              <a href="${product.ebayLink}" target="_blank"
                 class="block w-full text-center bg-[#ffcc00] hover:bg-[#ffdb4d] text-black font-semibold py-3 rounded-lg transition shadow-sm hover:shadow-md">
                Buy Now
              </a>` : ''}
    
              <button onclick="openEnquiryModal('${product.name}', '${product.id}')"
                 class="block w-full text-center border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold py-3 rounded-lg transition">
                Enquiry
              </button>
            </div>
          </div>
        </div>
      `;
}

window.changeSlide = function (productId, direction) {
    const container = document.getElementById(`carousel-${productId}`);
    if (!container) return;

    const slides = container.querySelectorAll(".carousel-slide");
    const dots = container.querySelectorAll(".dot");

    let activeIndex = 0;

    slides.forEach((slide, i) => {
        if (!slide.classList.contains("hidden")) {
            activeIndex = i;
            slide.classList.add("hidden");
            slide.classList.remove("block");
        }
    });

    if (dots[activeIndex]) {
        dots[activeIndex].classList.remove("bg-primary");
        dots[activeIndex].classList.add("bg-gray-300");
    }

    let newIndex = activeIndex + direction;
    if (newIndex >= slides.length) newIndex = 0;
    if (newIndex < 0) newIndex = slides.length - 1;

    slides[newIndex].classList.remove("hidden");
    slides[newIndex].classList.add("block");

    if (dots[newIndex]) {
        dots[newIndex].classList.remove("bg-gray-300");
        dots[newIndex].classList.add("bg-primary");
    }
};

window.openEnquiryModal = function (productName, productId) {
    const subject = `Enquiry for ${productName} (ID: ${productId})`;
    if (window.openContactModal) {
        openContactModal(subject);
    }
};