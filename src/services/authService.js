/**
 * Serviço de autenticação
 */

import { users } from '../data/mockData.js';
import {
  validarCPF,
  validateEmail,
  validateUsername,
  detectInputType,
} from '../utils/validators.js';
import { CONFIG } from '../utils/constants.js';
import { notificationService } from './notificationService.js';

class AuthService {
  constructor() {
    this.loginAttempts = 0;
    this.isBlocked = false;
    this.blockUntil = null;
  }

  /**
   * Verifica se a conta está bloqueada
   * @returns {boolean} True se bloqueada
   */
  isAccountBlocked() {
    if (this.isBlocked && this.blockUntil) {
      if (Date.now() < this.blockUntil) {
        return true;
      } else {
        // Desbloquear
        this.unblock();
        return false;
      }
    }
    return false;
  }

  /**
   * Bloqueia a conta temporariamente
   */
  block() {
    this.isBlocked = true;
    this.blockUntil = Date.now() + CONFIG.LOGIN.BLOCK_DURATION_MS;
  }

  /**
   * Desbloqueia a conta
   */
  unblock() {
    this.isBlocked = false;
    this.blockUntil = null;
    this.loginAttempts = 0;
  }

  /**
   * Valida credenciais de login
   * @param {string} identifier - CPF, email ou username
   * @param {string} password - Senha
   * @returns {object} { success: boolean, user?: object, error?: string }
   */
  validateCredentials(identifier, password) {
    // Verifica se está bloqueado
    if (this.isAccountBlocked()) {
      return {
        success: false,
        error: 'Conta temporariamente bloqueada. Aguarde alguns minutos.',
      };
    }

    // Validações básicas
    if (!identifier || !password) {
      return {
        success: false,
        error: 'Preencha todos os campos',
      };
    }

    // Detecta tipo de entrada
    const type = detectInputType(identifier);
    let user = null;

    // Valida formato
    if (type === 'cpf') {
      const cpfClean = identifier.replace(/[^\d]/g, '');
      if (!validarCPF(cpfClean)) {
        return {
          success: false,
          error: 'CPF inválido',
        };
      }
      user = users.find((u) => u.cpf === cpfClean);
    } else if (type === 'email') {
      if (!validateEmail(identifier)) {
        return {
          success: false,
          error: 'E-mail inválido',
        };
      }
      user = users.find((u) => u.email === identifier);
    } else if (type === 'username') {
      if (!validateUsername(identifier)) {
        return {
          success: false,
          error: 'Username inválido',
        };
      }
      user = users.find((u) => u.username === identifier);
    }

    // Usuário não encontrado
    if (!user) {
      this.loginAttempts++;
      this.checkLoginAttempts();
      return {
        success: false,
        error: `${type === 'cpf' ? 'CPF' : type === 'email' ? 'E-mail' : 'Usuário'} não encontrado`,
      };
    }

    // Valida senha (TODO: usar hash em produção)
    if (user.senha !== password) {
      this.loginAttempts++;

      if (this.loginAttempts >= CONFIG.LOGIN.MAX_ATTEMPTS) {
        this.block();
        return {
          success: false,
          error: `Após ${CONFIG.LOGIN.MAX_ATTEMPTS} tentativas incorretas, sua conta foi bloqueada por ${CONFIG.LOGIN.BLOCK_DURATION_MS / 60000} minutos.`,
        };
      }

      const remaining = CONFIG.LOGIN.MAX_ATTEMPTS - this.loginAttempts;
      return {
        success: false,
        error: `Senha incorreta. Você tem mais ${remaining} tentativa(s).`,
      };
    }

    // Login bem-sucedido
    this.loginAttempts = 0;
    return {
      success: true,
      user: { ...user },
    };
  }

  /**
   * Verifica quantidade de tentativas de login
   */
  checkLoginAttempts() {
    if (this.loginAttempts >= CONFIG.LOGIN.MAX_ATTEMPTS) {
      this.block();
    }
  }

  /**
   * Verifica código 2FA
   * @param {string} code - Código de 6 dígitos
   * @returns {boolean} True se válido
   */
  verify2FA(code) {
    // TODO: Implementar 2FA real com TOTP
    return code === '123456';
  }

  /**
   * Envia código de recuperação de senha
   * @param {string} identifier - CPF ou email
   * @returns {object} { success: boolean, message: string }
   */
  sendRecoveryCode(identifier) {
    // TODO: Implementar envio real de código
    console.log('Código de recuperação enviado para:', identifier);
    return {
      success: true,
      message: 'Código enviado com sucesso',
    };
  }

  /**
   * Verifica código de recuperação
   * @param {string} code - Código de verificação
   * @returns {boolean} True se válido
   */
  verifyRecoveryCode(code) {
    // TODO: Implementar verificação real
    return code === '123456';
  }

  /**
   * Redefine senha
   * @param {string} newPassword - Nova senha
   * @param {string} confirmPassword - Confirmação da senha
   * @returns {object} { success: boolean, error?: string }
   */
  resetPassword(newPassword, confirmPassword) {
    if (!newPassword || !confirmPassword) {
      return {
        success: false,
        error: 'Preencha todos os campos',
      };
    }

    if (newPassword !== confirmPassword) {
      return {
        success: false,
        error: 'As senhas não coincidem',
      };
    }

    if (newPassword.length < CONFIG.VALIDATION.PASSWORD_MIN_LENGTH) {
      return {
        success: false,
        error: `A senha deve ter pelo menos ${CONFIG.VALIDATION.PASSWORD_MIN_LENGTH} caracteres`,
      };
    }

    // TODO: Implementar atualização real no backend
    return {
      success: true,
    };
  }

  /**
   * Registra novo usuário
   * @param {object} userData - Dados do usuário
   * @returns {object} { success: boolean, user?: object, error?: string }
   */
  registerUser(userData) {
    const { nome, cpf, email, phone, password, confirmPassword } = userData;

    // Validações
    if (!nome || !cpf || !email || !phone || !password || !confirmPassword) {
      return {
        success: false,
        error: 'Preencha todos os campos',
      };
    }

    const cpfClean = cpf.replace(/[^\d]/g, '');
    if (!validarCPF(cpfClean)) {
      return {
        success: false,
        error: 'CPF inválido',
      };
    }

    if (!validateEmail(email)) {
      return {
        success: false,
        error: 'E-mail inválido',
      };
    }

    if (password !== confirmPassword) {
      return {
        success: false,
        error: 'As senhas não coincidem',
      };
    }

    if (password.length < CONFIG.VALIDATION.PASSWORD_MIN_LENGTH) {
      return {
        success: false,
        error: `A senha deve ter pelo menos ${CONFIG.VALIDATION.PASSWORD_MIN_LENGTH} caracteres`,
      };
    }

    // Verifica se CPF ou email já existem
    if (users.find((u) => u.cpf === cpfClean)) {
      return {
        success: false,
        error: 'CPF já cadastrado',
      };
    }

    if (users.find((u) => u.email === email)) {
      return {
        success: false,
        error: 'E-mail já cadastrado',
      };
    }

    // Cria novo usuário
    const newUser = {
      id: `user-${Date.now()}`,
      nome,
      cpf: cpfClean,
      email,
      phone,
      username: email.split('@')[0],
      senha: password, // TODO: Hash em produção
      role: 'user',
      saldo_brl: 0.0,
      saldo_usd: 0.0,
      createdAt: new Date().toISOString(),
    };

    // Adiciona aos usuários (em produção, salvar no backend)
    users.push(newUser);

    return {
      success: true,
      user: newUser,
    };
  }

  /**
   * Simula envio de email de boas-vindas
   * @param {object} user - Dados do usuário
   */
  sendWelcomeEmail(user) {
    console.log('=== E-MAIL DE BOAS-VINDAS ===');
    console.log(`Para: ${user.email}`);
    console.log(`Assunto: Bem-vindo ao Inwista!`);
    console.log(`\nOlá ${user.nome},\n`);
    console.log('Sua conta foi criada com sucesso!');
    console.log('\nSuas credenciais de acesso:');
    console.log(`CPF: ${user.cpf}`);
    console.log(`E-mail: ${user.email}`);
    console.log('\nAcesse: https://inwista.com/login');
    console.log('============================');
  }
}

// Exporta instância única (singleton)
export const authService = new AuthService();
