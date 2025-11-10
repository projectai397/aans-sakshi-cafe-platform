/**
 * MinIO File Upload Component
 * Handles file uploads to MinIO storage
 */

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react'

interface MinIOUploaderProps {
  bucketName: string
  onUploadComplete?: (file: { key: string; url: string; size: number }) => void
  onError?: (error: string) => void
  acceptedFileTypes?: string[]
  maxFileSize?: number // in bytes
  multiple?: boolean
}

export default function MinIOUploader({
  bucketName,
  onUploadComplete,
  onError,
  acceptedFileTypes = ['image/*', 'application/pdf'],
  maxFileSize = 50 * 1024 * 1024, // 50MB default
  multiple = false,
}: MinIOUploaderProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ key: string; url: string; size: number }>
  >([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  /**
   * Handle file selection
   */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])

    // Validate files
    const validFiles: File[] = []
    for (const file of selectedFiles) {
      // Check file size
      if (file.size > maxFileSize) {
        onError?.(`File ${file.name} exceeds size limit`)
        continue
      }

      // Check file type
      const isAccepted = acceptedFileTypes.some((type) => {
        if (type.endsWith('/*')) {
          const [category] = type.split('/')
          return file.type.startsWith(category)
        }
        return file.type === type
      })

      if (!isAccepted) {
        onError?.(`File type ${file.type} not accepted`)
        continue
      }

      validFiles.push(file)
    }

    if (multiple) {
      setFiles([...files, ...validFiles])
    } else {
      setFiles(validFiles.slice(0, 1))
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  /**
   * Handle drag and drop
   */
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const droppedFiles = Array.from(e.dataTransfer.files || [])
    const event = {
      target: {
        files: droppedFiles,
      },
    } as any

    handleFileSelect(event)
  }

  /**
   * Upload files to MinIO
   */
  const handleUpload = async () => {
    if (files.length === 0) {
      onError?.('No files selected')
      return
    }

    setUploading(true)
    const uploaded: Array<{ key: string; url: string; size: number }> = []

    for (const file of files) {
      try {
        setUploadProgress((prev) => ({
          ...prev,
          [file.name]: 0,
        }))

        // Read file as base64
        const reader = new FileReader()
        reader.onload = async (e) => {
          const base64Content = (e.target?.result as string).split(',')[1]

          // Call API to upload
          const response = await fetch('/api/minio/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fileName: file.name,
              fileContent: base64Content,
              bucketName,
              contentType: file.type,
              metadata: {
                originalName: file.name,
                uploadedAt: new Date().toISOString(),
              },
            }),
          })

          if (!response.ok) {
            throw new Error('Upload failed')
          }

          const data = await response.json()

          if (data.success) {
            uploaded.push(data.file)
            onUploadComplete?.(data.file)

            setUploadProgress((prev) => ({
              ...prev,
              [file.name]: 100,
            }))
          } else {
            throw new Error(data.error || 'Upload failed')
          }
        }

        reader.readAsDataURL(file)
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Upload failed'
        onError?.(errorMsg)

        setUploadProgress((prev) => ({
          ...prev,
          [file.name]: -1,
        }))
      }
    }

    setUploadedFiles([...uploadedFiles, ...uploaded])
    setFiles([])
    setUploading(false)
  }

  /**
   * Remove file from list
   */
  const removeFile = (fileName: string) => {
    setFiles(files.filter((f) => f.name !== fileName))
  }

  /**
   * Remove uploaded file
   */
  const removeUploadedFile = (key: string) => {
    setUploadedFiles(uploadedFiles.filter((f) => f.key !== key))
  }

  return (
    <div className="w-full space-y-4">
      {/* Upload Area */}
      <Card
        className="border-2 border-dashed border-gray-300 p-8 text-center cursor-pointer hover:border-gray-400 transition"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedFileTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />

        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
        <p className="text-lg font-semibold text-gray-700">Drag files here or click to select</p>
        <p className="text-sm text-gray-500 mt-1">
          Max file size: {(maxFileSize / 1024 / 1024).toFixed(0)}MB
        </p>
      </Card>

      {/* Selected Files List */}
      {files.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Selected Files ({files.length})</h3>
          <div className="space-y-2">
            {files.map((file) => (
              <div key={file.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex-1">
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
                <button
                  onClick={() => removeFile(file.name)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <Button
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            className="w-full mt-4"
          >
            {uploading ? 'Uploading...' : 'Upload Files'}
          </Button>
        </Card>
      )}

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Upload Progress</h3>
          <div className="space-y-2">
            {Object.entries(uploadProgress).map(([fileName, progress]) => (
              <div key={fileName}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{fileName}</span>
                  <span>{progress === -1 ? 'Failed' : `${progress}%`}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      progress === -1 ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.max(0, progress)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Uploaded Files ({uploadedFiles.length})
          </h3>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div key={file.key} className="flex items-center justify-between p-2 bg-green-50 rounded">
                <div className="flex-1">
                  <p className="text-sm font-medium">{file.key.split('-').pop()}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline"
                  >
                    View File
                  </a>
                </div>
                <button
                  onClick={() => removeUploadedFile(file.key)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
