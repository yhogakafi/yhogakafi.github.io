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

// Function to convert JSON data to XLSX
function generateXLSXFromData(data) {
    let workbook = XLSX.utils.book_new();
    let worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    let xlsxFile = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return xlsxFile;
}

// Function to handle file upload and generate report
function generateReport() {
    let xmlFile = document.getElementById('xmlFileInput').files[0];
    if (xmlFile) {
        let reader = new FileReader();
        reader.onload = function(e) {
            let xmlData = e.target.result;
            let extractedData = extractDataFromXML(xmlData);
            let xlsxFile = generateXLSXFromData(extractedData);
            downloadXLSXFile(xlsxFile);
        };
        reader.readAsText(xmlFile);
    } else {
        alert('Please select an XML file.');
    }
}

// Function to trigger download of the generated XLSX file
function downloadXLSXFile(data) {
    let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = 'report.xlsx';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}

// Add event listener to the "Generate Report" button
document.getElementById('generateReportButton').addEventListener('click', generateReport);
