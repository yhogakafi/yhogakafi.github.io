async function mergeFiles() {
    // Show the spinner
    document.getElementById('loadingSpinner').style.display = 'block';

    try {
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

        // Define the header columns in File1
        const headersFile1 = [
            'KODE PLU',
            'Jumlah',
            'UNIT',
            'Nomor Referensi SKU',
            'Harga Awal',
            'DISKON',
            'Username (Pembeli)',
            'Alamat Pengiriman',
            'No. Pesanan',
            'Countif dgn pdf mita',
            'Harga Setelah Diskon',
        ];

        // Get the header row from File2
        const headerRowFile2 = sheet2FromFile2.getRow(1);
        const headerValuesFile2 = headerRowFile2.values;

        // Create a map of File2 column headers to their indexes
        const columnMapFile2 = {};
        headerValuesFile2.forEach((header, index) => {
            if (header && headersFile1.includes(header)) {
                columnMapFile2[header] = index;
            }
        });

        // Clear existing content in the "daftar pesanan marketplace" sheet
        // Clear rows below the first row
        sheet1.eachRow({ includeEmpty: true }, (row, rowNumber) => {
            if (rowNumber > 1) { // Skip header row
                row.values = [];
            }
        });

        // Copy headers
        sheet1.getRow(1).values = headersFile1;

        // Copy rows and calculate DISKON
        sheet2FromFile2.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber > 1) { // Skip header row
                // Get values for the required columns
                const hargaAwalString = row.getCell(columnMapFile2['Harga Awal']).value;
                const hargaSetelahDiskonString = row.getCell(columnMapFile2['Harga Setelah Diskon']).value;

                // Clean and convert to integers
                const hargaAwal = cleanNumericString(hargaAwalString);
                const hargaSetelahDiskon = cleanNumericString(hargaSetelahDiskonString);

                // Calculate DISKON
                const diskon = hargaAwal - hargaSetelahDiskon;

                // Map row values
                const rowValues = headersFile1.map((header) => {
                    if (header === 'DISKON') {
                        return diskon;
                    } else if (header === 'Harga Awal') {
                        return hargaAwal;
                    } else if (header === 'Harga Setelah Diskon') {
                        return hargaSetelahDiskon;
                    } else if (header === 'Jumlah') {
                        return cleanNumericString(row.getCell(columnMapFile2['Jumlah']).value); // Ensure 'Jumlah' is integer
                    } else {
                        const columnIndex = columnMapFile2[header];
                        return columnIndex !== undefined ? row.getCell(columnIndex).value : null;
                    }
                });
                const newRow = sheet1.addRow(rowValues);

                // Set text wrap to false for all columns in the new row
                headersFile1.forEach((_, index) => {
                    const column = sheet1.getColumn(index + 1);
                    column.alignment = { wrapText: false };
                });
            }
        });

        // Copy the content of File3 to the 'no pesanan dari pdf mita' sheet
        const dataFromFile3 = sheet3FromFile3.getSheetValues().slice(1); // Skip header row
        sheet2.addRows(dataFromFile3);

        // Generate the output file name using file3's name
        const file3Name = file3Input.name;
        const outputFileName = file3Name.replace('_no_order', '');

        // Save the updated File1
        const updatedFile1 = new Blob([await workbook1.xlsx.writeBuffer()], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(updatedFile1);
        const a = document.createElement('a');
        a.href = url;
        a.download = outputFileName; // Use the modified file3 name
        a.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        // Hide the spinner
        document.getElementById('loadingSpinner').style.display = 'none';
    }
}

function fileToArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

// Helper function to clean numeric strings
function cleanNumericString(value) {
    return parseInt(value.replace(/\./g, ''), 10);
}
