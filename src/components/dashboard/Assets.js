/**
 * Componente de Ativos
 */

import { appStore } from '../../store/appStore.js';
import { formatUSD } from '../../utils/formatters.js';

export class Assets {
  render() {
    const currentUser = appStore.getCurrentUser();

    return `
      <header class="main__header">
        <h2>Meus ativos</h2>
      </header>
      <div class="p-16">
        <p>Saldo total: ${formatUSD(currentUser.saldo_usd)}</p>
        <!-- TODO: Adicionar lista detalhada de ativos em cripto -->
      </div>
    `;
  }

  attachEvents() {
    // Eventos de ativos
  }
}

export const assets = new Assets();
