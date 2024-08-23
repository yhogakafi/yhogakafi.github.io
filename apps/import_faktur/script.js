function convert() {
    const fileInput = document.getElementById('upload');
    const file = fileInput.files[0];
    if (!file) {
        alert('Please upload an Excel file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const data = event.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const xml = convertToXML(json);
        downloadXML(xml);
    };
    reader.readAsBinaryString(file);
}

function generateRandom3DigitNumber() {
    return Math.floor(Math.random() * 900) + 100; // Generates a random number between 100 and 999
}

function generateRandom6DigitNumber() {
    return Math.floor(Math.random() * 900000) + 100000; // Generates a random number between 100000 and 999999
}

function convertToXML(data) {
    const eximID = generateRandom3DigitNumber(); // Generate a random 3-digit number for EximID
    const transactionID = generateRandom6DigitNumber(); // Generate a random 6-digit number for TRANSACTIONID

    // Fetch the selected date
    const selectedDate = document.getElementById('date-picker').value;
    // Fetch invoiceNo
    const invoiceNo = document.getElementById('invoice-no').value || 'TESTINI';

    // Initialize grouping objects for SOID
    const soidGroups = {};

    let xml = `<?xml version="1.0"?>\n`;
    xml += `<NMEXML EximID="${eximID}" BranchCode="GPD" ACCOUNTANTCOPYID="">\n`;
    xml += '    <TRANSACTIONS OnError="CONTINUE">\n';
    xml += '        <SALESINVOICE operation="Add" REQUESTID="1">\n';

    if (data.length > 1) {
        // Add TRANSACTIONID with the randomly generated value
        xml += `            <TRANSACTIONID>${transactionID}</TRANSACTIONID>\n`;
    }

    // Initialize counters for KeyID, SOSEQ, and DOSEQ
    let keyIDCounter = 1;
    const soidSOSEQCounter = {};
    const soidDOSEQCounter = {};

    // First pass: Group item lines by SOID
    for (let i = 2; i < data.length; i++) {
        const row = data[i];
        const soid = row[38]; // SOID column index (adjust if necessary)

        if (!soidGroups[soid]) {
            soidGroups[soid] = [];
            soidSOSEQCounter[soid] = 0; // Initialize SOSEQ counter for this SOID
            soidDOSEQCounter[soid] = 1; // Initialize DOSEQ counter for this SOID
        }
        soidGroups[soid].push(row);
    }

    // Second pass: Create XML with sequential SOSEQ and DOSEQ
    for (const [soid, rows] of Object.entries(soidGroups)) {
        rows.forEach((row, index) => {
            xml += '            <ITEMLINE operation="Add">\n';
            xml += `                <KeyID>${keyIDCounter}</KeyID>\n`; // Use the counter for KeyID
            xml += `                <ITEMNO>${row[13] || ''}</ITEMNO>\n`;
            xml += `                <QUANTITY>${row[14] || ''}</QUANTITY>\n`;
            xml += `                <ITEMUNIT>${row[15] || ''}</ITEMUNIT>\n`;
            xml += `                <UNITRATIO>1</UNITRATIO>\n`;
            xml += `                <ITEMRESERVED1/>\n`;
            xml += `                <ITEMRESERVED2/>\n`;
            xml += `                <ITEMRESERVED3/>\n`;
            xml += `                <ITEMRESERVED4/>\n`;
            xml += `                <ITEMRESERVED5/>\n`;
            xml += `                <ITEMRESERVED6/>\n`;
            xml += `                <ITEMRESERVED7/>\n`;
            xml += `                <ITEMRESERVED8/>\n`;
            xml += `                <ITEMRESERVED9/>\n`;
            xml += `                <ITEMRESERVED10/>\n`;
            xml += `                <ITEMOVDESC>${row[27] || ''}</ITEMOVDESC>\n`;
            xml += `                <UNITPRICE>${row[28] || ''}</UNITPRICE>\n`;
            xml += `                <ITEMDISCPC>${row[29] || ''}</ITEMDISCPC>\n`;
            xml += `                <TAXCODES/>\n`;
            xml += `                <DEPTID>SHOPEE / SCELTA</DEPTID>\n`;
            xml += `                <GROUPSEQ/>\n`;
            xml += `                <SOSEQ>${index}</SOSEQ>\n`; // Sequential SOSEQ starting from 0
            xml += `                <BRUTOUNITPRICE>${row[34] || ''}</BRUTOUNITPRICE>\n`;
            xml += `                <WAREHOUSEID>ONLINE</WAREHOUSEID>\n`;
            xml += `                <QTYCONTROL>0</QTYCONTROL>\n`;
            xml += `                <DOSEQ>${soidDOSEQCounter[soid]}</DOSEQ>\n`; // Sequential DOSEQ starting from 1
            xml += `                <SOID>${row[38] || ''}</SOID>\n`;
            xml += `                <DOID>${row[39] || ''}</DOID>\n`;
            xml += '            </ITEMLINE>\n';

            // Increment counters for the next KeyID and DOSEQ
            keyIDCounter++;
            soidDOSEQCounter[soid]++;
        });
    }

    xml += `            <INVOICENO>${invoiceNo}</INVOICENO>\n`;
    xml += `            <INVOICEDATE>${selectedDate}</INVOICEDATE>\n`;
    xml += '            <TAX1CODE/>\n';
    xml += '            <TAX2CODE/>\n';
    xml += '            <TAX1RATE>0</TAX1RATE>\n';
    xml += '            <TAX2RATE>0</TAX2RATE>\n';
    xml += '            <RATE>1</RATE>\n';
    xml += '            <INCLUSIVETAX>0</INCLUSIVETAX>\n';
    xml += '            <CUSTOMERISTAXABLE>0</CUSTOMERISTAXABLE>\n';
    xml += '            <CASHDISCOUNT>0</CASHDISCOUNT>\n';
    xml += '            <CASHDISCPC/>\n';
    xml += '            <INVOICEAMOUNT></INVOICEAMOUNT>\n';
    xml += '            <FREIGHT>0</FREIGHT>\n';
    xml += '            <TERMSID>C.O.D</TERMSID>\n';
    xml += '            <SHIPVIA></SHIPVIA>\n';
    xml += '            <FOB/>\n';
    xml += '            <PURCHASEORDERNO/>\n';
    xml += '            <WAREHOUSEID>ONLINE</WAREHOUSEID>\n';
    xml += '            <DESCRIPTION/>\n';
    xml += `            <SHIPDATE>${selectedDate}</SHIPDATE>\n`;
    xml += '            <DELIVERYORDER></DELIVERYORDER>\n';
    xml += '            <FISCALRATE>1</FISCALRATE>\n';
    xml += `            <TAXDATE>${selectedDate}</TAXDATE>\n`;
    xml += '            <CUSTOMERID>TMO-1101</CUSTOMERID>\n';
    xml += '            <SALESMANID>\n';
    xml += '                <LASTNAME></LASTNAME>\n';
    xml += '                <FIRSTNAME>YOGHA</FIRSTNAME>\n';
    xml += '            </SALESMANID>\n';
    xml += '            <PRINTED>0</PRINTED>\n';
    xml += '            <SHIPTO1/>\n';
    xml += '            <SHIPTO2/>\n';
    xml += '            <SHIPTO3/>\n';
    xml += '            <SHIPTO4/>\n';
    xml += '            <SHIPTO5/>\n';
    xml += '            <ARACCOUNT>TMS-110302</ARACCOUNT>\n';
    xml += '            <TAXFORMNUMBER/>\n';
    xml += '            <TAXFORMCODE/>\n';
    xml += '            <CURRENCYNAME>IDR</CURRENCYNAME>\n';
    xml += '            <AUTOMATICINSERTGROUPING/>\n';
    xml += '        </SALESINVOICE>\n';
    xml += '    </TRANSACTIONS>\n';
    xml += '</NMEXML>';

    return xml;
}

function downloadXML(xml) {
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.getElementById('download');
    downloadLink.href = url;
    downloadLink.download = 'output.xml';
    downloadLink.style.display = 'block';
    downloadLink.textContent = 'Download XML';
}