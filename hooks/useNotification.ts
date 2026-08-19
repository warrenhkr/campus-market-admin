'use client'

import { toast } from 'sonner'

export function useNotification() {
  const success = (message: string, description?: string) => {
    toast.success(message, { description })
  }

  const error = (message: string, description?: string) => {
    toast.error(message, { description })
  }

  const loading = (message: string) => {
    toast.loading(message)
  }

  const promise = <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string
      error: string
    },
  ) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    })
  }

  return { success, error, loading, promise }
}
