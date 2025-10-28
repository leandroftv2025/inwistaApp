/**
 * Componente de Autenticação 2FA
 */

import { authService } from '../../services/authService.js';
import { notificationService } from '../../services/notificationService.js';
import { appStore } from '../../store/appStore.js';
import { VIEWS } from '../../utils/constants.js';
import { $, delay } from '../../utils/helpers.js';

export class TwoFactor {
  render() {
    return `
      <div class="full-height">
        <div class="centered" style="max-width:380px;width:100%;">
          <h2 class="mb-8" style="text-align:center;">Verificação 2FA</h2>
          <p class="mb-16" style="text-align:center;">Insira o código de 6 dígitos enviado para você</p>
          <form id="code-form">
            <div class="form-group">
              <input
                type="text"
                maxlength="6"
                class="form-control"
                id="code"
                placeholder="123456"
                required
              >
            </div>
            <button type="submit" class="btn btn--primary btn--full-width">Verificar código</button>
          </form>
          <div class="mt-8" style="font-size:var(--font-size-sm);text-align:center;">
            <button class="btn btn--sm btn--outline" id="resend">Enviar por SMS</button>
            <button class="btn btn--sm btn--outline" id="resend-email">Enviar por Email</button>
            <span id="timer" class="ml-8">60s</span>
          </div>
        </div>
      </div>
    `;
  }

  attachEvents() {
    // Timer countdown
    let seconds = 60;
    const timerEl = $('#timer');
    const interval = setInterval(() => {
      seconds--;
      if (timerEl) timerEl.textContent = seconds + 's';
      if (seconds <= 0) clearInterval(interval);
    }, 1000);

    // Form submit
    const form = $('#code-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = $('#code').value.trim();

        if (authService.verify2FA(code)) {
          notificationService.success(
            'Código verificado!',
            'Redirecionando para o dashboard...'
          );

          await delay(1000);
          appStore.setCurrentView(VIEWS.DASHBOARD);
        } else {
          notificationService.error(
            'Código Inválido',
            'O código inserido não é válido. Tente novamente.'
          );
        }
      });
    }

    // Resend buttons
    const resendBtn = $('#resend');
    const resendEmailBtn = $('#resend-email');

    if (resendBtn) {
      resendBtn.addEventListener('click', () => {
        seconds = 60;
        notificationService.success('Código Reenviado', 'Um novo código foi enviado por SMS.');
      });
    }

    if (resendEmailBtn) {
      resendEmailBtn.addEventListener('click', () => {
        seconds = 60;
        notificationService.success('Código Reenviado', 'Um novo código foi enviado por e-mail.');
      });
    }
  }
}

export const twoFactor = new TwoFactor();
