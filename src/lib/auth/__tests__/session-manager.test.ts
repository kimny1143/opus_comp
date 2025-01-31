import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals'
import { sessionManager } from '../session-manager'
import { getMockRedisClient, resetMockRedis } from '../../test/redis-mock'

// RedisClientのモック化
jest.mock('../../redis/client', () => ({
  getRedisClient: () => getMockRedisClient()
}))

describe('SessionManager', () => {
  beforeEach(() => {
    resetMockRedis()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('create', () => {
    it('新しいセッションを作成できること', async () => {
      const params = {
        userId: 'user123',
        role: 'USER'
      }

      const session = await sessionManager.create(params)

      expect(session).toMatchObject({
        userId: params.userId,
        role: params.role
      })
      expect(session.id).toBeDefined()
      expect(session.createdAt).toBeInstanceOf(Date)
      expect(session.expiresAt).toBeInstanceOf(Date)
    })

    it('Redisにセッションが保存されること', async () => {
      const params = {
        userId: 'user123',
        role: 'USER'
      }

      const session = await sessionManager.create(params)
      const redis = getMockRedisClient()
      const stored = await redis.get(`session:${session.id}`)

      expect(stored).toBeDefined()
      expect(JSON.parse(stored!)).toMatchObject({
        userId: params.userId,
        role: params.role
      })
    })
  })

  describe('get', () => {
    it('存在するセッションを取得できること', async () => {
      const params = {
        userId: 'user123',
        role: 'USER'
      }

      const created = await sessionManager.create(params)
      const retrieved = await sessionManager.get(created.id)

      expect(retrieved).toMatchObject({
        id: created.id,
        userId: params.userId,
        role: params.role
      })
    })

    it('存在しないセッションはnullを返すこと', async () => {
      const retrieved = await sessionManager.get('non-existent-id')
      expect(retrieved).toBeNull()
    })

    it('有効期限切れのセッションはnullを返すこと', async () => {
      const params = {
        userId: 'user123',
        role: 'USER'
      }

      const session = await sessionManager.create(params)
      const redis = getMockRedisClient()
      
      // 有効期限を過去の日時に設定
      const expiredSession = {
        ...session,
        expiresAt: new Date(Date.now() - 1000)
      }
      await redis.setex(
        `session:${session.id}`,
        3600,
        JSON.stringify(expiredSession)
      )

      const retrieved = await sessionManager.get(session.id)
      expect(retrieved).toBeNull()
    })
  })

  describe('destroy', () => {
    it('セッションを削除できること', async () => {
      const params = {
        userId: 'user123',
        role: 'USER'
      }

      const session = await sessionManager.create(params)
      const result = await sessionManager.destroy(session.id)
      expect(result).toBe(true)

      const retrieved = await sessionManager.get(session.id)
      expect(retrieved).toBeNull()
    })

    it('存在しないセッションの削除はfalseを返すこと', async () => {
      const result = await sessionManager.destroy('non-existent-id')
      expect(result).toBe(false)
    })
  })

  describe('refresh', () => {
    it('セッションの有効期限を更新できること', async () => {
      const params = {
        userId: 'user123',
        role: 'USER'
      }

      const session = await sessionManager.create(params)
      const originalExpiry = session.expiresAt

      // 少し待ってからリフレッシュ
      await new Promise(resolve => setTimeout(resolve, 100))

      const refreshed = await sessionManager.refresh(session.id)
      expect(refreshed).toBeDefined()
      expect(refreshed!.expiresAt.getTime()).toBeGreaterThan(originalExpiry.getTime())
    })

    it('存在しないセッションのリフレッシュはnullを返すこと', async () => {
      const refreshed = await sessionManager.refresh('non-existent-id')
      expect(refreshed).toBeNull()
    })
  })

  describe('エラーハンドリング', () => {
    it('Redisエラー時にセッション作成は失敗すること', async () => {
      const redis = getMockRedisClient()
      jest.spyOn(redis, 'setex').mockRejectedValueOnce(new Error('Redis error'))

      const params = {
        userId: 'user123',
        role: 'USER'
      }

      await expect(sessionManager.create(params)).rejects.toThrow('セッションの作成に失敗しました')
    })

    it('Redisエラー時にセッション取得はnullを返すこと', async () => {
      const redis = getMockRedisClient()
      jest.spyOn(redis, 'get').mockRejectedValueOnce(new Error('Redis error'))

      const result = await sessionManager.get('some-id')
      expect(result).toBeNull()
    })
  })
})