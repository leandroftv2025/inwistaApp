# 🔒 Guia de Segurança - Inwista App

## ⚠️ Avisos Importantes

### Status Atual: DEMO/PROTÓTIPO
Esta aplicação é um **protótipo educacional**. **NÃO USE EM PRODUÇÃO** sem implementar todas as melhorias de segurança listadas abaixo.

---

## 🚨 Vulnerabilidades Conhecidas (Demo)

### ❌ CRÍTICAS - Não usar em produção

1. **Credenciais Hardcoded**
   - Localização: `src/data/mockData.js`
   - Problema: Senhas em texto plano no código
   - Impacto: Qualquer pessoa com acesso ao código tem as credenciais
   - **Solução:** Implementar backend com hash de senhas (bcrypt/argon2)

2. **2FA Fixo**
   - Localização: `src/services/authService.js:123`
   - Problema: Código 2FA é sempre "123456"
   - Impacto: 2FA não oferece proteção real
   - **Solução:** Implementar TOTP (Google Authenticator) ou SMS via Twilio

3. **Sem Hash de Senhas**
   - Localização: `src/services/authService.js:140`
   - Problema: Comparação direta de senhas
   - Impacto: Senhas não são protegidas
   - **Solução:** Usar bcrypt com 12+ rounds

4. **Dados em Memória**
   - Localização: `src/data/mockData.js`
   - Problema: Dados perdidos ao recarregar
   - Impacto: Sem persistência, sem auditoria
   - **Solução:** Banco de dados PostgreSQL/MongoDB

5. **Sem Validação Backend**
   - Problema: Validação apenas no frontend
   - Impacto: Bypass via DevTools ou API direta
   - **Solução:** Validar TUDO no backend

### ⚠️ ALTAS - Implementar urgentemente

6. **Sem HTTPS**
   - Problema: Tráfego não criptografado
   - Impacto: Man-in-the-middle attacks
   - **Solução:** Certificado SSL/TLS obrigatório

7. **XSS (Cross-Site Scripting)**
   - Localização: Uso de `innerHTML` em vários lugares
   - Problema: Injeção de scripts maliciosos
   - **Solução:** Sanitizar com DOMPurify

8. **CSRF (Cross-Site Request Forgery)**
   - Problema: Sem tokens CSRF
   - Impacto: Requisições forjadas
   - **Solução:** Implementar tokens CSRF

9. **Rate Limiting Insuficiente**
   - Localização: `src/services/authService.js` (apenas login)
   - Problema: Rate limit só no login
   - **Solução:** Rate limit em todas as rotas sensíveis

10. **Sem Content Security Policy**
    - Problema: Sem CSP headers
    - Impacto: XSS mais fácil
    - **Solução:** Configurar CSP headers

---

## ✅ Checklist de Segurança para Produção

### Autenticação e Autorização

- [ ] **Implementar backend real**
  - Node.js + Express ou similar
  - Banco de dados PostgreSQL
  - ORM (Sequelize/Prisma)

- [ ] **Hash de senhas**
  ```javascript
  import bcrypt from 'bcryptjs';
  const hashedPassword = await bcrypt.hash(password, 12);
  const isValid = await bcrypt.compare(password, hashedPassword);
  ```

- [ ] **JWT (JSON Web Tokens)**
  ```javascript
  import jwt from 'jsonwebtoken';
  const token = jwt.sign({ userId }, SECRET, { expiresIn: '24h' });
  const decoded = jwt.verify(token, SECRET);
  ```

- [ ] **2FA Real**
  - Opção 1: TOTP (speakeasy + qrcode)
  - Opção 2: SMS (Twilio)
  - Opção 3: Email (SendGrid)

- [ ] **Refresh Tokens**
  - Access token: curta duração (15min)
  - Refresh token: longa duração (7 dias)
  - Rotação de tokens

- [ ] **Session Management**
  - Invalidar tokens ao fazer logout
  - Detectar múltiplos logins
  - Timeout de inatividade

### Validação e Sanitização

- [ ] **Validação no Backend**
  ```javascript
  import { body, validationResult } from 'express-validator';

  app.post('/api/login',
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      // Process login
    }
  );
  ```

- [ ] **Sanitização de Inputs**
  ```javascript
  import DOMPurify from 'dompurify';
  const clean = DOMPurify.sanitize(dirty);
  ```

- [ ] **Prepared Statements**
  ```javascript
  // ❌ SQL Injection vulnerável
  db.query(`SELECT * FROM users WHERE id = ${userId}`);

  // ✅ Seguro
  db.query('SELECT * FROM users WHERE id = $1', [userId]);
  ```

### Headers de Segurança

- [ ] **Helmet.js (Node.js)**
  ```javascript
  import helmet from 'helmet';
  app.use(helmet());
  ```

- [ ] **Content Security Policy**
  ```javascript
  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  }));
  ```

- [ ] **CORS Configurado**
  ```javascript
  import cors from 'cors';
  app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }));
  ```

- [ ] **HTTPS Obrigatório**
  ```javascript
  if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
      if (req.header('x-forwarded-proto') !== 'https') {
        res.redirect(`https://${req.header('host')}${req.url}`);
      } else {
        next();
      }
    });
  }
  ```

### Rate Limiting

- [ ] **Global Rate Limit**
  ```javascript
  import rateLimit from 'express-rate-limit';

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // 100 requests
  });
  app.use('/api/', limiter);
  ```

- [ ] **Auth Rate Limit (mais restrito)**
  ```javascript
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // Apenas 5 tentativas
  });
  app.use('/api/auth/login', authLimiter);
  ```

### Logs e Monitoramento

- [ ] **Logging**
  ```javascript
  import winston from 'winston';

  const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
      new winston.transports.File({ filename: 'combined.log' }),
    ],
  });
  ```

- [ ] **Auditoria**
  - Log de todas operações sensíveis
  - IP, timestamp, user agent
  - Detecção de atividades suspeitas

- [ ] **Error Handling**
  ```javascript
  app.use((err, req, res, next) => {
    logger.error(err.stack);

    // Não expor detalhes em produção
    const message = process.env.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : err.message;

    res.status(err.status || 500).json({ error: message });
  });
  ```

### Banco de Dados

- [ ] **Criptografia em Repouso**
  - PostgreSQL: pg_crypto
  - MongoDB: Encryption at Rest

- [ ] **Backup Regular**
  - Automático (diário)
  - Testado (mensal)
  - Off-site (replicação)

- [ ] **Least Privilege**
  - Usuário do banco com permissões mínimas
  - Não usar usuário root/admin

### Variáveis de Ambiente

- [ ] **Secrets Management**
  ```bash
  # .env (NUNCA commitar!)
  JWT_SECRET=random_64_character_string_here
  DATABASE_URL=postgresql://user:pass@localhost:5432/db
  ```

- [ ] **Validação de ENV**
  ```javascript
  const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'];
  requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
      throw new Error(`Missing required env var: ${varName}`);
    }
  });
  ```

### Dependências

- [ ] **Audit Regular**
  ```bash
  npm audit
  npm audit fix
  ```

- [ ] **Atualizações**
  - Dependências atualizadas mensalmente
  - Security patches imediatamente

- [ ] **Lock Files**
  - Committar package-lock.json
  - Usar versões exatas em produção

---

## 🛡️ Melhorias Implementadas

### ✅ No código atual

1. **Validação de CPF** - Algoritmo correto implementado
2. **Rate Limiting (Login)** - Bloqueio após 3 tentativas
3. **Validação de Email** - Regex básico
4. **Field Validation** - Feedback visual de erros
5. **Toast Notifications** - Feedback de ações

### ⏳ A implementar

Ver checklist acima.

---

## 📋 Compliance

### LGPD (Lei Geral de Proteção de Dados)

- [ ] Consentimento explícito
- [ ] Política de privacidade clara
- [ ] Direito ao esquecimento
- [ ] Portabilidade de dados
- [ ] DPO (Data Protection Officer)

### PCI DSS (se processar cartões)

- [ ] Não armazenar dados de cartão
- [ ] Usar gateway de pagamento certificado (Stripe, PagSeguro)
- [ ] Criptografia de dados sensíveis

---

## 🔍 Auditoria de Segurança

### Ferramentas Recomendadas

1. **OWASP ZAP** - Scanner de vulnerabilidades
2. **Snyk** - Análise de dependências
3. **SonarQube** - Qualidade e segurança de código
4. **Burp Suite** - Testes de penetração

### Testes de Segurança

```bash
# Scan de dependências
npm audit

# Lint de segurança
npm install -D eslint-plugin-security
```

---

## 📞 Reportar Vulnerabilidades

Se você encontrar uma vulnerabilidade de segurança:

1. **NÃO** abra uma issue pública
2. Envie email para: security@inwista.com
3. Inclua:
   - Descrição da vulnerabilidade
   - Passos para reproduzir
   - Impacto potencial
   - Sugestão de correção (opcional)

---

## 📚 Recursos

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [LGPD - Lei 13.709/2018](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)

---

**⚠️ LEMBRE-SE: Este é um projeto EDUCACIONAL. Implemente TODAS as melhorias antes de usar em produção!**
