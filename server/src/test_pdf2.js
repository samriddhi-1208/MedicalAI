const { PDFParse } = require('pdf-parse');

async function testPdfParse() {
  console.log("PDFParse class:", PDFParse);
  
  // Test with simple pdfParse helper function fallback
  let extractFn = null;

  if (typeof PDFParse === 'function') {
    extractFn = async (buf) => {
      try {
        const instance = new PDFParse({ data: buf });
        const res = await instance.getText();
        return res.text || res || "";
      } catch (e) {
        // Fallback static method
        if (typeof PDFParse.parse === 'function') {
          const res = await PDFParse.parse(buf);
          return res.text || "";
        }
        throw e;
      }
    };
  }

  console.log("Testing extractFn...");
}

testPdfParse().catch(err => console.error("Error:", err));
