type LogLevel = 'info' | 'error' | 'warn' | 'debug'

interface Logger {
  info: (message: string, meta?: Record<string, unknown>) => void
  error: (message: string, meta?: Record<string, unknown>) => void
  warn: (message: string, meta?: Record<string, unknown>) => void
  debug: (message: string, meta?: Record<string, unknown>) => void
}

export function createLogger(namespace: string): Logger {
  const log = (level: LogLevel, message: string, meta?: Record<string, unknown>) => {
    const timestamp = new Date().toISOString()
    const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] [${namespace}] ${message}`
    
    switch (level) {
      case 'info':
        console.log(formattedMessage, meta)
        break
      case 'error':
        console.error(formattedMessage, meta)
        break
      case 'warn':
        console.warn(formattedMessage, meta)
        break
      case 'debug':
        if (process.env.NODE_ENV === 'development') {
          console.debug(formattedMessage, meta)
        }
        break
    }
  }

  return {
    info: (message: string, meta?: Record<string, unknown>) => log('info', message, meta),
    error: (message: string, meta?: Record<string, unknown>) => log('error', message, meta),
    warn: (message: string, meta?: Record<string, unknown>) => log('warn', message, meta),
    debug: (message: string, meta?: Record<string, unknown>) => log('debug', message, meta)
  }
}

// デフォルトロガー
export const logger = createLogger('app')