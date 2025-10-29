# 💰 Inwista - Banco Digital

Aplicação web de banco digital com suporte a criptomoedas, desenvolvida como SPA (Single Page Application) com JavaScript vanilla.

## 🎯 Versões Disponíveis

### 📦 Versão Monolítica (Original)
- **Arquivo:** `index.html` + `app.js`
- **Estrutura:** Todo código em um único arquivo (1.393 linhas)
- **Uso:** Protótipo rápido, demonstração

### 🏗️ Versão Modular (Recomendada)
- **Arquivo:** `index-modular.html` + `src/`
- **Estrutura:** Código organizado em módulos ES6
- **Uso:** Desenvolvimento profissional, manutenção de longo prazo

## 🚀 Como Executar

### Pré-requisitos
- Navegador moderno com suporte a ES6 modules
- Servidor HTTP (ES6 modules não funcionam com `file://`)

### Opção 1: Python HTTP Server
```bash
python3 -m http.server 8000
```
Acesse: http://localhost:8000/index-modular.html

### Opção 2: Node.js http-server
```bash
npx http-server
```
Acesse: http://localhost:8080/index-modular.html

### Opção 3: VS Code Live Server
1. Instale a extensão "Live Server"
2. Clique com botão direito em `index-modular.html`
3. Selecione "Open with Live Server"

## 🔐 Credenciais de Teste

### Usuário Regular
- **CPF:** 12345678900
- **Email:** joao@inwista.com
- **Username:** joao
- **Senha:** 1234
- **Código 2FA:** 123456

### Usuário Admin
- **CPF:** 98765432100
- **Email:** admin@inwista.com
- **Username:** admin
- **Senha:** admin123
- **Código 2FA:** 123456

### Outro Usuário
- **CPF:** 11122233344
- **Email:** maria@email.com
- **Username:** maria
- **Senha:** senha123
- **Código 2FA:** 123456

## 📂 Estrutura do Projeto (Versão Modular)

```
src/
├── main.js                 # Entry point
├── components/             # Componentes UI
│   ├── auth/              # Autenticação
│   │   ├── Login.js
│   │   └── TwoFactor.js
│   ├── dashboard/         # Dashboard
│   │   ├── Home.js
│   │   ├── Transactions.js
│   │   ├── Assets.js
│   │   ├── Explore.js
│   │   └── Admin.js
│   ├── modals/            # Modais
│   │   └── BuyModal.js
│   └── common/            # Componentes comuns
│       ├── Sidebar.js
│       └── Layout.js
├── services/              # Lógica de negócio
│   ├── authService.js
│   ├── notificationService.js
│   ├── cryptoService.js
│   └── transactionService.js
├── store/                 # Estado global
│   └── appStore.js
├── utils/                 # Utilitários
│   ├── constants.js
│   ├── validators.js
│   ├── formatters.js
│   └── helpers.js
└── data/                  # Dados mockados
    └── mockData.js
```

## ✨ Funcionalidades

### ✅ Implementadas
- [x] Login multi-identificador (CPF, email, username)
- [x] Autenticação 2FA
- [x] Validação de CPF
- [x] Sistema de notificações (toast)
- [x] Dashboard com mercado de criptomoedas
- [x] Compra de criptomoedas
- [x] Histórico de transações
- [x] Visualização de ativos
- [x] Painel administrativo
- [x] Dark mode automático
- [x] Design responsivo
- [x] Bloqueio de conta após tentativas falhas

### 🚧 Em Desenvolvimento
- [ ] Recuperação de senha (UI pronta, backend pendente)
- [ ] Criação de conta (UI pronta, backend pendente)
- [ ] Integração com API real de criptomoedas
- [ ] Persistência de dados (localStorage/backend)
- [ ] Testes automatizados

## 🎨 Tecnologias

- **Frontend:** Vanilla JavaScript (ES6+)
- **UI:** HTML5, CSS3 (Design System customizado)
- **Gráficos:** Chart.js
- **Chat:** Botpress Webchat
- **Padrões:** Component-based, Observer, Singleton

## 🔧 Configuração e Desenvolvimento

### Estrutura de Componentes
Cada componente segue o padrão:
```javascript
export class MyComponent {
  render() {
    return `<div>HTML</div>`;
  }

  attachEvents() {
    // Event listeners
  }
}

export const myComponent = new MyComponent();
```

### Gerenciamento de Estado
```javascript
import { appStore } from './store/appStore.js';

// Ler estado
const user = appStore.getCurrentUser();

// Atualizar estado
appStore.setCurrentUser(user);

// Observar mudanças
appStore.subscribe((state) => {
  console.log('State changed:', state);
});
```

### Notificações
```javascript
import { notificationService } from './services/notificationService.js';

notificationService.success('Título', 'Mensagem');
notificationService.error('Erro', 'Descrição do erro');
notificationService.warning('Aviso', 'Mensagem de aviso');
```

## 📊 Melhorias Implementadas

### Antes (Monolítico)
- ❌ 1 arquivo com 1.393 linhas
- ❌ Difícil manutenção
- ❌ Código duplicado
- ❌ Impossível testar isoladamente
- ❌ Dificuldade para colaborar

### Depois (Modular)
- ✅ 23 arquivos modulares (média 50-200 linhas)
- ✅ Separação clara de responsabilidades
- ✅ Código reutilizável
- ✅ Fácil de testar
- ✅ Melhor DX (Developer Experience)
- ✅ Documentação clara

## 🔒 Segurança

### ⚠️ Avisos Importantes
Este é um projeto de **demonstração**. Para produção, implemente:

- [ ] Backend real com Node.js/Express
- [ ] Autenticação JWT
- [ ] Hash de senhas (bcrypt, argon2)
- [ ] 2FA real (TOTP, SMS via Twilio)
- [ ] HTTPS obrigatório
- [ ] Sanitização de inputs (DOMPurify)
- [ ] Content Security Policy (CSP)
- [ ] Rate limiting
- [ ] Validação no backend
- [ ] Auditoria de segurança

### Credenciais Hardcoded
- ⚠️ **NÃO** use em produção
- Senhas estão em texto plano
- Código 2FA é fixo (123456)
- Todos os dados são simulados

## 📈 Roadmap

### Fase 1: Segurança ✅ (Planejada)
- Backend Node.js + Express
- Autenticação JWT
- Hash de senhas
- 2FA real

### Fase 2: Arquitetura ✅ (Concluída)
- ✅ Modularização do código
- ✅ Separação de componentes
- ✅ Serviços isolados
- ✅ State management

### Fase 3: Qualidade (Planejada)
- Testes unitários (Vitest)
- Testes E2E (Playwright)
- TypeScript
- ESLint + Prettier

### Fase 4: Features (Planejada)
- API real de criptomoedas
- Gráficos avançados
- Histórico completo
- Exportação de relatórios

## 🤝 Contribuindo

### Como Contribuir
1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Padrões de Código
- Use ES6+ features
- Siga o padrão de componentes existente
- Adicione comentários JSDoc
- Mantenha funções pequenas e focadas
- Escreva testes para novas funcionalidades

## 📝 Licença

Este projeto é apenas para fins educacionais e de demonstração.

## 📞 Suporte

Para dúvidas ou problemas:
- Abra uma [Issue](https://github.com/seu-usuario/inwista/issues)
- Consulte a [Documentação de Arquitetura](./ARCHITECTURE.md)

## 🎓 Aprendizados

Este projeto demonstra:
- Arquitetura component-based em Vanilla JS
- Padrões de design (Observer, Singleton)
- Separação de responsabilidades
- State management sem bibliotecas
- ES6 modules
- Design system customizado
- Responsive design
- Dark mode
- Validação de formulários
- Notificações toast

---

**Desenvolvido com ❤️ para aprendizado e demonstração**
