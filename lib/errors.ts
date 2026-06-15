// Custom error classes
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTHENTICATION_ERROR', 401)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 'AUTHORIZATION_ERROR', 403)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409)
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter: number = 60) {
    super(`Too many requests. Retry after ${retryAfter}s`, 'RATE_LIMIT', 429)
    this.name = 'RateLimitError'
  }
}

// Error response builder
export interface ErrorResponse {
  error: {
    message: string
    code: string
    statusCode: number
  }
}

export function errorResponse(error: Error): ErrorResponse {
  if (error instanceof AppError) {
    return {
      error: {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
      },
    }
  }

  return {
    error: {
      message: error.message || 'Internal server error',
      code: 'INTERNAL_ERROR',
      statusCode: 500,
    },
  }
}

// Success response builder
export function successResponse<T>(data: T, message?: string) {
  return {
    data,
    ...(message && { message }),
  }
}
