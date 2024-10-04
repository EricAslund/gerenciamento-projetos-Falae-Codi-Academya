# Definindo a imagem base
FROM node:18

# Definindo o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copiando os arquivos de package.json e package-lock.json
COPY package*.json ./

# Instalando as dependências
RUN npm install

# Copiando o código do backend para o container
COPY . .

# Expondo a porta na qual a aplicação irá rodar
EXPOSE 3001

# Comando para iniciar o backend
CMD ["npm", "run", "dev"]
