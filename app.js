// INWISTA – SPA SIMULADA

/****************************
 * Integração com Backend (REST/GraphQL)
 ***************************/
const API_BASE_URL = "http://localhost:3000/api";
const GRAPHQL_ENDPOINT = "http://localhost:3000/api/graphql";

async function apiRequest(path, { method = "GET", body, headers = {}, fallback } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro inesperado" }));
      throw new Error(error.message || "Erro inesperado");
    }

    return await response.json();
  } catch (error) {
    console.warn("API fallback:", error.message);
    if (typeof fallback === "function") {
      return fallback(error);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function graphqlRequest(query, variables = {}, fallback) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error("Falha na requisição GraphQL");
    }

    const payload = await response.json();
    if (payload.errors) {
      throw new Error(payload.errors[0]?.message || "Erro GraphQL");
    }
    return payload.data;
  } catch (error) {
    if (typeof fallback === "function") {
      return fallback(error);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

const apiClient = {
  async login(identifier, password) {
    return apiRequest("/auth/login", {
      method: "POST",
      body: { identifier, password },
      fallback: () => {
        const type = detectInputType(identifier);
        let user = null;

        if (type === "cpf") {
          user = users.find((u) => u.cpf === identifier.replace(/[^\d]/g, ""));
        } else if (type === "email") {
          user = users.find((u) => u.email === identifier);
        } else {
          user = users.find((u) => u.username === identifier);
        }

        if (!user || user.senha !== password) {
          throw new Error("Credenciais inválidas");
        }

        return {
          user: { ...user, senha: undefined },
          requires2fa: true,
          twoFactorToken: "offline-demo",
          biometricRequired: true,
          biometricToken: "offline-demo",
        };
      },
    });
  },

  async verify2FA(twoFactorToken, code) {
    return apiRequest("/auth/2fa", {
      method: "POST",
      body: { twoFactorToken, code },
      fallback: () => {
        if (code === "123456") {
          return { success: true };
        }
        throw new Error("Código inválido");
      },
    });
  },

  async verifyBiometry(biometricToken, payload) {
    return apiRequest("/auth/biometry", {
      method: "POST",
      body: { biometricToken, payload },
      fallback: () => ({ success: true, score: 0.98 }),
    });
  },

  async fetchMarket() {
    const query = `
      query MarketSnapshot {
        marketSnapshot {
          symbol
          name
          price
          change24h
          volume24h
        }
      }
    `;

    const result = await graphqlRequest(query, {}, () => ({
      marketSnapshot: cryptos.map((c) => ({
        symbol: c.simbolo,
        name: c.nome,
        price: c.preco_usd,
        change24h: c.variacao_24h,
        volume24h: c.volume_24h,
      })),
    }));

    return result.marketSnapshot;
  },

  async fetchDashboard(userId) {
    return apiRequest(`/users/${userId}/dashboard`, {
      fallback: () => ({
        balances: {
          brl: currentUser?.saldo_brl ?? 0,
          usd: currentUser?.saldo_usd ?? 0,
          crypto: 3.42,
        },
        recentTransactions: transactions,
        compliance: { status: "Aprovado", score: 92 },
      }),
    });
  },

  async simulateTransaction(payload) {
    return apiRequest("/transactions/simulate", {
      method: "POST",
      body: payload,
      fallback: () => {
        const taxa = taxas[payload.tipo] ?? 0;
        const tarifa = payload.valor * (taxa / 100);
        const total = payload.tipo === "pix" ? payload.valor : payload.valor + tarifa;

        if (payload.valor <= 0) {
          throw new Error("Valor inválido");
        }

        if (payload.valor > currentUser.saldo_brl) {
          throw new Error("Saldo insuficiente");
        }

        return {
          approved: true,
          fees: tarifa,
          total,
          receipt: {
            protocolo: `SIM-${Date.now()}`,
            timestamp: new Date().toISOString(),
            tipo: payload.tipo,
            favorecido: payload.destinatario,
            valor: payload.valor,
            taxa: tarifa,
            total,
          },
        };
      },
    });
  },

  async exportReport() {
    return apiRequest("/admin/reports/export", {
      fallback: () => ({
        mime: "text/csv",
        content: "tipo,valor,status\nPIX,500,completed",
        filename: "relatorio-inwista.csv",
      }),
    });
  },
};

/****************************
 * Dados simulados
 ***************************/
const users = [
  {
    id: "user-001",
    nome: "João Silva",
    cpf: "12345678900",
    email: "joao@inwista.com",
    username: "joao",
    senha: "1234",
    role: "user",
    saldo_brl: 5000.0,
    saldo_usd: 950.0,
  },
  {
    id: "admin-001",
    nome: "Admin Inwista",
    cpf: "98765432100",
    email: "admin@inwista.com",
    username: "admin",
    senha: "admin123",
    role: "admin",
    saldo_brl: 0.0,
    saldo_usd: 0.0,
  },
  {
    id: "user-002",
    nome: "Maria Santos",
    cpf: "11122233344",
    email: "maria@email.com",
    username: "maria",
    senha: "senha123",
    role: "user",
    saldo_brl: 3500.0,
    saldo_usd: 650.0,
  },
];

let cryptos = [
  {
    nome: "Bitcoin",
    simbolo: "BTC",
    preco_usd: 113851.5,
    variacao_24h: -1.19,
    volume_24h: "2.3 tri",
    icone_cor: "#F7931A",
  },
  {
    nome: "Ethereum",
    simbolo: "ETH",
    preco_usd: 4059.14,
    variacao_24h: -3.65,
    volume_24h: "493.2 bi",
    icone_cor: "#627EEA",
  },
  {
    nome: "Bitcoin Cash",
    simbolo: "BCH",
    preco_usd: 559.85,
    variacao_24h: 0.28,
    volume_24h: "11.2 bi",
    icone_cor: "#8DC351",
  },
  {
    nome: "Litecoin",
    simbolo: "LTC",
    preco_usd: 98.38,
    variacao_24h: -3.27,
    volume_24h: "7.6 bi",
    icone_cor: "#345D9D",
  },
  {
    nome: "Ethereum Classic",
    simbolo: "ETC",
    preco_usd: 16.15,
    variacao_24h: -3.67,
    volume_24h: "2.5 bi",
    icone_cor: "#328332",
  },
];

let transactions = [
  {
    id: "txn-001",
    tipo: "pix_recebido",
    valor: 500.0,
    moeda: "BRL",
    status: "completed",
    data: "2025-10-28T10:30:00",
    de: "Maria Santos",
    para: "João Silva",
  },
  {
    id: "txn-002",
    tipo: "crypto_compra",
    valor: 1000.0,
    moeda: "BRL",
    cripto: "BTC",
    quantidade_cripto: 0.0088,
    taxa: 2.0,
    status: "completed",
    data: "2025-10-27T15:45:00",
  },
  {
    id: "txn-003",
    tipo: "ted",
    valor: 2500.0,
    moeda: "BRL",
    taxa: 3.5,
    status: "processing",
    data: "2025-10-28T14:20:00",
    de: "João Silva",
    para: "Banco XYZ",
  },
];

const taxas = {
  pix: 0.0,
  ted: 3.5,
  tef: 2.0,
  crypto_maker: 0.1,
  crypto_taker: 0.2,
};

/****************************
 * Estado & helpers
 ***************************/
let currentUser = null;
let currentView = "login"; // login, 2fa, biometric, dashboard, explore, transactions, assets, admin
let loginAttempts = 0;
let isBlocked = false;
let blockUntil = null;
let twoFactorSession = null;
let biometricSession = null;
let dashboardData = null;
let marketSnapshot = [];
let lastSimulation = null;

function $(selector) {
  return document.querySelector(selector);
}

function formatBRL(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}
function formatUSD(value) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
}

/****************************
 * CPF Validation
 ***************************/
function validarCPF(cpf) {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, '');
  
  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais (CPF inválido)
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  // CPFs de teste - aceitar para demonstração
  const testCPFs = ['12345678900', '98765432100', '11122233344'];
  if (testCPFs.includes(cpf)) return true;
  
  // Validação do primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = soma % 11;
  let digito1 = resto < 2 ? 0 : 11 - resto;
  
  if (parseInt(cpf.charAt(9)) !== digito1) return false;
  
  // Validação do segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = soma % 11;
  let digito2 = resto < 2 ? 0 : 11 - resto;
  
  if (parseInt(cpf.charAt(10)) !== digito2) return false;
  
  return true;
}

function detectInputType(value) {
  // Remove espaços
  value = value.trim();
  
  // Detecta email
  if (value.includes('@')) {
    return 'email';
  }
  
  // Detecta CPF (com ou sem formatação)
  const numbersOnly = value.replace(/[^\d]/g, '');
  if (numbersOnly.length === 11) {
    return 'cpf';
  }
  
  // Caso contrário, é username
  return 'username';
}

function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validateUsername(username) {
  return username.length >= 3;
}

/****************************
 * Notification System
 ***************************/
let notificationContainer = null;

function initNotificationContainer() {
  if (!notificationContainer) {
    notificationContainer = document.createElement('div');
    notificationContainer.className = 'notification-toast-container';
    document.body.appendChild(notificationContainer);
  }
  return notificationContainer;
}

function showToast(type, title, message, duration = 5000) {
  const container = initNotificationContainer();
  
  const toast = document.createElement('div');
  toast.className = `notification-toast notification-toast--${type}`;
  
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠'
  };
  
  toast.innerHTML = `
    <div class="notification-toast__icon">${icons[type] || '•'}</div>
    <div class="notification-toast__content">
      <div class="notification-toast__title">${title}</div>
      ${message ? `<div class="notification-toast__message">${message}</div>` : ''}
    </div>
    <button class="notification-toast__close">×</button>
  `;
  
  container.appendChild(toast);
  
  // Close button
  toast.querySelector('.notification-toast__close').addEventListener('click', () => {
    removeToast(toast);
  });
  
  // Auto remove
  if (duration > 0) {
    setTimeout(() => {
      removeToast(toast);
    }, duration);
  }
}

function removeToast(toast) {
  toast.style.animation = 'slideInFromTop 0.3s var(--ease-standard) reverse';
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 300);
}

function showFieldError(fieldId, message) {
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

function clearFieldError(fieldId) {
  const field = $(`#${fieldId}`);
  if (!field) return;
  
  field.classList.remove('form-control--error');
  const error = field.parentNode.querySelector('.field-error');
  if (error) {
    error.remove();
  }
}

function setFieldSuccess(fieldId) {
  const field = $(`#${fieldId}`);
  if (!field) return;
  
  clearFieldError(fieldId);
  field.classList.add('form-control--success');
}

/****************************
 * Renderizador principal
 ***************************/
function render() {
  const app = $("#app");
  if (!app) return;

  switch (currentView) {
    case "login":
      app.innerHTML = renderLogin();
      attachLoginEvents();
      break;
    case "2fa":
      app.innerHTML = render2FA();
      attach2FAEvents();
      break;
    case "biometric":
      app.innerHTML = renderBiometric();
      attachBiometricEvents();
      break;
    case "dashboard":
      app.innerHTML = renderLayout(renderHome());
      attachGlobalEvents();
      drawSparklines();
      hydrateDashboard();
      break;
    case "explore":
      app.innerHTML = renderLayout(renderExplore());
      attachGlobalEvents();
      break;
    case "transactions":
      app.innerHTML = renderLayout(renderTransactions());
      attachGlobalEvents();
      attachTransactionEvents();
      hydrateTransactions();
      break;
    case "assets":
      app.innerHTML = renderLayout(renderAssets());
      attachGlobalEvents();
      break;
    case "admin":
      if (currentUser && currentUser.role === "admin") {
        app.innerHTML = renderLayout(renderAdminDashboard());
        attachGlobalEvents();
      } else {
        currentView = "dashboard";
        render();
      }
      break;
    default:
      app.innerHTML = "<p>View not found</p>";
  }
}

/****************************
 * Telas
 ***************************/
function renderLogin() {
  const blockedMessage = isBlocked ? `<div style="padding: var(--space-12); background: rgba(var(--color-error-rgb), 0.1); border: 1px solid var(--color-error); border-radius: var(--radius-base); margin-bottom: var(--space-16); color: var(--color-error); font-size: var(--font-size-sm);">⚠ Conta temporariamente bloqueada. Tente novamente em alguns minutos.</div>` : '';
  
  return `
  <div class="login-container">
    <!-- LEFT SIDE: Branding -->
    <div class="login-left">
      <div class="login-left__content">
        <div class="login-left__logo">
          <div class="logo-inwista">
            <div class="logo-symbol" title="Inwista">S</div>
            <div class="logo-text">Inwista</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- RIGHT SIDE: Login Form -->
    <div class="login-right">
      <div class="login-right__form">
        <!-- Mobile Logo (only visible on mobile) -->
        <div class="login-mobile-logo">
          <div class="logo-inwista">
            <div class="logo-symbol">S</div>
            <div class="logo-text">Inwista</div>
          </div>
        </div>
        
        <div class="login-right__header">
          <h2 class="login-right__title">Acesso à Plataforma</h2>
          <p class="login-right__subtitle">Entre com suas credenciais</p>
        </div>

        ${blockedMessage}

        <form id="login-form">
          <div class="form-group">
            <label class="form-label" for="identifier">CPF, E-mail ou Usuário</label>
            <input type="text" id="identifier" class="form-control" placeholder="Digite seu CPF, e-mail ou usuário" required ${isBlocked ? 'disabled' : ''}>
          </div>
          <div class="form-group">
            <label class="form-label" for="password">Senha</label>
            <div class="input-with-icon">
              <input type="password" id="password" class="form-control" placeholder="Digite sua senha" required ${isBlocked ? 'disabled' : ''}>
              <button type="button" class="toggle-password-btn" id="toggle-password" aria-label="Mostrar senha">
                <svg id="eye-icon" class="eye-icon" viewBox="0 0 24 24">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                </svg>
                <svg id="eye-off-icon" class="eye-icon hidden" viewBox="0 0 24 24">
                  <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                </svg>
              </button>
            </div>
          </div>
          <div style="text-align: right; margin-bottom: var(--space-16);">
            <a href="#" id="forgot-password-link" style="font-size: var(--font-size-sm); color: var(--color-primary);">Esqueceu sua senha?</a>
          </div>
          <button type="submit" class="btn btn--primary btn--full-width" id="login-btn" style="height: 48px; margin-bottom: var(--space-16);" ${isBlocked ? 'disabled' : ''}>Acessar a plataforma</button>
        </form>

        <div class="login-right__divider">Não tem conta?</div>
        
        <button class="btn btn--outline btn--full-width" id="create-account" style="height: 48px;">Criar conta</button>

        <div class="login-right__footer">
          <div style="margin-bottom: var(--space-8);">
            <a href="#" target="_blank">Políticas de Privacidade</a> • 
            <a href="#" target="_blank">Termos e Políticas</a>
          </div>
          <a href="#" style="display: block;">Dúvidas frequentes</a>
        </div>
      </div>
    </div>
  </div>`;
}

function render2FA() {
  return `
  <div class="full-height">
    <div class="centered" style="max-width:380px;width:100%;">
      <h2 class="mb-8" style="text-align:center;">Verificação 2FA</h2>
      <p class="mb-16" style="text-align:center;">Insira o código de 6 dígitos enviado para você</p>
      <form id="code-form">
        <div class="form-group"><input type="text" maxlength="6" class="form-control" id="code" placeholder="123456" required></div>
        <button type="submit" class="btn btn--primary btn--full-width">Verificar código</button>
      </form>
      <div class="mt-8" style="font-size:var(--font-size-sm);text-align:center;">
        <button class="btn btn--sm btn--outline" id="resend">Enviar por SMS</button>
        <button class="btn btn--sm btn--outline" id="resend-email">Enviar por Email</button>
        <span id="timer" class="ml-8">60s</span>
      </div>
  </div>
</div>`;
}

function renderBiometric() {
  return `
  <div class="full-height">
    <div class="centered" style="max-width:420px;width:100%;text-align:center;">
      <div class="biometric-icon">👤</div>
      <h2 class="mb-8">Verificação Biométrica Facial</h2>
      <p class="mb-16">Posicione o rosto na área indicada ou envie uma selfie recente para validar o acesso.</p>
      <div class="biometric-card">
        <video id="biometric-video" autoplay playsinline muted class="hidden"></video>
        <canvas id="biometric-canvas" class="hidden"></canvas>
        <div id="biometric-placeholder" class="biometric-placeholder">
          <div class="biometric-guidelines">
            <span>Enquadre o rosto</span>
            <small>Iluminação frontal, mantenha-se imóvel.</small>
          </div>
        </div>
      </div>
      <div class="biometric-actions">
        <button class="btn btn--primary" id="start-biometric">Iniciar captura</button>
        <label class="btn btn--outline" for="biometric-upload">Enviar selfie</label>
        <input type="file" accept="image/*" id="biometric-upload" class="hidden" />
      </div>
      <div id="biometric-status" class="biometric-status"></div>
      <button class="btn btn--primary btn--full-width" id="confirm-biometric" disabled>Confirmar identidade</button>
      <button class="btn btn--link" id="skip-biometric">Validar depois</button>
    </div>
  </div>`;
}

function renderLayout(content) {
  return `
  <div style="display:flex;min-height:100vh;">
    ${renderSidebar()}
    <div class="main">${content}</div>
  </div>`;
}

function renderSidebar() {
  const items = [
    { id: "dashboard", label: "Início" },
    { id: "assets", label: "Meus ativos" },
    { id: "transactions", label: "Transações" },
    { id: "explore", label: "Explorar" },
    { id: "settings", label: "Configurações" },
  ];
  if (currentUser && currentUser.role === "admin") {
    items.push({ id: "admin", label: "Admin" });
  }
  return `
    <aside class="sidebar" id="sidebar">
      <div class="px-16">
        <div class="logo"><div class="logo__icon">S</div><span>Inwista</span></div>
      </div>
      <nav class="sidebar__nav">
        ${items
          .map(
            (item) => `<div class="sidebar__item ${
              currentView === item.id ? "sidebar__item--active" : ""
            }" data-nav="${item.id}">${item.label}</div>`
          )
          .join("")}
      </nav>
    </aside>`;
}

function renderHome() {
  const balances = dashboardData?.balances ?? {
    brl: currentUser?.saldo_brl ?? 0,
    usd: currentUser?.saldo_usd ?? 0,
    crypto: dashboardData?.balances?.crypto ?? 0,
  };

  const compliance = dashboardData?.compliance ?? { status: "Em análise", score: 85 };

  return `
    <header class="main__header"><h2>Bem-vindo, ${currentUser.nome}</h2><div>${formatBRL(
    balances.brl
  )}</div></header>
    <section class="p-16">
      <div class="grid grid--dashboard">
        <div class="card card--primary-gradient">
          <div>
            <div class="metric__value" id="dashboard-balance-brl">${formatBRL(balances.brl)}</div>
            <div class="metric__label">Saldo disponível</div>
          </div>
          <button class="btn btn--surface" id="quick-withdraw">Sacar agora</button>
        </div>
        <div class="card card--surface">
          <h4>Resumo de carteiras</h4>
          <ul class="list">
            <li><span>Saldo em USD</span><span id="dashboard-balance-usd">${formatUSD(balances.usd)}</span></li>
            <li><span>Criptoativos</span><span id="dashboard-crypto-btc">${(balances.crypto ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} BTC</span></li>
            <li><span>Saldo protegido</span><span>${formatBRL(1200)}</span></li>
          </ul>
        </div>
        <div class="card card--surface">
          <h4>Compliance</h4>
          <p>Status: <span class="badge badge--success" id="dashboard-compliance-status">${compliance.status}</span></p>
          <p>Score: <strong id="dashboard-compliance-score">${compliance.score}%</strong></p>
          <button class="btn btn--outline btn--sm" id="download-compliance">Exportar relatório</button>
        </div>
      </div>
    </section>
    <section class="p-16">
      <div class="section-header">
        <h3 class="mb-16">Mercado em tempo real</h3>
        <button class="btn btn--outline btn--sm" id="refresh-market">Atualizar cotações</button>
      </div>
      <div style="overflow-x:auto;">
        <table class="table" id="crypto-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Preço (USD)</th>
              <th></th>
              <th>Volume 24h</th>
              <th>Variação %</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${cryptos
              .map(
                (c, idx) => `<tr>
                <td><span style="display:flex;align-items:center;gap:8px;"><span style="width:16px;height:16px;background:${c.icone_cor};border-radius:50%;display:inline-block;"></span>${c.nome}</span></td>
                <td>${formatUSD(c.preco_usd)}</td>
                <td><canvas id="spark-${idx}" class="sparkline"></canvas></td>
                <td>${c.volume_24h}</td>
                <td style="color:${c.variacao_24h >= 0 ? "green" : "red"};">${c.variacao_24h}%</td>
                <td><button class="btn btn--sm btn--primary" data-buy="${c.simbolo}">Comprar</button></td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderExplore() {
  return `<header class="main__header"><h2>Explorar</h2></header><div class="p-16"><p>Conteúdo futuro...</p></div>`;
}

function renderTransactions() {
  return `
  <header class="main__header"><h2>Transações</h2></header>
  <div class="p-16">
    <div class="grid grid--two-columns">
      <div class="card card--surface">
        <h3 class="mb-16">Simulador PIX / TED / TEF</h3>
        <form id="simulation-form" class="vertical-form">
          <div class="form-group">
            <label class="form-label" for="simulation-type">Tipo de operação</label>
            <select id="simulation-type" class="form-control">
              <option value="pix">PIX Imediato</option>
              <option value="ted">TED</option>
              <option value="tef">TEF</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="simulation-value">Valor (BRL)</label>
            <input type="number" id="simulation-value" class="form-control" min="1" step="0.01" placeholder="1500.00" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="simulation-recipient">Favorecido / Chave PIX</label>
            <input type="text" id="simulation-recipient" class="form-control" placeholder="CPF, CNPJ, e-mail ou agência" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="simulation-description">Descrição</label>
            <textarea id="simulation-description" class="form-control" placeholder="Observações internas"></textarea>
          </div>
          <button type="submit" class="btn btn--primary btn--full-width">Simular operação</button>
        </form>
      </div>
      <div class="card card--surface" id="simulation-result-card">
        <h3 class="mb-16">Resultado da simulação</h3>
        <div id="simulation-result">
          ${lastSimulation ? renderSimulationSummary(lastSimulation) : '<p>Preencha o formulário ao lado para validar limites, taxas e comprovante.</p>'}
        </div>
      </div>
    </div>
  </div>
  <div class="p-16">
    <div id="transactions-table-wrapper">
      ${transactions.length === 0 ? renderEmptyState() : renderTransactionsTable()}
    </div>
  </div>`;
}

function renderTransactionsTable() {
  return `<table class="table"><thead><tr><th>ID</th><th>Tipo</th><th>Valor</th><th>Status</th><th>Data</th></tr></thead><tbody>${transactions
    .map(
      (t) => `<tr><td>${t.id}</td><td>${t.tipo}</td><td>${formatBRL(
        t.valor
      )}</td><td><span class="badge ${badgeClass(t.status)}">${
        t.status
      }</span></td><td>${new Date(t.data).toLocaleString("pt-BR")}</td></tr>`
    )
    .join("")}</tbody></table>`;
}

function renderSimulationSummary(simulation) {
  return `
    <div class="simulation-summary">
      <div class="summary-row"><span>Protocolo</span><strong>${simulation.protocolo}</strong></div>
      <div class="summary-row"><span>Data/Hora</span><strong>${new Date(simulation.timestamp).toLocaleString('pt-BR')}</strong></div>
      <div class="summary-row"><span>Tipo</span><strong>${simulation.tipo?.toUpperCase()}</strong></div>
      <div class="summary-row"><span>Favorecido</span><strong>${simulation.favorecido}</strong></div>
      <div class="summary-row"><span>Valor</span><strong>${formatBRL(simulation.valor)}</strong></div>
      <div class="summary-row"><span>Taxas</span><strong>${formatBRL(simulation.taxa ?? 0)}</strong></div>
      <div class="summary-row"><span>Total debitado</span><strong>${formatBRL(simulation.total ?? simulation.valor)}</strong></div>
      <button class="btn btn--outline btn--full-width" id="download-receipt">Baixar comprovante</button>
    </div>
  `;
}

function badgeClass(status) {
  switch (status) {
    case "completed":
      return "badge--success";
    case "processing":
      return "badge--warning";
    default:
      return "badge--error";
  }
}

function renderEmptyState() {
  return `<div style="text-align:center;padding:var(--space-32);"><p>Nenhuma transação encontrada</p></div>`;
}

function renderAssets() {
  return `<header class="main__header"><h2>Meus ativos</h2></header><div class="p-16"><p>Saldo total: ${formatUSD(
    currentUser.saldo_usd
  )}</p></div>`;
}

function renderAdminDashboard() {
  const totalUsers = users.length;
  const totalTx = transactions.length;
  const volume24h = transactions
    .filter((t) => t.status === "completed")
    .reduce((acc, t) => acc + t.valor, 0);
  return `<header class="main__header"><h2>Admin Dashboard</h2></header>
  <div class="p-16">
    <div class="flex gap-16">
      <div class="card"><div class="card__body">Total de usuários: ${totalUsers}</div></div>
      <div class="card"><div class="card__body">Total de transações: ${totalTx}</div></div>
      <div class="card"><div class="card__body">Volume 24h: ${formatBRL(volume24h)}</div></div>
    </div>
  </div>`;
}

/****************************
 * Eventos globais e helpers
 ***************************/
function attachLoginEvents() {
  // Check if blocked
  if (isBlocked && blockUntil) {
    if (Date.now() < blockUntil) {
      // Still blocked
      return;
    } else {
      // Unblock
      isBlocked = false;
      blockUntil = null;
      loginAttempts = 0;
    }
  }
  
  const identifierField = $('#identifier');
  const passwordField = $('#password');
  
  // Real-time validation for identifier
  if (identifierField) {
    identifierField.addEventListener('blur', () => {
      const value = identifierField.value.trim();
      if (!value) return;
      
      const type = detectInputType(value);
      clearFieldError('identifier');
      
      if (type === 'cpf') {
        const cpfClean = value.replace(/[^\d]/g, '');
        if (!validarCPF(cpfClean)) {
          showFieldError('identifier', 'CPF inválido. Verifique os dígitos.');
        } else {
          setFieldSuccess('identifier');
        }
      } else if (type === 'email') {
        if (!validateEmail(value)) {
          showFieldError('identifier', 'E-mail inválido. Use o formato: usuario@dominio.com');
        } else {
          setFieldSuccess('identifier');
        }
      } else if (type === 'username') {
        if (!validateUsername(value)) {
          showFieldError('identifier', 'Username deve ter pelo menos 3 caracteres');
        } else {
          setFieldSuccess('identifier');
        }
      }
    });
    
    identifierField.addEventListener('input', () => {
      clearFieldError('identifier');
      identifierField.classList.remove('form-control--success');
    });
  }
  
  if (passwordField) {
    passwordField.addEventListener('input', () => {
      clearFieldError('password');
    });
  }
  
  // Password toggle
  const togglePasswordBtn = $('#toggle-password');
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', () => {
      togglePasswordVisibility();
    });
  }
  
  // Forgot password link
  const forgotPasswordLink = $('#forgot-password-link');
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      openForgotPasswordModal();
    });
  }
  
  // Submit login
  $('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (isBlocked) {
      showToast('error', 'Conta Bloqueada', 'Aguarde alguns minutos antes de tentar novamente.');
      return;
    }

    const identifier = identifierField.value.trim();
    const password = passwordField.value.trim();

    clearFieldError('identifier');
    clearFieldError('password');

    let hasError = false;

    if (!identifier) {
      showFieldError('identifier', 'Campo obrigatório');
      hasError = true;
    } else {
      const type = detectInputType(identifier);

      if (type === 'cpf') {
        const cpfClean = identifier.replace(/[^\d]/g, '');
        if (!validarCPF(cpfClean)) {
          showFieldError('identifier', 'CPF inválido. Verifique os dígitos.');
          hasError = true;
        }
      } else if (type === 'email') {
        if (!validateEmail(identifier)) {
          showFieldError('identifier', 'E-mail inválido.');
          hasError = true;
        }
      } else if (type === 'username') {
        if (!validateUsername(identifier)) {
          showFieldError('identifier', 'Username deve ter pelo menos 3 caracteres');
          hasError = true;
        }
      }
    }

    if (!password) {
      showFieldError('password', 'Campo obrigatório');
      hasError = true;
    } else if (password.length < 4) {
      showFieldError('password', 'Senha deve ter no mínimo 4 caracteres');
      hasError = true;
    }

    if (hasError) return;

    const loginBtn = $('#login-btn');
    loginBtn.classList.add('btn--loading');
    loginBtn.disabled = true;

    try {
      const result = await apiClient.login(identifier, password);
      loginAttempts = 0;
      currentUser = { ...result.user };
      twoFactorSession = {
        token: result.twoFactorToken,
        identifier,
        attempts: 0,
      };
      biometricSession = result.biometricRequired
        ? { token: result.biometricToken, pending: true }
        : null;

      showToast('success', 'Credenciais válidas', 'Confirme o código 2FA para prosseguir.');
      currentView = '2fa';
      render();
    } catch (error) {
      loginAttempts++;
      const remaining = Math.max(0, 3 - loginAttempts);

      if (loginAttempts >= 3) {
        isBlocked = true;
        blockUntil = Date.now() + 5 * 60 * 1000;
        showToast('error', 'Conta Bloqueada', 'Após 3 tentativas incorretas, sua conta foi bloqueada por 5 minutos.');
        render();
      } else {
        showToast('error', 'Falha no login', `${error.message || 'Credenciais inválidas'}. Você tem mais ${remaining} tentativa(s).`);
      }
    } finally {
      loginBtn.classList.remove('btn--loading');
      loginBtn.disabled = false;
    }
  });
  
  const createAccountBtn = $('#create-account');
  if (createAccountBtn) {
    createAccountBtn.addEventListener('click', () => {
      openCreateAccountModal();
    });
  }
}

function checkLoginAttempts() {
  if (loginAttempts >= 3) {
    isBlocked = true;
    blockUntil = Date.now() + (5 * 60 * 1000);
    showToast('error', 'Conta Bloqueada', 'Muitas tentativas incorretas. Tente novamente em 5 minutos.');
    render();
  }
}

function attach2FAEvents() {
  let seconds = 60;
  const timerEl = $("#timer");
  const interval = setInterval(() => {
    seconds--;
    if (timerEl) timerEl.textContent = seconds + "s";
    if (seconds <= 0) clearInterval(interval);
  }, 1000);
  $('#code-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = $('#code').value.trim();

    if (!code || code.length !== 6) {
      showToast('error', 'Código inválido', 'Informe os 6 dígitos enviados.');
      return;
    }

    const submitBtn = $('#code-form button[type="submit"]');
    submitBtn.classList.add('btn--loading');
    submitBtn.disabled = true;

    try {
      await apiClient.verify2FA(twoFactorSession?.token ?? 'offline-demo', code);
      showToast('success', 'Código verificado!', biometricSession ? 'Vamos validar a biometria.' : 'Redirecionando para o dashboard...');

      twoFactorSession = null;
      if (biometricSession) {
        currentView = 'biometric';
      } else {
        currentView = 'dashboard';
      }
      render();
    } catch (error) {
      if (!twoFactorSession) {
        twoFactorSession = { attempts: 0 };
      }
      twoFactorSession.attempts += 1;
      const remaining = Math.max(0, 5 - twoFactorSession.attempts);
      showToast('error', 'Código Inválido', `${error.message || 'Falha na verificação.'} Restam ${remaining} tentativa(s).`);

      if (twoFactorSession.attempts >= 5) {
        showToast('error', 'Sessão encerrada', 'Você excedeu o limite de tentativas. Faça login novamente.');
        currentView = 'login';
        render();
      }
    } finally {
      submitBtn.classList.remove('btn--loading');
      submitBtn.disabled = false;
    }
  });
  const resendBtn = $('#resend');
  const resendEmailBtn = $('#resend-email');

  if (resendBtn) {
    resendBtn.addEventListener('click', () => {
      seconds = 60;
      showToast('success', 'Código Reenviado', 'Um novo código foi enviado por SMS.');
    });
  }
  
  if (resendEmailBtn) {
    resendEmailBtn.addEventListener('click', () => {
      seconds = 60;
      showToast('success', 'Código Reenviado', 'Um novo código foi enviado por e-mail.');
    });
  }
}

function attachBiometricEvents() {
  const startBtn = $("#start-biometric");
  const uploadInput = $("#biometric-upload");
  const confirmBtn = $("#confirm-biometric");
  const skipBtn = $("#skip-biometric");
  const statusEl = $("#biometric-status");
  const videoEl = $("#biometric-video");
  const canvasEl = $("#biometric-canvas");
  const placeholder = $("#biometric-placeholder");

  let stream = null;
  let capturedImage = null;

  function enableConfirmation(payloadDescription) {
    confirmBtn.disabled = false;
    statusEl.textContent = `Captura pronta (${payloadDescription})`;
    statusEl.classList.add("success");
  }

  if (startBtn) {
    startBtn.addEventListener("click", async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoEl.srcObject = stream;
        videoEl.classList.remove("hidden");
        placeholder.classList.add("hidden");
        statusEl.textContent = "Transmitindo vídeo. Clique em Confirmar para capturar.";
        statusEl.classList.remove("success", "error");
        capturedImage = null;
      } catch (error) {
        statusEl.textContent = "Não foi possível acessar a câmera. Faça upload manual.";
        statusEl.classList.add("error");
      }
    });
  }

  if (uploadInput) {
    uploadInput.addEventListener("change", async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        capturedImage = reader.result;
        placeholder.innerHTML = `<img src="${capturedImage}" alt="Pré-visualização" class="biometric-preview" />`;
        placeholder.classList.remove("hidden");
        videoEl?.classList.add("hidden");
        enableConfirmation("upload");
      };
      reader.readAsDataURL(file);
    });
  }

  if (confirmBtn) {
    confirmBtn.addEventListener("click", async () => {
      if (videoEl && !videoEl.classList.contains("hidden") && stream) {
        const context = canvasEl.getContext("2d");
        canvasEl.width = videoEl.videoWidth;
        canvasEl.height = videoEl.videoHeight;
        context.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);
        capturedImage = canvasEl.toDataURL("image/png");
      }

      if (!capturedImage) {
        showToast("error", "Capture inválida", "Faça o upload ou inicie a captura.");
        return;
      }

      confirmBtn.classList.add("btn--loading");
      try {
        await apiClient.verifyBiometry(biometricSession?.token ?? "offline-demo", {
          image: capturedImage,
          metadata: {
            device: navigator.userAgent,
            timestamp: new Date().toISOString(),
          },
        });

        showToast("success", "Biometria validada", "Identidade confirmada com sucesso.");
        biometricSession = null;
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
        currentView = "dashboard";
        render();
      } catch (error) {
        statusEl.textContent = error.message;
        statusEl.classList.add("error");
        showToast("error", "Falha na biometria", error.message);
      } finally {
        confirmBtn.classList.remove("btn--loading");
      }
    });
  }

  if (skipBtn) {
    skipBtn.addEventListener("click", () => {
      showToast("warning", "Biometria pendente", "Você poderá validar novamente no próximo acesso.");
      biometricSession = null;
      currentView = "dashboard";
      render();
    });
  }
}

function attachGlobalEvents() {
  // nav items
  document.querySelectorAll("[data-nav]").forEach((el) => {
    if (!el.dataset.bound) {
      el.dataset.bound = 'true';
      el.addEventListener("click", () => {
        currentView = el.dataset.nav;
        render();
      });
    }
  });
  // buy crypto buttons
  document.querySelectorAll("[data-buy]").forEach((btn) => {
    if (!btn.dataset.bound) {
      btn.dataset.bound = 'true';
      btn.addEventListener("click", () => {
        const simbolo = btn.dataset.buy;
        openBuyModal(simbolo);
      });
    }
  });

  const refreshBtn = document.getElementById('refresh-market');
  if (refreshBtn && !refreshBtn.dataset.bound) {
    refreshBtn.dataset.bound = 'true';
    refreshBtn.addEventListener('click', () => {
      refreshMarketData();
    });
  }

  const downloadBtn = document.getElementById('download-compliance');
  if (downloadBtn && !downloadBtn.dataset.bound) {
    downloadBtn.dataset.bound = 'true';
    downloadBtn.addEventListener('click', async () => {
      downloadBtn.classList.add('btn--loading');
      try {
        const report = await apiClient.exportReport();
        const blob = new Blob([report.content], { type: report.mime });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = report.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('success', 'Relatório exportado', 'O arquivo foi gerado com sucesso.');
      } catch (error) {
        showToast('error', 'Erro ao exportar', error.message);
      } finally {
        downloadBtn.classList.remove('btn--loading');
      }
    });
  }

  const withdrawBtn = document.getElementById('quick-withdraw');
  if (withdrawBtn && !withdrawBtn.dataset.bound) {
    withdrawBtn.dataset.bound = 'true';
    withdrawBtn.addEventListener('click', () => {
      showToast('info', 'Fluxo de saque', 'A validação de saque está disponível no módulo de simulação.');
    });
  }
}

function attachTransactionEvents() {
  const form = document.getElementById('simulation-form');
  if (form && !form.dataset.bound) {
    form.dataset.bound = 'true';
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!currentUser) {
        showToast('error', 'Sessão expirada', 'Faça login novamente para simular.');
        currentView = 'login';
        render();
        return;
      }

      const type = document.getElementById('simulation-type').value;
      const value = parseFloat(document.getElementById('simulation-value').value);
      const recipient = document.getElementById('simulation-recipient').value.trim();
      const description = document.getElementById('simulation-description').value.trim();

      if (Number.isNaN(value) || value <= 0) {
        showToast('error', 'Valor inválido', 'Informe um valor positivo.');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.classList.add('btn--loading');

      try {
        const payload = {
          userId: currentUser.id,
          tipo: type,
          valor: value,
          destinatario: recipient,
          descricao: description,
        };

        const result = await apiClient.simulateTransaction(payload);
        lastSimulation = { ...result.receipt };
        const resultContainer = document.getElementById('simulation-result');
        if (resultContainer) {
          resultContainer.innerHTML = renderSimulationSummary(lastSimulation);
          attachTransactionEvents();
        }
        showToast('success', 'Simulação aprovada', `Total debitado: ${formatBRL(result.total)}`);
      } catch (error) {
        showToast('error', 'Falha na simulação', error.message);
      } finally {
        submitBtn.classList.remove('btn--loading');
      }
    });
  }

  const downloadReceiptBtn = document.getElementById('download-receipt');
  if (downloadReceiptBtn && lastSimulation && !downloadReceiptBtn.dataset.bound) {
    downloadReceiptBtn.dataset.bound = 'true';
    downloadReceiptBtn.addEventListener('click', () => {
      const content = [
        `Protocolo: ${lastSimulation.protocolo}`,
        `Data/Hora: ${new Date(lastSimulation.timestamp).toLocaleString('pt-BR')}`,
        `Tipo: ${lastSimulation.tipo}`,
        `Favorecido: ${lastSimulation.favorecido}`,
        `Valor: ${formatBRL(lastSimulation.valor)}`,
        `Taxa: ${formatBRL(lastSimulation.taxa ?? 0)}`,
        `Total: ${formatBRL(lastSimulation.total ?? lastSimulation.valor)}`,
      ].join('\n');

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `comprovante-simulacao-${lastSimulation.protocolo}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }
}

function drawSparklines() {
  cryptos.forEach((c, idx) => {
    const ctx = document.getElementById(`spark-${idx}`);
    if (ctx) {
      const random = Array.from({ length: 10 }, () =>
        c.variacao_24h >= 0 ? Math.random() * 5 + 90 : Math.random() * 5 + 85
      );
      new Chart(ctx, {
        type: "line",
        data: {
          labels: random.map((_, i) => i),
          datasets: [
            {
              data: random,
              borderColor: c.variacao_24h >= 0 ? "#1FB8CD" : "#DB4545",
              borderWidth: 2,
              fill: false,
              tension: 0.3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { x: { display: false }, y: { display: false } },
        },
      });
    }
  });
}

async function hydrateDashboard() {
  if (!currentUser) return;

  try {
    const [market, dashboard] = await Promise.all([
      apiClient.fetchMarket(),
      apiClient.fetchDashboard(currentUser.id),
    ]);

    marketSnapshot = market;
    dashboardData = dashboard;

    const previousCryptos = cryptos.slice();
    cryptos = market.map((asset) => {
      const base = previousCryptos.find((c) => c.simbolo === asset.symbol) ?? {};
      const change = Number(asset.change24h ?? base.variacao_24h ?? 0);
      return {
        nome: asset.name ?? base.nome ?? asset.symbol,
        simbolo: asset.symbol ?? base.simbolo ?? asset.name,
        preco_usd: Number(asset.price ?? base.preco_usd ?? 0),
        variacao_24h: parseFloat(change.toFixed(2)),
        volume_24h: asset.volume24h ?? base.volume_24h ?? "--",
        icone_cor: base.icone_cor ?? "#1FB8CD",
      };
    });
    updateDashboardUI();
  } catch (error) {
    console.warn("hydrateDashboard", error);
    showToast('warning', 'Dados offline', 'Exibindo dados simulados.');
  }
}

async function refreshMarketData() {
  try {
    const market = await apiClient.fetchMarket();
    marketSnapshot = market;
    const previousCryptos = cryptos.slice();
    cryptos = market.map((asset) => {
      const base = previousCryptos.find((c) => c.simbolo === asset.symbol) ?? {};
      const change = Number(asset.change24h ?? base.variacao_24h ?? 0);
      return {
        nome: asset.name ?? base.nome ?? asset.symbol,
        simbolo: asset.symbol ?? base.simbolo ?? asset.name,
        preco_usd: Number(asset.price ?? base.preco_usd ?? 0),
        variacao_24h: parseFloat(change.toFixed(2)),
        volume_24h: asset.volume24h ?? base.volume_24h ?? "--",
        icone_cor: base.icone_cor ?? "#1FB8CD",
      };
    });
    showToast('success', 'Mercado atualizado', 'Cotações sincronizadas com sucesso.');
    updateDashboardUI();
  } catch (error) {
    showToast('error', 'Falha na atualização', error.message);
  }
}

function updateDashboardUI() {
  if (currentView !== 'dashboard') return;

  const balances = dashboardData?.balances ?? {
    brl: currentUser?.saldo_brl ?? 0,
    usd: currentUser?.saldo_usd ?? 0,
    crypto: 0,
  };

  const compliance = dashboardData?.compliance ?? { status: 'Em análise', score: 80 };

  const brlEl = document.getElementById('dashboard-balance-brl');
  if (brlEl) brlEl.textContent = formatBRL(balances.brl);

  const usdEl = document.getElementById('dashboard-balance-usd');
  if (usdEl) usdEl.textContent = formatUSD(balances.usd);

  const cryptoEl = document.getElementById('dashboard-crypto-btc');
  if (cryptoEl) {
    cryptoEl.textContent = `${(balances.crypto ?? 0).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    })} BTC`;
  }

  const complianceStatusEl = document.getElementById('dashboard-compliance-status');
  if (complianceStatusEl) complianceStatusEl.textContent = compliance.status;

  const complianceScoreEl = document.getElementById('dashboard-compliance-score');
  if (complianceScoreEl) complianceScoreEl.textContent = `${compliance.score}%`;

  const marketBody = document.querySelector('#crypto-table tbody');
  if (marketBody) {
    marketBody.innerHTML = cryptos
      .map(
        (c, idx) => `<tr>
          <td><span style="display:flex;align-items:center;gap:8px;"><span style="width:16px;height:16px;background:${c.icone_cor};border-radius:50%;display:inline-block;"></span>${c.nome}</span></td>
          <td>${formatUSD(Number(c.preco_usd))}</td>
          <td><canvas id="spark-${idx}" class="sparkline"></canvas></td>
          <td>${c.volume_24h}</td>
          <td style="color:${c.variacao_24h >= 0 ? 'var(--color-success)' : 'var(--color-error)'};">${
            c.variacao_24h >= 0 ? '+' : ''
          }${c.variacao_24h}%</td>
          <td><button class="btn btn--sm btn--primary" data-buy="${c.simbolo}">Comprar</button></td>
        </tr>`
      )
      .join('');
    drawSparklines();
    attachGlobalEvents();
  }
}

async function hydrateTransactions() {
  try {
    const apiTransactions = await apiRequest('/transactions', {
      fallback: () => transactions,
    });

    if (Array.isArray(apiTransactions)) {
      transactions = apiTransactions;
      const container = document.querySelector('#transactions-table-wrapper');
      if (container) {
        container.innerHTML = renderTransactionsTable();
        attachTransactionEvents();
      }
    }
  } catch (error) {
    console.warn('hydrateTransactions', error.message);
  }
}

/****************************
 * Modais
 ***************************/
function openBuyModal(simbolo) {
  const cripto = cryptos.find((c) => c.simbolo === simbolo);
  if (!cripto) return;
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `<div class="modal"><div class="modal__header">Comprar ${
    cripto.nome
  }</div><div class="modal__body"><div class="form-group"><label class="form-label">Valor em BRL</label><input type="number" id="buy-value" class="form-control" min="1" /></div><p id="buy-conversion" class="mt-8">≈ 0 ${
    cripto.simbolo
  }</p><p class="mt-8" style="font-size:var(--font-size-sm);">Taxa: ${
    taxas.crypto_taker
  }%</p></div><div class="modal__footer"><button class="btn btn--outline" id="cancel-buy">Cancelar</button><button class="btn btn--primary" id="confirm-buy" disabled>Confirmar</button></div></div>`;
  document.body.appendChild(overlay);
  const input = overlay.querySelector("#buy-value");
  const btnConfirm = overlay.querySelector("#confirm-buy");
  const conversionText = overlay.querySelector("#buy-conversion");
  input.addEventListener("input", () => {
    const val = parseFloat(input.value);
    if (val > 0 && val <= currentUser.saldo_brl) {
      btnConfirm.disabled = false;
      const usd = val / 5.3; // taxa fixa simplificada
      const qty = usd / cripto.preco_usd;
      conversionText.textContent = `≈ ${qty.toFixed(6)} ${cripto.simbolo}`;
    } else {
      btnConfirm.disabled = true;
      conversionText.textContent = `≈ 0 ${cripto.simbolo}`;
    }
  });
  btnConfirm.addEventListener("click", () => {
    const val = parseFloat(input.value);
    if (val > currentUser.saldo_brl) {
      alert("Saldo insuficiente");
      return;
    }
    currentUser.saldo_brl -= val;
    transactions.push({
      id: `txn-${Date.now()}`,
      tipo: "crypto_compra",
      valor: val,
      moeda: "BRL",
      cripto: cripto.simbolo,
      taxa: (val * taxas.crypto_taker) / 100,
      status: "completed",
      data: new Date().toISOString(),
    });
    document.body.removeChild(overlay);
    alert("Compra concluída!");
    render();
  });
  overlay.querySelector("#cancel-buy").addEventListener("click", () => {
    document.body.removeChild(overlay);
  });
  // fechar ao clicar fora
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) document.body.removeChild(overlay);
  });
}

// Toggle password visibility
function togglePasswordVisibility() {
  const passwordInput = $('#password');
  const eyeIcon = $('#eye-icon');
  const eyeOffIcon = $('#eye-off-icon');
  const toggleBtn = $('#toggle-password');
  
  if (!passwordInput || !eyeIcon || !eyeOffIcon || !toggleBtn) return;
  
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    eyeIcon.classList.add('hidden');
    eyeOffIcon.classList.remove('hidden');
    toggleBtn.setAttribute('aria-label', 'Ocultar senha');
  } else {
    passwordInput.type = 'password';
    eyeIcon.classList.remove('hidden');
    eyeOffIcon.classList.add('hidden');
    toggleBtn.setAttribute('aria-label', 'Mostrar senha');
  }
}

// Forgot Password Modal
function openForgotPasswordModal() {
  const modal = document.createElement('div');
  modal.id = 'forgot-password-modal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal__header">
        <h2>Recuperar Senha</h2>
        <button class="close-btn" id="close-forgot-modal">×</button>
      </div>
      <div class="modal__body">
        <p>Digite seu CPF ou e-mail cadastrado para receber o código de recuperação.</p>
        
        <div id="step-1">
          <div class="form-group">
            <label class="form-label">CPF ou E-mail</label>
            <input type="text" id="recovery-identifier" class="form-control" placeholder="Digite seu CPF ou e-mail" />
            <div id="recovery-error" class="error-message hidden"></div>
          </div>
          <button class="btn btn--primary btn--full-width" id="send-recovery-code">Enviar código de recuperação</button>
        </div>
        
        <div id="step-2" class="hidden">
          <p>Enviamos um código de 6 dígitos para seu e-mail/SMS.</p>
          <div class="form-group">
            <label class="form-label">Código de verificação</label>
            <input type="text" id="recovery-code" class="form-control" placeholder="000000" maxlength="6" />
          </div>
          <button class="btn btn--primary btn--full-width" id="verify-recovery-code">Verificar código</button>
          <button class="btn-link" id="resend-recovery-code">Reenviar código</button>
        </div>
        
        <div id="step-3" class="hidden">
          <div class="form-group">
            <label class="form-label">Nova senha</label>
            <input type="password" id="new-password" class="form-control" placeholder="Digite sua nova senha" />
          </div>
          <div class="form-group">
            <label class="form-label">Confirmar nova senha</label>
            <input type="password" id="confirm-password" class="form-control" placeholder="Digite novamente" />
          </div>
          <button class="btn btn--primary btn--full-width" id="reset-password-btn">Redefinir senha</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close modal
  $('#close-forgot-modal').addEventListener('click', () => closeForgotPasswordModal());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeForgotPasswordModal();
  });
  
  // Step 1: Send recovery code
  $('#send-recovery-code').addEventListener('click', () => sendRecoveryCode());
  
  // Step 2: Verify code
  $('#verify-recovery-code').addEventListener('click', () => verifyRecoveryCode());
  $('#resend-recovery-code').addEventListener('click', () => sendRecoveryCode());
  
  // Step 3: Reset password
  $('#reset-password-btn').addEventListener('click', () => resetPassword());
}

function closeForgotPasswordModal() {
  const modal = $('#forgot-password-modal');
  if (modal) modal.remove();
}

function sendRecoveryCode() {
  const identifier = $('#recovery-identifier').value.trim();
  const errorDiv = $('#recovery-error');
  
  if (!identifier) {
    errorDiv.textContent = 'Digite seu CPF ou e-mail';
    errorDiv.classList.remove('hidden');
    return;
  }
  
  showToast('success', 'Código enviado!', 'Verifique seu e-mail/SMS.');
  
  $('#step-1').classList.add('hidden');
  $('#step-2').classList.remove('hidden');
  errorDiv.classList.add('hidden');
}

function verifyRecoveryCode() {
  const code = $('#recovery-code').value.trim();
  
  if (code.length !== 6) {
    showToast('error', 'Código inválido', 'Digite o código de 6 dígitos');
    return;
  }
  
  if (code === '123456') {
    showToast('success', 'Código verificado!', '');
    $('#step-2').classList.add('hidden');
    $('#step-3').classList.remove('hidden');
  } else {
    showToast('error', 'Código inválido', 'Use 123456 para teste.');
  }
}

function resetPassword() {
  const newPass = $('#new-password').value;
  const confirmPass = $('#confirm-password').value;
  
  if (!newPass || !confirmPass) {
    showToast('error', 'Campos obrigatórios', 'Preencha todos os campos');
    return;
  }
  
  if (newPass !== confirmPass) {
    showToast('error', 'Senhas não coincidem', 'As senhas devem ser iguais');
    return;
  }
  
  if (newPass.length < 4) {
    showToast('error', 'Senha muito curta', 'A senha deve ter pelo menos 4 caracteres');
    return;
  }
  
  showToast('success', 'Senha redefinida!', 'Você já pode fazer login com a nova senha.');
  
  setTimeout(() => {
    closeForgotPasswordModal();
  }, 2000);
}

// Create Account Modal
function openCreateAccountModal() {
  const modal = document.createElement('div');
  modal.id = 'create-account-modal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal large">
      <div class="modal__header">
        <h2>Criar Nova Conta</h2>
        <button class="close-btn" id="close-create-modal">×</button>
      </div>
      <div class="modal__body">
        <div id="register-step-1">
          <h3 style="margin-bottom: var(--space-16);">Dados Pessoais</h3>
          
          <div class="form-group">
            <label class="form-label">Nome Completo *</label>
            <input type="text" id="reg-name" class="form-control" placeholder="João Silva" />
          </div>
          
          <div class="form-group">
            <label class="form-label">CPF *</label>
            <input type="text" id="reg-cpf" class="form-control" placeholder="000.000.000-00" />
            <div id="reg-cpf-error" class="error-message hidden"></div>
          </div>
          
          <div class="form-group">
            <label class="form-label">E-mail *</label>
            <input type="email" id="reg-email" class="form-control" placeholder="seu@email.com" />
          </div>
          
          <div class="form-group">
            <label class="form-label">Telefone/Celular *</label>
            <input type="tel" id="reg-phone" class="form-control" placeholder="(11) 99999-9999" />
          </div>
          
          <div class="form-group">
            <label class="form-label">Senha *</label>
            <div class="input-with-icon">
              <input type="password" id="reg-password" class="form-control" placeholder="Mínimo 6 caracteres" />
              <button type="button" class="toggle-password-btn" id="toggle-reg-password">
                <svg class="eye-icon" viewBox="0 0 24 24">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                </svg>
              </button>
            </div>
            <div class="password-strength" id="password-strength"></div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Confirmar Senha *</label>
            <input type="password" id="reg-confirm-password" class="form-control" placeholder="Digite novamente" />
          </div>
          
          <div class="form-group checkbox">
            <input type="checkbox" id="terms-accept" />
            <label for="terms-accept">
              Aceito os <a href="#" id="terms-link">Termos de Uso</a> e <a href="#" id="privacy-link">Políticas de Privacidade</a>
            </label>
          </div>
          
          <button class="btn btn--primary btn--full-width" id="proceed-verification">Continuar</button>
        </div>
        
        <div id="register-step-2" class="hidden">
          <div class="verification-icon">✉️</div>
          <h3 style="text-align: center; margin-bottom: var(--space-16);">Verifique seu E-mail</h3>
          <p style="text-align: center;">Enviamos um código de 6 dígitos para:</p>
          <p class="email-display" id="verification-email"></p>
          
          <div class="form-group">
            <label class="form-label">Código de verificação</label>
            <input type="text" id="reg-verification-code" class="form-control" placeholder="000000" maxlength="6" />
          </div>
          
          <button class="btn btn--primary btn--full-width" id="verify-email-code">Verificar e Criar Conta</button>
          <button class="btn-link" id="resend-verification">Reenviar código</button>
        </div>
        
        <div id="register-step-3" class="hidden">
          <div class="success-icon">✓</div>
          <h3 style="text-align: center; margin-bottom: var(--space-16);">Conta Criada com Sucesso!</h3>
          <p style="text-align: center;">Suas credenciais de acesso:</p>
          
          <div class="credentials-box">
            <p><strong>CPF:</strong> <span id="created-cpf"></span></p>
            <p><strong>E-mail:</strong> <span id="created-email"></span></p>
            <p style="margin-bottom: 0;"><strong>Senha:</strong> (a que você definiu)</p>
          </div>
          
          <p class="info-message">
            📧 Enviamos um e-mail de confirmação com suas informações de acesso.
          </p>
          
          <button class="btn btn--primary btn--full-width" id="go-to-login">Fazer Login Agora</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close modal
  $('#close-create-modal').addEventListener('click', () => closeCreateAccountModal());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeCreateAccountModal();
  });
  
  // Password strength indicator
  const regPasswordField = $('#reg-password');
  if (regPasswordField) {
    regPasswordField.addEventListener('input', (e) => {
      const password = e.target.value;
      const strengthDiv = $('#password-strength');
      
      if (!password) {
        strengthDiv.textContent = '';
        return;
      }
      
      let strength = 0;
      if (password.length >= 6) strength++;
      if (password.length >= 10) strength++;
      if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
      if (/\d/.test(password)) strength++;
      if (/[^a-zA-Z\d]/.test(password)) strength++;
      
      const levels = ['Muito fraca', 'Fraca', 'Média', 'Forte', 'Muito forte'];
      const colors = ['#EF4444', '#F59E0B', '#FCD34D', '#10B981', '#059669'];
      
      strengthDiv.textContent = `Força: ${levels[strength]}`;
      strengthDiv.style.color = colors[strength];
    });
  }
  
  // Toggle registration password
  const toggleRegPassword = $('#toggle-reg-password');
  if (toggleRegPassword) {
    toggleRegPassword.addEventListener('click', () => {
      if (regPasswordField.type === 'password') {
        regPasswordField.type = 'text';
      } else {
        regPasswordField.type = 'password';
      }
    });
  }
  
  // Step 1: Proceed to verification
  $('#proceed-verification').addEventListener('click', () => proceedToVerification());
  
  // Step 2: Verify email
  $('#verify-email-code').addEventListener('click', () => verifyEmailCode());
  $('#resend-verification').addEventListener('click', () => {
    showToast('success', 'Código reenviado!', '');
  });
  
  // Step 3: Go to login
  $('#go-to-login').addEventListener('click', () => goToLogin());
  
  // Prevent default on links
  $('#terms-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('info', 'Termos de Uso', 'Funcionalidade em desenvolvimento.');
  });
  $('#privacy-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('info', 'Políticas de Privacidade', 'Funcionalidade em desenvolvimento.');
  });
}

function closeCreateAccountModal() {
  const modal = $('#create-account-modal');
  if (modal) modal.remove();
}

function proceedToVerification() {
  const name = $('#reg-name').value.trim();
  const cpf = $('#reg-cpf').value.trim();
  const email = $('#reg-email').value.trim();
  const phone = $('#reg-phone').value.trim();
  const password = $('#reg-password').value;
  const confirmPassword = $('#reg-confirm-password').value;
  const termsAccepted = $('#terms-accept').checked;
  
  if (!name || !cpf || !email || !phone || !password || !confirmPassword) {
    showToast('error', 'Campos obrigatórios', 'Preencha todos os campos');
    return;
  }
  
  if (!validarCPF(cpf)) {
    $('#reg-cpf-error').textContent = 'CPF inválido';
    $('#reg-cpf-error').classList.remove('hidden');
    return;
  }
  
  if (password !== confirmPassword) {
    showToast('error', 'Senhas não coincidem', 'As senhas devem ser iguais');
    return;
  }
  
  if (password.length < 6) {
    showToast('error', 'Senha muito curta', 'A senha deve ter pelo menos 6 caracteres');
    return;
  }
  
  if (!termsAccepted) {
    showToast('error', 'Termos obrigatórios', 'Você deve aceitar os Termos de Uso');
    return;
  }
  
  $('#verification-email').textContent = email;
  showToast('success', 'Código enviado!', 'Verifique seu e-mail');
  
  $('#register-step-1').classList.add('hidden');
  $('#register-step-2').classList.remove('hidden');
}

function verifyEmailCode() {
  const code = $('#reg-verification-code').value.trim();
  
  if (code.length !== 6) {
    showToast('error', 'Código inválido', 'Digite o código de 6 dígitos');
    return;
  }
  
  if (code === '123456') {
    const newUser = {
      id: `user-${Date.now()}`,
      nome: $('#reg-name').value,
      cpf: $('#reg-cpf').value.replace(/[^\d]/g, ''),
      email: $('#reg-email').value,
      phone: $('#reg-phone').value,
      username: $('#reg-email').value.split('@')[0],
      senha: $('#reg-password').value,
      role: 'user',
      saldo_brl: 0.0,
      saldo_usd: 0.0,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    
    $('#created-cpf').textContent = newUser.cpf;
    $('#created-email').textContent = newUser.email;
    
    $('#register-step-2').classList.add('hidden');
    $('#register-step-3').classList.remove('hidden');
    
    simulateWelcomeEmail(newUser);
  } else {
    showToast('error', 'Código inválido', 'Use 123456 para teste.');
  }
}

function goToLogin() {
  closeCreateAccountModal();
  showToast('success', 'Conta criada!', 'Agora você pode fazer login com suas credenciais');
}

function simulateWelcomeEmail(user) {
  console.log('=== E-MAIL DE BOAS-VINDAS ===');
  console.log(`Para: ${user.email}`);
  console.log(`Assunto: Bem-vindo ao Inwista!`);
  console.log(`\nOlá ${user.nome},\n`);
  console.log('Sua conta foi criada com sucesso!');
  console.log('\nSuas credenciais de acesso:');
  console.log(`CPF: ${user.cpf}`);
  console.log(`E-mail: ${user.email}`);
  console.log('\nAcesse: https://inwista.com/login');
  console.log('============================');
  
  showToast('success', '📧 E-mail enviado!', 'Verifique sua caixa de entrada');
}

// Inicialização
render();
