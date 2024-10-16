'use client';
import { useState } from 'react'
import FileUpload from '@/components/FileUpload'
import dynamic from 'next/dynamic'

const CompressDecompress = dynamic(() => import('@/components/CompressDecompress'), { ssr: false });
const Design = dynamic(() => import('@/components/Design'), { ssr: false });

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [mode, setMode] = useState<'compress' | 'decompress'>('compress')
  const [outputFormat, setOutputFormat] = useState<'txt' | 'docx' | 'pdf'>('txt')

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-[url('../public/bg.jpg')] bg-cover bg-center relative">
      <div className="absolute inset-0 z-10">
        <Design />
      </div>
      <div className="p-8 rounded-lg bg-black bg-opacity-50 z-20 relative">
        <h1 className="text-4xl font-bold mb-8 text-white">Huffman Coding File Compression</h1>
        <div className="mb-8">
          <button
            className={`px-4 py-2 mr-2 ${mode === 'compress' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
            onClick={() => setMode('compress')}
          >
            Compress
          </button>
          <button
            className={`px-4 py-2 ${mode === 'decompress' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
            onClick={() => setMode('decompress')}
          >
            Decompress
          </button>
        </div>
        <FileUpload setFile={setFile} mode={mode} />
        
        {mode === 'decompress' && (
          <div className="mt-4">
            <label htmlFor="outputFormat" className="block mb-2 text-white">Select Output Format:</label>
            <select
              id="outputFormat"
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value as 'txt' | 'docx' | 'pdf')}
              className="p-2 border rounded text-black"
            >
              <option value="txt">TXT</option>
              <option value="docx">DOCX</option>
              <option value="pdf">PDF</option>
            </select>
          </div>
        )}

        {file && <CompressDecompress file={file} mode={mode} outputFormat={outputFormat} />}
      </div>
    </main>
  )
}
