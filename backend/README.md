# 🚀 Inwista Backend API

Backend REST API para o Inwista - Banco Digital com Criptomoedas.

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

## 🛠️ Instalação

```bash
cd backend
npm install
```

## ⚙️ Configuração

1. Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

2. Configure as variáveis de ambiente no `.env`

3. Configure o banco de dados PostgreSQL:
```bash
# Criar database
createdb inwista_db

# Rodar migrations (TODO: implementar)
npm run migrate
```

## 🚀 Executar

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

## 📡 Endpoints

### Health Check
```
GET /health
```

### Autenticação
```
POST /api/auth/login         - Login
POST /api/auth/register      - Registrar novo usuário
POST /api/auth/2fa/verify    - Verificar código 2FA
POST /api/auth/refresh       - Refresh token
POST /api/auth/logout        - Logout
```

### Usuários
```
GET    /api/users/me         - Obter usuário atual
PUT    /api/users/me         - Atualizar perfil
PATCH  /api/users/me/password - Alterar senha
```

### Transações
```
GET    /api/transactions      - Listar transações
POST   /api/transactions      - Criar transação
GET    /api/transactions/:id  - Obter transação específica
```

### Criptomoedas
```
GET    /api/crypto/prices     - Obter preços atuais
GET    /api/crypto/:symbol    - Obter detalhes de uma cripto
POST   /api/crypto/buy        - Comprar criptomoeda
POST   /api/crypto/sell       - Vender criptomoeda
```

## 🔐 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação.

### Headers
```
Authorization: Bearer <token>
```

### Fluxo de Autenticação

1. **Login:** POST `/api/auth/login`
   - Retorna `access_token` e `refresh_token`

2. **2FA:** POST `/api/auth/2fa/verify`
   - Verifica código 2FA
   - Retorna tokens finais

3. **Requests autenticados:**
   - Incluir header: `Authorization: Bearer <access_token>`

4. **Refresh:** POST `/api/auth/refresh`
   - Usar `refresh_token` para obter novo `access_token`

## 🗄️ Banco de Dados

### Tabelas

#### users
```sql
- id (UUID, PK)
- nome (VARCHAR)
- cpf (VARCHAR, UNIQUE)
- email (VARCHAR, UNIQUE)
- password_hash (VARCHAR)
- role (ENUM: user, admin)
- saldo_brl (DECIMAL)
- saldo_usd (DECIMAL)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### transactions
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- tipo (VARCHAR)
- valor (DECIMAL)
- moeda (VARCHAR)
- status (ENUM)
- created_at (TIMESTAMP)
```

#### crypto_holdings
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- simbolo (VARCHAR)
- quantidade (DECIMAL)
- preco_medio (DECIMAL)
- updated_at (TIMESTAMP)
```

## 🧪 Testes

```bash
npm test
```

## 📦 Estrutura

```
backend/
├── src/
│   ├── config/          # Configurações
│   ├── controllers/     # Controllers
│   ├── middleware/      # Middlewares
│   ├── models/          # Models do banco
│   ├── routes/          # Rotas da API
│   ├── utils/           # Utilitários
│   └── server.js        # Entry point
├── tests/               # Testes
├── .env.example         # Exemplo de variáveis
└── package.json
```

## 🔒 Segurança

- ✅ Helmet para headers de segurança
- ✅ Rate limiting
- ✅ CORS configurado
- ✅ Senhas com bcrypt (12 rounds)
- ✅ JWT com expiração
- ✅ Validação de inputs
- ✅ SQL injection protection (prepared statements)

## 📝 TODO

- [ ] Implementar rotas de autenticação
- [ ] Implementar rotas de usuários
- [ ] Implementar rotas de transações
- [ ] Implementar rotas de criptomoedas
- [ ] Configurar banco de dados PostgreSQL
- [ ] Criar migrations
- [ ] Adicionar testes automatizados
- [ ] Implementar 2FA real (TOTP)
- [ ] Integração com API de criptomoedas (CoinGecko)
- [ ] Sistema de logs
- [ ] Documentação com Swagger

---

**Status:** 🚧 Em desenvolvimento
