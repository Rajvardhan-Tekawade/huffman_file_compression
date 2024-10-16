import type { getDocument as GetDocumentType } from 'pdfjs-dist';

let pdfjsLib: typeof import('pdfjs-dist');
let getDocument: typeof GetDocumentType;

if (typeof window !== 'undefined') {
  const loadPdfjsLib = async () => {
    pdfjsLib = await import('pdfjs-dist');
    getDocument = pdfjsLib.getDocument;
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  };

  loadPdfjsLib();
}

export { getDocument };
