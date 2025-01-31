type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface Logger {
  info: (message: string, ...args: any[]) => void
  warn: (message: string, ...args: any[]) => void
  error: (message: string, ...args: any[]) => void
  debug: (message: string, ...args: any[]) => void
}

class ConsoleLogger implements Logger {
  private context: string

  constructor(context: string) {
    this.context = context
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString()
    return `[${timestamp}] [${level.toUpperCase()}] [${this.context}] ${message}`
  }

  info(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV !== 'test') {
      console.info(this.formatMessage('info', message), ...args)
    }
  }

  warn(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(this.formatMessage('warn', message), ...args)
    }
  }

  error(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV !== 'test') {
      console.error(this.formatMessage('error', message), ...args)
    }
  }

  debug(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('debug', message), ...args)
    }
  }
}

export function createLogger(context: string): Logger {
  return new ConsoleLogger(context)
}