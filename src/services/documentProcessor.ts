declare const pdfjsLib: any;
declare const mammoth: any;
declare const jspdf: any;
declare const docx: any;

export const extractTextFromFile = async (file: File): Promise<string | null> => {
  if (file.type === 'application/pdf') {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(' ');
    }
    return text;
  } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
    return result.value;
  } else if (file.type === 'text/plain') {
    return file.text();
  }
  return null;
};

export const createPdfFromText = async (text: string): Promise<string> => {
  const { jsPDF } = jspdf;
  const doc = new jsPDF();
  
  // jsPDF doesn't handle Arabic well out of the box. This is a basic implementation.
  const lines = doc.splitTextToSize(text, 180);
  doc.setR2L(true); // Enable Right-to-Left for Arabic
  doc.text(lines, 200, 10, { align: 'right' });
  
  return doc.output('bloburl');
};

export const createDocxFromText = async (text: string): Promise<string> => {
  // Ensure docx library is loaded
  if (typeof docx === 'undefined') {
      console.error("Docx library not loaded");
      return createTxtFromText(text); // Fallback
  }

  const { Document, Packer, Paragraph, TextRun } = docx;

  // Split text into paragraphs to handle lines properly
  const paragraphs = text.split('\n').map(line => new Paragraph({
    children: [
        new TextRun({
            text: line,
            size: 24, // 12pt
            rightToLeft: true, // RTL hint
        }),
    ],
    bidirectional: true, // Enable RTL for the paragraph
    spacing: {
        after: 100, // Spacing after paragraph
    }
  }));

  const doc = new Document({
    sections: [{
      properties: {},
      children: paragraphs,
    }],
  });

  const blob = await Packer.toBlob(doc);
  return URL.createObjectURL(blob);
};

export const createTxtFromText = (text: string): string => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    return URL.createObjectURL(blob);
};