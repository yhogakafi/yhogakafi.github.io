// Toggle dark and light modes
document.getElementById('dark-mode-toggle').addEventListener('change', (event) => {
    const linkElement = document.getElementById('theme-stylesheet');
    const theme = event.target.checked ? 'dark-mode.css' : 'light-mode.css';
    linkElement.setAttribute('href', theme);
});

// Validate file input for file1
document.getElementById('file1').addEventListener('change', function(event) {
    const files = event.target.files;
    const validSubstring = 'template.xlsx'.toLowerCase(); // Expected file name substring
    for (let i = 0; i < files.length; i++) {
        const fileName = files[i].name.toLowerCase();
        if (!fileName.includes(validSubstring)) {
            alert('Hanya bisa memilih file dengan nama template.xlsx');
            event.target.value = ''; // Clear the input
            break;
        }
    }
});

// Validate file input for file3
document.getElementById('file3').addEventListener('change', function(event) {
    const files = event.target.files;
    const validSubstring = '_no_order.xlsx'.toLowerCase(); // Expected file name substring
    for (let i = 0; i < files.length; i++) {
        const fileName = files[i].name.toLowerCase();
        if (!fileName.includes(validSubstring)) {
            alert('Hanya bisa memilih file hasil ekspor PDF LABEL PENGIRIMAN dengan nama _no_order.xlsx');
            event.target.value = ''; // Clear the input
            break;
        }
    }
});
