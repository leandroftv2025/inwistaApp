/**
 * Setup para testes com Vitest
 */

// Mock do DOM global
global.document = window.document;
global.navigator = window.navigator;

// Mock do Chart.js (não disponível em ambiente de testes)
global.Chart = class Chart {
  constructor() {}
  destroy() {}
};

// Limpar DOM após cada teste
afterEach(() => {
  document.body.innerHTML = '';
});
