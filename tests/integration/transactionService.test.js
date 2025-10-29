/**
 * Testes de integração para transactionService
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { transactionService } from '@services/transactionService.js';
import { transactions } from '@data/mockData.js';

describe('TransactionService', () => {
  describe('getAllTransactions', () => {
    it('deve retornar array de transações', () => {
      const txs = transactionService.getAllTransactions();
      expect(Array.isArray(txs)).toBe(true);
      expect(txs.length).toBeGreaterThan(0);
    });
  });

  describe('getTransactionById', () => {
    it('deve retornar transação existente', () => {
      const tx = transactionService.getTransactionById('txn-001');
      expect(tx).not.toBeNull();
      expect(tx.id).toBe('txn-001');
    });

    it('deve retornar null para ID inexistente', () => {
      const tx = transactionService.getTransactionById('nonexistent');
      expect(tx).toBeNull();
    });
  });

  describe('createCryptoPurchase', () => {
    let initialLength;

    beforeEach(() => {
      initialLength = transactions.length;
    });

    it('deve criar nova transação de compra', () => {
      const data = {
        valor: 1000,
        cripto: 'BTC',
        quantidade: 0.0088,
        userId: 'user-001',
      };

      const tx = transactionService.createCryptoPurchase(data);

      expect(tx).toBeDefined();
      expect(tx.id).toBeDefined();
      expect(tx.tipo).toBe('crypto_compra');
      expect(tx.valor).toBe(1000);
      expect(tx.cripto).toBe('BTC');
      expect(tx.quantidade_cripto).toBe(0.0088);
      expect(tx.status).toBe('completed');
    });

    it('deve calcular taxa corretamente', () => {
      const data = {
        valor: 1000,
        cripto: 'BTC',
        quantidade: 0.0088,
        userId: 'user-001',
      };

      const tx = transactionService.createCryptoPurchase(data);

      // Taxa de 0.2% sobre 1000 = 2
      expect(tx.taxa).toBe(2);
    });

    it('deve adicionar transação à lista', () => {
      const data = {
        valor: 500,
        cripto: 'ETH',
        quantidade: 0.1,
        userId: 'user-001',
      };

      transactionService.createCryptoPurchase(data);

      const allTxs = transactionService.getAllTransactions();
      expect(allTxs.length).toBe(initialLength + 1);
    });

    it('deve gerar ID único', () => {
      const data = {
        valor: 100,
        cripto: 'BTC',
        quantidade: 0.001,
        userId: 'user-001',
      };

      const tx1 = transactionService.createCryptoPurchase(data);
      const tx2 = transactionService.createCryptoPurchase(data);

      expect(tx1.id).not.toBe(tx2.id);
    });
  });

  describe('calculateFee', () => {
    it('deve calcular taxa PIX (0%)', () => {
      const fee = transactionService.calculateFee('pix', 1000);
      expect(fee).toBe(0);
    });

    it('deve calcular taxa TED (3.5%)', () => {
      const fee = transactionService.calculateFee('ted', 1000);
      expect(fee).toBe(35);
    });

    it('deve calcular taxa crypto_taker (0.2%)', () => {
      const fee = transactionService.calculateFee('crypto_taker', 1000);
      expect(fee).toBe(2);
    });

    it('deve retornar 0 para tipo desconhecido', () => {
      const fee = transactionService.calculateFee('unknown', 1000);
      expect(fee).toBe(0);
    });
  });

  describe('getStatistics', () => {
    it('deve retornar estatísticas corretas', () => {
      const stats = transactionService.getStatistics();

      expect(stats).toBeDefined();
      expect(stats.total).toBeDefined();
      expect(stats.completed).toBeDefined();
      expect(stats.processing).toBeDefined();
      expect(stats.volume24h).toBeDefined();
    });

    it('deve contar transações corretamente', () => {
      const stats = transactionService.getStatistics();
      const allTxs = transactionService.getAllTransactions();

      expect(stats.total).toBe(allTxs.length);
    });

    it('deve calcular volume apenas de transações completadas', () => {
      const stats = transactionService.getStatistics();
      const allTxs = transactionService.getAllTransactions();
      const completedTxs = allTxs.filter((t) => t.status === 'completed');
      const expectedVolume = completedTxs.reduce((acc, t) => acc + t.valor, 0);

      expect(stats.volume24h).toBe(expectedVolume);
    });
  });
});
