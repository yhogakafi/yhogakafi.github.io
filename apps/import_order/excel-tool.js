function processFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) {
        alert('Please select a file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        const processedData = processExcelData(jsonData);

        // Create new file name
        const originalFileName = file.name;
        const newFileName = originalFileName.replace(/\.xlsx?$/, '') + '_new.xlsx';

        saveToExcel(processedData, newFileName);
    };
    reader.readAsArrayBuffer(file);
}

function processExcelData(data) {
    const columnsToKeep = [
        'No. Pesanan',
        'Nomor Referensi SKU',
        'Harga Awal',
        'Harga Setelah Diskon',
        'Jumlah',
        'Username (Pembeli)',
        'Alamat Pengiriman'
    ];
    
    const filteredData = data.map(row => {
        const newRow = {};

        columnsToKeep.forEach(col => {
            if (row[col] !== undefined) {
                newRow[col] = row[col];
            }
        });

        // Remove periods from values and convert to float
        const hargaAwal = parseFloat((row['Harga Awal'] || '').replace(/\./g, '')) || 0;
        const hargaSetelahDiskon = parseFloat((row['Harga Setelah Diskon'] || '').replace(/\./g, '')) || 0;

        // Add the new column with the calculated value
        newRow['Selisih Harga'] = hargaAwal - hargaSetelahDiskon;

        // Convert back to string for output, but ensure periods are removed
        newRow['Harga Awal'] = hargaAwal.toFixed(0);
        newRow['Harga Setelah Diskon'] = hargaSetelahDiskon.toFixed(0);

        return newRow;
    });

    const columnOrder = [
        'COUNTIF', // New column added here
        'KODE PLU', // New column added here
        'Jumlah',
        'UNIT', // New column added here
        'Nomor Referensi SKU',
        'Harga Awal',
        'Selisih Harga', // New column added here
        'Username (Pembeli)',
        'Alamat Pengiriman',
        '', // Placeholder columns
        '',
        '',
        'Harga Setelah Diskon' // Moved to the end
    ];
    
    return filteredData.map(row => {
        const newRow = {};
        columnOrder.forEach(col => {
            newRow[col] = row[col] !== undefined ? row[col] : '';
        });
        return newRow;
    });
}

function saveToExcel(data, filename) {
    const ws = XLSX.utils.json_to_sheet(data);

    // Explicitly format numeric columns
    const colKeys = ['Harga Awal', 'Harga Setelah Diskon', 'Selisih Harga'];
    colKeys.forEach(key => {
        if (ws[key]) {
            ws[key].z = XLSX.SSF.get_table()['0']; // Apply number format
        }
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    const blob = new Blob([s2ab(wbout)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link to trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Clean up URL object
    URL.revokeObjectURL(url);
}

function s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
        view[i] = s.charCodeAt(i) & 0xFF;
    }
    return buf;
}