document.addEventListener('DOMContentLoaded', () => {
    // Scroll to Top
    const scrollToTop = document.getElementById('scroll-to-top');
    scrollToTop?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Nav Scroll Behavior
    function handleNavScroll() {
        const nav = document.getElementById("main-nav");
        if (!nav) return;
        const isMobile = window.innerWidth <= 1024;

        if (isMobile && window.scrollY > 50) {
            nav.classList.add("!bg-primary", "shadow-lg");
            nav.classList.remove("bg-transparent");
        } else {
            nav.classList.remove("!bg-primary", "shadow-lg");
            nav.classList.add("bg-transparent");
        }
    }
    function throttle(fn, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                fn.apply(this, args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    }

    const throttledNavScroll = throttle(handleNavScroll, 100);
    window.addEventListener("scroll", throttledNavScroll);
    window.addEventListener("resize", throttledNavScroll);

    // Dropdown Utility
    function toggleDropdown(dropdownId, keepOpenIds = []) {
        document.querySelectorAll(".open").forEach(el => {
            if (!keepOpenIds.includes(el.id)) {
                el.classList.remove("open");
                el.style.maxHeight = null;
                el.classList.add("hidden");
            }
        });

        const dropdown = document.getElementById(dropdownId);
        if (!dropdown) return;

        const isOpen = dropdown.classList.contains("open");
        if (!isOpen) {
            dropdown.classList.remove("hidden");
            dropdown.classList.add("open");
            dropdown.style.maxHeight = dropdown.scrollHeight + "px";
        }
    }

    // Desktop Nav Dropdowns
    const navButton = document.getElementById('nav-main');
    const navDropdown = document.getElementById('nav-drop');
    const serviceButton = document.getElementById('service-main');
    const serviceDropdown = document.getElementById('service-drop');

    navButton?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!serviceDropdown?.classList.contains('hidden')) {
            serviceDropdown.classList.add('hidden');
        }
        navDropdown?.classList.toggle('hidden');
    });

    serviceButton?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!navDropdown?.classList.contains('hidden')) {
            navDropdown.classList.add('hidden');
        }
        serviceDropdown?.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
        navDropdown?.classList.add('hidden');
        serviceDropdown?.classList.add('hidden');
    });

    navDropdown?.addEventListener('click', (e) => e.stopPropagation());
    serviceDropdown?.addEventListener('click', (e) => e.stopPropagation());

    // Mobile Nav Dropdown
    const mobNavButton = document.getElementById('mob-nav');
    const mobNavDropdown = document.getElementById('mob-nav-drop');
    const mobNavDropdownClose = document.getElementById('mob-nav-close');

    mobNavButton?.addEventListener('click', (e) => {
        e.stopPropagation();
        mobNavDropdown?.classList.toggle('hidden');
    });

    mobNavDropdownClose?.addEventListener('click', () => {
        mobNavDropdown?.classList.add('hidden');
    });

    mobNavDropdown?.addEventListener('click', (e) => e.stopPropagation());

    // Additional Dropdowns
    const serviceToggle = document.getElementById("service-toggle");
    serviceToggle?.addEventListener("click", () => {
        toggleDropdown("service-dropdown", ["service-dropdown"]);
    });

    const moreToggle = document.getElementById("more-toggle");
    moreToggle?.addEventListener("click", () => {
        toggleDropdown("more-dropdown", ["more-dropdown"]);
    });

    document.addEventListener("click", (e) => {
        const isInsideDropdown = e.target.closest("#service-dropdown, #service-toggle, #more-dropdown, #more-toggle");
        if (!isInsideDropdown) {
            document.querySelectorAll(".open").forEach(el => {
                el.classList.remove("open");
                el.style.maxHeight = null;
                el.classList.add("hidden");
            });
        }
    });

    // Form Submission
    const form = document.getElementById("submit-form");
    form?.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        let hasData = false;

        for (const [key, value] of formData.entries()) {
            if (value.trim() !== "") {
                hasData = true;
                break;
            }
        }

        if (!hasData) {
            alert("Please fill out at least one field before submitting.");
            return;
        }

        fetch("https://script.google.com/macros/s/AKfycbwS1UoSmfoQ5J09B5-vwGUWMG97rWgnov0BXn95nGwOT3DtF6H7rRfo9xDJTsqHvKtC/exec", {
            method: "POST",
            body: formData
        })
            .then(() => {
                alert("Form submitted successfully");
                window.location.reload();
            })
            .catch(() => {
                alert("Something went wrong");
            });
    });

    // Modal Logic
    function openContactModal() {
        const modal = document.getElementById("contactModal");
        modal?.classList.remove("hidden");
        modal?.classList.add("flex");
    }

    function closeContactModal() {
        const modal = document.getElementById("contactModal");
        modal?.classList.remove("flex");
        modal?.classList.add("hidden");
    }

    document.getElementById("closeModalBtn")?.addEventListener("click", closeContactModal);
    document.getElementById("contactModal")?.addEventListener("click", function (e) {
        if (e.target === this) closeContactModal();
    });

    // Expose modal function globally if needed
    window.openContactModal = openContactModal;
});
