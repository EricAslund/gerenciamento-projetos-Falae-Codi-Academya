import { Request, Response } from 'express';
import db from '../config/db';

interface CustomRequest extends Request {
  userId?: number;
}

export default class projetosController {

  // Cadastrar um novo projeto
  async cadastrarProjeto(req: CustomRequest, res: Response) {
    const { nome, descricao, data_inicio, status } = req.body;
    const usuarioId = req.userId;
    const usuario = await db('usuarios').where({ id: usuarioId }).first();

    if (usuario.papel !== 'Gerente') {
      res.status(404).json({ message: 'Permissão insuficiente para executar este comando.' });
      return;
    }


    try {
      const [id] = await db('projetos').insert({ nome, descricao, data_inicio, status });
      res.status(201).json({ id, message: 'Projeto criado com sucesso.' });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao criar projeto.', error });
    }
  }
  // Listar todos os projetos


  async listarProjetos(req: Request, res: Response) {
    const {
      page = 1,
      limit = 10,
      usuario,
      status,
      dataInicio,
      dataFim,
      ordenarPor = 'id',
      ordem = 'asc'
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    // Validar e formatar os parâmetros de ordenação
    const ordenarPorValidado = typeof ordenarPor === 'string' ? ordenarPor : 'id';
    const ordemValidado = ordem === 'desc' ? 'desc' : 'asc';

    // Determinar o tipo de ordenação com base no campo
    const ordenarPorTipo = ['data_inicio', 'data_fim'].includes(ordenarPorValidado) ? 'date' :
      ['id', 'valor_diaria'].includes(ordenarPorValidado) ? 'numeric' :
        'alphabetic';

    try {
      // Contar total de projetos com filtros aplicados
      const [totalCountResult] = await db('projetos')
        .leftJoin('projetos_usuarios', 'projetos.id', '=', 'projetos_usuarios.projeto_id')
        .where((qb) => {
          if (usuario) {
            qb.where('projetos_usuarios.usuario_id', '=', usuario); // Ajuste conforme o campo real no banco
          }
          if (status) {
            qb.where('projetos.status', '=', status); // Ajuste conforme o campo real no banco
          }
          if (dataInicio) {
            qb.where('projetos.data_inicio', '>=', dataInicio);
          }
          if (dataFim) {
            qb.where('projetos.data_fim', '<=', dataFim);
          }
        })
        .countDistinct('projetos.id as count'); // Conta apenas projetos distintos

      const totalCount: number = Number(totalCountResult.count);

      if (totalCount === 0) {
        return res.status(404).json({ message: 'Nenhum projeto encontrado.' });
      }


      // Construir a consulta de projetos
      let projetosQuery = db('projetos')
        .select(
          'projetos.id',
          'projetos.nome',
          'projetos.descricao',
          'projetos.data_inicio',
          'projetos.data_fim',
          'projetos.status'
        )
        .leftJoin('projetos_usuarios', 'projetos.id', '=', 'projetos_usuarios.projeto_id')
        .where((qb) => {
          if (usuario) {
            qb.where('projetos_usuarios.usuario_id', '=', usuario);
          }
          if (status) {
            qb.where('projetos.status', '=', status);
          }
          if (dataInicio) {
            qb.where('projetos.data_inicio', '>=', dataInicio);
          }
          if (dataFim) {
            qb.where('projetos.data_fim', '<=', dataFim);
          }
        })
        .groupBy('projetos.id')  // Agrupa pelos IDs dos projetos para evitar duplicação
        .limit(Number(limit))
        .offset(offset);

      // Ordenar de acordo com o tipo
      if (ordenarPorTipo === 'date') {
        projetosQuery = projetosQuery.orderBy(ordenarPorValidado, ordemValidado);
      } else if (ordenarPorTipo === 'numeric') {
        projetosQuery = projetosQuery.orderBy(ordenarPorValidado, ordemValidado);
      } else {
        projetosQuery = projetosQuery.orderBy(ordenarPorValidado, ordemValidado);
      }

      const projetos = await projetosQuery;

      const totalPages = Math.ceil(totalCount / Number(limit));

  
      const projetosFormatados = projetos.map(projeto => ({
        ...projeto,
        data_inicio: projeto.data_inicio ? new Date(projeto.data_inicio).toISOString().split('T')[0] : null,
        data_fim: projeto.data_fim ? new Date(projeto.data_fim).toISOString().split('T')[0] : null
      }));

      res.status(200).json({
        projetos: projetosFormatados,
        totalPages,
        currentPage: Number(page)
      });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar projetos.', error });
    }
  }


  async editarProjeto(req: CustomRequest, res: Response) {
    const { id } = req.params;
    const { nome, descricao, data_inicio, status, data_fim } = req.body;
    const usuarioId = req.userId;
    const usuario = await db('usuarios').where({ id: usuarioId }).first();

    if (usuario.papel !== 'Gerente') {
      res.status(404).json({ message: 'Permissão insuficiente para executar este comando.' });
      return;
    }

    try {
      const projeto = await db('projetos').where({ id }).first();
      if (!projeto) {
        return res.status(404).json({ message: 'Projeto não encontrado.' });
      }

      await db('projetos').where({ "id": id }).update({ nome, descricao, data_inicio, data_fim, status });
      res.status(200).json({ message: 'Projeto atualizado com sucesso.' });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao atualizar projeto.', error });
    }
  }
  async removerProjeto(req: CustomRequest, res: Response) {
    const { id } = req.params;
    const usuarioId = req.userId;
    const usuario = await db('usuarios').where({ id: usuarioId }).first();

    if (usuario.papel !== 'Gerente') {
      res.status(404).json({ message: 'Permissão insuficiente para executar este comando.' });
      return;
    }

    try {
      const projeto = await db('projetos').where({ id }).first();
      if (!projeto) {
        return res.status(404).json({ message: 'Projeto não encontrado.' });
      }
      if (projeto.status !== 'Concluído') {
        return res.status(400).json({ message: 'O projeto não pode ser removido porque não está concluído.' });
      }


      await db('projetos').where({ id }).del();
      res.status(204).json({ message: 'Projeto removido com sucesso.' });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao remover projeto.', error });
    }
  }



}