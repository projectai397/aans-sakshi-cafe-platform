/**
 * MinIO File Upload Routes
 * Handles file uploads, downloads, and management
 */

import { router, publicProcedure, protectedProcedure } from '@/server/_core/trpc'
import { z } from 'zod'
import { minioService } from '@/server/services/minio-service'

// Validation schemas
const UploadFileSchema = z.object({
  fileName: z.string().min(1, 'File name required'),
  fileContent: z.string(), // base64 encoded
  bucketName: z.string().min(1, 'Bucket name required'),
  contentType: z.string().default('application/octet-stream'),
  metadata: z.record(z.string()).optional(),
})

const DownloadFileSchema = z.object({
  bucketName: z.string(),
  key: z.string(),
})

const DeleteFileSchema = z.object({
  bucketName: z.string(),
  key: z.string(),
})

const ListFilesSchema = z.object({
  bucketName: z.string(),
  prefix: z.string().optional(),
  maxKeys: z.number().int().positive().default(1000),
})

const CopyFileSchema = z.object({
  sourceBucket: z.string(),
  sourceKey: z.string(),
  destBucket: z.string(),
  destKey: z.string(),
})

const BucketSchema = z.object({
  bucketName: z.string().min(1, 'Bucket name required'),
})

export const minioUploadRouter = router({
  /**
   * Upload file to MinIO
   */
  uploadFile: protectedProcedure
    .input(UploadFileSchema)
    .mutation(async ({ input }) => {
      try {
        // Decode base64 content
        const buffer = Buffer.from(input.fileContent, 'base64')

        // Validate file size (max 50MB)
        const maxSize = 50 * 1024 * 1024
        if (buffer.length > maxSize) {
          return {
            success: false,
            error: 'File size exceeds 50MB limit',
          }
        }

        const result = await minioService.uploadFile(
          input.bucketName,
          input.fileName,
          buffer,
          input.contentType,
          input.metadata
        )

        return {
          success: true,
          file: result,
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Upload failed',
        }
      }
    }),

  /**
   * Download file from MinIO
   */
  downloadFile: publicProcedure.input(DownloadFileSchema).query(async ({ input }) => {
    try {
      const buffer = await minioService.downloadFile(input.bucketName, input.key)

      return {
        success: true,
        content: buffer.toString('base64'),
        size: buffer.length,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Download failed',
      }
    }
  }),

  /**
   * Get presigned URL for file
   */
  getPresignedUrl: publicProcedure
    .input(
      z.object({
        bucketName: z.string(),
        key: z.string(),
        expiresIn: z.number().int().positive().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const url = await minioService.getPresignedUrl(
          input.bucketName,
          input.key,
          input.expiresIn
        )

        return {
          success: true,
          url,
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to generate URL',
        }
      }
    }),

  /**
   * Delete file from MinIO
   */
  deleteFile: protectedProcedure.input(DeleteFileSchema).mutation(async ({ input }) => {
    try {
      const success = await minioService.deleteFile(input.bucketName, input.key)

      if (success) {
        return {
          success: true,
          message: 'File deleted successfully',
        }
      } else {
        return {
          success: false,
          error: 'Failed to delete file',
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed',
      }
    }
  }),

  /**
   * List files in bucket
   */
  listFiles: publicProcedure.input(ListFilesSchema).query(async ({ input }) => {
    try {
      const files = await minioService.listFiles(
        input.bucketName,
        input.prefix,
        input.maxKeys
      )

      return {
        success: true,
        files,
        count: files.length,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list files',
      }
    }
  }),

  /**
   * Get file metadata
   */
  getFileMetadata: publicProcedure
    .input(
      z.object({
        bucketName: z.string(),
        key: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const metadata = await minioService.getFileMetadata(input.bucketName, input.key)

        if (!metadata) {
          return {
            success: false,
            error: 'File not found',
          }
        }

        return {
          success: true,
          metadata,
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get metadata',
        }
      }
    }),

  /**
   * Copy file
   */
  copyFile: protectedProcedure.input(CopyFileSchema).mutation(async ({ input }) => {
    try {
      const success = await minioService.copyFile(
        input.sourceBucket,
        input.sourceKey,
        input.destBucket,
        input.destKey
      )

      if (success) {
        return {
          success: true,
          message: 'File copied successfully',
        }
      } else {
        return {
          success: false,
          error: 'Failed to copy file',
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Copy failed',
      }
    }
  }),

  /**
   * Create bucket
   */
  createBucket: protectedProcedure.input(BucketSchema).mutation(async ({ input }) => {
    try {
      const success = await minioService.createBucket(input.bucketName)

      if (success) {
        return {
          success: true,
          message: `Bucket '${input.bucketName}' created successfully`,
        }
      } else {
        return {
          success: false,
          error: 'Failed to create bucket',
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bucket creation failed',
      }
    }
  }),

  /**
   * Delete bucket
   */
  deleteBucket: protectedProcedure.input(BucketSchema).mutation(async ({ input }) => {
    try {
      const success = await minioService.deleteBucket(input.bucketName)

      if (success) {
        return {
          success: true,
          message: `Bucket '${input.bucketName}' deleted successfully`,
        }
      } else {
        return {
          success: false,
          error: 'Failed to delete bucket',
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bucket deletion failed',
      }
    }
  }),

  /**
   * Ensure bucket exists
   */
  ensureBucket: protectedProcedure.input(BucketSchema).mutation(async ({ input }) => {
    try {
      const success = await minioService.ensureBucket(input.bucketName)

      if (success) {
        return {
          success: true,
          message: `Bucket '${input.bucketName}' is ready`,
        }
      } else {
        return {
          success: false,
          error: 'Failed to ensure bucket',
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bucket operation failed',
      }
    }
  }),

  /**
   * Get storage statistics
   */
  getStorageStats: publicProcedure.query(async () => {
    try {
      // In real implementation, would fetch from MinIO admin API
      return {
        success: true,
        stats: {
          totalBuckets: 0,
          totalObjects: 0,
          totalSize: 0,
          usedSize: 0,
          availableSize: 0,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get stats',
      }
    }
  }),
})
