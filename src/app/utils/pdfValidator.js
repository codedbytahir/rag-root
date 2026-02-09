export const validatePDF = async (file) => {
  if (typeof window === 'undefined') return { valid: true };

  try {
    // 1. Dynamic Import of main library
    const pdfjsLib = await import('pdfjs-dist/build/pdf');

    // 2. Use CDN for Worker (Fixes 'Module not found' build error)
    // We use the version matching the installed library
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    
    let hasImages = false;
    let hasText = false;

    const pagesToCheck = Math.min(pdf.numPages, 5);

    for (let i = 1; i <= pagesToCheck; i++) {
      const page = await pdf.getPage(i);
      
      // Check Text
      const textContent = await page.getTextContent();
      if (textContent.items.length > 0) hasText = true;

      // Check Images
      const ops = await page.getOperatorList();
      const imageModes = [
        pdfjsLib.OPS.paintImageXObject, 
        pdfjsLib.OPS.paintInlineImageXObject,
        pdfjsLib.OPS.paintJpegXObject
      ];

      if (ops.fnArray.some(fn => imageModes.includes(fn))) {
        hasImages = true;
        break;
      }
    }

    if (hasImages) return { valid: false, error: "PDF contains images. Text-only allowed." };
    if (!hasText) return { valid: false, error: "No text found (Scanned PDF)." };

    return { valid: true };

  } catch (err) {
    console.error("PDF Validation Error:", err);
    // Allow pass-through if validation fails technically, to not block user
    return { valid: true }; 
  }
};