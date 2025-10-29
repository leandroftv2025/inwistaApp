/**
 * Store global da aplicação (State Management básico)
 */

import { VIEWS } from '../utils/constants.js';

class AppStore {
  constructor() {
    this.state = {
      currentUser: null,
      currentView: VIEWS.LOGIN,
      isLoading: false,
    };
    this.listeners = [];
  }

  /**
   * Obtém o estado atual
   * @returns {object} Estado
   */
  getState() {
    return this.state;
  }

  /**
   * Atualiza o estado
   * @param {object} newState - Novo estado (parcial)
   */
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
  }

  /**
   * Registra listener para mudanças de estado
   * @param {function} callback - Função a ser chamada quando estado mudar
   */
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  /**
   * Notifica todos os listeners sobre mudança de estado
   */
  notifyListeners() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  /**
   * Define usuário atual
   * @param {object} user - Dados do usuário
   */
  setCurrentUser(user) {
    this.setState({ currentUser: user });
  }

  /**
   * Obtém usuário atual
   * @returns {object|null} Usuário atual
   */
  getCurrentUser() {
    return this.state.currentUser;
  }

  /**
   * Remove usuário atual (logout)
   */
  clearCurrentUser() {
    this.setState({ currentUser: null, currentView: VIEWS.LOGIN });
  }

  /**
   * Define view atual
   * @param {string} view - Nome da view
   */
  setCurrentView(view) {
    this.setState({ currentView: view });
  }

  /**
   * Obtém view atual
   * @returns {string} View atual
   */
  getCurrentView() {
    return this.state.currentView;
  }

  /**
   * Define estado de loading
   * @param {boolean} isLoading - Estado de loading
   */
  setLoading(isLoading) {
    this.setState({ isLoading });
  }

  /**
   * Verifica se está carregando
   * @returns {boolean} True se carregando
   */
  isLoading() {
    return this.state.isLoading;
  }

  /**
   * Atualiza saldo do usuário
   * @param {object} saldos - { saldo_brl, saldo_usd }
   */
  updateUserBalance(saldos) {
    if (this.state.currentUser) {
      const updatedUser = {
        ...this.state.currentUser,
        ...saldos,
      };
      this.setCurrentUser(updatedUser);
    }
  }

  /**
   * Reseta o estado para valores iniciais
   */
  reset() {
    this.state = {
      currentUser: null,
      currentView: VIEWS.LOGIN,
      isLoading: false,
    };
    this.notifyListeners();
  }
}

// Exporta instância única (singleton)
export const appStore = new AppStore();
