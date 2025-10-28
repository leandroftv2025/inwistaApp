/**
 * Funções de formatação de dados
 */

/**
 * Formata valor em Real Brasileiro (BRL)
 * @param {number} value - Valor a ser formatado
 * @returns {string} Valor formatado (ex: R$ 1.234,56)
 */
export function formatBRL(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

/**
 * Formata valor em Dólar Americano (USD)
 * @param {number} value - Valor a ser formatado
 * @returns {string} Valor formatado (ex: $1,234.56)
 */
export function formatUSD(value) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
}

/**
 * Formata data em formato brasileiro
 * @param {string|Date} date - Data a ser formatada
 * @returns {string} Data formatada (ex: 28/10/2025 15:30)
 */
export function formatDate(date) {
  return new Date(date).toLocaleString("pt-BR");
}

/**
 * Formata CPF (000.000.000-00)
 * @param {string} cpf - CPF sem formatação
 * @returns {string} CPF formatado
 */
export function formatCPF(cpf) {
  cpf = cpf.replace(/[^\d]/g, '');
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata telefone brasileiro
 * @param {string} phone - Telefone sem formatação
 * @returns {string} Telefone formatado
 */
export function formatPhone(phone) {
  phone = phone.replace(/[^\d]/g, '');

  if (phone.length === 11) {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (phone.length === 10) {
    return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }

  return phone;
}
