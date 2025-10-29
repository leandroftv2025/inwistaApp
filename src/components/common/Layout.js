/**
 * Componente Layout (wrapper com sidebar)
 */

import { sidebar } from './Sidebar.js';

export class Layout {
  /**
   * Renderiza layout com sidebar e conteúdo
   * @param {string} content - Conteúdo HTML
   * @returns {string} HTML do layout
   */
  render(content) {
    return `
      <div style="display:flex;min-height:100vh;">
        ${sidebar.render()}
        <div class="main">${content}</div>
      </div>
    `;
  }
}

export const layout = new Layout();
