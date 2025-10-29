/**
 * Testes unitários para helpers
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  $,
  $$,
  showFieldError,
  clearFieldError,
  setFieldSuccess,
  getBadgeClass,
  delay,
} from '@utils/helpers.js';

describe('$ (querySelector)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('deve selecionar elemento por ID', () => {
    document.body.innerHTML = '<div id="test">Content</div>';
    const element = $('#test');
    expect(element).not.toBeNull();
    expect(element.textContent).toBe('Content');
  });

  it('deve selecionar elemento por classe', () => {
    document.body.innerHTML = '<div class="my-class">Content</div>';
    const element = $('.my-class');
    expect(element).not.toBeNull();
    expect(element.textContent).toBe('Content');
  });

  it('deve retornar null se elemento não existir', () => {
    const element = $('#nonexistent');
    expect(element).toBeNull();
  });
});

describe('$$ (querySelectorAll)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('deve selecionar múltiplos elementos', () => {
    document.body.innerHTML = `
      <div class="item">1</div>
      <div class="item">2</div>
      <div class="item">3</div>
    `;
    const elements = $$('.item');
    expect(elements.length).toBe(3);
  });

  it('deve retornar NodeList vazia se nenhum elemento for encontrado', () => {
    const elements = $$('.nonexistent');
    expect(elements.length).toBe(0);
  });
});

describe('showFieldError', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('deve adicionar classe de erro ao campo', () => {
    document.body.innerHTML = '<div><input id="test-field" /></div>';
    showFieldError('test-field', 'Erro de teste');

    const field = $('#test-field');
    expect(field.classList.contains('form-control--error')).toBe(true);
  });

  it('deve criar elemento de erro', () => {
    document.body.innerHTML = '<div><input id="test-field" /></div>';
    showFieldError('test-field', 'Erro de teste');

    const errorElement = document.querySelector('.field-error');
    expect(errorElement).not.toBeNull();
    expect(errorElement.textContent).toContain('Erro de teste');
  });

  it('deve substituir erro existente', () => {
    document.body.innerHTML = '<div><input id="test-field" /></div>';
    showFieldError('test-field', 'Primeiro erro');
    showFieldError('test-field', 'Segundo erro');

    const errorElements = document.querySelectorAll('.field-error');
    expect(errorElements.length).toBe(1);
    expect(errorElements[0].textContent).toContain('Segundo erro');
  });

  it('não deve fazer nada se campo não existir', () => {
    expect(() => showFieldError('nonexistent', 'Error')).not.toThrow();
  });
});

describe('clearFieldError', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('deve remover classe de erro', () => {
    document.body.innerHTML = '<div><input id="test-field" class="form-control--error" /></div>';
    clearFieldError('test-field');

    const field = $('#test-field');
    expect(field.classList.contains('form-control--error')).toBe(false);
  });

  it('deve remover elemento de erro', () => {
    document.body.innerHTML = `
      <div>
        <input id="test-field" class="form-control--error" />
        <div class="field-error">Erro</div>
      </div>
    `;
    clearFieldError('test-field');

    const errorElement = document.querySelector('.field-error');
    expect(errorElement).toBeNull();
  });

  it('não deve fazer nada se campo não existir', () => {
    expect(() => clearFieldError('nonexistent')).not.toThrow();
  });
});

describe('setFieldSuccess', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('deve adicionar classe de sucesso', () => {
    document.body.innerHTML = '<div><input id="test-field" /></div>';
    setFieldSuccess('test-field');

    const field = $('#test-field');
    expect(field.classList.contains('form-control--success')).toBe(true);
  });

  it('deve limpar erros antes de adicionar sucesso', () => {
    document.body.innerHTML = `
      <div>
        <input id="test-field" class="form-control--error" />
        <div class="field-error">Erro</div>
      </div>
    `;
    setFieldSuccess('test-field');

    const field = $('#test-field');
    expect(field.classList.contains('form-control--error')).toBe(false);
    expect(field.classList.contains('form-control--success')).toBe(true);
    expect(document.querySelector('.field-error')).toBeNull();
  });

  it('não deve fazer nada se campo não existir', () => {
    expect(() => setFieldSuccess('nonexistent')).not.toThrow();
  });
});

describe('getBadgeClass', () => {
  it('deve retornar classe correta para "completed"', () => {
    expect(getBadgeClass('completed')).toBe('badge--success');
  });

  it('deve retornar classe correta para "processing"', () => {
    expect(getBadgeClass('processing')).toBe('badge--warning');
  });

  it('deve retornar classe de erro para status desconhecido', () => {
    expect(getBadgeClass('failed')).toBe('badge--error');
    expect(getBadgeClass('unknown')).toBe('badge--error');
  });
});

describe('delay', () => {
  it('deve aguardar tempo especificado', async () => {
    const start = Date.now();
    await delay(100);
    const end = Date.now();

    expect(end - start).toBeGreaterThanOrEqual(90); // Margem de erro
    expect(end - start).toBeLessThan(150);
  });

  it('deve retornar uma Promise', () => {
    const result = delay(10);
    expect(result).toBeInstanceOf(Promise);
  });
});
