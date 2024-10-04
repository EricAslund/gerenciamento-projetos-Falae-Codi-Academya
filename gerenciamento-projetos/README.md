# Sistema de Gerenciamento de Projetos (SGP)

O Sistema de Gerenciamento de Projetos (SGP) é uma aplicação desenvolvida para gerenciar projetos e usuários. Ele permite a criação, leitura, atualização e exclusão de projetos e usuários, bem como a autenticação de usuários com diferentes papéis.

## Tecnologias Utilizadas

- **Back-end**:
  - Node.js
  - Express
  - TypeScript
  - MySQL
  - Knex.js
  - JWT para autenticação

- **Front-end**:
  - React.js
  - TypeScript
  - Tailwind CSS

## Funcionalidades

### API

A API RESTful do SGP oferece as seguintes funcionalidades:

- **Usuários**:
  - Criar um novo usuário
  - Listar todos os usuários em um projeto
  - Deletar um usuário

- **Projetos**:
  - Criar um novo projeto
  - Listar todos os projetos
  - Atualizar um projeto existente
  - Deletar um projeto

### Autenticação

- Registro de novos usuários 
- Login de usuários
- Proteção de rotas usando JWT para usuários autenticados

## Configuração

### Ambiente

Certifique-se de ter o Node.js e o MySQL instalados. Para configurar o ambiente:

1. **Clone o repositório**:
    ```bash
    git clone [<URL_DO_REPOSITORIO>](https://github.com/FullStack-lab/etapa01-bootcamp-EricAslund.git)
    cd [<DIRETORIO_DO_REPOSITORIO>](https://github.com/FullStack-lab/etapa01-bootcamp-EricAslund/tree/main)
    ```

2. **Instale as dependências do back-end**:
    ```bash
    cd backend
    npm install
    ```

3. **Configure as variáveis de ambiente**:
   - Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:
     ```env
     PORT=3001
     DB_HOST=localhost
     DB_USER=seu_usuario
     DB_PASSWORD=sua_senha
     DB_NAME=nome_do_banco
     JWT_SECRET=seu_segredo_jwt
     ```

4. **Inicie o servidor**:
    ```bash
    npm start
    ```

### Front-end

1. **Instale as dependências do front-end**:
    ```bash
    cd frontend
    npm install
    ```

2. **Inicie o servidor de desenvolvimento**:
    ```bash
    npm start
    ```

## Estrutura do Projeto

- `gerenciamento-projetos/`
  - `backend/` - Código fonte do back-end (API)
  - `frontend/` - Código fonte do front-end (interface do usuário)


## Contato

Para qualquer dúvida ou sugestão, entre em contato com [Eric Christian Radicchi Aslund](mail-to:eric_aslund@yahoo.comm).
