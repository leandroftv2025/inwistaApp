/**
 * Constantes e configurações da aplicação
 */

export const CONFIG = {
  LOGIN: {
    MAX_ATTEMPTS: 3,
    BLOCK_DURATION_MS: 5 * 60 * 1000, // 5 minutos
    MIN_PASSWORD_LENGTH: 4, // TODO: Aumentar para 8 em produção
  },
  VALIDATION: {
    CPF_LENGTH: 11,
    CODE_2FA_LENGTH: 6,
    USERNAME_MIN_LENGTH: 3,
    PASSWORD_MIN_LENGTH: 6,
  },
  NOTIFICATION: {
    DEFAULT_DURATION: 5000, // 5 segundos
    MAX_VISIBLE: 3,
  },
};

export const FEES = {
  pix: 0.0,
  ted: 3.5,
  tef: 2.0,
  crypto_maker: 0.1,
  crypto_taker: 0.2,
};

export const VIEWS = {
  LOGIN: 'login',
  TWO_FA: '2fa',
  DASHBOARD: 'dashboard',
  EXPLORE: 'explore',
  TRANSACTIONS: 'transactions',
  ASSETS: 'assets',
  ADMIN: 'admin',
  SETTINGS: 'settings',
};

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

export const TRANSACTION_STATUS = {
  COMPLETED: 'completed',
  PROCESSING: 'processing',
  FAILED: 'failed',
};

export const ICONS = {
  [NOTIFICATION_TYPES.SUCCESS]: '✓',
  [NOTIFICATION_TYPES.ERROR]: '✕',
  [NOTIFICATION_TYPES.WARNING]: '⚠',
  [NOTIFICATION_TYPES.INFO]: '•',
};
