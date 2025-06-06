document.addEventListener('DOMContentLoaded', () => {
    const scrollToTop = document.getElementById('scroll-to-top');
    if (scrollToTop) {
        scrollToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    function handleNavScroll() {
        const nav = document.getElementById("main-nav");
        if (!nav) return;
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
    window.addEventListener("resize", handleNavScroll);

    const navButton = document.getElementById('nav-main');
    const navDropdown = document.getElementById('nav-drop');
    const serviceButton = document.getElementById('service-main');
    const serviceDropdown = document.getElementById('service-drop');
    const mobNavButton = document.getElementById('mob-nav');
    const mobNavDropdown = document.getElementById('mob-nav-drop');
    const mobNavDropdownClose = document.getElementById('mob-nav-close');

    if (navButton && navDropdown) {
        navButton.addEventListener('click', (e) => {
            if (serviceDropdown && !serviceDropdown.classList.contains('hidden')) {
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

        navDropdown.addEventListener('click', (e) => e.stopPropagation());
    }

    if (serviceButton && serviceDropdown) {
        serviceButton.addEventListener('click', (e) => {
            if (navDropdown && !navDropdown.classList.contains('hidden')) {
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

        serviceDropdown.addEventListener('click', (e) => e.stopPropagation());
    }

    if (mobNavButton && mobNavDropdown && mobNavDropdownClose) {
        mobNavButton.addEventListener('click', (e) => {
            if (!mobNavDropdown.classList.contains('hidden')) {
                mobNavDropdown.classList.add('hidden');
            }
            e.stopPropagation();
            mobNavDropdown.classList.toggle('hidden');
        });

        mobNavDropdownClose.addEventListener('click', () => {
            if (!mobNavDropdown.classList.contains('hidden')) {
                mobNavDropdown.classList.add('hidden');
            }
        });

        mobNavDropdown.addEventListener('click', (e) => e.stopPropagation());
    }

    function toggleDropdown(btnId, dropdownId) {
        const dropdown = document.getElementById(dropdownId);
        if (!dropdown) return;

        const isOpen = dropdown.classList.contains("open");

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

    const serviceToggle = document.getElementById("service-toggle");
    if (serviceToggle) {
        serviceToggle.addEventListener("click", () => {
            toggleDropdown("service-toggle", "service-dropdown");
        });
    }

    const moreToggle = document.getElementById("more-toggle");
    if (moreToggle) {
        moreToggle.addEventListener("click", () => {
            toggleDropdown("more-toggle", "more-dropdown");
        });
    }

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

    const form = document.getElementById("submit-form");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            fetch("https://script.google.com/macros/s/AKfycbwF7c28J7q8qYrUJDf3y-VqqCqKN1dZ5nNQIU2GwybdMrYA4dDBD9glz9xa-vwAhzpC/exec", {
                method: "POST",
                body: formData
            })
                .then(res => {
                    alert("Form submitted successfully");
                    window.location.reload();
                })
                .catch(err => {
                    alert("Something went wrong");
                });
        });
    }
});