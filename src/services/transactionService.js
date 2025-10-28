/**
 * Serviço de transações
 */

import { transactions } from '../data/mockData.js';
import { FEES } from '../utils/constants.js';

class TransactionService {
  /**
   * Obtém todas as transações
   * @returns {Array} Lista de transações
   */
  getAllTransactions() {
    return transactions;
  }

  /**
   * Obtém transação por ID
   * @param {string} id - ID da transação
   * @returns {object|null} Transação ou null
   */
  getTransactionById(id) {
    return transactions.find((t) => t.id === id) || null;
  }

  /**
   * Cria nova transação de compra de cripto
   * @param {object} data - Dados da transação
   * @returns {object} Transação criada
   */
  createCryptoPurchase(data) {
    const { valor, cripto, quantidade, userId } = data;

    const transaction = {
      id: `txn-${Date.now()}`,
      tipo: 'crypto_compra',
      valor,
      moeda: 'BRL',
      cripto,
      quantidade_cripto: quantidade,
      taxa: (valor * FEES.crypto_taker) / 100,
      status: 'completed',
      data: new Date().toISOString(),
      userId,
    };

    transactions.push(transaction);
    return transaction;
  }

  /**
   * Calcula taxa para tipo de transação
   * @param {string} tipo - Tipo da transação (pix, ted, crypto, etc)
   * @param {number} valor - Valor da transação
   * @returns {number} Valor da taxa
   */
  calculateFee(tipo, valor) {
    const feePercentage = FEES[tipo] || 0;
    return (valor * feePercentage) / 100;
  }

  /**
   * Obtém estatísticas de transações
   * @returns {object} Estatísticas
   */
  getStatistics() {
    const total = transactions.length;
    const completed = transactions.filter((t) => t.status === 'completed').length;
    const processing = transactions.filter((t) => t.status === 'processing').length;
    const volume24h = transactions
      .filter((t) => t.status === 'completed')
      .reduce((acc, t) => acc + t.valor, 0);

    return {
      total,
      completed,
      processing,
      volume24h,
    };
  }
}

// Exporta instância única (singleton)
export const transactionService = new TransactionService();
