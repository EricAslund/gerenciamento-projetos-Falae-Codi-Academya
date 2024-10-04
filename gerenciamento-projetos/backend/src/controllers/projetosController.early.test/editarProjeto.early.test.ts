import { Request, Response } from 'express';
import db from '../../config/db';
import projetosController from '../projetosController';

// Mocking the database module
jest.mock("../../config/db");

// Interface CustomRequest
interface CustomRequest extends Request {
  userId?: any; // Mudado para string
}

describe('projetosController.editarProjeto() method', () => {
  let controller: projetosController;
  let mockRequest: Partial<CustomRequest>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    controller = new projetosController();
    mockRequest = {
      params: { id: '1' },
      body: {
        nome: 'Projeto Atualizado',
        descricao: 'Descrição do projeto atualizado',
        data_inicio: new Date(),
        status: 'Em Andamento',
        data_fim: new Date(),
      },
      userId: '123', // Simulando um ID de usuário como string
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('Permission Check', () => {
    it('should return 404 if user is not a manager', async () => {
      (db as any).mockReturnValueOnce({
        where: jest.fn().mockReturnValueOnce({
          first: jest.fn().mockResolvedValueOnce({ papel: 'Funcionário' }),
        }),
      });

      await controller.editarProjeto(mockRequest as CustomRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Permissão insuficiente para executar este comando.' });
    });
  });

  describe('Project Existence Check', () => {
    it('should return 404 if project is not found', async () => {
      (db as any).mockReturnValueOnce({
        where: jest.fn().mockReturnValueOnce({
          first: jest.fn().mockResolvedValueOnce({ papel: 'Gerente' }),
        }),
      });

      (db as any).mockReturnValueOnce({
        where: jest.fn().mockReturnValueOnce({
          first: jest.fn().mockResolvedValueOnce(null), // Projeto não encontrado
        }),
      });

      await controller.editarProjeto(mockRequest as CustomRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Projeto não encontrado.' });
    });
  });

  describe('Successful Update', () => {
    it('should return 200 if project is successfully updated', async () => {
      (db as any).mockReturnValueOnce({
        where: jest.fn().mockReturnValueOnce({
          first: jest.fn().mockResolvedValueOnce({ papel: 'Gerente' }),
        }),
      });

      (db as any).mockReturnValueOnce({
        where: jest.fn().mockReturnValueOnce({
          first: jest.fn().mockResolvedValueOnce({ id: '1', status: 'Concluído' }), // Projeto encontrado
        }),
      });

      (db as any).mockReturnValueOnce({
        where: jest.fn().mockReturnValueOnce({
          update: jest.fn().mockResolvedValueOnce(undefined), // Simulando atualização bem-sucedida
        }),
      });

      await controller.editarProjeto(mockRequest as CustomRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Projeto atualizado com sucesso.' });
    });
  });

  describe('Error Handling', () => {
    it('should return 500 on database error', async () => {
      (db as any).mockReturnValueOnce({
        where: jest.fn().mockReturnValueOnce({
          first: jest.fn().mockResolvedValueOnce({ papel: 'Gerente' }),
        }),
      });

      (db as any).mockReturnValueOnce({
        where: jest.fn().mockReturnValueOnce({
          first: jest.fn().mockResolvedValueOnce({ id: '1', status: 'Concluído' }),
        }),
      });

      (db as any).mockReturnValueOnce({
        where: jest.fn().mockReturnValueOnce({
          update: jest.fn().mockRejectedValueOnce(new Error('Database error')), // Simulando erro no banco de dados
        }),
      });

      await controller.editarProjeto(mockRequest as CustomRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Erro ao atualizar projeto.', error: expect.any(Error) });
    });
  });
});
