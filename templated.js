
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;
const modeIcon = document.getElementById('modeIcon');

darkModeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    
    // Icon එක මාරු කරන්න (හඳ සහ ඉර අතර)
    if (body.classList.contains('dark-mode')) {
        modeIcon.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('theme', 'dark'); // User පස්සේ වෙලාවක ආවත් dark mode එක තියාගන්න
    } else {
        modeIcon.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('theme', 'light');
    }
});

// Page එක load වෙද්දී කලින් තිබ්බ theme එක චෙක් කරන්න
if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    modeIcon.classList.replace('fa-moon', 'fa-sun');
}