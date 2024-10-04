
// Unit tests for: ValidarProjeto


import { NextFunction, Request, Response } from 'express';
import { ValidarProjeto } from '../ValidarProjeto';



describe('ValidarProjeto() ValidarProjeto method', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  // Happy Path Tests
  describe('Happy Path', () => {
    it('should call next when all required fields are present and valid', () => {
      req.body = {
        nome: 'Projeto A',
        descricao: 'Descrição do Projeto A',
        data_inicio: '2023-01-01',
        status: 'ativo',
        data_fim: '2023-12-31'
      };

      ValidarProjeto(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should return 400 if nome is missing', () => {
      req.body = {
        descricao: 'Descrição do Projeto A',
        data_inicio: '2023-01-01',
        status: 'ativo'
      };

      ValidarProjeto(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Os campos nome, descrição, data de início e status são obrigatórios.'
      });
    });

    it('should return 400 if descricao is missing', () => {
      req.body = {
        nome: 'Projeto A',
        data_inicio: '2023-01-01',
        status: 'ativo'
      };

      ValidarProjeto(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Os campos nome, descrição, data de início e status são obrigatórios.'
      });
    });

    it('should return 400 if data_inicio is missing', () => {
      req.body = {
        nome: 'Projeto A',
        descricao: 'Descrição do Projeto A',
        status: 'ativo'
      };

      ValidarProjeto(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Os campos nome, descrição, data de início e status são obrigatórios.'
      });
    });

    it('should return 400 if status is missing', () => {
      req.body = {
        nome: 'Projeto A',
        descricao: 'Descrição do Projeto A',
        data_inicio: '2023-01-01'
      };

      ValidarProjeto(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Os campos nome, descrição, data de início e status são obrigatórios.'
      });
    });

    it('should return 400 if data_fim is before data_inicio', () => {
      req.body = {
        nome: 'Projeto A',
        descricao: 'Descrição do Projeto A',
        data_inicio: '2023-01-01',
        status: 'ativo',
        data_fim: '2022-12-31'
      };

      ValidarProjeto(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'A data de fim não pode ser anterior à data de início.'
      });
    });
  });
});

// End of unit tests for: ValidarProjeto
