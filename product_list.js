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

/* Cloudinary config */
const CLOUD_NAME = "dtmsihmxc";
const UPLOAD_PRESET = "product_upload";

// --- AUTH STATE MANAGEMENT ---
const loginSection = document.getElementById('login-section');
const adminContent = document.getElementById('admin-content');
const logoutContainer = document.getElementById('logout-container');

onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        console.log("User logged in:", user.email);
        if (loginSection) loginSection.classList.add('hidden');
        if (adminContent) adminContent.classList.remove('hidden');
        if (logoutContainer) logoutContainer.classList.remove('hidden');

        // Load products ONLY if logged in
        loadProductsFromFirebase();
    } else {
        // User is signed out
        console.log("User logged out");
        if (loginSection) loginSection.classList.remove('hidden');
        if (adminContent) adminContent.classList.add('hidden');
        if (logoutContainer) logoutContainer.classList.add('hidden');
    }
});

// --- LOGIN HANDLER ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorMsg = document.getElementById('login-error');

        try {
            await signInWithEmailAndPassword(auth, email, password);
            if (errorMsg) errorMsg.classList.add('hidden');
        } catch (error) {
            console.error("Login Error:", error);
            if (errorMsg) {
                errorMsg.textContent = "Invalid email or password.";
                errorMsg.classList.remove('hidden');
            }
        }
    });
}

// --- LOGOUT HANDLER ---
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth).then(() => {
            console.log("Signed out successfully");
        }).catch((error) => {
            console.error("Sign out error", error);
        });
    });
}

// Global state for products and editing
let allProducts = [];
let allCategories = [];
let editingProductId = null;
let currentProductImageUrls = [];

/* =================================
   UPLOAD IMAGES (Cloudinary)
================================= */
async function uploadImagesToCloudinary(fileList) {
    // Convert to array and sort by name (Natural Sort) to ensure deterministic order
    // This fixes issues where '1.jpg', '10.jpg', '2.jpg' sort incorrectly
    const files = Array.from(fileList).sort((a, b) => {
        return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
    });

    const uploads = [];

    for (const file of files) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit example
            alert(`File ${file.name} is too large. Max 5MB.`);
            continue;
        }

        const data = new FormData()
        data.append("file", file)
        data.append("upload_preset", UPLOAD_PRESET)

        uploads.push(
            fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                method: "POST",
                body: data
            }).then(r => r.json())
        )
    }

    const results = await Promise.all(uploads)
    // Filter out any failed uploads if necessary, or just map
    return results.map(r => r.secure_url).filter(url => url);
}


/* =================================
   FETCH ALL PRODUCTS
================================= */
async function getProducts() {
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
            category: data.category || "",
            description: data.description || "",
            specs: data.specs || "",
            ebayLink: data.ebayLink,
            images: Array.isArray(data.images) && data.images.length
                ? data.images
                : ["https://placehold.co/400x400?text=No+Image"]
        });
    });

    return products;
}

/* =================================
   FETCH CATEGORIES
================================= */
async function getCategories() {
    const q = query(
        collection(db, "categories"),
        orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    const categories = [];

    snapshot.forEach(doc => {
        categories.push({ id: doc.id, ...doc.data() });
    });

    return categories;
}

async function loadCategories() {
    try {
        allCategories = await getCategories();
        renderCategoryList();
        populateCategoryDropdown();
    } catch (error) {
        console.error("Error loading categories:", error);
    }
}

function renderCategoryList() {
    const list = document.getElementById("category-list");
    if (!list) return;

    list.innerHTML = allCategories.map(cat => `
        <div class="bg-gray-100 rounded-full px-4 py-2 flex items-center gap-3">
            <span class="font-medium text-gray-700">${cat.name}</span>
            <button onclick="deleteCategory('${cat.id}')" class="text-red-500 hover:text-red-700">
                <i class="fa-solid fa-times"></i>
            </button>
        </div>
    `).join("");
}

function populateCategoryDropdown() {
    const dropdown = document.getElementById("category");
    if (!dropdown) return;

    // Preserve selected value if any
    const currentValue = dropdown.value;

    dropdown.innerHTML = `
        <option value="" disabled selected>Select Category</option>
        ${allCategories.map(cat => `<option value="${cat.name}">${cat.name}</option>`).join("")}
    `;

    if (currentValue) {
        dropdown.value = currentValue;
    }

    // Populate Secondary Dropdown
    const dropdown2 = document.getElementById("category2");
    if (dropdown2) {
        const currentVal2 = dropdown2.value;
        dropdown2.innerHTML = `
            <option value="" selected>Secondary Category (Optional)</option>
            ${allCategories.map(cat => `<option value="${cat.name}">${cat.name}</option>`).join("")}
        `;
        if (currentVal2) dropdown2.value = currentVal2;
    }
}

/* =================================
   ADD / DELETE CATEGORY
================================= */
const addCategoryBtn = document.getElementById("addCategoryBtn");
if (addCategoryBtn) {
    addCategoryBtn.addEventListener("click", async () => {
        const input = document.getElementById("new-category-name");
        const name = input.value.trim();
        if (!name) return;

        try {
            await addDoc(collection(db, "categories"), {
                name: name,
                createdAt: serverTimestamp()
            });
            input.value = "";
            loadCategories(); // Refresh
        } catch (error) {
            console.error("Error adding category:", error);
            alert("Error adding category: " + error.message);
        }
    });
}

window.deleteCategory = async function (id) {
    if (confirm("Delete this category?")) {
        try {
            await deleteDoc(doc(db, "categories", id));
            loadCategories();
        } catch (error) {
            console.error("Error deleting category:", error);
        }
    }
}

/* =================================
   LOAD & RENDER (For Listing Page)
================================= */
async function loadProductsFromFirebase() {
    try {
        // Load both products and categories
        await loadCategories();
        allProducts = await getProducts();
        renderProducts(allProducts);
    } catch (error) {
        console.error("Error loading products:", error);
    }
}

function renderProducts(products) {
    const grid = document.getElementById("product-grid");
    if (!grid) return;

    if (!products.length) {
        grid.innerHTML = `<p class="text-gray-500">No products available</p>`;
        return;
    }

    grid.innerHTML = products.map(product => `
    <div class="bg-white rounded-xl shadow border border-gray-100 overflow-hidden flex flex-col h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">

      <div class="relative overflow-hidden bg-white aspect-square group" id="carousel-${product.id}">
        <!-- Link Image to Single Product -->
        <a href="./single-product.html?id=${product.id}" class="block w-full h-full relative cursor-pointer">
            ${product.images.map((img, index) => `
            <img src="${img}"
                class="carousel-slide w-full h-full object-contain p-4 ${index === 0 ? 'block' : 'hidden'}"
                data-index="${index}"
                alt="${product.name}">
            `).join("")}
        </a>

        ${product.images.length > 1 ? `
          <button onclick="changeSlide('${product.id}', -1)"
            class="absolute top-1/2 -translate-y-1/2 left-2 bg-white/70 border border-gray-200 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 z-10 transition-opacity">
            <i class="fa-solid fa-chevron-left text-gray-700"></i>
          </button>

          <button onclick="changeSlide('${product.id}', 1)"
            class="absolute top-1/2 -translate-y-1/2 right-2 bg-white/70 border border-gray-200 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 z-10 transition-opacity">
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
        <a href="./single-product.html?id=${product.id}" class="block group-hover:text-secondary-cyan">
            <h3 class="font-kumbhSans font-bold text-xl text-text-dark mb-2 text-primary hover:text-secondary-cyan transition-colors cursor-pointer">${product.name}</h3>
        </a>
        <div class="flex flex-wrap gap-2 mb-2">
            ${(product.categories || [product.category]).filter(c => c).map(cat =>
        `<span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">${cat}</span>`
    ).join("")}
        </div>
        <p class="font-HindMadurai text-textpara-dark text-sm mb-4 line-clamp-3 flex-grow">${product.description}</p>

        <div class="mt-auto space-y-3">
          ${product.ebayLink && product.ebayLink.trim() !== "" ? `
          <a href="${product.ebayLink}" target="_blank"
             class="block w-full text-center bg-[#ffcc00] hover:bg-[#ffdb4d] text-black font-semibold py-3 rounded-lg transition shadow-sm hover:shadow-md">
            Buy Now
          </a>
          ` : ''}

          <div class="grid grid-cols-2 gap-3">
            <button onclick="startEditing('${product.id}')"
                class="w-full text-center border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold py-3 rounded-lg transition">
                Edit
            </button>
            <button onclick="deleteProduct('${product.id}')"
                class="w-full text-center border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-semibold py-3 rounded-lg transition">
                Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join("");
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

/* =================================
   DELETE PRODUCT
================================= */
window.deleteProduct = async function (id) {
    if (confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
        try {
            await deleteDoc(doc(db, "products", id));
            alert("Product deleted successfully");
            loadProductsFromFirebase();
        } catch (error) {
            console.error("Error deleting product:", error);
            alert("Error deleting product: " + error.message);
        }
    }
}

/* =================================
   EDIT PRODUCT
================================= */
window.startEditing = function (id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return;

    editingProductId = id;
    currentProductImageUrls = product.images;

    // Populate form
    document.getElementById('name').value = product.name;

    // Handle Categories (Array or Legacy String)
    const categories = Array.isArray(product.categories) ? product.categories : (product.category ? [product.category] : []);

    document.getElementById('category').value = categories[0] || "";
    document.getElementById('category2').value = categories[1] || "";

    document.getElementById('link').value = product.ebayLink || "";
    document.getElementById('description').value = product.description;
    document.getElementById('specs').value = product.specs || "";

    // Images are not required when editing
    document.getElementById('images').required = false;

    // Update button text
    const submitBtn = document.querySelector('#productForm button[type="submit"]');
    if (submitBtn) {
        submitBtn.innerText = "Update Product";
    }

    // Scroll to form
    const form = document.getElementById('productForm');
    if (form) {
        form.scrollIntoView({ behavior: 'smooth' });
    }
}


/* =================================
   ADD / UPDATE PRODUCT HANDLER
================================= */
const productForm = document.getElementById('productForm');

if (productForm) {
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = productForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;
        submitBtn.disabled = true;

        if (editingProductId) {
            submitBtn.innerText = "Updating...";
        } else {
            submitBtn.innerText = "Adding...";
        }

        const name = document.getElementById('name').value;
        const category1 = document.getElementById('category').value;
        const category2 = document.getElementById('category2').value;
        const link = document.getElementById('link').value;
        const description = document.getElementById('description').value;
        const specs = document.getElementById('specs').value;
        const imageFiles = document.getElementById('images').files;

        // Combine categories
        const categoriesToSave = [category1];
        if (category2 && category2 !== category1) {
            categoriesToSave.push(category2);
        }

        // Validation for Add Mode
        if (!editingProductId && imageFiles.length === 0) {
            alert("Please select at least one image.");
            submitBtn.disabled = false;
            submitBtn.innerText = originalText;
            return;
        }

        try {
            let imageUrls = [];

            if (imageFiles.length > 0) {
                // Upload new images to Cloudinary
                // NOTE: User requested to use Cloudinary, NOT Firebase Storage
                imageUrls = await uploadImagesToCloudinary(imageFiles);
            } else if (editingProductId) {
                // Keep existing images
                imageUrls = currentProductImageUrls;
            }

            const productData = {
                name: name,
                categories: categoriesToSave,
                category: categoriesToSave[0], // Keep for backward compatibility
                ebayLink: link,
                description: description,
                specs: specs,
                images: imageUrls,
            };

            if (!editingProductId) {
                productData.createdAt = serverTimestamp();
            }

            if (editingProductId) {
                // UPDATE
                await updateDoc(doc(db, "products", editingProductId), productData);
                alert("Product updated successfully!");

                // Reset edit state
                editingProductId = null;
                currentProductImageUrls = [];
                submitBtn.innerText = "Add Product";
                document.getElementById('images').required = true;
            } else {
                // ADD
                await addDoc(collection(db, "products"), productData);
                alert("Product added successfully!");
            }

            productForm.reset();
            loadProductsFromFirebase(); // Refresh list

        } catch (error) {
            console.error("Error saving product:", error);
            alert("Error saving product: " + error.message);
        } finally {
            submitBtn.disabled = false;
            if (!editingProductId) {
                submitBtn.innerText = "Add Product";
            }
        }
    });
}

// Initial load
loadProductsFromFirebase();
