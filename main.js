document.getElementById('scroll-to-top').addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // Optional: for smooth scrolling
    });
});
// dropdown.js

document.addEventListener('DOMContentLoaded', () => {
    const navButton = document.getElementById('nav-main');
    const navDropdown = document.getElementById('nav-drop');
    const serviceButton = document.getElementById('service-main');
    const serviceDropdown = document.getElementById('service-drop');

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
});
