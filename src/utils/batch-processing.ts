import { PrismaClient } from '@prisma/client'
import { logger } from '@/lib/logger'

/**
 * バッチ処理の設定オプション
 */
interface BatchProcessingOptions<T> {
  /** 一度に処理するデータ数 */
  chunkSize?: number
  /** 最大リトライ回数 */
  maxRetries?: number
  /** リトライ間隔(ミリ秒) */
  retryDelay?: number
  /** 進捗コールバック */
  onProgress?: (processed: number, total: number) => void
  /** エラー発生時のコールバック */
  onError?: (error: Error, items: T[]) => void
  /** 処理成功時のコールバック */
  onSuccess?: (items: T[]) => void
}

/**
 * バッチ処理の実行結果
 */
interface BatchProcessingResult<T> {
  /** 成功した処理の数 */
  successCount: number
  /** 失敗した処理の数 */
  failureCount: number
  /** 失敗したアイテムのリスト */
  failedItems: T[]
  /** 実行時間(ミリ秒) */
  executionTime: number
  /** パフォーマンスメトリクス */
  metrics: {
    averageChunkProcessingTime: number
    maxChunkProcessingTime: number
    minChunkProcessingTime: number
  }
}

/**
 * Prismaのテーブル名を定義
 */
export type PrismaTableName =
  | 'user'
  | 'account'
  | 'session'
  | 'purchaseOrder'
  | 'purchaseOrderItem'
  | 'vendor'
  | 'tag'
  | 'invoiceTemplate'
  | 'invoiceTemplateItem'
  | 'invoice'
  | 'invoiceItem'
  | 'payment'
  | 'project'
  | 'projectMember'
  | 'reminderLog'
  | 'reminderSetting'
  | 'statusHistory'
  | 'notification'
  | 'testLog'
  | 'itemCategoryMaster'

/**
 * データを一括処理するユーティリティ
 * @param items 処理対象のデータ配列
 * @param processor 各データに対する処理関数
 * @param options バッチ処理のオプション
 */
export async function processBatch<T>(
  items: T[],
  processor: (items: T[]) => Promise<void>,
  options: BatchProcessingOptions<T> = {}
): Promise<BatchProcessingResult<T>> {
  const {
    chunkSize = 100,
    maxRetries = 3,
    retryDelay = 1000,
    onProgress,
    onError,
    onSuccess
  } = options

  const startTime = Date.now()
  const result: BatchProcessingResult<T> = {
    successCount: 0,
    failureCount: 0,
    failedItems: [],
    executionTime: 0,
    metrics: {
      averageChunkProcessingTime: 0,
      maxChunkProcessingTime: 0,
      minChunkProcessingTime: Infinity
    }
  }

  const chunks = []
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize))
  }

  const chunkTimes: number[] = []

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    let retries = 0
    let success = false

    const chunkStartTime = Date.now()

    while (!success && retries < maxRetries) {
      try {
        await processor(chunk)
        success = true
        result.successCount += chunk.length
        onSuccess?.(chunk)

        const chunkTime = Date.now() - chunkStartTime
        chunkTimes.push(chunkTime)
        result.metrics.maxChunkProcessingTime = Math.max(
          result.metrics.maxChunkProcessingTime,
          chunkTime
        )
        result.metrics.minChunkProcessingTime = Math.min(
          result.metrics.minChunkProcessingTime,
          chunkTime
        )

      } catch (error) {
        retries++
        logger.error('Batch processing error:', {
          error,
          chunk,
          retry: retries
        })

        if (retries === maxRetries) {
          result.failureCount += chunk.length
          result.failedItems.push(...chunk)
          onError?.(error as Error, chunk)
        } else {
          await new Promise(resolve => setTimeout(resolve, retryDelay))
        }
      }
    }

    onProgress?.(
      (i + 1) * chunkSize,
      items.length
    )
  }

  result.executionTime = Date.now() - startTime
  result.metrics.averageChunkProcessingTime =
    chunkTimes.reduce((sum, time) => sum + time, 0) / chunkTimes.length

  return result
}

/**
 * データベースの一括更新を行うユーティリティ
 * @param prisma Prismaクライアント
 * @param table 更新対象のテーブル名
 * @param items 更新するデータの配列
 * @param options バッチ処理のオプション
 */
export async function batchUpdate<T extends { id: string }>(
  prisma: PrismaClient,
  table: PrismaTableName,
  items: T[],
  options: BatchProcessingOptions<T> = {}
): Promise<BatchProcessingResult<T>> {
  return processBatch(
    items,
    async (chunk) => {
      await prisma.$transaction(
        chunk.map(item => {
          const { id, ...data } = item
          return (prisma[table] as any).update({
            where: { id },
            data
          })
        })
      )
    },
    options
  )
}

/**
 * データベースの一括作成を行うユーティリティ
 * @param prisma Prismaクライアント
 * @param table 作成対象のテーブル名
 * @param items 作成するデータの配列
 * @param options バッチ処理のオプション
 */
export async function batchCreate<T>(
  prisma: PrismaClient,
  table: PrismaTableName,
  items: T[],
  options: BatchProcessingOptions<T> = {}
): Promise<BatchProcessingResult<T>> {
  return processBatch(
    items,
    async (chunk) => {
      await (prisma[table] as any).createMany({
        data: chunk
      })
    },
    options
  )
}

/**
 * データベースの一括削除を行うユーティリティ
 * @param prisma Prismaクライアント
 * @param table 削除対象のテーブル名
 * @param ids 削除するレコードのID配列
 * @param options バッチ処理のオプション
 */
export async function batchDelete(
  prisma: PrismaClient,
  table: PrismaTableName,
  ids: string[],
  options: BatchProcessingOptions<string> = {}
): Promise<BatchProcessingResult<string>> {
  return processBatch(
    ids,
    async (chunk) => {
      await (prisma[table] as any).deleteMany({
        where: {
          id: {
            in: chunk
          }
        }
      })
    },
    options
  )
}