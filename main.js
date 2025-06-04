document.getElementById('scroll-to-top').addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // Optional: for smooth scrolling
    });
});
// dropdown.js
function handleNavScroll() {
    const nav = document.getElementById("main-nav");
    const isMobile = window.innerWidth <= 1024;

    if (isMobile && window.scrollY > 50) {
        nav.classList.add("bg-primary", "shadow-lg");
        nav.classList.remove("bg-transparent");
    } else {
        nav.classList.remove("bg-primary", "shadow-lg");
        nav.classList.add("bg-transparent");
    }
}

window.addEventListener("scroll", handleNavScroll);
window.addEventListener("resize", handleNavScroll); // In case screen resizes after load



document.addEventListener('DOMContentLoaded', () => {
    const navButton = document.getElementById('nav-main');
    const navDropdown = document.getElementById('nav-drop');
    const serviceButton = document.getElementById('service-main');
    const serviceDropdown = document.getElementById('service-drop');
    const mobNavButton = document.getElementById('mob-nav');
    const mobNavDropdown = document.getElementById('mob-nav-drop');
    const mobNavDropdownclose = document.getElementById('mob-nav-close');

    if (navButton && navDropdown) {
        navButton.addEventListener('click', (e) => {
            if (!serviceDropdown.classList.contains('hidden')) {
                serviceDropdown.classList.add('hidden');
            }
            e.stopPropagation();
            navDropdown.classList.toggle('hidden');
        });

        document.addEventListener('click', () => {
            if (!navDropdown.classList.contains('hidden')) {
                navDropdown.classList.add('hidden');
            }
        });

        navDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    if (serviceButton && serviceDropdown) {
        serviceButton.addEventListener('click', (e) => {
            if (!navDropdown.classList.contains('hidden')) {
                navDropdown.classList.add('hidden');
            }
            e.stopPropagation();
            serviceDropdown.classList.toggle('hidden');
        });

        document.addEventListener('click', () => {
            if (!serviceDropdown.classList.contains('hidden')) {
                serviceDropdown.classList.add('hidden');
            }
        });

        serviceDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    if (mobNavButton && mobNavDropdown && mobNavDropdownclose) {
        mobNavButton.addEventListener('click', (e) => {
            if (!mobNavDropdown.classList.contains('hidden')) {
                mobNavDropdown.classList.add('hidden');
            }
            e.stopPropagation();
            mobNavDropdown.classList.toggle('hidden');
        });

        mobNavDropdownclose.addEventListener('click', () => {
            if (!mobNavDropdown.classList.contains('hidden')) {
                mobNavDropdown.classList.add('hidden');
            }
        });

        mobNavDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    function toggleDropdown(btnId, dropdownId) {
        const dropdown = document.getElementById(dropdownId);
        const isOpen = dropdown.classList.contains("open");

        // Close all open dropdowns
        document.querySelectorAll(".open").forEach(el => {
            el.classList.remove("open");
            el.style.maxHeight = null;
            el.classList.add("hidden");
        });

        if (!isOpen) {
            dropdown.classList.remove("hidden");
            dropdown.classList.add("open");
            dropdown.style.maxHeight = dropdown.scrollHeight + "px";
        }
    }

    document.getElementById("service-toggle").addEventListener("click", () => {
        toggleDropdown("service-toggle", "service-dropdown");
    });

    document.getElementById("more-toggle").addEventListener("click", () => {
        toggleDropdown("more-toggle", "more-dropdown");
    });

    // Close when clicking outside
    document.addEventListener("click", function (e) {
        const isDropdown = e.target.closest("#service-dropdown, #service-toggle, #more-dropdown, #more-toggle");
        if (!isDropdown) {
            document.querySelectorAll(".open").forEach(el => {
                el.classList.remove("open");
                el.style.maxHeight = null;
                el.classList.add("hidden");
            });
        }
    });
});
