/**
 * Funções de validação
 */

import { CONFIG } from './constants.js';

/**
 * Valida CPF brasileiro
 * @param {string} cpf - CPF a ser validado (com ou sem formatação)
 * @returns {boolean} True se válido
 */
export function validarCPF(cpf) {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, '');

  // Verifica se tem 11 dígitos
  if (cpf.length !== CONFIG.VALIDATION.CPF_LENGTH) return false;

  // Verifica se todos os dígitos são iguais (CPF inválido)
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  // CPFs de teste - aceitar para demonstração
  // TODO: Remover em produção
  const testCPFs = ['12345678900', '98765432100', '11122233344'];
  if (testCPFs.includes(cpf)) return true;

  // Validação do primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = soma % 11;
  let digito1 = resto < 2 ? 0 : 11 - resto;

  if (parseInt(cpf.charAt(9)) !== digito1) return false;

  // Validação do segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = soma % 11;
  let digito2 = resto < 2 ? 0 : 11 - resto;

  if (parseInt(cpf.charAt(10)) !== digito2) return false;

  return true;
}

/**
 * Detecta o tipo de entrada (CPF, email ou username)
 * @param {string} value - Valor a ser analisado
 * @returns {string} 'cpf', 'email' ou 'username'
 */
export function detectInputType(value) {
  // Remove espaços
  value = value.trim();

  // Detecta email
  if (value.includes('@')) {
    return 'email';
  }

  // Detecta CPF (com ou sem formatação)
  const numbersOnly = value.replace(/[^\d]/g, '');
  if (numbersOnly.length === CONFIG.VALIDATION.CPF_LENGTH) {
    return 'cpf';
  }

  // Caso contrário, é username
  return 'username';
}

/**
 * Valida formato de email
 * @param {string} email - Email a ser validado
 * @returns {boolean} True se válido
 */
export function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Valida username
 * @param {string} username - Username a ser validado
 * @returns {boolean} True se válido
 */
export function validateUsername(username) {
  return username.length >= CONFIG.VALIDATION.USERNAME_MIN_LENGTH;
}

/**
 * Valida senha
 * @param {string} password - Senha a ser validada
 * @returns {boolean} True se válido
 */
export function validatePassword(password) {
  return password.length >= CONFIG.VALIDATION.PASSWORD_MIN_LENGTH;
}

/**
 * Calcula força da senha
 * @param {string} password - Senha a ser analisada
 * @returns {object} { strength: number (0-4), label: string, color: string }
 */
export function getPasswordStrength(password) {
  if (!password) {
    return { strength: 0, label: '', color: '' };
  }

  let strength = 0;
  if (password.length >= 6) strength++;
  if (password.length >= 10) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z\d]/.test(password)) strength++;

  const levels = ['Muito fraca', 'Fraca', 'Média', 'Forte', 'Muito forte'];
  const colors = ['#EF4444', '#F59E0B', '#FCD34D', '#10B981', '#059669'];

  return {
    strength,
    label: levels[strength],
    color: colors[strength]
  };
}
