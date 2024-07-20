document.addEventListener('DOMContentLoaded', function() {
    const convertBtn = document.getElementById('convertBtn');
    const fileInput = document.getElementById('fileInput');
    const sonoInput = document.getElementById('sonoInput'); // Added this line

    convertBtn.addEventListener('click', function() {
        // Check if SONO input is empty
        if (!sonoInput.value) {
            alert('Input NO. PESANAN terlebih dahulu.');
            return;
        }

        // Check if SONO input is exactly 5 digits
        const sonoValue = sonoInput.value;
        if (!/^\d{5}$/.test(sonoValue)) {
            alert('NO. PESANAN harus terdiri dari 5 digit.');
            return;
        }

        // Check if a PROJECTID is selected
        const selectedProjectID = document.querySelector('input[name="projectID"]:checked');
        if (!selectedProjectID) {
            alert('Pilih KODE MARKETPLACE terlebih dahulu.');
            return;
        }

        // Check if a SHIPVIAID is selected
        const selectedShipviaID = document.querySelector('input[name="shipviaID"]:checked');
        if (!selectedShipviaID) {
            alert('Pilih JASA KIRIM terlebih dahulu.');
            return;
        }
        
        // Check if a FIRSTNAME is selected
        const selectedFIRSTNAME = document.querySelector('input[name="FIRSTNAME"]:checked');
        if (!selectedFIRSTNAME) {
            alert('Pilih PENJUAL terlebih dahulu.');
            return;
        }

        convertXlsxToXml(fileInput.files[0]);
    });

    function convertXlsxToXml(file) {
        // Show the spinner
        document.getElementById('loadingSpinner').style.display = 'block';

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
    
                // Get the original file name without extension
                const fileNameWithoutExtension = file.name.split('.').slice(0, -1).join('.');
    
                // Assuming the data starts from the second row (index 1)
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, range: 1 });
    
                // Convert jsonData to XML
                const xmlData = jsonToXml(jsonData);
    
                // Download the XML as a file with the original file name
                downloadXmlFile(xmlData, `${fileNameWithoutExtension}.xml`);
            } finally {
                // Hide the spinner
                document.getElementById('loadingSpinner').style.display = 'none';
            }

        };
        reader.readAsArrayBuffer(file);
    }

    function jsonToXml(jsonData) {
        let xmlString = '<?xml version="1.0" encoding="UTF-8"?>\n';

        // Generate a 3-digit random number for EximID
        const randomEximID = Math.floor(100 + Math.random() * 900);

        const headerRow = jsonData[0];

        // Group rows by PONO
        const groupedByPono = jsonData.slice(1).reduce((acc, row) => {
            const pono = row[58] || '';
            if (!acc[pono]) {
                acc[pono] = [];
            }
            acc[pono].push(row);
            return acc;
        }, {});

        // Get today's date in yyyy-mm-dd format
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        const yearMonth = today.toISOString().slice(2, 7).replace('-', '');

        // Parse the starting SONO number from the input value
        let sonoStartNumber = parseInt(sonoInput.value, 10);

        // Get the selected PROJECTID value
        const selectedProjectID = document.querySelector('input[name="projectID"]:checked').value;

        // Get the selected SHIPVIAID value
        const selectedShipviaID = document.querySelector('input[name="shipviaID"]:checked').value;

        // Get the selected FIRSTNAME value
        const selectedFIRSTNAME = document.querySelector('input[name="FIRSTNAME"]:checked').value;

        // Opening NMEXML tag with the random EximID
        xmlString += `<NMEXML EximID="${randomEximID}" BranchCode="ONLINE" ACCOUNTANTCOPYID="">\n`;

        // Opening TRANSACTIONS tag
        xmlString += `  <TRANSACTIONS OnError="CONTINUE">\n`;

        Object.values(groupedByPono).forEach(rows => {
            const firstRow = rows[0];

            // Generate a 6-digit random number for TRANSACTIONID
            const randomTransactionID = Math.floor(100000 + Math.random() * 900000);

            xmlString += `    <SALESORDER operation="Add" REQUESTID="1">\n`;
            xmlString += `      <TRANSACTIONID>${randomTransactionID}</TRANSACTIONID>\n`;

            let keyIdCounter = 0;
            rows.forEach(row => {
                xmlString += `      <ITEMLINE operation="Add">\n`;
                xmlString += `        <KeyID>${keyIdCounter}</KeyID>\n`;
                keyIdCounter++;
                xmlString += `        <ITEMNO>${row[8] || ''}</ITEMNO>\n`;
                xmlString += `        <QUANTITY>${row[9] || ''}</QUANTITY>\n`;
                xmlString += `        <ITEMUNIT>${row[10] || ''}</ITEMUNIT>\n`;
                xmlString += `        <UNITRATIO>${row[11] || ''}</UNITRATIO>\n`;
                for (let i = 12; i <= 21; i++) {
                    xmlString += `        <ITEMRESERVED${i-11}>${row[i] || ''}</ITEMRESERVED${i-11}>\n`;
                }
                xmlString += `        <ITEMOVDESC>${row[22] || ''}</ITEMOVDESC>\n`;
                xmlString += `        <UNITPRICE>${row[23] || ''}</UNITPRICE>\n`;
                xmlString += `        <DISCPC>${row[24] ? '#' + row[24] : ''}</DISCPC>\n`;
                xmlString += `        <TAXCODES>T</TAXCODES>\n`;
                xmlString += `        <PROJECTID>${selectedProjectID}</PROJECTID>\n`; // Use the selected PROJECTID value
                xmlString += `        <DEPTID>ONLINE-TMS</DEPTID>\n`;
                xmlString += `        <QTYSHIPPED>${row[28] || ''}</QTYSHIPPED>\n`;
                xmlString += `      </ITEMLINE>\n`;
            });

            // Create SONO value with the specified format and increment
            const sonoNumber = (sonoStartNumber++).toString().padStart(5, '0');
            const sonoValue = `SCO-S${yearMonth}-${sonoNumber}`;
            xmlString += `      <SONO>${sonoValue}</SONO>\n`;

            xmlString += `      <SODATE>${formattedDate}</SODATE>\n`;
            xmlString += `      <TAX1ID>T</TAX1ID>\n`;
            xmlString += `      <TAX1CODE>T</TAX1CODE>\n`;
            xmlString += `      <TAX2CODE>${firstRow[33] || ''}</TAX2CODE>\n`;
            xmlString += `      <TAX1RATE>11</TAX1RATE>\n`;
            xmlString += `      <TAX2RATE>${firstRow[35] || ''}</TAX2RATE>\n`;
            xmlString += `      <TAX1AMOUNT>${firstRow[36] || ''}</TAX1AMOUNT>\n`;
            xmlString += `      <TAX2AMOUNT>${firstRow[37] || ''}</TAX2AMOUNT>\n`;
            xmlString += `      <RATE>1</RATE>\n`;
            xmlString += `      <TAXINCLUSIVE>1</TAXINCLUSIVE>\n`;
            xmlString += `      <CUSTOMERISTAXABLE>1</CUSTOMERISTAXABLE>\n`;
            xmlString += `      <CASHDISCOUNT>${firstRow[41] || ''}</CASHDISCOUNT>\n`;
            xmlString += `      <CASHDISCPC>${firstRow[42] || ''}</CASHDISCPC>\n`;
            xmlString += `      <FREIGHT>${firstRow[43] || ''}</FREIGHT>\n`;
            xmlString += `      <TERMSID>C.O.D</TERMSID>\n`;
            xmlString += `      <SHIPVIAID>${selectedShipviaID}</SHIPVIAID>\n`; // Use the selected SHIPVIAID value
            xmlString += `      <FOB>${firstRow[46] || ''}</FOB>\n`;
            xmlString += `      <ESTSHIPDATE>${formattedDate}</ESTSHIPDATE>\n`;
            xmlString += `      <DESCRIPTION>${firstRow[48] || ''}</DESCRIPTION>\n`;
            xmlString += `      <SHIPTO1>${firstRow[49] || ''}</SHIPTO1>\n`;
            xmlString += `      <SHIPTO2>${firstRow[50] || ''}</SHIPTO2>\n`;
            xmlString += `      <SHIPTO3>${firstRow[51] || ''}</SHIPTO3>\n`;
            xmlString += `      <SHIPTO4>${firstRow[52] || ''}</SHIPTO4>\n`;
            xmlString += `      <SHIPTO5>${firstRow[53] || ''}</SHIPTO5>\n`;
            xmlString += `      <DP>0</DP>\n`;
            xmlString += `      <DPACCOUNTID>TMS-210202</DPACCOUNTID>\n`;
            xmlString += `      <DPUSED>${firstRow[56] || ''}</DPUSED>\n`;
            xmlString += `      <CUSTOMERID>${selectedProjectID}</CUSTOMERID>\n`;
            xmlString += `      <PONO>${firstRow[58] || ''}</PONO>\n`;
            xmlString += `      <SALESMANID>\n`;
            xmlString += `        <LASTNAME>${firstRow[59] || ''}</LASTNAME>\n`;
            xmlString += `        <FIRSTNAME>${selectedFIRSTNAME}</FIRSTNAME>\n`; // Use the selected FIRSTNAME value
            xmlString += `      </SALESMANID>\n`;
            xmlString += `      <CURRENCYNAME>IDR</CURRENCYNAME>\n`;
            xmlString += `    </SALESORDER>\n`;
        });

        // Closing TRANSACTIONS tag
        xmlString += `  </TRANSACTIONS>\n`;

        // Closing NMEXML tag
        xmlString += `</NMEXML>\n`;

        return xmlString;
    }

    function downloadXmlFile(xmlData, filename) {
        const blob = new Blob([xmlData], { type: 'text/xml' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});
