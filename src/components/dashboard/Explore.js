/**
 * Componente Explorar
 */

export class Explore {
  render() {
    return `
      <header class="main__header">
        <h2>Explorar</h2>
      </header>
      <div class="p-16">
        <p>Conteúdo futuro...</p>
        <!-- TODO: Adicionar funcionalidades de exploração -->
      </div>
    `;
  }

  attachEvents() {
    // Eventos de explore
  }
}

export const explore = new Explore();
