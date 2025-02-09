// MVPではRedisを使用しないため、このファイルは不要です。
// セッション管理はnext-authのデフォルト実装を使用します。

export const getRedisClient = async () => {
  throw new Error('Redis is not supported in MVP')
}

export const closeRedisConnection = async () => {
  // no-op
}