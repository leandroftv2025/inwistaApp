# Dockerfile para Frontend
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Stage de produção
FROM node:18-alpine

WORKDIR /app

# Copiar apenas os arquivos necessários
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Instalar apenas dependências de produção
RUN npm ci --only=production

# Expor porta
EXPOSE 5000

# Comando de inicialização
CMD ["npm", "run", "preview", "--", "--port", "5000", "--host", "0.0.0.0"]
