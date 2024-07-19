async function extractData() {
    try {
        // Get the file from the input
        const fileInput = document.getElementById('pdf-file');
        const file = fileInput.files[0];
        if (!file) {
            alert('Please select a PDF file.');
            return;
        }

        // Read the file as an ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        
        // Load the PDF document
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let text = '';

        // Loop through each page of the PDF
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            
            // Get the text content of the page
            const textContent = await page.getTextContent();
            
            // Join the text items without spaces
            const pageText = textContent.items.map(item => item.str).join('');
            
            // Append the page text to the full text
            text += pageText + ' ';
        }

        // Define the keyword to search for
        const keyword = 'No. Pesanan: ';
        
        // Extract the data after the keyword
        const dataAfterKeyword = extractDataAfterKeyword(text, keyword);

        if (dataAfterKeyword.length === 0) {
            alert('No data found after the keyword.');
            return;
        }

        // Create a new workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet([['Data'], ...dataAfterKeyword.map(item => [item])]);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

        // Convert the workbook to a binary array
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        
        // Save the workbook as an Excel file
        saveAsExcelFile(excelBuffer, 'extracted_data.xlsx');
    } catch (error) {
        console.error('Error:', error);
    }
}

function extractDataAfterKeyword(text, keyword) {
    const regex = new RegExp(`${keyword}([^\\s]+)`, 'g');
    const matches = [...text.matchAll(regex)];
    return matches.map(match => {
        // Extract the matched string
        let extractedData = match[1];
        
        // Remove everything after and including "Penerima:"
        const penerimaIndex = extractedData.indexOf('Penerima:');
        if (penerimaIndex !== -1) {
            extractedData = extractedData.substring(0, penerimaIndex);
        }

        return extractedData;
    });
}

function saveAsExcelFile(buffer, filename) {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}
