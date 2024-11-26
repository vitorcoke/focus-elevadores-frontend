# Etapa 1: Usar uma imagem oficial do Node.js
FROM node:18-bullseye AS build

# Definir o diretório de trabalho dentro do container
WORKDIR /app/focus-elevadores-frontend

# Copiar os arquivos package.json e package-lock.json para instalar as dependências
COPY package*.json ./

# Instalar as dependências do projeto
RUN npm install --force

# Copiar o código da aplicação NestJS para dentro do container
COPY . .

RUN npm run build

# Instala o PM2 globalmente
RUN npm install -g pm2

# Comando para iniciar a aplicação com PM2
CMD ["pm2-runtime", "start", "npm", "--name", "focus-elevadores-frontend", "--", "start"]