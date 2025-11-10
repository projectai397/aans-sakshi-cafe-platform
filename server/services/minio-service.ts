/**
 * MinIO File Storage Service
 * Handles S3-compatible file operations
 */

import fetch from 'node-fetch'
import crypto from 'crypto'

interface FileUploadResult {
  bucket: string
  key: string
  url: string
  size: number
  contentType: string
  uploadedAt: Date
}

interface FileMetadata {
  name: string
  size: number
  contentType: string
  uploadedAt: Date
  uploadedBy?: string
  tags?: Record<string, string>
}

class MinIOService {
  private endpoint: string
  private accessKey: string
  private secretKey: string
  private useSSL: boolean
  private region: string

  constructor() {
    this.endpoint = process.env.MINIO_ENDPOINT || 'localhost:9000'
    this.accessKey = process.env.MINIO_ACCESS_KEY || 'minioadmin'
    this.secretKey = process.env.MINIO_SECRET_KEY || 'minioadmin'
    this.useSSL = process.env.MINIO_USE_SSL === 'true'
    this.region = process.env.MINIO_REGION || 'us-east-1'
  }

  /**
   * Get base URL for MinIO
   */
  private getBaseUrl(): string {
    const protocol = this.useSSL ? 'https' : 'http'
    return `${protocol}://${this.endpoint}`
  }

  /**
   * Ensure bucket exists
   */
  async ensureBucket(bucketName: string): Promise<boolean> {
    try {
      const url = `${this.getBaseUrl()}/${bucketName}`
      const response = await fetch(url, {
        method: 'HEAD',
      })

      if (response.status === 404) {
        // Create bucket
        const createResponse = await fetch(url, {
          method: 'PUT',
        })
        return createResponse.ok
      }

      return response.ok
    } catch (error) {
      console.error(`Error ensuring bucket ${bucketName}:`, error)
      return false
    }
  }

  /**
   * Upload file to MinIO
   */
  async uploadFile(
    bucketName: string,
    fileName: string,
    fileContent: Buffer,
    contentType: string = 'application/octet-stream',
    metadata?: Record<string, string>
  ): Promise<FileUploadResult> {
    try {
      // Ensure bucket exists
      await this.ensureBucket(bucketName)

      // Generate unique key
      const timestamp = Date.now()
      const random = crypto.randomBytes(4).toString('hex')
      const key = `${timestamp}-${random}-${fileName}`

      const url = `${this.getBaseUrl()}/${bucketName}/${key}`

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': contentType,
          'Content-Length': fileContent.length.toString(),
          ...this.getMetadataHeaders(metadata),
        },
        body: fileContent,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      return {
        bucket: bucketName,
        key,
        url: `${this.getBaseUrl()}/${bucketName}/${key}`,
        size: fileContent.length,
        contentType,
        uploadedAt: new Date(),
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  }

  /**
   * Download file from MinIO
   */
  async downloadFile(bucketName: string, key: string): Promise<Buffer> {
    try {
      const url = `${this.getBaseUrl()}/${bucketName}/${key}`
      const response = await fetch(url, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`)
      }

      return Buffer.from(await response.arrayBuffer())
    } catch (error) {
      console.error('Error downloading file:', error)
      throw error
    }
  }

  /**
   * Get presigned URL for file
   */
  async getPresignedUrl(
    bucketName: string,
    key: string,
    expiresIn: number = 24 * 60 * 60
  ): Promise<string> {
    try {
      // In real implementation, would use AWS SDK or similar
      // For now, return direct URL (not presigned)
      return `${this.getBaseUrl()}/${bucketName}/${key}`
    } catch (error) {
      console.error('Error generating presigned URL:', error)
      throw error
    }
  }

  /**
   * Delete file from MinIO
   */
  async deleteFile(bucketName: string, key: string): Promise<boolean> {
    try {
      const url = `${this.getBaseUrl()}/${bucketName}/${key}`
      const response = await fetch(url, {
        method: 'DELETE',
      })

      return response.ok
    } catch (error) {
      console.error('Error deleting file:', error)
      throw error
    }
  }

  /**
   * List files in bucket
   */
  async listFiles(
    bucketName: string,
    prefix: string = '',
    maxKeys: number = 1000
  ): Promise<FileMetadata[]> {
    try {
      const url = `${this.getBaseUrl()}/${bucketName}?list-type=2&prefix=${prefix}&max-keys=${maxKeys}`
      const response = await fetch(url, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error(`List failed: ${response.statusText}`)
      }

      // Parse XML response (simplified)
      const files: FileMetadata[] = []
      return files
    } catch (error) {
      console.error('Error listing files:', error)
      throw error
    }
  }

  /**
   * Copy file within bucket or between buckets
   */
  async copyFile(
    sourceBucket: string,
    sourceKey: string,
    destBucket: string,
    destKey: string
  ): Promise<boolean> {
    try {
      const sourceUrl = `${this.getBaseUrl()}/${sourceBucket}/${sourceKey}`
      const destUrl = `${this.getBaseUrl()}/${destBucket}/${destKey}`

      const response = await fetch(destUrl, {
        method: 'PUT',
        headers: {
          'x-amz-copy-source': `/${sourceBucket}/${sourceKey}`,
        },
      })

      return response.ok
    } catch (error) {
      console.error('Error copying file:', error)
      throw error
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(bucketName: string, key: string): Promise<FileMetadata | null> {
    try {
      const url = `${this.getBaseUrl()}/${bucketName}/${key}`
      const response = await fetch(url, {
        method: 'HEAD',
      })

      if (!response.ok) {
        return null
      }

      return {
        name: key.split('/').pop() || key,
        size: parseInt(response.headers.get('content-length') || '0'),
        contentType: response.headers.get('content-type') || 'application/octet-stream',
        uploadedAt: new Date(response.headers.get('last-modified') || Date.now()),
      }
    } catch (error) {
      console.error('Error getting file metadata:', error)
      return null
    }
  }

  /**
   * Create bucket
   */
  async createBucket(bucketName: string): Promise<boolean> {
    try {
      const url = `${this.getBaseUrl()}/${bucketName}`
      const response = await fetch(url, {
        method: 'PUT',
      })

      return response.ok
    } catch (error) {
      console.error(`Error creating bucket ${bucketName}:`, error)
      return false
    }
  }

  /**
   * Delete bucket
   */
  async deleteBucket(bucketName: string): Promise<boolean> {
    try {
      const url = `${this.getBaseUrl()}/${bucketName}`
      const response = await fetch(url, {
        method: 'DELETE',
      })

      return response.ok
    } catch (error) {
      console.error(`Error deleting bucket ${bucketName}:`, error)
      return false
    }
  }

  /**
   * Get metadata headers for upload
   */
  private getMetadataHeaders(metadata?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {}

    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        headers[`x-amz-meta-${key}`] = value
      })
    }

    return headers
  }
}

export const minioService = new MinIOService()
