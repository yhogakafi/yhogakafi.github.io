document.getElementById('process').addEventListener('click', async () => {
    const fileInput = document.getElementById('upload');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please upload an Excel file.');
        return;
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file);

    const incomeSheet = workbook.getWorksheet('Income');
    const processedSheet = workbook.addWorksheet('Processed Income');

    // Copy headers with the new column
    const columns = ['No Pesanan Penjualan Accurate', 'No Pengiriman pesanan Accurate', 'No Pesanan = No Pengiriman Accurate', 'Total Sub Pesanan Penjualan Accurate', 'Accurate = Income', 'Harga asli produk - diskon - pengembalian + kompensasi'].concat(incomeSheet.getRow(6).values.slice(1));
    processedSheet.addRow(columns);

    // Copy data and formatting from row 6
    incomeSheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        if (rowNumber >= 7) {
            // Calculate the new column value
            const colH = row.getCell('H').value || 0;
            const colI = row.getCell('I').value || 0;
            const colJ = row.getCell('J').value || 0;
            const colAC = row.getCell('AC').value || 0;
            const newColumnValue = (colH + colI + colJ + colAC);

            // Add row values including the new column value
            const rowValues = ['','','','','', newColumnValue].concat(row.values.slice(1));
            const newRow = processedSheet.addRow(rowValues);
            for (let i = 0; i < row.cellCount; i++) {
                newRow.getCell(i + 1).style = row.getCell(i + 1).style; // Copy formatting
            }
        }
    });

    // Adjust column widths for new columns
    processedSheet.columns = [
        { key: 'A', width: 10 },
        { key: 'B', width: 10 },
        { key: 'C', width: 10 },
        { key: 'D', width: 10 },
        { key: 'E', width: 10 },
        { key: 'F', width: 20 }, // Adjust width for the new column if needed
        ...processedSheet.columns.slice(6)
    ];

    // Save the new workbook
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/octet-stream' });

    // Construct new file name
    const originalFileName = file.name.replace(/\.[^/.]+$/, ""); // Remove file extension
    const newFileName = `${originalFileName}_processed.xlsx`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = newFileName; // Use the new file name
    a.click();
});
