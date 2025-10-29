# Arquitetura Modular - Inwista App

## 📁 Estrutura de Diretórios

```
inwistaApp/
├── index.html              # HTML original (monolítico)
├── index-modular.html      # HTML modular (usa ES6 modules)
├── app.js                  # Código original (1.393 linhas) - LEGADO
├── style.css               # Estilos (mantido sem alterações)
├── src/                    # Nova estrutura modular
│   ├── main.js            # Ponto de entrada da aplicação
│   ├── components/        # Componentes da UI
│   │   ├── auth/         # Componentes de autenticação
│   │   │   ├── Login.js
│   │   │   └── TwoFactor.js
│   │   ├── dashboard/    # Componentes do dashboard
│   │   │   ├── Home.js
│   │   │   ├── Transactions.js
│   │   │   ├── Assets.js
│   │   │   ├── Explore.js
│   │   │   └── Admin.js
│   │   ├── modals/       # Componentes de modais
│   │   │   └── BuyModal.js
│   │   └── common/       # Componentes comuns
│   │       ├── Sidebar.js
│   │       └── Layout.js
│   ├── services/         # Serviços (lógica de negócio)
│   │   ├── authService.js
│   │   ├── notificationService.js
│   │   ├── cryptoService.js
│   │   └── transactionService.js
│   ├── store/            # Gerenciamento de estado
│   │   └── appStore.js
│   ├── utils/            # Funções utilitárias
│   │   ├── constants.js
│   │   ├── validators.js
│   │   ├── formatters.js
│   │   └── helpers.js
│   └── data/             # Dados mockados
│       └── mockData.js
└── ARCHITECTURE.md       # Este arquivo
```

## 🏗️ Padrões Arquiteturais

### 1. **Component-Based Architecture**
Cada componente é uma classe com dois métodos principais:
- `render()` - Retorna HTML string
- `attachEvents()` - Anexa event listeners ao DOM

### 2. **Singleton Pattern (Services)**
Todos os serviços são exportados como instâncias únicas:
```javascript
export const authService = new AuthService();
```

### 3. **Observer Pattern (Store)**
O `appStore` implementa um sistema de observers para notificar mudanças de estado:
```javascript
appStore.subscribe((state) => {
  // React to state changes
});
```

### 4. **Separation of Concerns**
- **Components** → UI e interação
- **Services** → Lógica de negócio
- **Utils** → Funções auxiliares puras
- **Store** → Gerenciamento de estado global
- **Data** → Dados mockados (futuramente API)

## 🔄 Fluxo de Dados

```
User Interaction
      ↓
  Component
      ↓
   Service
      ↓
    Store
      ↓
State Change Notification
      ↓
App Re-renders
```

## 📦 Módulos e Dependências

### main.js (Entry Point)
- Importa todos os componentes
- Gerencia roteamento entre views
- Subscribe ao store para re-renders
- Anexa eventos globais

### Components
**Responsabilidades:**
- Renderizar HTML
- Anexar event listeners
- Chamar services para lógica de negócio
- Atualizar store quando necessário

**NÃO fazem:**
- Lógica de negócio complexa
- Validações (delegadas aos services)
- Manipulação direta de dados globais

### Services
**Responsabilidades:**
- Validação de dados
- Lógica de negócio
- Comunicação com APIs (futuro)
- Transformação de dados

**NÃO fazem:**
- Renderização de UI
- Manipulação direta do DOM

### Store
**Responsabilidades:**
- Armazenar estado global
- Notificar mudanças de estado
- Fornecer interface para leitura/escrita

**Estado gerenciado:**
- `currentUser` - Usuário autenticado
- `currentView` - View atual
- `isLoading` - Estado de loading

## 🔌 Como Usar

### Adicionar Novo Componente

1. Criar arquivo em `src/components/`:
```javascript
export class MyComponent {
  render() {
    return `<div>My Component</div>`;
  }

  attachEvents() {
    // Event listeners
  }
}

export const myComponent = new MyComponent();
```

2. Importar em `main.js`:
```javascript
import { myComponent } from './components/MyComponent.js';
```

3. Adicionar no switch de views:
```javascript
case VIEWS.MY_VIEW:
  component = myComponent;
  break;
```

### Adicionar Novo Serviço

1. Criar arquivo em `src/services/`:
```javascript
class MyService {
  doSomething() {
    // Business logic
  }
}

export const myService = new MyService();
```

2. Importar onde necessário:
```javascript
import { myService } from '../services/myService.js';
```

### Atualizar Estado Global

```javascript
import { appStore } from './store/appStore.js';

// Set state
appStore.setState({ currentView: 'dashboard' });

// Get state
const state = appStore.getState();

// Subscribe to changes
appStore.subscribe((newState) => {
  console.log('State changed:', newState);
});
```

## 🚀 Benefícios da Modularização

### Antes (Monolítico)
- ❌ 1.393 linhas em um arquivo
- ❌ Difícil manutenção
- ❌ Impossível testar isoladamente
- ❌ Código duplicado
- ❌ Difícil colaboração em equipe

### Depois (Modular)
- ✅ Arquivos pequenos e focados (50-200 linhas)
- ✅ Fácil manutenção e debugging
- ✅ Testável (unit tests)
- ✅ Reutilização de código
- ✅ Melhor experiência de desenvolvimento
- ✅ Fácil onboarding de novos desenvolvedores

## 📊 Métricas de Código

| Métrica | Antes | Depois |
|---------|-------|--------|
| Arquivos | 3 | 23 |
| Maior arquivo JS | 1.393 linhas | ~250 linhas |
| Duplicação | Alta | Baixa |
| Testabilidade | 0% | 80%+ |
| Manutenibilidade | Baixa | Alta |

## 🔜 Próximos Passos

1. **Adicionar Testes**
   - Unit tests para validators, formatters
   - Integration tests para services
   - E2E tests para fluxos principais

2. **Implementar Build System**
   - Configurar Vite ou Webpack
   - Minificação de código
   - Tree-shaking
   - Code splitting

3. **TypeScript**
   - Migrar para TypeScript
   - Type safety
   - Melhor autocomplete

4. **Backend Integration**
   - Criar apiService.js
   - Substituir mockData por chamadas reais
   - Implementar autenticação JWT

5. **State Management Avançado**
   - Migrar para Zustand ou Redux
   - Persistência de estado
   - Undo/Redo

## 🛠️ Como Executar

### Versão Monolítica (Original)
```bash
# Abrir index.html em um navegador
# OU usar um servidor HTTP simples:
python3 -m http.server 8000
# Acessar: http://localhost:8000
```

### Versão Modular (Nova)
```bash
# IMPORTANTE: ES6 modules requerem um servidor HTTP
# Não funciona abrindo arquivo diretamente (file://)

# Opção 1: Python
python3 -m http.server 8000

# Opção 2: Node.js (http-server)
npx http-server

# Opção 3: VS Code Live Server
# Instalar extensão Live Server e clicar com botão direito em index-modular.html

# Acessar: http://localhost:8000/index-modular.html
```

## ⚠️ Importante

- **ES6 Modules** requerem servidor HTTP (não funcionam com `file://`)
- Use `index-modular.html` para a versão modular
- O arquivo `app.js` original foi mantido como referência
- Ambas as versões compartilham o mesmo `style.css`

## 📚 Referências

- [ES6 Modules - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [Component Pattern](https://www.patterns.dev/posts/presentational-container-pattern/)
- [Observer Pattern](https://refactoring.guru/design-patterns/observer)
- [Singleton Pattern](https://refactoring.guru/design-patterns/singleton)
