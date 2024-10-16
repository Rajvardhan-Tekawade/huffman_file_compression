import { saveAs } from 'file-saver'
import { compressFile, decompressFile } from '../utils/huffman'
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { Document, Packer, Paragraph } from 'docx';

interface CompressDecompressProps {
  file: File
  mode: 'compress' | 'decompress'
  outputFormat: 'txt' | 'docx' | 'pdf'
}

const CompressDecompress: React.FC<CompressDecompressProps> = ({ file, mode, outputFormat }) => {
  const handleProcess = async () => {
    try {
      if (mode === 'compress') {
        console.log('Starting compression...');
        const compressedData = await compressFile(file);
        console.log('Compression completed, creating blob...');
        const blob = new Blob([compressedData], { type: 'application/octet-stream' });
        console.log('Saving compressed file...');
        saveAs(blob, `${file.name}.huf`);
      } else {
        console.log('Starting decompression...');
        const decompressedData = await decompressFile(file);
        console.log('Decompression completed, creating blob...');
        const mimeTypes = {
          txt: 'text/plain',
          docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          pdf: 'application/pdf'
        };

        let blob: Blob;
        let fileName: string;

        switch (outputFormat) {
          case 'txt':
            blob = new Blob([decompressedData], { type: 'text/plain;charset=utf-8' });
            fileName = 'decompressed_file.txt';
            break;
          case 'docx':
            blob = await createDocxBlob(new TextDecoder().decode(decompressedData));
            fileName = 'decompressed_file.docx';
            break;
          case 'pdf':
            blob = await createPdfBlob(new TextDecoder().decode(decompressedData));
            fileName = 'decompressed_file.pdf';
            break;
          default:
            throw new Error('Unsupported output format');
        }

        downloadBlob(blob, fileName);
      }
      console.log('File processing completed successfully');
    } catch (error) {
      console.error('Error processing file:', error);
      alert(`An error occurred while processing the file: ${error}`);
    }
  }

  return (
    <button
      onClick={handleProcess}
      className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
    >
      {mode === 'compress' ? 'Compress' : 'Decompress'} File
    </button>
  )
}

function getFileType(fileName: string): string {
  if (fileName.endsWith('.pdf')) return 'application/pdf';
  if (fileName.endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  return 'text/plain;charset=utf-8';
}

function getFileExtension(fileName: string): string {
  if (fileName.endsWith('.pdf.huf')) return '.pdf';
  if (fileName.endsWith('.docx.huf')) return '.docx';
  return '.txt';
}

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

const createDocxBlob = async (data: string): Promise<Blob> => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [new Paragraph(data)]
    }]
  });
  const buffer = await Packer.toBuffer(doc);
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
};

const createPdfBlob = async (data: string): Promise<Blob> => {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;
  const lineHeight = fontSize * 1.5;
  const margin = 50;
  const pageWidth = page.getWidth() - 2 * margin;

  const words = data.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    if (font.widthOfTextAtSize(currentLine + ' ' + word, fontSize) <= pageWidth) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  });
  if (currentLine) lines.push(currentLine);

  let y = page.getHeight() - margin;
  lines.forEach((line) => {
    if (y < margin) {
      page = pdfDoc.addPage([595, 842]);
      y = page.getHeight() - margin;
    }
    page.drawText(line, {
      x: margin,
      y: y,
      size: fontSize,
      font: font,
      lineHeight: lineHeight,
    });
    y -= lineHeight;
  });

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
};

export default CompressDecompress
