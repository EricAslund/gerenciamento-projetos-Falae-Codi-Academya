import { Request, Response } from 'express';
import db from '../config/db';
import mailer from '../config/mailer'; // Importar o arquivo de configuração do nodemailer

interface CustomRequest extends Request {
  userId?: number;
}

export default class UsuariosProjetosController {

  // Listar usuários de um projeto específico
  async listarUsuarios(req: Request, res: Response) {
    const { projetoId } = req.params;
    const projetoId_inteiro = Number(projetoId);
    const { page = 1, limit = 10 } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    try {
      const [totalCountResult] = await db('projetos_usuarios')
        .where('projetos_usuarios.projeto_id', projetoId_inteiro)
        .count('* as count');

      const totalCount: number = Number(totalCountResult.count);

      const usuarios = await db('projetos_usuarios')
        .where('projetos_usuarios.projeto_id', projetoId_inteiro)
        .join('usuarios', 'usuarios.id', '=', 'projetos_usuarios.usuario_id')
        .select('usuarios.id', 'usuarios.nome', 'usuarios.email', 'usuarios.papel')
        .limit(Number(limit))
        .offset(offset);

      const totalPages = Math.ceil(totalCount / Number(limit));

      res.status(200).json({
        usuarios,
        totalCount,
        totalPages,
        currentPage: Number(page),
      });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar usuários.', error });
    }
  }

  // Cadastrar um usuário em um projeto específico
  async cadastrarUsuario(req: CustomRequest, res: Response) {
    const { projetoId } = req.params;
    const { usuario_id } = req.body;
    const projetoId_inteiro = Number(projetoId);
    const usuarioId = req.userId;
    const usuario = await db('usuarios').where({ id: usuarioId }).first();
  
    if (usuario.papel !== 'Gerente') {
      res.status(404).json({ message: 'Permissão insuficiente para executar este comando.' });
      return;
    }


    const UsuariosProjetos = await db('projetos_usuarios').where('projeto_id', projetoId_inteiro).andWhere('usuario_id', usuario_id).first();


    if (UsuariosProjetos) {
      return res.status(400).json({ message: 'Usuário já cadastrado neste projeto.' });
    }

    try {
      // Consultar o nome do projeto
      const projeto = await db('projetos').where('id', projetoId_inteiro).first();
     
      if (!projeto) {
        return res.status(404).json({ message: 'Projeto não encontrado.' });
      }

      await db('projetos_usuarios').insert({
        projeto_id: projetoId_inteiro,
        usuario_id: usuario_id
      });

      // Buscar o email do usuário
      const usuarioAdicionado = await db('usuarios').where('id', usuario_id).first();

      // Enviar email de confirmação
      if (usuarioAdicionado) {
        await mailer.sendMail({
          to: usuarioAdicionado.email,
          subject: 'Adicionado ao Projeto',
          text: `Olá ${usuario.nome}, você foi adicionado ao projeto${projeto.nome}.`,
        });
      }

      res.status(201).json({ message: 'Usuário adicionado ao projeto com sucesso.' });
    } catch (error) {
      console.error('Erro ao adicionar usuário ao projeto:', error);
      res.status(500).json({ message: 'Erro ao adicionar usuário ao projeto.', error });
    }
  }

  // Remover um usuário de um projeto específico
  async removerUsuario(req: CustomRequest, res: Response) {
    const { projetoId, usuarioId } = req.params;
    const projetoId_inteiro = Number(projetoId);
    const UsuarioAutenticado = req.userId;

    const usuario = await db('usuarios').where({ id: UsuarioAutenticado }).first();
    if (!usuario || usuario.papel !== 'Gerente') {
      res.status(403).json({ message: 'Permissão insuficiente para executar este comando.' });
      return;
    }

    try {
      const projeto = await db('projetos').where('id', projetoId_inteiro).first();

      if (!projeto) {
        return res.status(404).json({ message: 'Projeto não encontrado.' });
      }

      const rowsDeleted = await db('projetos_usuarios')
        .where({ projeto_id: projetoId_inteiro, usuario_id: usuarioId })
        .del();

      if (rowsDeleted === 0) {
        return res.status(404).json({ message: 'Usuário não encontrado neste projeto.' });
      }

      // Buscar o email do usuário removido
      const usuarioRemovido = await db('usuarios').where('id', usuarioId).first();

      // Enviar email de confirmação
      if (usuarioRemovido) {
        await mailer.sendMail({
          to: usuarioRemovido.email,
          subject: 'Removido do Projeto',
          text: `Olá ${usuarioRemovido.nome}, você foi removido do projeto${projeto.nome}.`,
        });
      }

      res.status(204).json({ message: 'Usuário removido do projeto com sucesso.' });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao remover usuário do projeto.', error });
    }
  }
}
