'use client'

import React from 'react'

interface StatusBadgeProps {
  status: string
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
}

const statusColors: Record<string, Record<string, string>> = {
  default: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-300',
  },
  success: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-300',
  },
  warning: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-300',
  },
  danger: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-300',
  },
  info: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300',
  },
}

const sizeClasses: Record<string, string> = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
}

export function StatusBadge({
  status,
  variant = 'default',
  size = 'md',
}: StatusBadgeProps) {
  const colors = statusColors[variant]

  return (
    <span
      className={`inline-block rounded-full font-semibold border ${sizeClasses[size]} ${colors.bg} ${colors.text} ${colors.border}`}
    >
      {status}
    </span>
  )
}

// Helper function to determine status variant
export function getStatusVariant(status: string): 'success' | 'warning' | 'danger' | 'info' | 'default' {
  const normalizedStatus = String(status).toUpperCase()

  if (['COMPLETED', 'DELIVERED', 'APPROVED', 'ACTIVE', 'VERIFIED'].includes(normalizedStatus)) {
    return 'success'
  }
  if (['PENDING', 'IN_PROGRESS', 'PROCESSING'].includes(normalizedStatus)) {
    return 'warning'
  }
  if (['FAILED', 'REJECTED', 'CANCELLED', 'SUSPENDED', 'EXPIRED'].includes(normalizedStatus)) {
    return 'danger'
  }
  if (['INFO', 'INFO_NOTICE'].includes(normalizedStatus)) {
    return 'info'
  }

  return 'default'
}
