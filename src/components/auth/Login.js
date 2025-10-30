/**
 * Componente de Login
 */

import { authService } from '../../services/authService.js';
import { notificationService } from '../../services/notificationService.js';
import { appStore } from '../../store/appStore.js';
import { VIEWS } from '../../utils/constants.js';
import {
  $,
  showFieldError,
  clearFieldError,
  setFieldSuccess,
  delay,
} from '../../utils/helpers.js';
import {
  detectInputType,
  validarCPF,
  validateEmail,
  validateUsername,
} from '../../utils/validators.js';

export class Login {
  render() {
    const isBlocked = authService.isAccountBlocked();
    const blockedMessage = isBlocked
      ? `<div style="padding: var(--space-12); background: rgba(var(--color-error-rgb), 0.1); border: 1px solid var(--color-error); border-radius: var(--radius-base); margin-bottom: var(--space-16); color: var(--color-error); font-size: var(--font-size-sm);">⚠ Conta temporariamente bloqueada. Tente novamente em alguns minutos.</div>`
      : '';

    return `
      <div class="login-container">
        <!-- LEFT SIDE: Branding -->
        <div class="login-left">
          <div class="login-left__content">
            <div class="login-left__logo">
              <img src="/imagens/Logo3.PNG" alt="Logo Inwista" class="logo-image" />
            </div>
          </div>
        </div>

        <!-- RIGHT SIDE: Login Form -->
        <div class="login-right">
          <div class="login-right__form">
            <!-- Mobile Logo -->
            <div class="login-mobile-logo">
              <div class="logo-inwista">
                <div class="logo-symbol">S</div>
                <div class="logo-text">Inwista</div>
              </div>
            </div>

            <div class="login-right__header">
              <h2 class="login-right__title">Acesso à Plataforma</h2>
              <p class="login-right__subtitle">Entre com suas credenciais</p>
            </div>

            ${blockedMessage}

            <form id="login-form">
              <div class="form-group">
                <label class="form-label" for="identifier">CPF, E-mail ou Usuário</label>
                <input
                  type="text"
                  id="identifier"
                  class="form-control"
                  placeholder="Digite seu CPF, e-mail ou usuário"
                  required
                  ${isBlocked ? 'disabled' : ''}
                >
              </div>
              <div class="form-group">
                <label class="form-label" for="password">Senha</label>
                <div class="input-with-icon">
                  <input
                    type="password"
                    id="password"
                    class="form-control"
                    placeholder="Digite sua senha"
                    required
                    ${isBlocked ? 'disabled' : ''}
                  >
                  <button type="button" class="toggle-password-btn" id="toggle-password" aria-label="Mostrar senha">
                    <svg id="eye-icon" class="eye-icon" viewBox="0 0 24 24">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                    <svg id="eye-off-icon" class="eye-icon hidden" viewBox="0 0 24 24">
                      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div style="text-align: right; margin-bottom: var(--space-16);">
                <a href="#" id="forgot-password-link" style="font-size: var(--font-size-sm); color: var(--color-primary);">Esqueceu sua senha?</a>
              </div>
              <button
                type="submit"
                class="btn btn--primary btn--full-width"
                id="login-btn"
                style="height: 48px; margin-bottom: var(--space-16);"
                ${isBlocked ? 'disabled' : ''}
              >
                Acessar a plataforma
              </button>
            </form>

            <div class="login-right__divider">Não tem conta?</div>

            <button class="btn btn--outline btn--full-width" id="create-account" style="height: 48px;">Criar conta</button>

            <div class="login-right__footer">
              <div style="margin-bottom: var(--space-8);">
                <a href="#" target="_blank">Políticas de Privacidade</a> •
                <a href="#" target="_blank">Termos e Políticas</a>
              </div>
              <a href="#" style="display: block;">Dúvidas frequentes</a>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  attachEvents() {
    // Check if still blocked
    if (authService.isAccountBlocked()) {
      return;
    }

    const identifierField = $('#identifier');
    const passwordField = $('#password');

    // Real-time validation for identifier
    if (identifierField) {
      identifierField.addEventListener('blur', () => {
        const value = identifierField.value.trim();
        if (!value) return;

        const type = detectInputType(value);
        clearFieldError('identifier');

        if (type === 'cpf') {
          const cpfClean = value.replace(/[^\d]/g, '');
          if (!validarCPF(cpfClean)) {
            showFieldError('identifier', 'CPF inválido. Verifique os dígitos.');
          } else {
            setFieldSuccess('identifier');
          }
        } else if (type === 'email') {
          if (!validateEmail(value)) {
            showFieldError(
              'identifier',
              'E-mail inválido. Use o formato: usuario@dominio.com'
            );
          } else {
            setFieldSuccess('identifier');
          }
        } else if (type === 'username') {
          if (!validateUsername(value)) {
            showFieldError(
              'identifier',
              'Username deve ter pelo menos 3 caracteres'
            );
          } else {
            setFieldSuccess('identifier');
          }
        }
      });

      identifierField.addEventListener('input', () => {
        clearFieldError('identifier');
        identifierField.classList.remove('form-control--success');
      });
    }

    if (passwordField) {
      passwordField.addEventListener('input', () => {
        clearFieldError('password');
      });
    }

    // Password toggle
    const togglePasswordBtn = $('#toggle-password');
    if (togglePasswordBtn) {
      togglePasswordBtn.addEventListener('click', () => {
        this.togglePasswordVisibility();
      });
    }

    // Form submit
    const form = $('#login-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleLogin();
      });
    }
  }

  togglePasswordVisibility() {
    const passwordInput = $('#password');
    const eyeIcon = $('#eye-icon');
    const eyeOffIcon = $('#eye-off-icon');
    const toggleBtn = $('#toggle-password');

    if (!passwordInput || !eyeIcon || !eyeOffIcon || !toggleBtn) return;

    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      eyeIcon.classList.add('hidden');
      eyeOffIcon.classList.remove('hidden');
      toggleBtn.setAttribute('aria-label', 'Ocultar senha');
    } else {
      passwordInput.type = 'password';
      eyeIcon.classList.remove('hidden');
      eyeOffIcon.classList.add('hidden');
      toggleBtn.setAttribute('aria-label', 'Mostrar senha');
    }
  }

  async handleLogin() {
    const identifier = $('#identifier').value.trim();
    const password = $('#password').value.trim();

    // Clear previous errors
    clearFieldError('identifier');
    clearFieldError('password');

    // Validate credentials
    const result = authService.validateCredentials(identifier, password);

    if (!result.success) {
      notificationService.error('Erro no Login', result.error);
      if (result.error.includes('CPF')) {
        showFieldError('identifier', result.error);
      } else if (result.error.includes('Senha')) {
        showFieldError('password', result.error);
      }
      return;
    }

    // Success!
    const loginBtn = $('#login-btn');
    loginBtn.classList.add('btn--loading');
    loginBtn.disabled = true;

    appStore.setCurrentUser(result.user);
    notificationService.success('Login realizado com sucesso!', '');

    await delay(1000);

    appStore.setCurrentView(VIEWS.TWO_FA);
  }
}

export const login = new Login();
