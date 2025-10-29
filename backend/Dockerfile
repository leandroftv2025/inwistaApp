# Dockerfile para Backend
FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY src ./src

# Expor porta
EXPOSE 3001

# Comando de inicialização
CMD ["npm", "start"]
