async function mergeWorkbooks() {
    const uploadWorkbook1 = document.getElementById('upload-workbook1').files[0];
    const uploadWorkbook2 = document.getElementById('upload-workbook2').files[0];
    const uploadWorkbook3 = document.getElementById('upload-workbook3').files[0];
    const sheetName = document.getElementById('sheet-name').value.trim();

    if (!uploadWorkbook1 || !uploadWorkbook2 || !uploadWorkbook3) {
        alert("Please upload all three workbooks.");
        return;
    }

    if (!sheetName) {
        alert("Please enter the sheet name from Workbook 3.");
        return;
    }

    const workbook1 = new ExcelJS.Workbook();
    const workbook2 = new ExcelJS.Workbook();
    const workbook3 = new ExcelJS.Workbook();

    await workbook1.xlsx.load(await uploadWorkbook1.arrayBuffer());
    await workbook2.xlsx.load(await uploadWorkbook2.arrayBuffer());
    await workbook3.xlsx.load(await uploadWorkbook3.arrayBuffer());

    // Copy sheet from workbook2 to workbook1
    const sheet2 = workbook2.getWorksheet('Sheet1');
    if (sheet2) {
        let newSheet2 = workbook1.addWorksheet('Daftar Barang');
        newSheet2.columns = sheet2.columns.map(col => ({ header: col.header, key: col.key, width: col.width }));
        sheet2.eachRow({ includeEmpty: true }, (row, rowNumber) => {
            newSheet2.addRow(row.values);
        });

        // Apply red fill to rows in column K if the value is "Retur Penjualan" or "Faktur Penjualan"
        const columnKIndex = 11; // ExcelJS uses 1-based index for columns
        newSheet2.eachRow({ includeEmpty: true }, (row, rowNumber) => {
            const cellValue = row.getCell(columnKIndex).value;
            if (cellValue === "Retur Penjualan" || cellValue === "Faktur Penjualan") {
                row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFFF0000' } // Red color
                    };
                });
            }
        });

        // Add new header column in column N
        newSheet2.getCell('N1').value = 'COUNTIF Formula';
        newSheet2.getCell('N1').alignment = { horizontal: 'center' };

        // Add formula to all rows in column N and apply yellow fill
        newSheet2.eachRow({ includeEmpty: true }, (row, rowNumber) => {
            if (rowNumber > 1) { // Skip header row
                const cell = row.getCell('N');
                cell.value = {
                    formula: `COUNTIF('No Pengiriman'!A:A, 'Daftar Barang'!I${rowNumber})`
                };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFFFF00' } // Yellow color
                };
            }
        });

        // Apply specific fill colors to header cells
        const headerCells = {
            A1: 'FFFF00', // Yellow
            B1: 'FFFF00', // Yellow
            C1: 'FFFF00', // Yellow
            G1: 'FFFF00', // Yellow
            D1: '4F81BD', // Blue
            E1: '4F81BD', // Blue
            F1: '4F81BD', // Blue
            H1: '4F81BD', // Blue
            I1: '4F81BD'  // Blue
        };

        for (const [cellAddress, color] of Object.entries(headerCells)) {
            const cell = newSheet2.getCell(cellAddress);
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: color }
            };
        }
    } else {
        alert("Sheet1 not found in Workbook 2.");
        return;
    }

    // Copy specified sheet from workbook3 to workbook1
    const sheet3 = workbook3.getWorksheet(sheetName);
    if (sheet3) {
        let newSheet3 = workbook1.addWorksheet('No Pengiriman');
        newSheet3.columns = sheet3.columns.map(col => ({ header: col.header, key: col.key, width: col.width }));
        sheet3.eachRow({ includeEmpty: true }, (row, rowNumber) => {
            newSheet3.addRow(row.values);
        });
    } else {
        alert(`Sheet '${sheetName}' not found in Workbook 3.`);
        return;
    }

    // Generate and download the merged workbook
    const mergedWorkbookBlob = await workbook1.xlsx.writeBuffer();
    const downloadUrl = URL.createObjectURL(new Blob([mergedWorkbookBlob], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
    
    // Create a link and trigger download
    const downloadLink = document.createElement('a');
    downloadLink.href = downloadUrl;
    downloadLink.download = `${sheetName}.xlsx`;
    downloadLink.click();

    // Clean up the URL object
    URL.revokeObjectURL(downloadUrl);
}
