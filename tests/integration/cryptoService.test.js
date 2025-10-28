/**
 * Testes de integração para cryptoService
 */

import { describe, it, expect } from 'vitest';
import { cryptoService } from '@services/cryptoService.js';

describe('CryptoService', () => {
  describe('getAllCryptos', () => {
    it('deve retornar array de criptomoedas', () => {
      const cryptos = cryptoService.getAllCryptos();
      expect(Array.isArray(cryptos)).toBe(true);
      expect(cryptos.length).toBeGreaterThan(0);
    });

    it('deve incluir Bitcoin', () => {
      const cryptos = cryptoService.getAllCryptos();
      const btc = cryptos.find((c) => c.simbolo === 'BTC');
      expect(btc).toBeDefined();
      expect(btc.nome).toBe('Bitcoin');
    });
  });

  describe('getCryptoBySymbol', () => {
    it('deve retornar cripto existente', () => {
      const btc = cryptoService.getCryptoBySymbol('BTC');
      expect(btc).not.toBeNull();
      expect(btc.nome).toBe('Bitcoin');
    });

    it('deve retornar null para símbolo inexistente', () => {
      const result = cryptoService.getCryptoBySymbol('INVALID');
      expect(result).toBeNull();
    });
  });

  describe('generateSparklineData', () => {
    it('deve gerar array com quantidade especificada de pontos', () => {
      const btc = cryptoService.getCryptoBySymbol('BTC');
      const data = cryptoService.generateSparklineData(btc, 10);

      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(10);
    });

    it('deve gerar valores numéricos', () => {
      const btc = cryptoService.getCryptoBySymbol('BTC');
      const data = cryptoService.generateSparklineData(btc);

      data.forEach((value) => {
        expect(typeof value).toBe('number');
        expect(value).toBeGreaterThan(0);
      });
    });

    it('deve usar quantidade padrão de 10 pontos', () => {
      const btc = cryptoService.getCryptoBySymbol('BTC');
      const data = cryptoService.generateSparklineData(btc);
      expect(data.length).toBe(10);
    });
  });

  describe('convertBRLtoUSD', () => {
    it('deve converter valor BRL para USD', () => {
      const usd = cryptoService.convertBRLtoUSD(530);
      expect(usd).toBeCloseTo(100, 2);
    });

    it('deve converter zero', () => {
      const usd = cryptoService.convertBRLtoUSD(0);
      expect(usd).toBe(0);
    });

    it('deve converter valores decimais', () => {
      const usd = cryptoService.convertBRLtoUSD(53);
      expect(usd).toBeCloseTo(10, 2);
    });
  });

  describe('calculateCryptoPurchase', () => {
    it('deve calcular compra de BTC corretamente', () => {
      const result = cryptoService.calculateCryptoPurchase(530, 'BTC');

      expect(result).not.toBeNull();
      expect(result.crypto).toBeDefined();
      expect(result.crypto.simbolo).toBe('BTC');
      expect(result.valorUSD).toBeCloseTo(100, 2);
      expect(result.quantidade).toBeGreaterThan(0);
    });

    it('deve retornar null para símbolo inválido', () => {
      const result = cryptoService.calculateCryptoPurchase(100, 'INVALID');
      expect(result).toBeNull();
    });

    it('deve calcular quantidade baseada no preço', () => {
      const result = cryptoService.calculateCryptoPurchase(53000, 'BTC');

      expect(result).not.toBeNull();
      expect(result.quantidade).toBeGreaterThan(0);

      // Verificar se a quantidade * preço = valorUSD (aproximadamente)
      const calculated = result.quantidade * result.crypto.preco_usd;
      expect(calculated).toBeCloseTo(result.valorUSD, 1);
    });

    it('deve funcionar para diferentes criptomoedas', () => {
      const resultBTC = cryptoService.calculateCryptoPurchase(1000, 'BTC');
      const resultETH = cryptoService.calculateCryptoPurchase(1000, 'ETH');

      expect(resultBTC).not.toBeNull();
      expect(resultETH).not.toBeNull();

      // ETH é mais barato, deve comprar mais quantidade
      expect(resultETH.quantidade).toBeGreaterThan(resultBTC.quantidade);
    });
  });
});
