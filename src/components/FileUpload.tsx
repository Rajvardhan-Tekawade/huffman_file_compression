import React from 'react'

interface FileUploadProps {
  setFile: (file: File | null) => void
  mode: 'compress' | 'decompress'
}

const FileUpload: React.FC<FileUploadProps> = ({ setFile, mode }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      setFile(files[0])
    }
  }

  const acceptedFileTypes = mode === 'compress' ? '.txt,.docx,.pdf' : '.huf'

  return (
    <div className="mb-4">
      <input
        type="file"
        onChange={handleFileChange}
        accept={acceptedFileTypes}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
      />
    </div>
  )
}

export default FileUpload