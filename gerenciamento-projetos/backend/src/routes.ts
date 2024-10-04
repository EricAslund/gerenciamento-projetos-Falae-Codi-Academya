import { Router } from 'express';
import ProjetosController from './controllers/projetosController';
import UsuariosController from './controllers/usuariosController';
import { autenticarJWT } from './middlewares/autenticarJWT';
import UsuariosProjetosController from './controllers/usuariosProjetosController';
import DashboardController from './controllers/dashboardController';
import GoogleAgendaController from '../src/controllers/googleAgendaCotroller';
import { ValidacaoUsuario } from './middlewares/ValidacaoUsuario';
import { ValidarProjeto } from './middlewares/ValidarProjeto';
import csvController from './controllers/csvController';
const router = Router();

const usuariosController = new UsuariosController()
const projetosController = new ProjetosController()
const usuariosProjetosController = new UsuariosProjetosController()
// const googleAgendaController = new GoogleAgendaController()

// Rota para buscar estatísticas dos projetos
router.get('/dashboard',autenticarJWT, DashboardController.getDashboardData);

// Rotas para Projetos
router.get('/projetos',autenticarJWT, projetosController.listarProjetos);
router.post('/projetos',autenticarJWT,ValidarProjeto, projetosController.cadastrarProjeto);
router.put('/projetos/:id',autenticarJWT,ValidarProjeto, projetosController.editarProjeto);
router.delete('/projetos/:id',autenticarJWT, projetosController.removerProjeto);
router.post('/calendar-event',autenticarJWT, GoogleAgendaController.createEvent);
router.post('/upload-csv',autenticarJWT, csvController.upload.single('file'), csvController.processCSV);

// Rotas para Usuários em Projetos
router.get('/projetos/:projetoId/usuarios',autenticarJWT, usuariosProjetosController.listarUsuarios);
router.post('/projetos/:projetoId/usuarios',autenticarJWT, usuariosProjetosController.cadastrarUsuario);
router.delete('/projetos/:projetoId/usuarios/:usuarioId',autenticarJWT, usuariosProjetosController.removerUsuario);
router.get('/usuarios',autenticarJWT, usuariosController.index)

// Rotas para Autenticação
router.post('/auth/register',ValidacaoUsuario, usuariosController.registrarUsuario);
router.post('/auth/login',ValidacaoUsuario,usuariosController.loginUsuario);
router.get('/auth/me', autenticarJWT,usuariosController.dadosUsuarioAutenticado);

export default router;
