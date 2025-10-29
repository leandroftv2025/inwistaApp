/**
 * Modal de Compra de Criptomoedas
 */

import { cryptoService } from '../../services/cryptoService.js';
import { transactionService } from '../../services/transactionService.js';
import { appStore } from '../../store/appStore.js';
import { notificationService } from '../../services/notificationService.js';
import { FEES } from '../../utils/constants.js';
import { $ } from '../../utils/helpers.js';

export class BuyModal {
  open(simbolo) {
    const cripto = cryptoService.getCryptoBySymbol(simbolo);
    if (!cripto) return;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal__header">Comprar ${cripto.nome}</div>
        <div class="modal__body">
          <div class="form-group">
            <label class="form-label">Valor em BRL</label>
            <input
              type="number"
              id="buy-value"
              class="form-control"
              min="1"
              placeholder="0.00"
            />
          </div>
          <p id="buy-conversion" class="mt-8">≈ 0 ${cripto.simbolo}</p>
          <p class="mt-8" style="font-size:var(--font-size-sm);">
            Taxa: ${FEES.crypto_taker}%
          </p>
        </div>
        <div class="modal__footer">
          <button class="btn btn--outline" id="cancel-buy">Cancelar</button>
          <button class="btn btn--primary" id="confirm-buy" disabled>Confirmar</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const input = overlay.querySelector('#buy-value');
    const btnConfirm = overlay.querySelector('#confirm-buy');
    const conversionText = overlay.querySelector('#buy-conversion');
    const currentUser = appStore.getCurrentUser();

    // Update conversion on input
    input.addEventListener('input', () => {
      const val = parseFloat(input.value);
      if (val > 0 && val <= currentUser.saldo_brl) {
        btnConfirm.disabled = false;
        const result = cryptoService.calculateCryptoPurchase(val, simbolo);
        if (result) {
          conversionText.textContent = `≈ ${result.quantidade.toFixed(6)} ${cripto.simbolo}`;
        }
      } else {
        btnConfirm.disabled = true;
        conversionText.textContent = `≈ 0 ${cripto.simbolo}`;
      }
    });

    // Confirm purchase
    btnConfirm.addEventListener('click', () => {
      const val = parseFloat(input.value);

      if (val > currentUser.saldo_brl) {
        notificationService.error('Saldo Insuficiente', 'Você não tem saldo suficiente.');
        return;
      }

      const result = cryptoService.calculateCryptoPurchase(val, simbolo);
      if (!result) return;

      // Update balance
      const newBalance = currentUser.saldo_brl - val;
      appStore.updateUserBalance({ saldo_brl: newBalance });

      // Create transaction
      transactionService.createCryptoPurchase({
        valor: val,
        cripto: cripto.simbolo,
        quantidade: result.quantidade,
        userId: currentUser.id,
      });

      document.body.removeChild(overlay);
      notificationService.success('Compra Concluída!', `Você comprou ${result.quantidade.toFixed(6)} ${cripto.simbolo}`);

      // Re-render para atualizar saldo
      // O main.js está inscrito no store e vai re-renderizar automaticamente
    });

    // Cancel button
    overlay.querySelector('#cancel-buy').addEventListener('click', () => {
      document.body.removeChild(overlay);
    });

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
      }
    });

    // Focus no input
    setTimeout(() => input.focus(), 100);
  }
}

export const buyModal = new BuyModal();
