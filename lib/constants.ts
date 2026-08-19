// Configuration et constantes du panel admin

export const ADMIN_CONFIG = {
  PAGINATION: {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    LIMITS: [10, 20, 50, 100],
  },
  EXPORT: {
    MAX_RECORDS: 10000,
    FORMATS: ['csv', 'json'],
  },
  TABLES: {
    DEFAULT_PAGE_SIZE: 20,
    MIN_PAGE_SIZE: 1,
    MAX_PAGE_SIZE: 100,
  },
  SEARCH: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 255,
    DEBOUNCE_MS: 300,
  },
  TOAST: {
    DURATION: 3000,
    POSITION: 'top-right',
  },
} as const

export const API_ENDPOINTS = {
  USERS: '/api/admin/users',
  SELLERS: '/api/admin/sellers',
  PRODUCTS: '/api/admin/products',
  ORDERS: '/api/admin/orders',
  PAYMENTS: '/api/admin/payments',
  REPORTS: '/api/admin/reports',
  SUPPORT: '/api/admin/support',
} as const

export const ROUTES = {
  ADMIN: '/admin',
  DASHBOARD: '/admin/dashboard',
  USERS: '/admin/users',
  SELLERS: '/admin/vendors',
  SHOPS: '/admin/shops',
  PRODUCTS: '/admin/products',
  ORDERS: '/admin/orders',
  PAYMENTS: '/admin/payments',
  SUBSCRIPTIONS: '/admin/subscriptions',
  SUPPORT: '/admin/support',
  REPORTS: '/admin/reports',
  REVIEWS: '/admin/reviews',
  LOGS: '/admin/logs',
  SETTINGS: '/admin/settings',
  ALERTS: '/admin/alerts',
  CATEGORIES: '/admin/catalog',
  ANALYTICS: '/admin/analytics',
  FINANCE: '/admin/finance',
  NOTIFICATIONS: '/admin/notifications',
} as const

export const NAVIGATION_LINKS = [
  { href: ROUTES.DASHBOARD, label: 'Dashboard', icon: 'D', category: 'main' },
  { href: ROUTES.USERS, label: 'Users', icon: 'U', category: 'management' },
  { href: ROUTES.SELLERS, label: 'Sellers', icon: 'S', category: 'management' },
  { href: ROUTES.SHOPS, label: 'Shops', icon: 'B', category: 'management' },
  { href: ROUTES.PRODUCTS, label: 'Products', icon: 'P', category: 'management' },
  { href: ROUTES.ORDERS, label: 'Orders', icon: 'O', category: 'operations' },
  { href: ROUTES.PAYMENTS, label: 'Payments', icon: '$', category: 'operations' },
  { href: ROUTES.SUBSCRIPTIONS, label: 'Subscriptions', icon: 'A', category: 'operations' },
  { href: ROUTES.ANALYTICS, label: 'Analytics', icon: '%', category: 'reporting' },
  { href: ROUTES.REPORTS, label: 'Reports', icon: 'R', category: 'moderation' },
  { href: ROUTES.REVIEWS, label: 'Reviews', icon: '*', category: 'moderation' },
  { href: ROUTES.ALERTS, label: 'Alertes', icon: '!', category: 'moderation' },
  { href: ROUTES.SUPPORT, label: 'Support', icon: '?', category: 'support' },
  { href: ROUTES.CATEGORIES, label: 'Categories', icon: 'C', category: 'catalog' },
  { href: ROUTES.LOGS, label: 'Logs', icon: 'L', category: 'audit' },
  { href: ROUTES.SETTINGS, label: 'Settings', icon: '=', category: 'settings' },
] as const

export const ADMIN_PERMISSIONS = {
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  PRODUCT_APPROVE: 'product:approve',
  PRODUCT_DELETE: 'product:delete',
  ORDER_UPDATE: 'order:update',
  PAYMENT_REFUND: 'payment:refund',
  REPORT_RESOLVE: 'report:resolve',
} as const

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Vous n\'êtes pas autorisé à effectuer cette action',
  NOT_FOUND: 'Ressource non trouvée',
  VALIDATION_ERROR: 'Erreur de validation',
  SERVER_ERROR: 'Erreur serveur. Veuillez réessayer.',
  NETWORK_ERROR: 'Erreur réseau. Vérifiez votre connexion.',
} as const

export const SUCCESS_MESSAGES = {
  CREATED: 'Créé avec succès',
  UPDATED: 'Mis à jour avec succès',
  DELETED: 'Supprimé avec succès',
  APPROVED: 'Approuvé avec succès',
  REJECTED: 'Rejeté avec succès',
} as const
