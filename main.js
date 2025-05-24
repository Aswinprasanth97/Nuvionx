document.getElementById('scroll-to-top').addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // Optional: for smooth scrolling
    });
});
document.getElementById('nav-main').addEventListener('click', () => {
    console.log("clicked");

    let dropmenu = document.getElementById('nav-drop');
    if (dropmenu.classList.contains('hidden')) { dropmenu.classList.remove('hidden'); }
    else { dropmenu.classList.add('hidden'); }

})
if (!document.getElementById('nav-drop').classList.contains('hidden')) {
    document.documentElement.addEventListener('click', () => {
        console.log('clicked');

        let dropmenu = document.getElementById('nav-drop');
        if (!dropmenu.classList.contains('hidden')) {
            dropmenu.classList.add('hidden');
        }
    });
}
