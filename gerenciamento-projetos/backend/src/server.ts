import express from 'express';
import cors from 'cors';
import routes from './routes';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

// Criar uma instância do Express
const app = express();
app.use(cors({
  origin: 'http://localhost:3000', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  credentials: true, 
}));
const port = process.env.PORT || 3002;

// Middleware para parsear JSON
app.use(express.json());

// Definir as rotas
app.use('/api', routes);

// Rota de teste
app.get('/api/status', (req, res) => {
  res.send({ message: 'API funcionando' });
});

// Iniciar o servidor
 app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});


export default app;