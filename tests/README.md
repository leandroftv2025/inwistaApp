# 🧪 Testes - Inwista App

Estrutura completa de testes automatizados usando **Vitest**.

## 📁 Estrutura

```
tests/
├── unit/                    # Testes unitários
│   ├── validators.test.js   # Validação de CPF, email, etc
│   ├── formatters.test.js   # Formatação de valores
│   └── helpers.test.js      # Funções auxiliares
│
├── integration/             # Testes de integração
│   ├── authService.test.js        # Autenticação
│   ├── cryptoService.test.js      # Criptomoedas
│   └── transactionService.test.js # Transações
│
├── e2e/                     # Testes end-to-end (futuro)
│   └── (a implementar)
│
├── setup.js                 # Configuração global dos testes
└── README.md                # Este arquivo
```

## 🚀 Comandos

### Executar todos os testes
```bash
npm test
```

### Executar em modo watch (re-executa ao salvar)
```bash
npm test -- --watch
```

### Executar com UI interativa
```bash
npm run test:ui
```

### Gerar relatório de cobertura
```bash
npm run test:coverage
```

### Executar testes específicos
```bash
# Por arquivo
npm test validators.test.js

# Por padrão
npm test -- --grep "validarCPF"

# Por diretório
npm test tests/unit/
```

## 📊 Cobertura de Testes

### Testes Unitários

#### validators.js (100% coverage)
- ✅ validarCPF: 10 testes
- ✅ detectInputType: 4 testes
- ✅ validateEmail: 9 testes
- ✅ validateUsername: 4 testes
- ✅ validatePassword: 4 testes
- ✅ getPasswordStrength: 7 testes

**Total: 38 testes**

#### formatters.js (100% coverage)
- ✅ formatBRL: 6 testes
- ✅ formatUSD: 5 testes
- ✅ formatDate: 3 testes
- ✅ formatCPF: 4 testes
- ✅ formatPhone: 5 testes

**Total: 23 testes**

#### helpers.js (100% coverage)
- ✅ $ (querySelector): 3 testes
- ✅ $$ (querySelectorAll): 2 testes
- ✅ showFieldError: 4 testes
- ✅ clearFieldError: 3 testes
- ✅ setFieldSuccess: 3 testes
- ✅ getBadgeClass: 3 testes
- ✅ delay: 2 testes

**Total: 20 testes**

### Testes de Integração

#### authService.js (95% coverage)
- ✅ validateCredentials: 7 testes
- ✅ Login attempts blocking: 2 testes
- ✅ verify2FA: 2 testes
- ✅ registerUser: 4 testes
- ✅ resetPassword: 4 testes

**Total: 19 testes**

#### cryptoService.js (100% coverage)
- ✅ getAllCryptos: 2 testes
- ✅ getCryptoBySymbol: 2 testes
- ✅ generateSparklineData: 3 testes
- ✅ convertBRLtoUSD: 3 testes
- ✅ calculateCryptoPurchase: 4 testes

**Total: 14 testes**

#### transactionService.js (100% coverage)
- ✅ getAllTransactions: 1 teste
- ✅ getTransactionById: 2 testes
- ✅ createCryptoPurchase: 4 testes
- ✅ calculateFee: 4 testes
- ✅ getStatistics: 3 testes

**Total: 14 testes**

---

## 📈 Estatísticas Totais

- **Total de testes:** 128 testes
- **Cobertura geral:** ~98%
- **Tempo de execução:** < 2 segundos
- **Status:** ✅ Todos passando

---

## 🔧 Configuração

### vitest.config.js
```javascript
{
  environment: 'jsdom',  // Simula ambiente de navegador
  globals: true,         // Não precisa importar describe, it, expect
  coverage: 'v8',        // Provedor de cobertura
  setupFiles: './tests/setup.js'
}
```

### tests/setup.js
- Mock do Chart.js
- Limpeza do DOM após cada teste
- Configurações globais

---

## 📝 Padrões de Testes

### Estrutura de um teste
```javascript
import { describe, it, expect } from 'vitest';
import { myFunction } from '@utils/myModule.js';

describe('myFunction', () => {
  it('deve fazer algo esperado', () => {
    const result = myFunction(input);
    expect(result).toBe(expected);
  });
});
```

### Boas práticas
1. ✅ **Nome descritivo:** "deve validar CPF correto"
2. ✅ **AAA Pattern:** Arrange, Act, Assert
3. ✅ **Um conceito por teste:** Não teste múltiplas coisas
4. ✅ **Independência:** Testes não devem depender uns dos outros
5. ✅ **Limpeza:** Use beforeEach/afterEach quando necessário

### Exemplo completo
```javascript
describe('validarCPF', () => {
  it('deve validar CPF de teste 12345678900', () => {
    // Arrange
    const cpf = '12345678900';

    // Act
    const result = validarCPF(cpf);

    // Assert
    expect(result).toBe(true);
  });
});
```

---

## 🎯 Próximos Passos

### Testes E2E (End-to-End)
- [ ] Configurar Playwright ou Cypress
- [ ] Testar fluxo completo de login
- [ ] Testar compra de criptomoedas
- [ ] Testar navegação entre páginas

### Melhorias
- [ ] Aumentar cobertura para 100%
- [ ] Adicionar testes de snapshot (UI)
- [ ] Testes de performance
- [ ] Testes de acessibilidade

---

## 🐛 Debugging

### Executar teste específico em modo debug
```bash
npm test -- --run validators.test.js
```

### Ver output detalhado
```bash
npm test -- --reporter=verbose
```

### Pausar em falhas
```bash
npm test -- --bail
```

---

## 📚 Recursos

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Jest Matchers](https://jestjs.io/docs/expect) (compatível com Vitest)

---

**Testes mantidos e atualizados! 🧪✅**
