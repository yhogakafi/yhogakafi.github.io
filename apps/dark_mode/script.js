document.getElementById('dark-mode-toggle').addEventListener('click', () => {
    const linkElement = document.getElementById('theme-stylesheet');
    const currentTheme = linkElement.getAttribute('href');

    if (currentTheme === 'light-mode.css') {
        linkElement.setAttribute('href', 'dark-mode.css');
    } else {
        linkElement.setAttribute('href', 'light-mode.css');
    }
});