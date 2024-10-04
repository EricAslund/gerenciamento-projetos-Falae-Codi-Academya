# Definindo a imagem base
FROM node:18

# Definindo o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copiando os arquivos de package.json e package-lock.json
COPY package*.json ./

# Instalando as dependências
RUN npm install

# Copiando o código do frontend para o container
COPY . .

# Construindo o projeto
RUN npm run build

# Expondo a porta do frontend (React utiliza a porta 3000 por padrão)
EXPOSE 3000

# Comando para iniciar o frontend
CMD ["npm", "start"]
