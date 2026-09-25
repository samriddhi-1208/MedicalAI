const pdfParsePkg = require('pdf-parse');

async function parsePdfSafely(fileBuffer) {
  if (typeof pdfParsePkg === 'function') {
    const res = await pdfParsePkg(fileBuffer);
    return res.text || "";
  }
  if (pdfParsePkg && typeof pdfParsePkg.default === 'function') {
    const res = await pdfParsePkg.default(fileBuffer);
    return res.text || "";
  }
  if (pdfParsePkg && typeof pdfParsePkg.PDFParse === 'function') {
    try {
      const parser = new pdfParsePkg.PDFParse({ data: fileBuffer });
      const result = await parser.getText();
      return typeof result === 'string' ? result : (result.text || "");
    } catch (e) {
      console.log("PDFParse class error:", e.message);
    }
  }
  return "";
}

console.log("parsePdfSafely helper defined successfully!");
