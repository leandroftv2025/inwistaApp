/**
 * Componente Admin Dashboard
 */

import { users } from '../../data/mockData.js';
import { transactionService } from '../../services/transactionService.js';
import { formatBRL } from '../../utils/formatters.js';

export class Admin {
  render() {
    const stats = transactionService.getStatistics();
    const totalUsers = users.length;

    return `
      <header class="main__header">
        <h2>Admin Dashboard</h2>
      </header>
      <div class="p-16">
        <div class="flex gap-16">
          <div class="card">
            <div class="card__body">
              Total de usuários: ${totalUsers}
            </div>
          </div>
          <div class="card">
            <div class="card__body">
              Total de transações: ${stats.total}
            </div>
          </div>
          <div class="card">
            <div class="card__body">
              Volume 24h: ${formatBRL(stats.volume24h)}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  attachEvents() {
    // Eventos admin
  }
}

export const admin = new Admin();
