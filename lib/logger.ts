type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  level: LogLevel
  timestamp: string
  message: string
  data?: unknown
  error?: Error
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private log(level: LogLevel, message: string, data?: unknown, error?: Error) {
    const entry: LogEntry = {
      level,
      timestamp: new Date().toISOString(),
      message,
      ...(data && { data }),
      ...(error && { error: { message: error.message, stack: error.stack } }),
    }

    // Console output
    const logMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log

    if (this.isDevelopment) {
      logMethod(`[${level.toUpperCase()}] ${message}`, data || error || '')
    } else {
      // Production: structured logging
      logMethod(JSON.stringify(entry))
    }
  }

  info(message: string, data?: unknown) {
    this.log('info', message, data)
  }

  warn(message: string, data?: unknown) {
    this.log('warn', message, data)
  }

  error(message: string, error?: Error, data?: unknown) {
    this.log('error', message, data, error)
  }

  debug(message: string, data?: unknown) {
    if (this.isDevelopment) {
      this.log('debug', message, data)
    }
  }
}

export const logger = new Logger()

// Action-specific logging
export interface AdminActionLog {
  adminId: string
  action: string
  resourceType: string
  resourceId: string
  changes: Record<string, unknown>
  success: boolean
  errorMessage?: string
}

export function logAdminAction(log: AdminActionLog) {
  logger.info('Admin action performed', {
    adminId: log.adminId,
    action: log.action,
    resourceType: log.resourceType,
    resourceId: log.resourceId,
    success: log.success,
    ...(log.errorMessage && { error: log.errorMessage }),
  })
}
