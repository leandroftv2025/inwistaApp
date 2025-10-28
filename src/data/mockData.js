/**
 * Dados simulados para demonstração
 * TODO: Substituir por chamadas de API real em produção
 */

export const users = [
  {
    id: "user-001",
    nome: "João Silva",
    cpf: "12345678900",
    email: "joao@inwista.com",
    username: "joao",
    senha: "1234", // TODO: Remover senha hardcoded
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
    senha: "admin123", // TODO: Remover senha hardcoded
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
    senha: "senha123", // TODO: Remover senha hardcoded
    role: "user",
    saldo_brl: 3500.0,
    saldo_usd: 650.0,
  },
];

export const cryptos = [
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

export const transactions = [
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
