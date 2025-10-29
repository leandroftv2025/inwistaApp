const http = require('http');
const fs = require('fs');
const path = require('path');
const { randomUUID, randomBytes } = require('crypto');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;

const users = [
  {
    id: 'user-001',
    nome: 'João Silva',
    cpf: '12345678900',
    email: 'joao@inwista.com',
    username: 'joao',
    senha: '1234',
    role: 'user',
    saldo_brl: 5000.0,
    saldo_usd: 950.0,
    twoFactorSecret: '123456',
    biometricTemplate: 'face-default',
  },
  {
    id: 'admin-001',
    nome: 'Admin Inwista',
    cpf: '98765432100',
    email: 'admin@inwista.com',
    username: 'admin',
    senha: 'admin123',
    role: 'admin',
    saldo_brl: 0.0,
    saldo_usd: 0.0,
    twoFactorSecret: '123456',
    biometricTemplate: 'face-admin',
  },
  {
    id: 'user-002',
    nome: 'Maria Santos',
    cpf: '11122233344',
    email: 'maria@email.com',
    username: 'maria',
    senha: 'senha123',
    role: 'user',
    saldo_brl: 3500.0,
    saldo_usd: 650.0,
    twoFactorSecret: '654321',
    biometricTemplate: 'face-maria',
  },
];

let transactions = [
  {
    id: 'txn-001',
    tipo: 'pix_recebido',
    valor: 500.0,
    moeda: 'BRL',
    status: 'completed',
    data: '2025-10-28T10:30:00',
    de: 'Maria Santos',
    para: 'João Silva',
  },
  {
    id: 'txn-002',
    tipo: 'crypto_compra',
    valor: 1000.0,
    moeda: 'BRL',
    cripto: 'BTC',
    quantidade_cripto: 0.0088,
    taxa: 2.0,
    status: 'completed',
    data: '2025-10-27T15:45:00',
  },
  {
    id: 'txn-003',
    tipo: 'ted',
    valor: 2500.0,
    moeda: 'BRL',
    taxa: 3.5,
    status: 'processing',
    data: '2025-10-28T14:20:00',
    de: 'João Silva',
    para: 'Banco XYZ',
  },
];

const marketFallback = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 113851.5,
    change24h: -1.19,
    volume24h: '2.3 tri',
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    price: 4059.14,
    change24h: -3.65,
    volume24h: '493.2 bi',
  },
  {
    symbol: 'BCH',
    name: 'Bitcoin Cash',
    price: 559.85,
    change24h: 0.28,
    volume24h: '11.2 bi',
  },
  {
    symbol: 'LTC',
    name: 'Litecoin',
    price: 98.38,
    change24h: -3.27,
    volume24h: '7.6 bi',
  },
];

const transferFees = {
  pix: 0,
  ted: 0.35,
  tef: 0.2,
};

const twoFactorSessions = new Map();
const biometricSessions = new Map();

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
};

function applyCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function sendJSON(res, statusCode, payload) {
  applyCors(res);
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function sendText(res, statusCode, payload, contentType = 'text/plain; charset=utf-8') {
  applyCors(res);
  res.writeHead(statusCode, { 'Content-Type': contentType });
  res.end(payload);
}

function collectRequestBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1e6) {
        req.destroy();
        reject(new Error('Payload muito grande'));
      }
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function safeJSONParse(str) {
  try {
    return str ? JSON.parse(str) : {};
  } catch (error) {
    return null;
  }
}

function generateId() {
  if (typeof randomUUID === 'function') {
    return randomUUID();
  }
  return randomBytes(16).toString('hex');
}

function findUser(identifier = '') {
  const clean = identifier.replace(/[^\w@.]/g, '');
  return (
    users.find((u) => u.email === clean) ||
    users.find((u) => u.username === clean) ||
    users.find((u) => u.cpf === clean.replace(/[^\d]/g, ''))
  );
}

function sanitizeUser(user) {
  if (!user) return null;
  const { senha, twoFactorSecret, biometricTemplate, ...safe } = user;
  return safe;
}

function calculateTransferFees(tipo, valor) {
  const fee = transferFees[tipo] || 0;
  return Number(((valor * fee) / 100).toFixed(2));
}

async function fetchMarketFromProvider() {
  const providerUrl = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,bitcoin-cash,litecoin';

  if (typeof fetch !== 'function') {
    return marketFallback;
  }

  try {
    const response = await fetch(providerUrl, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'inwista-mvp-demo',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao obter dados externos');
    }

    const data = await response.json();
    return data.map((asset) => ({
      symbol: asset.symbol?.toUpperCase() || asset.id,
      name: asset.name,
      price: asset.current_price,
      change24h: asset.price_change_percentage_24h,
      volume24h: (asset.total_volume || 0).toLocaleString('pt-BR'),
    }));
  } catch (error) {
    console.warn('Market provider error:', error.message);
    return marketFallback;
  }
}

async function handleApi(req, res, parsedUrl) {
  const { pathname } = parsedUrl;

  if (req.method === 'OPTIONS') {
    applyCors(res);
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'GET' && pathname === '/api/health') {
    sendJSON(res, 200, { status: 'ok', timestamp: new Date().toISOString() });
    return;
  }

  if (req.method === 'POST' && pathname === '/api/auth/login') {
    const bodyRaw = await collectRequestBody(req);
    const body = safeJSONParse(bodyRaw);

    if (!body) {
      sendJSON(res, 400, { message: 'JSON inválido.' });
      return;
    }

    const { identifier, password } = body;

    if (!identifier || !password) {
      sendJSON(res, 400, { message: 'Identificador e senha são obrigatórios.' });
      return;
    }

    const user = findUser(identifier.trim());

    if (!user || user.senha !== password) {
      sendJSON(res, 401, { message: 'Credenciais inválidas.' });
      return;
    }

    const twoFactorToken = generateId();
    const biometricToken = generateId();

    twoFactorSessions.set(twoFactorToken, {
      userId: user.id,
      code: user.twoFactorSecret || '123456',
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    biometricSessions.set(biometricToken, {
      userId: user.id,
      template: user.biometricTemplate,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    sendJSON(res, 200, {
      user: sanitizeUser(user),
      requires2fa: true,
      twoFactorToken,
      biometricRequired: true,
      biometricToken,
    });
    return;
  }

  if (req.method === 'POST' && pathname === '/api/auth/2fa') {
    const bodyRaw = await collectRequestBody(req);
    const body = safeJSONParse(bodyRaw);

    if (!body) {
      sendJSON(res, 400, { message: 'JSON inválido.' });
      return;
    }

    const { twoFactorToken, code } = body;

    if (!twoFactorToken || !code) {
      sendJSON(res, 400, { message: 'Token e código são obrigatórios.' });
      return;
    }

    const session = twoFactorSessions.get(twoFactorToken);

    if (!session || session.expiresAt < Date.now()) {
      sendJSON(res, 401, { message: 'Token expirado. Faça login novamente.' });
      return;
    }

    if (session.code !== code) {
      sendJSON(res, 401, { message: 'Código inválido.' });
      return;
    }

    twoFactorSessions.delete(twoFactorToken);
    sendJSON(res, 200, { success: true });
    return;
  }

  if (req.method === 'POST' && pathname === '/api/auth/biometry') {
    const bodyRaw = await collectRequestBody(req);
    const body = safeJSONParse(bodyRaw);

    if (!body) {
      sendJSON(res, 400, { message: 'JSON inválido.' });
      return;
    }

    const { biometricToken, payload } = body;
    const session = biometricSessions.get(biometricToken);

    if (!session || session.expiresAt < Date.now()) {
      sendJSON(res, 401, { message: 'Sessão biométrica inválida.' });
      return;
    }

    if (!payload || !payload.image) {
      sendJSON(res, 400, { message: 'Imagem obrigatória.' });
      return;
    }

    biometricSessions.delete(biometricToken);
    sendJSON(res, 200, { success: true, score: 0.98, userId: session.userId });
    return;
  }

  const dashboardMatch = pathname.match(/^\/api\/users\/([^/]+)\/dashboard$/);
  if (req.method === 'GET' && dashboardMatch) {
    const userId = dashboardMatch[1];
    const user = users.find((u) => u.id === userId);

    if (!user) {
      sendJSON(res, 404, { message: 'Usuário não encontrado.' });
      return;
    }

    const recentTransactions = transactions
      .filter((txn) => txn.de === user.nome || txn.para === user.nome)
      .slice(-5)
      .reverse();

    sendJSON(res, 200, {
      balances: {
        brl: user.saldo_brl,
        usd: user.saldo_usd,
        crypto: 3.42,
      },
      recentTransactions,
      compliance: {
        status: 'Aprovado',
        score: 92,
      },
    });
    return;
  }

  if (req.method === 'POST' && pathname === '/api/transactions/simulate') {
    const bodyRaw = await collectRequestBody(req);
    const body = safeJSONParse(bodyRaw);

    if (!body) {
      sendJSON(res, 400, { message: 'JSON inválido.' });
      return;
    }

    const { userId, tipo, valor, moeda = 'BRL', destinatario } = body;

    if (!userId || !tipo || typeof valor !== 'number') {
      sendJSON(res, 400, { message: 'Campos obrigatórios ausentes.' });
      return;
    }

    const user = users.find((u) => u.id === userId);

    if (!user) {
      sendJSON(res, 404, { message: 'Usuário não encontrado.' });
      return;
    }

    if (valor <= 0) {
      sendJSON(res, 400, { message: 'Valor inválido.' });
      return;
    }

    if (valor > user.saldo_brl) {
      sendJSON(res, 400, { message: 'Saldo insuficiente.' });
      return;
    }

    const feeValue = calculateTransferFees(tipo, valor);
    const total = tipo === 'pix' ? valor : valor + feeValue;
    const protocol = `SIM-${Date.now()}-${Math.floor(Math.random() * 999)}`;

    const receipt = {
      protocolo: protocol,
      timestamp: new Date().toISOString(),
      tipo,
      moeda,
      favorecido: destinatario || 'N/I',
      valor,
      taxa: feeValue,
      total,
    };

    sendJSON(res, 200, {
      approved: true,
      fees: feeValue,
      total,
      receipt,
    });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/transactions') {
    sendJSON(res, 200, transactions);
    return;
  }

  if (req.method === 'POST' && pathname === '/api/transactions') {
    const bodyRaw = await collectRequestBody(req);
    const body = safeJSONParse(bodyRaw);

    if (!body) {
      sendJSON(res, 400, { message: 'JSON inválido.' });
      return;
    }

    const { userId, tipo, valor, destinatario } = body;
    const user = users.find((u) => u.id === userId);

    if (!user) {
      sendJSON(res, 404, { message: 'Usuário não encontrado.' });
      return;
    }

    if (typeof valor !== 'number' || valor <= 0) {
      sendJSON(res, 400, { message: 'Valor inválido.' });
      return;
    }

    const feeValue = calculateTransferFees(tipo, valor);
    const total = tipo === 'pix' ? valor : valor + feeValue;

    if (total > user.saldo_brl) {
      sendJSON(res, 400, { message: 'Saldo insuficiente para execução.' });
      return;
    }

    user.saldo_brl = Number((user.saldo_brl - total).toFixed(2));

    const transaction = {
      id: `txn-${generateId().slice(0, 8)}`,
      tipo,
      valor,
      taxa: feeValue,
      total,
      status: 'completed',
      data: new Date().toISOString(),
      de: user.nome,
      para: destinatario || 'N/I',
    };

    transactions.push(transaction);
    sendJSON(res, 201, transaction);
    return;
  }

  if (req.method === 'GET' && pathname === '/api/admin/reports/export') {
    const headers = 'id,tipo,valor,taxa,status,data\n';
    const rows = transactions
      .map((t) => `${t.id},${t.tipo},${t.valor},${t.taxa || 0},${t.status},${t.data}`)
      .join('\n');

    sendJSON(res, 200, {
      mime: 'text/csv',
      filename: `inwista-relatorio-${Date.now()}.csv`,
      content: headers + rows,
    });
    return;
  }

  if (req.method === 'POST' && pathname === '/api/graphql') {
    const bodyRaw = await collectRequestBody(req);
    const body = safeJSONParse(bodyRaw);

    if (!body) {
      sendJSON(res, 400, { errors: [{ message: 'JSON inválido.' }] });
      return;
    }

    if (!body.query || !body.query.includes('marketSnapshot')) {
      sendJSON(res, 400, { errors: [{ message: 'Query não suportada.' }] });
      return;
    }

    const snapshot = await fetchMarketFromProvider();
    sendJSON(res, 200, { data: { marketSnapshot: snapshot } });
    return;
  }

  sendJSON(res, 404, { message: 'Rota não encontrada.' });
}

function serveStatic(req, res, parsedUrl) {
  let pathname = parsedUrl.pathname;
  if (pathname === '/') {
    pathname = '/index.html';
  }

  const filePath = path.join(process.cwd(), pathname.replace(/^\/+/, ''));
  if (!filePath.startsWith(process.cwd())) {
    sendText(res, 403, 'Acesso negado.');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      sendText(res, 404, 'Arquivo não encontrado.');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
    stream.on('error', () => {
      res.writeHead(500);
      res.end('Erro interno ao ler arquivo.');
    });
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);

  if (parsedUrl.pathname.startsWith('/api/')) {
    try {
      await handleApi(req, res, parsedUrl);
    } catch (error) {
      console.error('Erro na API:', error);
      sendJSON(res, 500, { message: 'Erro interno do servidor.' });
    }
    return;
  }

  serveStatic(req, res, parsedUrl);
});

server.listen(PORT, () => {
  console.log(`Inwista MVP disponível em http://localhost:${PORT}`);
});
