const pdfParsePkg = require('pdf-parse');
console.log("require('pdf-parse') keys:", Object.keys(pdfParsePkg));
console.log("type of require('pdf-parse'):", typeof pdfParsePkg);
console.log("type of default:", typeof pdfParsePkg.default);
console.log("type of PDFParse / pdfParse:", typeof pdfParsePkg.pdfParse, typeof pdfParsePkg.PDFParse);
