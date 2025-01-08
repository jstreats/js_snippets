const fs = require('fs');
const jsPDF = require('jspdf');
const path = require('path');

const mergeRegressionEvidenceToPdf = (folderPath) => {
  // Get all the PNG files in the folder
  const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.png'));

  // Create a new PDF document
  const doc = new jsPDF();

  // Loop through the files and add them to the PDF
  files.forEach((file, index) => {
    // Read the file
    const imageData = fs.readFileSync(path.join(folderPath, file));

    // Add the image to the PDF
    doc.addImage(imageData, 'PNG', 10, 10, 180, 180);

    // Add the filename to the page
    doc.setFontSize(12);
    doc.text(file, 10, 200);

    // Add a new page
    doc.addPage();
  });

  // Get the current UTC time
  const now = new Date();
  const utcTime = now.toISOString().replace(/[:.]/g, '-');

  // Create a subfolder with the current UTC time
  const subfolderPath = path.join(folderPath, utcTime);
  fs.mkdirSync(subfolderPath);

  // Save the PDF file to the subfolder
  const fileName = `images-${utcTime}.pdf`;
  doc.save(path.join(subfolderPath, fileName));

  // Return the file name
  return fileName;
};

module.exports = mergeRegressionEvidenceToPdf; 
 
