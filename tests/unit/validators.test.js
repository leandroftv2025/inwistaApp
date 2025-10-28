/**
 * Testes unitários para validators
 */

import { describe, it, expect } from 'vitest';
import {
  validarCPF,
  detectInputType,
  validateEmail,
  validateUsername,
  validatePassword,
  getPasswordStrength,
} from '@utils/validators.js';

describe('validarCPF', () => {
  describe('CPFs válidos', () => {
    it('deve validar CPF de teste 12345678900', () => {
      expect(validarCPF('12345678900')).toBe(true);
    });

    it('deve validar CPF de teste 98765432100', () => {
      expect(validarCPF('98765432100')).toBe(true);
    });

    it('deve validar CPF de teste 11122233344', () => {
      expect(validarCPF('11122233344')).toBe(true);
    });

    it('deve validar CPF formatado', () => {
      expect(validarCPF('123.456.789-00')).toBe(true);
    });

    it('deve validar CPF com espaços', () => {
      expect(validarCPF('123 456 789 00')).toBe(true);
    });
  });

  describe('CPFs inválidos', () => {
    it('deve rejeitar CPF com menos de 11 dígitos', () => {
      expect(validarCPF('123456789')).toBe(false);
    });

    it('deve rejeitar CPF com mais de 11 dígitos', () => {
      expect(validarCPF('123456789000')).toBe(false);
    });

    it('deve rejeitar CPF com todos dígitos iguais', () => {
      expect(validarCPF('11111111111')).toBe(false);
      expect(validarCPF('00000000000')).toBe(false);
      expect(validarCPF('99999999999')).toBe(false);
    });

    it('deve rejeitar CPF vazio', () => {
      expect(validarCPF('')).toBe(false);
    });

    it('deve rejeitar string não numérica', () => {
      expect(validarCPF('abcdefghijk')).toBe(false);
    });
  });
});

describe('detectInputType', () => {
  it('deve detectar email', () => {
    expect(detectInputType('usuario@email.com')).toBe('email');
    expect(detectInputType('test@example.org')).toBe('email');
  });

  it('deve detectar CPF', () => {
    expect(detectInputType('12345678900')).toBe('cpf');
    expect(detectInputType('123.456.789-00')).toBe('cpf');
  });

  it('deve detectar username', () => {
    expect(detectInputType('joao')).toBe('username');
    expect(detectInputType('maria_silva')).toBe('username');
    expect(detectInputType('user123')).toBe('username');
  });

  it('deve remover espaços antes de detectar', () => {
    expect(detectInputType('  usuario@email.com  ')).toBe('email');
    expect(detectInputType('  12345678900  ')).toBe('cpf');
  });
});

describe('validateEmail', () => {
  describe('emails válidos', () => {
    it('deve validar email simples', () => {
      expect(validateEmail('test@example.com')).toBe(true);
    });

    it('deve validar email com subdomínio', () => {
      expect(validateEmail('user@mail.example.com')).toBe(true);
    });

    it('deve validar email com números', () => {
      expect(validateEmail('user123@test.com')).toBe(true);
    });

    it('deve validar email com ponto no nome', () => {
      expect(validateEmail('first.last@example.com')).toBe(true);
    });
  });

  describe('emails inválidos', () => {
    it('deve rejeitar email sem @', () => {
      expect(validateEmail('invalid.email.com')).toBe(false);
    });

    it('deve rejeitar email sem domínio', () => {
      expect(validateEmail('user@')).toBe(false);
    });

    it('deve rejeitar email sem nome', () => {
      expect(validateEmail('@example.com')).toBe(false);
    });

    it('deve rejeitar email com espaços', () => {
      expect(validateEmail('user @example.com')).toBe(false);
    });

    it('deve rejeitar email vazio', () => {
      expect(validateEmail('')).toBe(false);
    });
  });
});

describe('validateUsername', () => {
  it('deve validar username com 3 caracteres', () => {
    expect(validateUsername('abc')).toBe(true);
  });

  it('deve validar username com mais de 3 caracteres', () => {
    expect(validateUsername('joao')).toBe(true);
    expect(validateUsername('maria_silva')).toBe(true);
  });

  it('deve rejeitar username com menos de 3 caracteres', () => {
    expect(validateUsername('ab')).toBe(false);
    expect(validateUsername('a')).toBe(false);
  });

  it('deve rejeitar username vazio', () => {
    expect(validateUsername('')).toBe(false);
  });
});

describe('validatePassword', () => {
  it('deve validar senha com 6 caracteres', () => {
    expect(validatePassword('123456')).toBe(true);
  });

  it('deve validar senha com mais de 6 caracteres', () => {
    expect(validatePassword('senhaSegura123')).toBe(true);
  });

  it('deve rejeitar senha com menos de 6 caracteres', () => {
    expect(validatePassword('12345')).toBe(false);
    expect(validatePassword('abc')).toBe(false);
  });

  it('deve rejeitar senha vazia', () => {
    expect(validatePassword('')).toBe(false);
  });
});

describe('getPasswordStrength', () => {
  it('deve retornar vazio para senha vazia', () => {
    const result = getPasswordStrength('');
    expect(result.label).toBe('');
    expect(result.strength).toBe(0);
  });

  it('deve retornar "Muito fraca" para senha curta', () => {
    const result = getPasswordStrength('123');
    expect(result.label).toBe('Muito fraca');
    expect(result.strength).toBe(0);
  });

  it('deve retornar "Fraca" para senha de 6 caracteres', () => {
    const result = getPasswordStrength('123456');
    expect(result.label).toBe('Fraca');
    expect(result.strength).toBe(1);
  });

  it('deve retornar "Média" para senha com 10+ caracteres', () => {
    const result = getPasswordStrength('1234567890');
    expect(result.label).toBe('Média');
    expect(result.strength).toBe(2);
  });

  it('deve retornar "Forte" para senha com maiúsculas, minúsculas e números', () => {
    const result = getPasswordStrength('Senha123abc');
    expect(result.label).toBe('Forte');
    expect(result.strength).toBe(3);
  });

  it('deve retornar "Muito forte" para senha complexa', () => {
    const result = getPasswordStrength('Senha123!@#');
    expect(result.label).toBe('Muito forte');
    expect(result.strength).toBe(4);
  });

  it('deve retornar cor apropriada', () => {
    expect(getPasswordStrength('123').color).toBe('#EF4444');
    expect(getPasswordStrength('123456').color).toBe('#F59E0B');
    expect(getPasswordStrength('Senha123!@#').color).toBe('#059669');
  });
});
