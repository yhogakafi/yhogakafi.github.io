document.getElementById('dark-mode-toggle').addEventListener('change', (event) => {
    const linkElement = document.getElementById('theme-stylesheet');
    if (event.target.checked) {
        linkElement.setAttribute('href', 'dark-mode.css');
    } else {
        linkElement.setAttribute('href', 'light-mode.css');
    }
});

document.getElementById('file1').addEventListener('change', function(event) {
    const files = event.target.files;
    const validSubstring = 'template.xlsx'.toLowerCase(); // Convert to lowercase for case-insensitive comparison
    for (let i = 0; i < files.length; i++) {
        const fileName = files[i].name.toLowerCase(); // Convert to lowercase for case-insensitive comparison
        if (!fileName.includes(validSubstring)) {
            alert('Hanya bisa memilih file dengan nama template.xlsx');
            event.target.value = ''; // Clear the input
            break;
        }
    }
});

document.getElementById('file3').addEventListener('change', function(event) {
    const files = event.target.files;
    const validSubstring = '_no_order.xlsx'.toLowerCase(); // Convert to lowercase for case-insensitive comparison
    for (let i = 0; i < files.length; i++) {
        const fileName = files[i].name.toLowerCase(); // Convert to lowercase for case-insensitive comparison
        if (!fileName.includes(validSubstring)) {
            alert('Hanya bisa memilih file hasil ekspor PDF LABEL PENGIRIMAN dengan nama **_no_order.xlsx');
            event.target.value = ''; // Clear the input
            break;
        }
    }
});