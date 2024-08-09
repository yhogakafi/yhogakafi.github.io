// Function to parse XML and extract required data
function extractDataFromXML(xmlData) {
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(xmlData, "text/xml");

    let salesOrders = xmlDoc.getElementsByTagName('SALESORDER');
    let extractedData = [];

    for (let i = 0; i < salesOrders.length; i++) {
        let salesOrder = salesOrders[i];
        let PONO = salesOrder.getElementsByTagName('PONO')[0].textContent;
        let SHIPTO1 = salesOrder.getElementsByTagName('SHIPTO1')[0].textContent;
        let SONO = salesOrder.getElementsByTagName('SONO')[0].textContent;
        let SODATE = salesOrder.getElementsByTagName('SODATE')[0].textContent;

        extractedData.push({
            PONO: PONO,
            SHIPTO1: SHIPTO1,
            SONO: SONO,
            SODATE: SODATE
        });
    }

    return extractedData;
}

// Function to convert JSON data to XLSX with custom headers
async function generateXLSXFromData(data, fileName) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // Define custom headers
    const headers = ['No.', 'No.PO', 'Username', 'No.Pesanan', 'Tgl.Pesanan'];

    // Add the file name as the first row and merge it across the five columns
    worksheet.addRow([fileName]);
    worksheet.mergeCells('A1:E1');

    // Apply styles to the header cell
    worksheet.getCell('A1').font = { size: 14, bold: true };
    worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'center' };

    // Add the headers as the second row
    worksheet.addRow(headers);

    // Add the data starting from the third row
    data.forEach((item, index) => {
        worksheet.addRow([index + 1, item.PONO, item.SHIPTO1, item.SONO, item.SODATE]);
    });

    // Apply borders to non-empty cells
    worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell, colNumber) => {
            if (cell.value) {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            }
        });
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
}


// Function to handle file upload and generate report
function generateReport() {
    let xmlFile = document.getElementById('xmlFileInput').files[0];
    if (xmlFile) {
        let reader = new FileReader();
        reader.onload = async function(e) {
            let xmlData = e.target.result;
            let extractedData = extractDataFromXML(xmlData);
            let fileName = xmlFile.name.replace(/\.[^/.]+$/, ""); // Remove file extension
            let xlsxFile = await generateXLSXFromData(extractedData, fileName);
            let newFileName = fileName + "_report.xlsx"; // Append "_report"
            downloadXLSXFile(xlsxFile, newFileName);
        };
        reader.readAsText(xmlFile);
    } else {
        alert('Please select an XML file.');
    }
}

// Function to trigger download of the generated XLSX file
function downloadXLSXFile(data, fileName) {
    let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}

// Add event listener to the "Generate Report" button
document.getElementById('generateReportButton').addEventListener('click', generateReport);
