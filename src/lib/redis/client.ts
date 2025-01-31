import Redis from 'ioredis'

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times: number) => {
    if (times > 3) {
      return null
    }
    return Math.min(times * 50, 2000)
  },
  enableReadyCheck: true,
  lazyConnect: true
})

redis.on('error', (error: Error) => {
  console.error('Redis connection error:', error)
})

redis.on('connect', () => {
  console.info('Redis connected successfully')
})

export const getRedisClient = () => redis