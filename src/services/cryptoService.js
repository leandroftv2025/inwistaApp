/**
 * Serviço de criptomoedas
 */

import { cryptos } from '../data/mockData.js';

class CryptoService {
  /**
   * Obtém todas as criptomoedas
   * @returns {Array} Lista de criptomoedas
   */
  getAllCryptos() {
    return cryptos;
  }

  /**
   * Obtém criptomoeda por símbolo
   * @param {string} simbolo - Símbolo da cripto (BTC, ETH, etc)
   * @returns {object|null} Dados da cripto ou null
   */
  getCryptoBySymbol(simbolo) {
    return cryptos.find((c) => c.simbolo === simbolo) || null;
  }

  /**
   * Gera dados aleatórios para sparkline
   * @param {object} crypto - Dados da criptomoeda
   * @param {number} points - Quantidade de pontos
   * @returns {Array} Array de valores
   */
  generateSparklineData(crypto, points = 10) {
    return Array.from({ length: points }, () =>
      crypto.variacao_24h >= 0
        ? Math.random() * 5 + 90
        : Math.random() * 5 + 85
    );
  }

  /**
   * Converte BRL para USD (taxa fixa simplificada)
   * TODO: Usar API de câmbio real
   * @param {number} brl - Valor em BRL
   * @returns {number} Valor em USD
   */
  convertBRLtoUSD(brl) {
    const TAXA_CONVERSAO = 5.3; // Taxa fixa simplificada
    return brl / TAXA_CONVERSAO;
  }

  /**
   * Calcula quantidade de cripto que pode ser comprada
   * @param {number} valorBRL - Valor em BRL
   * @param {string} simbolo - Símbolo da cripto
   * @returns {object} { quantidade, valorUSD, crypto }
   */
  calculateCryptoPurchase(valorBRL, simbolo) {
    const crypto = this.getCryptoBySymbol(simbolo);
    if (!crypto) {
      return null;
    }

    const valorUSD = this.convertBRLtoUSD(valorBRL);
    const quantidade = valorUSD / crypto.preco_usd;

    return {
      quantidade,
      valorUSD,
      crypto,
    };
  }
}

// Exporta instância única (singleton)
export const cryptoService = new CryptoService();
