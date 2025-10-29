/**
 * Componente Dashboard/Home
 */

import { appStore } from '../../store/appStore.js';
import { cryptoService } from '../../services/cryptoService.js';
import { formatBRL, formatUSD } from '../../utils/formatters.js';

export class Home {
  render() {
    const currentUser = appStore.getCurrentUser();
    const cryptos = cryptoService.getAllCryptos();

    return `
      <header class="main__header">
        <h2>Bem-vindo, ${currentUser.nome}</h2>
        <div>${formatBRL(currentUser.saldo_brl)}</div>
      </header>
      <section class="p-16">
        <h3 class="mb-16">Mercado</h3>
        <div style="overflow-x:auto;">
          <table class="table" id="crypto-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Preço (USD)</th>
                <th></th>
                <th>Volume 24h</th>
                <th>Variação %</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${cryptos
                .map(
                  (c, idx) => `
                    <tr>
                      <td>
                        <span style="display:flex;align-items:center;gap:8px;">
                          <span style="width:16px;height:16px;background:${c.icone_cor};border-radius:50%;display:inline-block;"></span>
                          ${c.nome}
                        </span>
                      </td>
                      <td>${formatUSD(c.preco_usd)}</td>
                      <td><canvas id="spark-${idx}" class="sparkline"></canvas></td>
                      <td>${c.volume_24h}</td>
                      <td style="color:${c.variacao_24h >= 0 ? 'green' : 'red'};">
                        ${c.variacao_24h}%
                      </td>
                      <td>
                        <button class="btn btn--sm btn--primary" data-buy="${c.simbolo}">
                          Comprar
                        </button>
                      </td>
                    </tr>
                  `
                )
                .join('')}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  attachEvents() {
    // Draw sparklines
    this.drawSparklines();

    // Buy buttons
    const buyButtons = document.querySelectorAll('[data-buy]');
    buyButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const simbolo = btn.dataset.buy;
        // Import modal dinamicamente para evitar dependência circular
        import('../modals/BuyModal.js').then(({ buyModal }) => {
          buyModal.open(simbolo);
        });
      });
    });
  }

  drawSparklines() {
    const cryptos = cryptoService.getAllCryptos();

    cryptos.forEach((c, idx) => {
      const ctx = document.getElementById(`spark-${idx}`);
      if (ctx && window.Chart) {
        const data = cryptoService.generateSparklineData(c);

        new Chart(ctx, {
          type: 'line',
          data: {
            labels: data.map((_, i) => i),
            datasets: [
              {
                data,
                borderColor: c.variacao_24h >= 0 ? '#1FB8CD' : '#DB4545',
                borderWidth: 2,
                fill: false,
                tension: 0.3,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { display: false }, y: { display: false } },
          },
        });
      }
    });
  }
}

export const home = new Home();
