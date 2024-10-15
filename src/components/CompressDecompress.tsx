import { saveAs } from 'file-saver'
import { compressFile, decompressFile } from '../utils/huffman'

interface CompressDecompressProps {
  file: File
  mode: 'compress' | 'decompress'
}

const CompressDecompress: React.FC<CompressDecompressProps> = ({ file, mode }) => {
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
        const newFileType = getFileType(file.name);
        const blob = new Blob([decompressedData], { type: newFileType });
        console.log('Saving decompressed file...');
        const newName = file.name.replace(/\.huf$/, getFileExtension(file.name));
        saveAs(blob, newName);
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

export default CompressDecompress
