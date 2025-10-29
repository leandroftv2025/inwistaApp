/**
 * Componente Sidebar
 */

import { appStore } from '../../store/appStore.js';
import { VIEWS, USER_ROLES } from '../../utils/constants.js';

export class Sidebar {
  render() {
    const currentUser = appStore.getCurrentUser();
    const currentView = appStore.getCurrentView();

    const items = [
      { id: VIEWS.DASHBOARD, label: 'Início' },
      { id: VIEWS.ASSETS, label: 'Meus ativos' },
      { id: VIEWS.TRANSACTIONS, label: 'Transações' },
      { id: VIEWS.EXPLORE, label: 'Explorar' },
      { id: VIEWS.SETTINGS, label: 'Configurações' },
    ];

    if (currentUser && currentUser.role === USER_ROLES.ADMIN) {
      items.push({ id: VIEWS.ADMIN, label: 'Admin' });
    }

    return `
      <aside class="sidebar" id="sidebar">
        <div class="px-16">
          <div class="logo">
            <div class="logo__icon">S</div>
            <span>Inwista</span>
          </div>
        </div>
        <nav class="sidebar__nav">
          ${items
            .map(
              (item) => `
                <div class="sidebar__item ${
                  currentView === item.id ? 'sidebar__item--active' : ''
                }" data-nav="${item.id}">
                  ${item.label}
                </div>
              `
            )
            .join('')}
        </nav>
      </aside>
    `;
  }
}

export const sidebar = new Sidebar();
