import { useEffect, useRef } from 'react'
import Uppy from '@uppy/core'
import Dashboard from '@uppy/dashboard'
import TusPlugin from '@uppy/tus'
import '@uppy/core/dist/style.css'
import '@uppy/dashboard/dist/style.css'

interface UppyUploaderProps {
  onComplete?: (files: any[]) => void
  onError?: (error: Error) => void
  endpoint?: string
  maxFiles?: number
  maxFileSize?: number
  allowedFileTypes?: string[]
}

export default function UppyUploader({
  onComplete,
  onError,
  endpoint = '/api/upload',
  maxFiles = 10,
  maxFileSize = 50 * 1024 * 1024, // 50MB
  allowedFileTypes = ['image/*', 'application/pdf'],
}: UppyUploaderProps) {
  const uppyRef = useRef<Uppy | null>(null)
  const dashboardRef = useRef<Dashboard | null>(null)

  useEffect(() => {
    if (uppyRef.current) return

    const uppy = new Uppy({
      id: 'uppy-dashboard',
      autoProceed: false,
      allowMultipleUploads: true,
      restrictions: {
        maxNumberOfFiles: maxFiles,
        maxFileSize: maxFileSize,
        allowedFileTypes: allowedFileTypes,
      },
    })

    uppy.use(TusPlugin, {
      endpoint: endpoint,
      chunkSize: 5 * 1024 * 1024, // 5MB chunks
      retryDelays: [0, 1000, 3000, 5000],
    })

    uppy.on('complete', (result) => {
      if (onComplete && result.successful.length > 0) {
        onComplete(result.successful)
      }
    })

    uppy.on('error', (error) => {
      if (onError) {
        onError(error)
      }
    })

    const dashboard = new Dashboard({
      target: '#uppy-dashboard',
      inline: true,
      height: 400,
      proudlyDisplayPoweredByUppy: false,
    })

    uppy.use(dashboard)

    uppyRef.current = uppy
    dashboardRef.current = dashboard

    return () => {
      uppy.close()
    }
  }, [endpoint, maxFiles, maxFileSize, allowedFileTypes, onComplete, onError])

  return (
    <div className="w-full">
      <div id="uppy-dashboard" className="uppy-dashboard-container" />
    </div>
  )
}
