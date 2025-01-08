const fs = require('fs');
const path = require('path');
const pdf = require('pdf-creator-node');
const moment = require('moment');

const folderPath = 'path/to/folder';
const outputFolderPath = 'path/to/output/folder';

// Get all the PNG files in the folder
const files = fs.readdirSync(folderPath);

// Create a new PDF document
const doc = new pdf.PDFDocument({
  margin: 50,
  size: 'A4',
});

// Add each file to the PDF document
files.forEach((file, index) => {
  // Get the file name
  const fileName = path.basename(file, '.png');

  // Create a new page in the PDF document
  doc.addPage();

  // Add the image to the page
  doc.image(path.join(folderPath, file), {
    x: 50,
    y: 50,
    width: 500,
    height: 500,
  });

  // Add the file name to the page
  doc.text(fileName, {
    x: 50,
    y: 600,
    fontSize: 12,
  });
});

// Save the PDF document
const outputFileName = `output-${moment().format('YYYY-MM-DD HH:mm')}.pdf`;
const outputFilePath = path.join(outputFolderPath, outputFileName);
doc.save(outputFilePath, (err) => {
  if (err) {
    console.error(err);
    return;
  }

  console.log(`The PDF file has been saved to ${outputFilePath}`);
});
