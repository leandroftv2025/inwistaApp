# 🖥️ Guia de Instalação - VM Ubuntu no MacBook

Guia completo para instalar e rodar o **Inwista App** em uma máquina virtual Ubuntu no seu MacBook.

---

## 📋 Pré-requisitos

### No MacBook (Host)
- ✅ VirtualBox, VMware Fusion, UTM, ou Parallels instalado
- ✅ VM Ubuntu 20.04+ criada e funcionando
- ✅ Conexão de rede configurada na VM (NAT ou Bridge)

### Configuração Recomendada da VM
- **RAM:** Mínimo 2GB (recomendado 4GB)
- **Disco:** Mínimo 20GB
- **CPUs:** 2 cores
- **Rede:** NAT ou Bridge (para acessar do MacBook)

---

## 🎯 PARTE 1: Preparar a VM Ubuntu

### 1️⃣ Conectar na VM Ubuntu

**Opção A - Interface gráfica da VM:**
```bash
# Abra o terminal na VM Ubuntu (Ctrl+Alt+T)
```

**Opção B - SSH do MacBook (recomendado):**
```bash
# No MacBook, descubra o IP da VM
# Na VM Ubuntu, execute:
ip addr show

# No MacBook, conecte via SSH:
ssh seu-usuario@IP_DA_VM
```

### 2️⃣ Atualizar Sistema

```bash
# Atualizar pacotes
sudo apt update && sudo apt upgrade -y

# Instalar ferramentas básicas
sudo apt install -y curl wget git build-essential
```

### 3️⃣ Instalar Node.js 18+ e npm

```bash
# Instalar Node.js via NodeSource (versão LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalação
node --version   # Deve mostrar v18.x.x ou superior
npm --version    # Deve mostrar 9.x.x ou superior
```

**Se já tiver Node.js instalado mas versão antiga:**
```bash
# Remover versão antiga
sudo apt remove nodejs npm

# Reinstalar versão correta (repita comandos acima)
```

### 4️⃣ Instalar PostgreSQL

```bash
# Instalar PostgreSQL 14
sudo apt install -y postgresql postgresql-contrib

# Verificar se está rodando
sudo systemctl status postgresql

# Se não estiver rodando, iniciar
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

---

## 🚀 PARTE 2: Configurar o Projeto

### 1️⃣ Clonar Repositório

```bash
# Criar diretório de projetos
mkdir -p ~/projects
cd ~/projects

# Clonar repositório
git clone https://github.com/leandroftv2025/inwistaApp.git
cd inwistaApp

# Mudar para a branch com todas as melhorias
git checkout claude/code-review-improvements-011CUaSndnaGmfysXqT3Xgd1

# Verificar que está na branch correta
git branch
```

### 2️⃣ Instalar Dependências do Frontend

```bash
# Na raiz do projeto
npm install

# Deve instalar ~300MB de dependências
# Aguarde 2-5 minutos
```

### 3️⃣ Rodar Testes (Validação)

```bash
# Executar testes para garantir que tudo funciona
npm test

# Resultado esperado:
# ✓ Test Files  6 passed (6)
# ✓ Tests  128 passed (128)
```

✅ **Se todos os testes passaram, está tudo OK!**

---

## 🗄️ PARTE 3: Configurar PostgreSQL

### 1️⃣ Criar Banco de Dados e Usuário

```bash
# Entrar no PostgreSQL
sudo -u postgres psql
```

**Dentro do `psql`, execute:**

```sql
-- Criar banco de dados
CREATE DATABASE inwista_db;

-- Criar usuário
CREATE USER inwista_user WITH PASSWORD 'inwista2025';

-- Dar permissões
GRANT ALL PRIVILEGES ON DATABASE inwista_db TO inwista_user;

-- Permitir conexão
ALTER DATABASE inwista_db OWNER TO inwista_user;

-- Sair
\q
```

### 2️⃣ Testar Conexão

```bash
# Testar se consegue conectar
psql -h localhost -U inwista_user -d inwista_db

# Digite a senha: inwista2025
# Se conectar com sucesso, digite \q para sair
```

### 3️⃣ Configurar Backend

```bash
# Entrar no diretório do backend
cd ~/projects/inwistaApp/backend

# Instalar dependências
npm install

# Copiar arquivo de configuração
cp .env.example .env

# Editar arquivo .env
nano .env
```

**Configure o arquivo `.env`:**

```bash
PORT=3001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=inwista_db
DB_USER=inwista_user
DB_PASSWORD=inwista2025

# JWT Secrets (gerar abaixo)
JWT_SECRET=COLE_AQUI_O_SECRET_GERADO
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=COLE_AQUI_O_REFRESH_SECRET_GERADO
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=3
LOCK_TIME=5

# CORS
CORS_ORIGIN=http://localhost:5000
```

**Gerar JWT Secrets:**

```bash
# Gerar JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Copiar resultado e colar em JWT_SECRET no arquivo .env

# Gerar JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Copiar resultado e colar em JWT_REFRESH_SECRET no arquivo .env
```

Salvar e fechar (Ctrl+O, Enter, Ctrl+X)

---

## 🎨 PARTE 4: Descobrir IP da VM para Acesso do MacBook

### Método 1: IP da VM (Recomendado)

```bash
# Na VM Ubuntu, descubra o IP
ip addr show

# Procure por:
# - eth0 (VirtualBox/VMware)
# - enp0s3 (algumas VMs)
# - ens33 (algumas VMs)

# Exemplo de saída:
# inet 192.168.1.100/24
#      ^^^^^^^^^^^ Este é o IP
```

**Anote o IP, exemplo:** `192.168.1.100`

### Método 2: Configurar Port Forwarding (VirtualBox)

Se estiver usando VirtualBox com NAT:

1. **No VirtualBox:**
   - Selecione a VM → Configurações → Rede
   - Clique em "Avançado" → "Encaminhamento de Portas"
   - Adicione 2 regras:

| Nome | Protocolo | IP Host | Porta Host | IP Convidado | Porta Convidado |
|------|-----------|---------|------------|--------------|-----------------|
| Frontend | TCP | 127.0.0.1 | 5000 | | 5000 |
| Backend | TCP | 127.0.0.1 | 3001 | | 3001 |

2. **Acessar do MacBook:**
   - Frontend: `http://localhost:5000`
   - Backend: `http://localhost:3001`

---

## 🚀 PARTE 5: Rodar a Aplicação

### 1️⃣ Terminal 1 - Backend

```bash
cd ~/projects/inwistaApp/backend
npm run dev

# Deve aparecer:
# ✅ Inwista Backend running on port 3001
# 🌍 Environment: development
# 🔗 Health check: http://localhost:3001/health
```

**Deixe este terminal aberto!**

### 2️⃣ Terminal 2 - Frontend

```bash
# Abra um NOVO terminal (Ctrl+Shift+T ou nova aba SSH)
cd ~/projects/inwistaApp
npm run dev

# Deve aparecer:
# VITE v5.4.21  ready in 500 ms
# ➜  Local:   http://localhost:5000/
# ➜  Network: http://192.168.1.100:5000/
#             ^^^^^^^^^^^^^^^^^^^ Use este IP
```

**Deixe este terminal aberto também!**

---

## 🌐 PARTE 6: Acessar do MacBook

### Opção A - Via IP da VM (Rede Bridge/NAT)

**No seu MacBook, abra o navegador:**

```
Frontend: http://IP_DA_VM:5000
Backend:  http://IP_DA_VM:3001/health

Exemplo:
http://192.168.1.100:5000
```

### Opção B - Via Port Forwarding (VirtualBox NAT)

**No seu MacBook, abra o navegador:**

```
Frontend: http://localhost:5000
Backend:  http://localhost:3001/health
```

---

## 🧪 PARTE 7: Testar a Aplicação

### 1️⃣ Testar Backend (Health Check)

**No navegador do MacBook:**
```
http://IP_DA_VM:3001/health
```

**Deve retornar:**
```json
{
  "status": "OK",
  "timestamp": "2025-10-29T20:00:00.000Z",
  "uptime": 123.45
}
```

### 2️⃣ Testar Frontend

**No navegador do MacBook:**
```
http://IP_DA_VM:5000
```

**Você deve ver:**
- ✅ Tela de login do Inwista
- ✅ Formulário com campos CPF e Senha
- ✅ Sem erros no console do navegador (F12)

### 3️⃣ Fazer Login de Teste

**Credenciais de teste:**

```
CPF: 12345678900
Senha: 1234
Código 2FA: 123456
```

**Após login:**
- ✅ Deve redirecionar para o Dashboard
- ✅ Mostrar saldo em BRL e USD
- ✅ Mostrar gráfico de transações
- ✅ Listar criptomoedas disponíveis

---

## 🔧 PARTE 8: Comandos Úteis

### Parar os Servidores

```bash
# Em cada terminal, pressione:
Ctrl+C
```

### Reiniciar os Servidores

```bash
# Backend
cd ~/projects/inwistaApp/backend
npm run dev

# Frontend (outro terminal)
cd ~/projects/inwistaApp
npm run dev
```

### Ver Logs em Tempo Real

```bash
# Backend já mostra logs automaticamente

# Para ver requisições HTTP no frontend:
# Os logs aparecem no terminal onde o Vite está rodando
```

### Atualizar Código

```bash
cd ~/projects/inwistaApp
git pull origin claude/code-review-improvements-011CUaSndnaGmfysXqT3Xgd1

# Reinstalar dependências (se package.json mudou)
npm install
cd backend && npm install

# Reiniciar os servidores
```

---

## 🐛 Troubleshooting

### ❌ Problema: "EADDRINUSE: address already in use"

**Causa:** Porta 5000 ou 3001 já está em uso

**Solução:**
```bash
# Descobrir o processo usando a porta
sudo lsof -i :5000
sudo lsof -i :3001

# Matar o processo
kill -9 PID
```

### ❌ Problema: "Cannot connect to database"

**Causa:** PostgreSQL não está rodando ou credenciais erradas

**Solução:**
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Se não estiver, iniciar
sudo systemctl start postgresql

# Verificar credenciais no .env
cat ~/projects/inwistaApp/backend/.env | grep DB_
```

### ❌ Problema: Não consigo acessar do MacBook

**Causa:** Firewall bloqueando ou IP errado

**Solução:**
```bash
# Na VM Ubuntu, verificar IP
ip addr show

# Permitir portas no firewall (se UFW estiver ativo)
sudo ufw allow 5000/tcp
sudo ufw allow 3001/tcp

# Ou desativar firewall temporariamente (apenas para testes)
sudo ufw disable
```

### ❌ Problema: "npm install" falha com erro de permissão

**Causa:** Permissões incorretas do npm

**Solução:**
```bash
# Corrigir permissões
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER ~/projects/inwistaApp

# Tentar novamente
npm install
```

### ❌ Problema: Página em branco no navegador

**Causa:** Frontend não compilou corretamente

**Solução:**
```bash
# Limpar cache e rebuild
cd ~/projects/inwistaApp
rm -rf node_modules package-lock.json dist
npm install
npm run dev

# Verificar console do navegador (F12) para erros
```

### ❌ Problema: CORS Error no console

**Causa:** Backend não está permitindo requisições do frontend

**Solução:**
```bash
# Editar backend/.env
nano ~/projects/inwistaApp/backend/.env

# Verificar CORS_ORIGIN
CORS_ORIGIN=http://IP_DA_VM:5000

# Ou permitir todas origens (apenas desenvolvimento)
CORS_ORIGIN=*

# Reiniciar backend
```

---

## 📊 Verificação Final - Checklist

Execute este checklist para garantir que tudo está funcionando:

- [ ] ✅ Node.js 18+ instalado (`node --version`)
- [ ] ✅ PostgreSQL rodando (`sudo systemctl status postgresql`)
- [ ] ✅ Banco `inwista_db` criado (`psql -U inwista_user -d inwista_db`)
- [ ] ✅ Projeto clonado (`~/projects/inwistaApp`)
- [ ] ✅ Dependências instaladas (`node_modules` existe)
- [ ] ✅ Testes passando (`npm test` = 128/128)
- [ ] ✅ Backend rodando (terminal 1)
- [ ] ✅ Frontend rodando (terminal 2)
- [ ] ✅ Health check OK (`http://IP:3001/health`)
- [ ] ✅ Frontend carregando (`http://IP:5000`)
- [ ] ✅ Login funcionando (CPF: 12345678900, Senha: 1234)
- [ ] ✅ Dashboard acessível
- [ ] ✅ Sem erros no console (F12)

---

## 🎯 Configurações Específicas por VM

### VirtualBox (NAT)

```bash
# Configurar Port Forwarding
# VM Settings → Network → Advanced → Port Forwarding

Host Port 5000 → Guest Port 5000
Host Port 3001 → Guest Port 3001

# Acessar: http://localhost:5000
```

### VMware Fusion (Bridge)

```bash
# A VM recebe IP da sua rede local automaticamente
# Descobrir IP:
ip addr show

# Acessar: http://IP_DA_VM:5000
```

### UTM (macOS com Apple Silicon)

```bash
# Por padrão usa DHCP
# Descobrir IP:
ip addr show

# Se quiser IP fixo:
# UTM Settings → Network → Bridge Mode

# Acessar: http://IP_DA_VM:5000
```

### Parallels Desktop

```bash
# Por padrão usa Shared Network (NAT)
# IP é atribuído automaticamente

# Descobrir IP:
ifconfig

# Acessar: http://IP_DA_VM:5000
```

---

## 🚀 Performance - Dicas para VM

### Melhorar Performance do Node.js na VM

```bash
# Aumentar limite de watchers (para Vite HMR)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Liberar RAM

```bash
# Limpar cache do sistema
sudo sync; echo 3 | sudo tee /proc/sys/vm/drop_caches

# Ver uso de memória
free -h
```

### Modo de Produção (Build)

Se quiser testar o build de produção:

```bash
# Build do frontend
cd ~/projects/inwistaApp
npm run build

# Servir build
npm run preview

# Acesso: http://IP_DA_VM:5000
```

---

## 📚 Recursos Adicionais

### Documentação do Projeto

- **README.md** - Visão geral do projeto
- **ARCHITECTURE.md** - Arquitetura modular
- **DEPLOY_GUIDE.md** - Deploy em VPS/Easypanel
- **SECURITY.md** - Guia de segurança
- **tests/README.md** - Guia de testes

### Comandos Rápidos

```bash
# Ver todos os scripts disponíveis
npm run

# Rodar testes em modo watch
npm test -- --watch

# Rodar testes com UI
npm run test:ui

# Ver cobertura de testes
npm run test:coverage

# Lint do código
npm run lint

# Fix automático de lint
npm run lint:fix
```

---

## 🎉 Conclusão

Se seguiu todos os passos, você agora tem:

✅ VM Ubuntu configurada
✅ Node.js e PostgreSQL instalados
✅ Projeto Inwista rodando
✅ Backend na porta 3001
✅ Frontend na porta 5000
✅ Acessível do MacBook
✅ 128 testes passando

**URL de acesso:**
```
Frontend: http://IP_DA_VM:5000
Backend:  http://IP_DA_VM:3001
```

**Credenciais de teste:**
```
CPF: 12345678900
Senha: 1234
2FA: 123456
```

---

## 💡 Próximos Passos Recomendados

1. **Explorar a aplicação** - Testar todas as funcionalidades
2. **Implementar backend real** - Conectar com PostgreSQL
3. **Adicionar mais features** - Expandir funcionalidades
4. **Deploy em produção** - Usar o DEPLOY_GUIDE.md

---

**Dúvidas?** Consulte a seção de Troubleshooting ou abra uma issue no GitHub!

🤖 Generated with [Claude Code](https://claude.com/claude-code)
