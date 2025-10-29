/**
 * Funções auxiliares gerais
 */

/**
 * Seletor de elemento DOM (atalho para querySelector)
 * @param {string} selector - Seletor CSS
 * @returns {Element|null} Elemento encontrado ou null
 */
export function $(selector) {
  return document.querySelector(selector);
}

/**
 * Seletor de múltiplos elementos DOM (atalho para querySelectorAll)
 * @param {string} selector - Seletor CSS
 * @returns {NodeList} Lista de elementos
 */
export function $$(selector) {
  return document.querySelectorAll(selector);
}

/**
 * Mostra erro em campo de formulário
 * @param {string} fieldId - ID do campo
 * @param {string} message - Mensagem de erro
 */
export function showFieldError(fieldId, message) {
  const field = $(`#${fieldId}`);
  if (!field) return;

  // Add error class
  field.classList.add('form-control--error');

  // Remove existing error
  const existingError = field.parentNode.querySelector('.field-error');
  if (existingError) {
    existingError.remove();
  }

  // Add error message
  const errorDiv = document.createElement('div');
  errorDiv.className = 'field-error';
  errorDiv.innerHTML = `<span>⚠</span> ${message}`;
  field.parentNode.appendChild(errorDiv);
}

/**
 * Remove erro de campo de formulário
 * @param {string} fieldId - ID do campo
 */
export function clearFieldError(fieldId) {
  const field = $(`#${fieldId}`);
  if (!field) return;

  field.classList.remove('form-control--error');
  const error = field.parentNode.querySelector('.field-error');
  if (error) {
    error.remove();
  }
}

/**
 * Marca campo como válido (sucesso)
 * @param {string} fieldId - ID do campo
 */
export function setFieldSuccess(fieldId) {
  const field = $(`#${fieldId}`);
  if (!field) return;

  clearFieldError(fieldId);
  field.classList.add('form-control--success');
}

/**
 * Obtém classe CSS baseada no status
 * @param {string} status - Status da transação
 * @returns {string} Classe CSS
 */
export function getBadgeClass(status) {
  switch (status) {
    case "completed":
      return "badge--success";
    case "processing":
      return "badge--warning";
    default:
      return "badge--error";
  }
}

/**
 * Simula delay (útil para loading states)
 * @param {number} ms - Milissegundos para aguardar
 * @returns {Promise}
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
