# 🚀 Guia Completo de Deploy - Easypanel + VPS Ubuntu

## 📋 Pré-requisitos

- ✅ VPS Ubuntu 20.04+ com Easypanel instalado
- ✅ Acesso SSH à VPS
- ✅ Git instalado na VPS
- ✅ Node.js 18+ e npm instalados

---

## 🔍 FASE 1: Testar Localmente na VPS

### 1️⃣ Conectar via SSH e Clonar Repositório

```bash
# Conectar na VPS
ssh seu-usuario@ip-da-vps

# Criar diretório para projetos
mkdir -p ~/projects
cd ~/projects

# Clonar repositório
git clone https://github.com/leandroftv2025/inwistaApp.git
cd inwistaApp

# Mudar para branch com melhorias
git checkout claude/code-review-improvements-011CUaSndnaGmfysXqT3Xgd1
```

### 2️⃣ Instalar Dependências e Rodar Testes

```bash
# Instalar dependências do frontend
npm install

# Rodar testes para garantir que tudo funciona
npm test

# Você deve ver:
# ✓ 128 tests passed
```

### 3️⃣ Testar Frontend Localmente

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Deve aparecer:
# ➜  Local:   http://localhost:3000
```

**Em outro terminal:**

```bash
# Testar se está respondendo
curl http://localhost:3000
```

### 4️⃣ Configurar Backend

```bash
# Ir para diretório do backend
cd backend

# Instalar dependências
npm install

# Copiar arquivo de configuração
cp .env.example .env

# Editar configurações
nano .env
```

**Configurar o `.env`:**

```bash
PORT=3001
NODE_ENV=development

# Database (configurar depois)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=inwista_db
DB_USER=inwista_user
DB_PASSWORD=SuaSenhaForte123!

# JWT Secrets (gerar abaixo)
JWT_SECRET=COLE_AQUI_STRING_ALEATORIA
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=OUTRA_STRING_ALEATORIA
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=3
LOCK_TIME=5

# CORS
CORS_ORIGIN=http://localhost:3000
```

**Gerar JWT Secrets:**

```bash
# Gerar JWT_SECRET (64 caracteres hex)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Copiar resultado e colar em JWT_SECRET

# Gerar JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Copiar resultado e colar em JWT_REFRESH_SECRET
```

### 5️⃣ Testar Backend

```bash
# Ainda em backend/
npm run dev

# Deve aparecer:
# ✅ Inwista Backend running on port 3001
# 🌍 Environment: development
# 🔗 Health check: http://localhost:3001/health
```

**Testar health check:**

```bash
curl http://localhost:3001/health

# Deve retornar:
# {"status":"OK","timestamp":"2025-10-28...","uptime":123.45}
```

---

## 🐘 FASE 2: Configurar PostgreSQL

### 1️⃣ Instalar PostgreSQL

```bash
# Atualizar pacotes
sudo apt update && sudo apt upgrade -y

# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Verificar instalação
sudo systemctl status postgresql

# Deve mostrar: active (running)
```

### 2️⃣ Criar Banco de Dados e Usuário

```bash
# Entrar no PostgreSQL
sudo -u postgres psql
```

**Dentro do psql, executar:**

```sql
-- Criar banco de dados
CREATE DATABASE inwista_db;

-- Criar usuário
CREATE USER inwista_user WITH PASSWORD 'SuaSenhaForte123!';

-- Dar permissões
GRANT ALL PRIVILEGES ON DATABASE inwista_db TO inwista_user;

-- Permitir conexão
ALTER DATABASE inwista_db OWNER TO inwista_user;

-- Sair
\q
```

### 3️⃣ Configurar Acesso Remoto (se necessário)

```bash
# Editar postgresql.conf
sudo nano /etc/postgresql/*/main/postgresql.conf

# Encontrar e descomentar/alterar:
listen_addresses = 'localhost'  # ou '*' para todas interfaces
```

```bash
# Editar pg_hba.conf
sudo nano /etc/postgresql/*/main/pg_hba.conf

# Adicionar no final:
# IPv4 local connections:
host    inwista_db    inwista_user    127.0.0.1/32    md5
```

```bash
# Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

### 4️⃣ Testar Conexão

```bash
# Testar conexão
psql -h localhost -U inwista_user -d inwista_db

# Digite a senha quando solicitado
# Se conectar com sucesso, digite \q para sair
```

### 5️⃣ Atualizar .env do Backend

```bash
cd ~/projects/inwistaApp/backend
nano .env
```

**Atualizar com credenciais corretas:**

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=inwista_db
DB_USER=inwista_user
DB_PASSWORD=SuaSenhaForte123!
```

---

## 🎨 FASE 3: Deploy no Easypanel

### Método 1: Deploy via Interface do Easypanel (Recomendado)

#### 1️⃣ Acessar Easypanel

```
https://seu-painel.easypanel.io
```

Ou se instalou localmente:
```
http://ip-da-vps:3000
```

#### 2️⃣ Criar Novo Projeto

1. Clique em **"+ New Project"**
2. Nome: `inwista-app`
3. Clique em **"Create"**

---

#### 3️⃣ Deploy PostgreSQL

1. Dentro do projeto `inwista-app`, clique em **"+ Add Service"**
2. Escolha **"Database"** → **"PostgreSQL"**
3. Configure:
   - **Name:** `inwista-postgres`
   - **Version:** `15` (ou latest)
   - **Database:** `inwista_db`
   - **Username:** `inwista_user`
   - **Password:** `SuaSenhaForte123!`

4. Em **"Advanced":**
   - **Volume:** `/var/lib/postgresql/data` (já vem por padrão)

5. Clique em **"Deploy"**

6. **Anotar:** O hostname interno será `inwista-postgres`

---

#### 4️⃣ Deploy do Backend

1. Dentro do projeto `inwista-app`, clique em **"+ Add Service"**
2. Escolha **"App"** → **"From Git"**
3. Configure:

**General:**
- **Name:** `inwista-backend`

**Source:**
- **Repository:** `https://github.com/leandroftv2025/inwistaApp`
- **Branch:** `claude/code-review-improvements-011CUaSndnaGmfysXqT3Xgd1`
- **Build Path:** `/backend` (importante!)

**Build:**
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Deployment:**
- **Port:** `3001`
- **Protocol:** `HTTP`

**Environment Variables** (clicar em "+ Add Variable"):
```
PORT=3001
NODE_ENV=production

DB_HOST=inwista-postgres
DB_PORT=5432
DB_NAME=inwista_db
DB_USER=inwista_user
DB_PASSWORD=SuaSenhaForte123!

JWT_SECRET=cole_seu_jwt_secret_aqui
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=cole_seu_refresh_secret_aqui
JWT_REFRESH_EXPIRES_IN=7d

BCRYPT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=3
LOCK_TIME=5

CORS_ORIGIN=https://inwista.seudominio.com
```

**Domain:**
- Adicione: `api-inwista.seudominio.com`
- Ou use o domínio gerado automaticamente

4. Clique em **"Deploy"**

5. Aguardar deploy (1-3 minutos)

6. **Testar:**
```bash
curl https://api-inwista.seudominio.com/health
```

---

#### 5️⃣ Deploy do Frontend

1. Dentro do projeto `inwista-app`, clique em **"+ Add Service"**
2. Escolha **"App"** → **"From Git"**
3. Configure:

**General:**
- **Name:** `inwista-frontend`

**Source:**
- **Repository:** `https://github.com/leandroftv2025/inwistaApp`
- **Branch:** `claude/code-review-improvements-011CUaSndnaGmfysXqT3Xgd1`
- **Build Path:** `/` (raiz)

**Build:**
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm run preview` (ou `npx vite preview`)

**Deployment:**
- **Port:** `3000`
- **Protocol:** `HTTP`

**Environment Variables:**
```
NODE_ENV=production
VITE_API_URL=https://api-inwista.seudominio.com
```

**Domain:**
- Adicione: `inwista.seudominio.com`
- Habilite **"HTTPS"** (Easypanel gera certificado automaticamente)

4. Clique em **"Deploy"**

5. Aguardar build (2-5 minutos)

6. **Testar:**
```
https://inwista.seudominio.com
```

---

### Método 2: Deploy com Docker Compose

Se preferir usar Docker diretamente na VPS:

#### 1️⃣ Preparar Ambiente

```bash
cd ~/projects/inwistaApp

# Copiar arquivo de env
cp .env.docker.example .env

# Editar
nano .env
```

**Configurar `.env`:**
```bash
DB_PASSWORD=SuaSenhaForte123!
JWT_SECRET=seu_jwt_secret_64_chars
JWT_REFRESH_SECRET=seu_refresh_secret_64_chars
FRONTEND_URL=https://inwista.seudominio.com
BACKEND_URL=https://api.inwista.seudominio.com
```

#### 2️⃣ Build e Deploy

```bash
# Build das imagens
docker-compose build

# Subir containers
docker-compose up -d

# Ver logs
docker-compose logs -f

# Ver status
docker-compose ps
```

#### 3️⃣ Testar

```bash
# Testar backend
curl http://localhost:3001/health

# Testar frontend
curl http://localhost:3000
```

---

## 🔧 FASE 4: Configurações Finais

### 1️⃣ Configurar Nginx Reverse Proxy (se não usar Easypanel)

```bash
sudo apt install nginx -y

# Criar configuração
sudo nano /etc/nginx/sites-available/inwista
```

**Configuração Nginx:**

```nginx
# Backend API
server {
    listen 80;
    server_name api.inwista.seudominio.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# Frontend
server {
    listen 80;
    server_name inwista.seudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/inwista /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Recarregar nginx
sudo systemctl reload nginx
```

### 2️⃣ Configurar SSL com Certbot

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obter certificados
sudo certbot --nginx -d inwista.seudominio.com -d api.inwista.seudominio.com

# Seguir instruções na tela
```

### 3️⃣ Configurar Firewall

```bash
# Permitir SSH
sudo ufw allow ssh

# Permitir HTTP e HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Ativar firewall
sudo ufw enable
```

---

## ✅ FASE 5: Verificação e Testes

### 1️⃣ Verificar Serviços

```bash
# Verificar se todos containers estão rodando (Docker)
docker ps

# Verificar logs do backend
docker logs inwista-backend

# Verificar logs do frontend
docker logs inwista-frontend

# Verificar PostgreSQL
docker logs inwista-postgres
```

### 2️⃣ Testar Endpoints

```bash
# Health check do backend
curl https://api.inwista.seudominio.com/health

# Deve retornar:
# {"status":"OK","timestamp":"...","uptime":...}

# Testar frontend
curl -I https://inwista.seudominio.com

# Deve retornar: HTTP/2 200
```

### 3️⃣ Testar Aplicação no Navegador

1. Acesse: `https://inwista.seudominio.com`
2. Você deve ver a tela de login
3. Credenciais de teste:
   - **CPF:** 12345678900
   - **Senha:** 1234
   - **2FA:** 123456

4. Teste:
   - ✅ Login
   - ✅ 2FA
   - ✅ Dashboard
   - ✅ Compra de cripto (mock)
   - ✅ Visualizar transações

### 4️⃣ Verificar DevTools

1. Abrir DevTools (F12)
2. Aba **Console:** Não deve ter erros críticos
3. Aba **Network:** API calls devem retornar 200
4. Aba **Application:** Verificar se não há erros de CORS

---

## 🐛 Troubleshooting

### Problema: CORS Error

**Sintoma:** Erro no console: `CORS policy blocked`

**Solução:**
```bash
# Editar .env do backend
cd ~/projects/inwistaApp/backend
nano .env

# Atualizar CORS_ORIGIN:
CORS_ORIGIN=https://inwista.seudominio.com

# Reiniciar backend
docker-compose restart backend
```

### Problema: Cannot connect to database

**Sintoma:** Backend retorna erro de conexão com banco

**Solução:**
```bash
# Verificar se PostgreSQL está rodando
docker ps | grep postgres

# Ver logs do PostgreSQL
docker logs inwista-postgres

# Verificar credenciais no .env
cd backend && cat .env | grep DB_
```

### Problema: Frontend não carrega

**Sintoma:** Página em branco ou erro 404

**Solução:**
```bash
# Verificar logs do frontend
docker logs inwista-frontend

# Rebuild do frontend
docker-compose build frontend
docker-compose up -d frontend

# Ver se porta está escutando
netstat -tuln | grep 3000
```

### Problema: Testes não passam

**Sintoma:** `npm test` falha

**Solução:**
```bash
# Limpar node_modules
rm -rf node_modules package-lock.json
npm install

# Rodar testes novamente
npm test

# Se ainda falhar, ver logs detalhados:
npm test -- --reporter=verbose
```

---

## 📊 Monitoramento

### Logs em Tempo Real

```bash
# Todos os containers
docker-compose logs -f

# Apenas backend
docker-compose logs -f backend

# Apenas frontend
docker-compose logs -f frontend

# Apenas postgres
docker-compose logs -f postgres
```

### Uso de Recursos

```bash
# Ver uso de CPU/RAM
docker stats

# Ver espaço em disco
df -h
```

---

## 🔄 Atualizações

### Atualizar Aplicação

```bash
cd ~/projects/inwistaApp

# Pull das mudanças
git pull origin claude/code-review-improvements-011CUaSndnaGmfysXqT3Xgd1

# Rebuild e restart
docker-compose build
docker-compose up -d

# Ou no Easypanel: clicar em "Redeploy"
```

---

## 🎯 Checklist Final

- [ ] ✅ VPS Ubuntu configurada
- [ ] ✅ Easypanel instalado
- [ ] ✅ Repositório clonado
- [ ] ✅ Testes passando (128/128)
- [ ] ✅ PostgreSQL rodando
- [ ] ✅ Backend deployado e respondendo
- [ ] ✅ Frontend deployado e carregando
- [ ] ✅ SSL configurado (HTTPS)
- [ ] ✅ Domínios apontando corretamente
- [ ] ✅ CORS configurado
- [ ] ✅ Firewall configurado
- [ ] ✅ Aplicação funcionando no navegador
- [ ] ✅ Login testado com sucesso

---

## 📞 Suporte

### Problemas com Deploy?
1. Verificar logs: `docker-compose logs -f`
2. Verificar portas: `netstat -tuln | grep -E "3000|3001|5432"`
3. Verificar firewall: `sudo ufw status`

### Easypanel não está acessível?
```bash
# Verificar se está rodando
sudo systemctl status easypanel

# Reiniciar se necessário
sudo systemctl restart easypanel
```

---

## 🎉 Conclusão

Se seguiu todos os passos, sua aplicação Inwista deve estar:

✅ Rodando em produção
✅ Com HTTPS configurado
✅ Backend API funcionando
✅ Frontend acessível
✅ Banco de dados persistente
✅ Pronta para receber usuários!

**URL Frontend:** `https://inwista.seudominio.com`
**URL API:** `https://api.inwista.seudominio.com`

---

**Próximos passos:**
1. Implementar rotas reais do backend
2. Conectar frontend ao backend
3. Adicionar monitoramento (ex: PM2, Datadog)
4. Configurar backups automáticos do banco
5. Implementar CI/CD (GitHub Actions)

🚀 **Boa sorte com seu deploy!**
