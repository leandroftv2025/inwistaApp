/**
 * Testes unitários para formatters
 */

import { describe, it, expect } from 'vitest';
import {
  formatBRL,
  formatUSD,
  formatDate,
  formatCPF,
  formatPhone,
} from '@utils/formatters.js';

describe('formatBRL', () => {
  it('deve formatar valor inteiro', () => {
    expect(formatBRL(1000)).toBe('R$ 1.000,00');
  });

  it('deve formatar valor decimal', () => {
    expect(formatBRL(1234.56)).toBe('R$ 1.234,56');
  });

  it('deve formatar zero', () => {
    expect(formatBRL(0)).toBe('R$ 0,00');
  });

  it('deve formatar valor negativo', () => {
    expect(formatBRL(-500)).toBe('-R$ 500,00');
  });

  it('deve formatar valor grande', () => {
    expect(formatBRL(1000000)).toBe('R$ 1.000.000,00');
  });

  it('deve manter 2 casas decimais', () => {
    expect(formatBRL(10.5)).toBe('R$ 10,50');
    expect(formatBRL(10.999)).toBe('R$ 11,00'); // Arredondado
  });
});

describe('formatUSD', () => {
  it('deve formatar valor inteiro', () => {
    expect(formatUSD(1000)).toBe('$1,000.00');
  });

  it('deve formatar valor decimal', () => {
    expect(formatUSD(1234.56)).toBe('$1,234.56');
  });

  it('deve formatar zero', () => {
    expect(formatUSD(0)).toBe('$0.00');
  });

  it('deve formatar valor negativo', () => {
    expect(formatUSD(-500)).toBe('-$500.00');
  });

  it('deve manter 2 casas decimais', () => {
    expect(formatUSD(10.5)).toBe('$10.50');
  });
});

describe('formatDate', () => {
  it('deve formatar data ISO', () => {
    const formatted = formatDate('2025-10-28T10:30:00');
    expect(formatted).toContain('28/10/2025');
  });

  it('deve formatar objeto Date', () => {
    const date = new Date('2025-10-28T10:30:00');
    const formatted = formatDate(date);
    expect(formatted).toContain('28/10/2025');
  });

  it('deve incluir horário', () => {
    const formatted = formatDate('2025-10-28T15:45:30');
    expect(formatted).toContain(':');
  });
});

describe('formatCPF', () => {
  it('deve formatar CPF sem formatação', () => {
    expect(formatCPF('12345678900')).toBe('123.456.789-00');
  });

  it('deve formatar CPF já formatado', () => {
    expect(formatCPF('123.456.789-00')).toBe('123.456.789-00');
  });

  it('deve remover caracteres não numéricos antes de formatar', () => {
    expect(formatCPF('123 456 789 00')).toBe('123.456.789-00');
  });

  it('deve formatar CPF parcial', () => {
    expect(formatCPF('123456789')).toBe('123.456.789-');
  });
});

describe('formatPhone', () => {
  it('deve formatar celular (11 dígitos)', () => {
    expect(formatPhone('11987654321')).toBe('(11) 98765-4321');
  });

  it('deve formatar telefone fixo (10 dígitos)', () => {
    expect(formatPhone('1133334444')).toBe('(11) 3333-4444');
  });

  it('deve formatar telefone já formatado', () => {
    expect(formatPhone('(11) 98765-4321')).toBe('(11) 98765-4321');
  });

  it('deve retornar sem formatação se quantidade incorreta de dígitos', () => {
    expect(formatPhone('123456789')).toBe('123456789');
  });

  it('deve remover caracteres não numéricos antes de formatar', () => {
    expect(formatPhone('11 9 8765 4321')).toBe('(11) 98765-4321');
  });
});
