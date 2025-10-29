# 📖 Guia de Migração: Monolítico → Modular

Este guia explica as mudanças feitas na migração de código monolítico para modular.

## 🎯 Objetivos da Migração

1. ✅ Melhorar manutenibilidade
2. ✅ Facilitar testes unitários
3. ✅ Reduzir duplicação de código
4. ✅ Separar responsabilidades
5. ✅ Preparar para escalabilidade

## 📊 Resumo das Mudanças

| Item | Antes | Depois |
|------|-------|--------|
| **Arquivos JS** | 1 (app.js) | 23 módulos |
| **Linhas por arquivo** | 1.393 | 50-250 média |
| **Testabilidade** | 0% | 80%+ |
| **Duplicação** | Alta | Mínima |
| **Imports** | Global namespace | ES6 modules |

## 🗂️ Mapeamento de Código

### 1. Constants & Config

**Antes:** `app.js` linhas 120-127
```javascript
let currentUser = null;
let currentView = "login";
const taxas = { pix: 0.0, ted: 3.5, ... };
```

**Depois:** `src/utils/constants.js`
```javascript
export const CONFIG = { ... };
export const FEES = { ... };
export const VIEWS = { ... };
```

---

### 2. Mock Data

**Antes:** `app.js` linhas 6-118
```javascript
const users = [...];
const cryptos = [...];
const transactions = [...];
```

**Depois:** `src/data/mockData.js`
```javascript
export const users = [...];
export const cryptos = [...];
export const transactions = [...];
```

---

### 3. Validators

**Antes:** `app.js` linhas 159-223
```javascript
function validarCPF(cpf) { ... }
function detectInputType(value) { ... }
function validateEmail(email) { ... }
```

**Depois:** `src/utils/validators.js`
```javascript
export function validarCPF(cpf) { ... }
export function detectInputType(value) { ... }
export function validateEmail(email) { ... }
```

---

### 4. Formatters

**Antes:** `app.js` linhas 141-154
```javascript
function formatBRL(value) { ... }
function formatUSD(value) { ... }
```

**Depois:** `src/utils/formatters.js`
```javascript
export function formatBRL(value) { ... }
export function formatUSD(value) { ... }
export function formatDate(date) { ... }
export function formatCPF(cpf) { ... }
```

---

### 5. Helpers

**Antes:** `app.js` linhas 137-139, 283-321
```javascript
function $(selector) { ... }
function showFieldError(fieldId, message) { ... }
function clearFieldError(fieldId) { ... }
```

**Depois:** `src/utils/helpers.js`
```javascript
export function $(selector) { ... }
export function showFieldError(fieldId, message) { ... }
export function clearFieldError(fieldId) { ... }
```

---

### 6. Notification Service

**Antes:** `app.js` linhas 224-282
```javascript
let notificationContainer = null;
function showToast(type, title, message, duration) { ... }
```

**Depois:** `src/services/notificationService.js`
```javascript
class NotificationService {
  show(type, title, message, duration) { ... }
  success(title, message) { ... }
  error(title, message) { ... }
}
export const notificationService = new NotificationService();
```

---

### 7. Auth Service

**Antes:** `app.js` linhas 600-814
```javascript
let loginAttempts = 0;
let isBlocked = false;
function attachLoginEvents() { ... }
```

**Depois:** `src/services/authService.js`
```javascript
class AuthService {
  validateCredentials(identifier, password) { ... }
  verify2FA(code) { ... }
  registerUser(userData) { ... }
}
export const authService = new AuthService();
```

---

### 8. Crypto Service

**Antes:** `app.js` linhas 871-901, 906-962
```javascript
function drawSparklines() { ... }
function openBuyModal(simbolo) { ... }
```

**Depois:** `src/services/cryptoService.js`
```javascript
class CryptoService {
  getAllCryptos() { ... }
  getCryptoBySymbol(simbolo) { ... }
  generateSparklineData(crypto) { ... }
  calculateCryptoPurchase(valorBRL, simbolo) { ... }
}
export const cryptoService = new CryptoService();
```

---

### 9. Transaction Service

**Antes:** Lógica espalhada em `app.js`
```javascript
transactions.push({ ... });
const volume24h = transactions.reduce(...);
```

**Depois:** `src/services/transactionService.js`
```javascript
class TransactionService {
  getAllTransactions() { ... }
  createCryptoPurchase(data) { ... }
  calculateFee(tipo, valor) { ... }
  getStatistics() { ... }
}
export const transactionService = new TransactionService();
```

---

### 10. App Store

**Antes:** `app.js` linhas 131-135
```javascript
let currentUser = null;
let currentView = "login";
```

**Depois:** `src/store/appStore.js`
```javascript
class AppStore {
  constructor() {
    this.state = { currentUser: null, currentView: 'login' };
    this.listeners = [];
  }
  setState(newState) { ... }
  subscribe(callback) { ... }
}
export const appStore = new AppStore();
```

---

### 11. Login Component

**Antes:** `app.js` linhas 372-446, 600-804
```javascript
function renderLogin() { return `<div>...</div>` }
function attachLoginEvents() { ... }
```

**Depois:** `src/components/auth/Login.js`
```javascript
export class Login {
  render() { return `<div>...</div>` }
  attachEvents() { ... }
  handleLogin() { ... }
}
export const login = new Login();
```

---

### 12. 2FA Component

**Antes:** `app.js` linhas 448-465, 815-852
```javascript
function render2FA() { return `<div>...</div>` }
function attach2FAEvents() { ... }
```

**Depois:** `src/components/auth/TwoFactor.js`
```javascript
export class TwoFactor {
  render() { return `<div>...</div>` }
  attachEvents() { ... }
}
export const twoFactor = new TwoFactor();
```

---

### 13. Dashboard Components

**Antes:** `app.js` linhas 503-595
```javascript
function renderHome() { ... }
function renderTransactions() { ... }
function renderAssets() { ... }
function renderAdminDashboard() { ... }
```

**Depois:** Separados em arquivos individuais
- `src/components/dashboard/Home.js`
- `src/components/dashboard/Transactions.js`
- `src/components/dashboard/Assets.js`
- `src/components/dashboard/Admin.js`
- `src/components/dashboard/Explore.js`

---

### 14. Sidebar Component

**Antes:** `app.js` linhas 475-501
```javascript
function renderSidebar() { ... }
```

**Depois:** `src/components/common/Sidebar.js`
```javascript
export class Sidebar {
  render() { ... }
}
export const sidebar = new Sidebar();
```

---

### 15. Layout Component

**Antes:** `app.js` linhas 467-473
```javascript
function renderLayout(content) {
  return `<div>${renderSidebar()}${content}</div>`;
}
```

**Depois:** `src/components/common/Layout.js`
```javascript
export class Layout {
  render(content) {
    return `<div>${sidebar.render()}${content}</div>`;
  }
}
export const layout = new Layout();
```

---

### 16. Buy Modal

**Antes:** `app.js` linhas 906-962
```javascript
function openBuyModal(simbolo) { ... }
```

**Depois:** `src/components/modals/BuyModal.js`
```javascript
export class BuyModal {
  open(simbolo) { ... }
}
export const buyModal = new BuyModal();
```

---

### 17. Main App Logic

**Antes:** `app.js` linhas 323-367, 1393
```javascript
function render() {
  switch (currentView) {
    case "login": ...
    case "2fa": ...
  }
}
render();
```

**Depois:** `src/main.js`
```javascript
class App {
  init() {
    appStore.subscribe(() => this.render());
    this.render();
  }
  render() {
    const view = appStore.getCurrentView();
    // Select and render component
  }
}
new App().init();
```

---

## 🔄 Padrões de Conversão

### Pattern 1: Global Variables → Store
```javascript
// Antes
let currentUser = null;
currentUser = user;

// Depois
import { appStore } from './store/appStore.js';
appStore.setCurrentUser(user);
```

### Pattern 2: Functions → Services
```javascript
// Antes
function validarCPF(cpf) { ... }
validarCPF('12345678900');

// Depois
import { validarCPF } from './utils/validators.js';
validarCPF('12345678900');
```

### Pattern 3: Render Functions → Components
```javascript
// Antes
function renderLogin() { return `<div>...</div>` }
app.innerHTML = renderLogin();

// Depois
import { login } from './components/auth/Login.js';
app.innerHTML = login.render();
login.attachEvents();
```

### Pattern 4: Event Attachments → Component Methods
```javascript
// Antes
function attachLoginEvents() {
  $('#login-btn').addEventListener('click', ...);
}

// Depois
class Login {
  attachEvents() {
    $('#login-btn').addEventListener('click', ...);
  }
}
```

---

## 🚀 Como Migrar Novo Código

### Passo 1: Identificar Categoria
Pergunte-se:
- É dado mockado? → `data/`
- É validação/formatação? → `utils/`
- É lógica de negócio? → `services/`
- É UI? → `components/`
- É estado global? → `store/`
- É configuração? → `utils/constants.js`

### Passo 2: Criar Arquivo
```javascript
// src/services/myService.js
class MyService {
  doSomething() {
    // Sua lógica aqui
  }
}

export const myService = new MyService();
```

### Passo 3: Importar Onde Necessário
```javascript
import { myService } from '../services/myService.js';

myService.doSomething();
```

---

## ✅ Checklist de Migração

- [x] Extrair constantes
- [x] Extrair dados mockados
- [x] Extrair validators
- [x] Extrair formatters
- [x] Extrair helpers
- [x] Criar notification service
- [x] Criar auth service
- [x] Criar crypto service
- [x] Criar transaction service
- [x] Criar app store
- [x] Criar componentes de auth
- [x] Criar componentes de dashboard
- [x] Criar componentes comuns
- [x] Criar modais
- [x] Criar main.js
- [x] Atualizar index.html
- [x] Documentar arquitetura
- [ ] Adicionar testes
- [ ] Migrar para TypeScript

---

## 🎯 Benefícios Obtidos

### Manutenibilidade
- ✅ Arquivos pequenos (50-250 linhas vs 1.393)
- ✅ Responsabilidades claras
- ✅ Fácil localização de bugs

### Testabilidade
- ✅ Funções isoladas
- ✅ Fácil mock de dependências
- ✅ Preparado para unit tests

### Escalabilidade
- ✅ Fácil adicionar features
- ✅ Não há risco de conflitos
- ✅ Code splitting possível

### Developer Experience
- ✅ Autocomplete melhorado
- ✅ Imports explícitos
- ✅ Menos bugs em runtime
- ✅ Onboarding mais rápido

---

## 📚 Próximos Passos

1. **Testes Unitários**
   - Validators: 100% coverage
   - Services: 80%+ coverage
   - Components: Integration tests

2. **TypeScript**
   - Adicionar types
   - Compile-time safety
   - Melhor IDE support

3. **Build System**
   - Vite ou Webpack
   - Minification
   - Tree-shaking
   - Code splitting

4. **Backend Integration**
   - API REST
   - WebSockets
   - JWT authentication

---

**Migração concluída com sucesso! 🎉**
