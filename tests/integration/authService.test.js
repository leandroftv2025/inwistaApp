/**
 * Testes de integração para authService
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { authService } from '@services/authService.js';
import { users } from '@data/mockData.js';

describe('AuthService', () => {
  beforeEach(() => {
    // Reset state antes de cada teste
    authService.unblock();
  });

  describe('validateCredentials', () => {
    it('deve validar credenciais corretas com CPF', () => {
      const result = authService.validateCredentials('12345678900', '1234');
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user.nome).toBe('João Silva');
    });

    it('deve validar credenciais corretas com email', () => {
      const result = authService.validateCredentials('joao@inwista.com', '1234');
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
    });

    it('deve validar credenciais corretas com username', () => {
      const result = authService.validateCredentials('joao', '1234');
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
    });

    it('deve rejeitar senha incorreta', () => {
      const result = authService.validateCredentials('12345678900', 'wrong');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Senha incorreta');
    });

    it('deve rejeitar usuário não encontrado', () => {
      const result = authService.validateCredentials('55566677788', '1234');
      expect(result.success).toBe(false);
      expect(result.error).toContain('não encontrado');
    });

    it('deve rejeitar CPF inválido', () => {
      const result = authService.validateCredentials('11111111111', '1234');
      expect(result.success).toBe(false);
      expect(result.error).toContain('CPF inválido');
    });

    it('deve rejeitar campos vazios', () => {
      const result = authService.validateCredentials('', '');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Preencha todos os campos');
    });
  });

  describe('Login attempts blocking', () => {
    it('deve bloquear após 3 tentativas incorretas', () => {
      // Primeira tentativa
      let result = authService.validateCredentials('12345678900', 'wrong1');
      expect(result.success).toBe(false);

      // Segunda tentativa
      result = authService.validateCredentials('12345678900', 'wrong2');
      expect(result.success).toBe(false);

      // Terceira tentativa (deve bloquear)
      result = authService.validateCredentials('12345678900', 'wrong3');
      expect(result.success).toBe(false);
      expect(result.error).toContain('bloqueada');

      // Próxima tentativa deve estar bloqueada
      result = authService.validateCredentials('12345678900', '1234');
      expect(result.success).toBe(false);
      expect(result.error).toContain('bloqueada');
    });

    it('deve resetar tentativas após login bem-sucedido', () => {
      // Tentativa incorreta
      authService.validateCredentials('12345678900', 'wrong');

      // Login bem-sucedido
      const result = authService.validateCredentials('12345678900', '1234');
      expect(result.success).toBe(true);

      // Tentativas devem estar resetadas
      expect(authService.loginAttempts).toBe(0);
    });
  });

  describe('verify2FA', () => {
    it('deve aceitar código correto', () => {
      expect(authService.verify2FA('123456')).toBe(true);
    });

    it('deve rejeitar código incorreto', () => {
      expect(authService.verify2FA('000000')).toBe(false);
      expect(authService.verify2FA('wrong')).toBe(false);
    });
  });

  describe('registerUser', () => {
    it('deve registrar novo usuário com dados válidos', () => {
      const userData = {
        nome: 'Novo Usuário',
        cpf: '12312312312',
        email: 'novo@test.com',
        phone: '11999999999',
        password: 'senha123',
        confirmPassword: 'senha123',
      };

      const result = authService.registerUser(userData);
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user.nome).toBe('Novo Usuário');
    });

    it('deve rejeitar CPF inválido', () => {
      const userData = {
        nome: 'Teste',
        cpf: '11111111111',
        email: 'test@test.com',
        phone: '11999999999',
        password: 'senha123',
        confirmPassword: 'senha123',
      };

      const result = authService.registerUser(userData);
      expect(result.success).toBe(false);
      expect(result.error).toContain('CPF inválido');
    });

    it('deve rejeitar senhas diferentes', () => {
      const userData = {
        nome: 'Teste',
        cpf: '12312312312',
        email: 'test@test.com',
        phone: '11999999999',
        password: 'senha123',
        confirmPassword: 'senha456',
      };

      const result = authService.registerUser(userData);
      expect(result.success).toBe(false);
      expect(result.error).toContain('não coincidem');
    });

    it('deve rejeitar senha curta', () => {
      const userData = {
        nome: 'Teste',
        cpf: '12312312312',
        email: 'test@test.com',
        phone: '11999999999',
        password: '123',
        confirmPassword: '123',
      };

      const result = authService.registerUser(userData);
      expect(result.success).toBe(false);
      expect(result.error).toContain('pelo menos');
    });
  });

  describe('resetPassword', () => {
    it('deve aceitar senhas válidas e iguais', () => {
      const result = authService.resetPassword('novaSenha123', 'novaSenha123');
      expect(result.success).toBe(true);
    });

    it('deve rejeitar senhas diferentes', () => {
      const result = authService.resetPassword('senha1', 'senha2');
      expect(result.success).toBe(false);
      expect(result.error).toContain('não coincidem');
    });

    it('deve rejeitar senha curta', () => {
      const result = authService.resetPassword('123', '123');
      expect(result.success).toBe(false);
      expect(result.error).toContain('pelo menos');
    });

    it('deve rejeitar campos vazios', () => {
      const result = authService.resetPassword('', '');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Preencha todos os campos');
    });
  });
});
