/**
 * Ponto de entrada principal da aplicação
 */

import { appStore } from './store/appStore.js';
import { VIEWS } from './utils/constants.js';
import { $ } from './utils/helpers.js';

// Import components
import { login } from './components/auth/Login.js';
import { twoFactor } from './components/auth/TwoFactor.js';
import { home } from './components/dashboard/Home.js';
import { transactions } from './components/dashboard/Transactions.js';
import { assets } from './components/dashboard/Assets.js';
import { explore } from './components/dashboard/Explore.js';
import { admin } from './components/dashboard/Admin.js';
import { layout } from './components/common/Layout.js';

class App {
  constructor() {
    this.app = null;
    this.currentComponent = null;
  }

  /**
   * Inicializa a aplicação
   */
  init() {
    this.app = $('#app');
    if (!this.app) {
      console.error('Elemento #app não encontrado');
      return;
    }

    // Subscribe to store changes
    appStore.subscribe((state) => {
      this.render();
    });

    // Initial render
    this.render();
  }

  /**
   * Renderiza a view atual
   */
  render() {
    if (!this.app) return;

    const currentView = appStore.getCurrentView();
    const currentUser = appStore.getCurrentUser();

    let component;
    let needsLayout = false;

    // Select component based on view
    switch (currentView) {
      case VIEWS.LOGIN:
        component = login;
        break;
      case VIEWS.TWO_FA:
        component = twoFactor;
        break;
      case VIEWS.DASHBOARD:
        component = home;
        needsLayout = true;
        break;
      case VIEWS.EXPLORE:
        component = explore;
        needsLayout = true;
        break;
      case VIEWS.TRANSACTIONS:
        component = transactions;
        needsLayout = true;
        break;
      case VIEWS.ASSETS:
        component = assets;
        needsLayout = true;
        break;
      case VIEWS.ADMIN:
        // Check admin permission
        if (currentUser && currentUser.role === 'admin') {
          component = admin;
          needsLayout = true;
        } else {
          // Redirect to dashboard if not admin
          appStore.setCurrentView(VIEWS.DASHBOARD);
          return;
        }
        break;
      default:
        this.app.innerHTML = '<p>View não encontrada</p>';
        return;
    }

    // Render component
    if (component) {
      const html = component.render();
      this.app.innerHTML = needsLayout ? layout.render(html) : html;

      // Attach events after render
      if (component.attachEvents) {
        component.attachEvents();
      }

      // Attach global navigation events if layout is used
      if (needsLayout) {
        this.attachGlobalEvents();
      }

      this.currentComponent = component;
    }
  }

  /**
   * Anexa eventos globais (navegação, etc)
   */
  attachGlobalEvents() {
    // Navigation items
    const navItems = document.querySelectorAll('[data-nav]');
    navItems.forEach((el) => {
      el.addEventListener('click', () => {
        const view = el.dataset.nav;
        appStore.setCurrentView(view);
      });
    });
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});

export default App;
