/**
 * Componente de Transações
 */

import { transactionService } from '../../services/transactionService.js';
import { formatBRL, formatDate } from '../../utils/formatters.js';
import { getBadgeClass } from '../../utils/helpers.js';

export class Transactions {
  render() {
    const transactions = transactionService.getAllTransactions();

    return `
      <header class="main__header">
        <h2>Transações</h2>
      </header>
      <div class="p-16">
        ${transactions.length === 0 ? this.renderEmptyState() : this.renderTable(transactions)}
      </div>
    `;
  }

  renderTable(transactions) {
    return `
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tipo</th>
            <th>Valor</th>
            <th>Status</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          ${transactions
            .map(
              (t) => `
                <tr>
                  <td>${t.id}</td>
                  <td>${t.tipo}</td>
                  <td>${formatBRL(t.valor)}</td>
                  <td>
                    <span class="badge ${getBadgeClass(t.status)}">
                      ${t.status}
                    </span>
                  </td>
                  <td>${formatDate(t.data)}</td>
                </tr>
              `
            )
            .join('')}
        </tbody>
      </table>
    `;
  }

  renderEmptyState() {
    return `
      <div style="text-align:center;padding:var(--space-32);">
        <p>Nenhuma transação encontrada</p>
      </div>
    `;
  }

  attachEvents() {
    // Eventos específicos de transações (ex: filtros, paginação)
  }
}

export const transactions = new Transactions();
