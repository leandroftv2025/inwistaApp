/**
 * Serviço de notificações (Toast)
 */

import { CONFIG, NOTIFICATION_TYPES, ICONS } from '../utils/constants.js';

class NotificationService {
  constructor() {
    this.container = null;
  }

  /**
   * Inicializa o container de notificações
   */
  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'notification-toast-container';
      this.container.setAttribute('aria-live', 'polite');
      this.container.setAttribute('aria-atomic', 'true');
      document.body.appendChild(this.container);
    }
    return this.container;
  }

  /**
   * Mostra uma notificação toast
   * @param {string} type - Tipo da notificação (success, error, warning, info)
   * @param {string} title - Título da notificação
   * @param {string} message - Mensagem da notificação
   * @param {number} duration - Duração em ms (0 = permanente)
   */
  show(type, title, message = '', duration = CONFIG.NOTIFICATION.DEFAULT_DURATION) {
    const container = this.init();

    const toast = document.createElement('div');
    toast.className = `notification-toast notification-toast--${type}`;
    toast.setAttribute('role', 'alert');

    toast.innerHTML = `
      <div class="notification-toast__icon" aria-hidden="true">${ICONS[type] || '•'}</div>
      <div class="notification-toast__content">
        <div class="notification-toast__title">${title}</div>
        ${message ? `<div class="notification-toast__message">${message}</div>` : ''}
      </div>
      <button class="notification-toast__close" aria-label="Fechar notificação">×</button>
    `;

    // Limitar notificações visíveis
    if (container.children.length >= CONFIG.NOTIFICATION.MAX_VISIBLE) {
      this.remove(container.firstChild);
    }

    container.appendChild(toast);

    // Close button
    const closeBtn = toast.querySelector('.notification-toast__close');
    closeBtn.addEventListener('click', () => {
      this.remove(toast);
    });

    // Auto remove
    if (duration > 0) {
      setTimeout(() => {
        this.remove(toast);
      }, duration);
    }

    return toast;
  }

  /**
   * Remove uma notificação
   * @param {HTMLElement} toast - Elemento toast a ser removido
   */
  remove(toast) {
    if (!toast || !toast.parentNode) return;

    toast.style.animation = 'slideInFromTop 0.3s var(--ease-standard) reverse';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

  /**
   * Métodos de conveniência
   */
  success(title, message, duration) {
    return this.show(NOTIFICATION_TYPES.SUCCESS, title, message, duration);
  }

  error(title, message, duration) {
    return this.show(NOTIFICATION_TYPES.ERROR, title, message, duration);
  }

  warning(title, message, duration) {
    return this.show(NOTIFICATION_TYPES.WARNING, title, message, duration);
  }

  info(title, message, duration) {
    return this.show(NOTIFICATION_TYPES.INFO, title, message, duration);
  }
}

// Exporta instância única (singleton)
export const notificationService = new NotificationService();
