'use client'

import { useState } from 'react'
import FileUpload from '@/components/FileUpload'
import CompressDecompress from '@/components/CompressDecompress'

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [mode, setMode] = useState<'compress' | 'decompress'>('compress')

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold mb-8">Huffman Coding File Compression</h1>
      <div className="mb-8">
        <button
          className={`px-4 py-2 mr-2 ${mode === 'compress' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setMode('compress')}
        >
          Compress
        </button>
        <button
          className={`px-4 py-2 ${mode === 'decompress' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setMode('decompress')}
        >
          Decompress
        </button>
      </div>
      <FileUpload setFile={setFile} mode={mode} />
      {file && <CompressDecompress file={file} mode={mode} />}
    </main>
  )
}