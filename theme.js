document.getElementById('dark-mode-toggle').addEventListener('change', (event) => {
    const linkElement = document.getElementById('theme-stylesheet');
    if (event.target.checked) {
        linkElement.setAttribute('href', 'dark-mode.css');
    } else {
        linkElement.setAttribute('href', 'light-mode.css');
    }
});