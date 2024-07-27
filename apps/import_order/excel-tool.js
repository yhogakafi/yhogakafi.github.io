async function mergeFiles() {
    const file1Input = document.getElementById('file1').files[0];
    const file2Input = document.getElementById('file2').files[0];
    const file3Input = document.getElementById('file3').files[0];

    if (!file1Input || !file2Input || !file3Input) {
        alert('Please select all three files.');
        return;
    }

    const file1Data = await fileToArrayBuffer(file1Input);
    const file2Data = await fileToArrayBuffer(file2Input);
    const file3Data = await fileToArrayBuffer(file3Input);

    const workbook1 = new ExcelJS.Workbook();
    const workbook2 = new ExcelJS.Workbook();
    const workbook3 = new ExcelJS.Workbook();

    await workbook1.xlsx.load(file1Data);
    await workbook2.xlsx.load(file2Data);
    await workbook3.xlsx.load(file3Data);

    const sheet1 = workbook1.getWorksheet('daftar pesanan marketplace');
    const sheet2 = workbook1.getWorksheet('no pesanan dari pdf mita');

    const sheet2FromFile2 = workbook2.worksheets[0];
    const sheet3FromFile3 = workbook3.worksheets[0];

    // Define the new column order
    const newColumnOrder = [
        'Jumlah',
        'Nomor Referensi SKU',
        'Harga Awal',
        'Harga Setelah Diskon',
        'Username (Pembeli)',
        'Alamat Pengiriman',
        'No. Pesanan'
    ];

    // Get the header row from File2
    const headerRow = sheet2FromFile2.getRow(1);
    const headerValues = headerRow.values;

    // Determine the indexes of the columns to copy
    const columnIndexes = newColumnOrder.map(column => headerValues.indexOf(column)).filter(index => index > 0);

    // Clear existing content in the "daftar pesanan marketplace" sheet
    sheet1.eachRow({ includeEmpty: true }, (row) => {
        row.values = [];
    });

    // Copy headers
    sheet1.addRow(newColumnOrder);

    // Create a mapping from old index to new index
    const oldToNewIndex = newColumnOrder.reduce((map, column, index) => {
        map[headerValues.indexOf(column)] = index + 1; // ExcelJS columns are 1-based
        return map;
    }, {});

    // Copy rows
    sheet2FromFile2.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber > 1) { // Skip header row
            const rowValues = newColumnOrder.map((_, index) => {
                const oldIndex = columnIndexes[index] - 1; // Adjust for 0-based index
                return row.getCell(oldIndex + 1).value;
            });
            const newRow = sheet1.addRow(rowValues);

            // Set text wrap to false for all columns in the new row
            newColumnOrder.forEach((_, index) => {
                const column = sheet1.getColumn(index + 1);
                column.alignment = { wrapText: false };
            });
        }
    });

    // Copy the content of File3 to the 'no pesanan dari pdf mita' sheet
    const dataFromFile3 = sheet3FromFile3.getSheetValues().slice(1); // Skip header row
    sheet2.addRows(dataFromFile3);

    // Generate the output file name
    const file3Name = file3Input.name;
    const outputFileName = file3Name.replace('_no_order', '');

    // Save the updated File1
    const updatedFile1 = new Blob([await workbook1.xlsx.writeBuffer()], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(updatedFile1);
    const a = document.createElement('a');
    a.href = url;
    a.download = outputFileName;
    a.click();
    URL.revokeObjectURL(url);
}

function fileToArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}
