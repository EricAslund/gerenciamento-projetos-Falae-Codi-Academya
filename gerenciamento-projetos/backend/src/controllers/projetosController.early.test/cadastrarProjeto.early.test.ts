import { Request, Response } from 'express';
import db from '../../config/db';
import projetosController from '../projetosController';

// Mocking the database module
jest.mock("../../config/db");

interface MockCustomRequest extends Request {
  userId?: number;
}

class MockResponse implements Partial<Response> {
  status = jest.fn().mockReturnThis();
  json = jest.fn().mockReturnThis();
}

describe('projetosController.cadastrarProjeto() method', () => {
  let controller: projetosController;
  let mockRequest: MockCustomRequest;
  let mockResponse: MockResponse;

  beforeEach(() => {
    controller = new projetosController();
    mockRequest = {
      body: {
        nome: 'Projeto Teste',
        descricao: 'Descrição do projeto teste',
        data_inicio: '2023-10-01',
        status: 'Ativo',
      },
      userId: 1,
    } as MockCustomRequest;
    mockResponse = new MockResponse();
  });

  describe('Happy Path', () => {
    it('should create a project successfully when user is a manager', async () => {
      // Mocking the database response for user role check
      (db as any).mockReturnValueOnce({
        where: jest.fn().mockReturnValueOnce({
          first: jest.fn().mockResolvedValueOnce({ papel: 'Gerente' }),
        }),
      });
      // Mocking the database response for project insertion
      (db as any).mockReturnValueOnce({
        insert: jest.fn().mockResolvedValueOnce([1]),
      });

      await controller.cadastrarProjeto(mockRequest, mockResponse as unknown as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({ id: 1, message: 'Projeto criado com sucesso.' });
    });
  });

  describe('Edge Cases', () => {
    it('should return 404 if user is not a manager', async () => {
      // Mocking the database response for user role check
      (db as any).mockReturnValueOnce({
        where: jest.fn().mockReturnValueOnce({
          first: jest.fn().mockResolvedValueOnce({ papel: 'Desenvolvedor' }),
        }),
      });

      await controller.cadastrarProjeto(mockRequest, mockResponse as unknown as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Permissão insuficiente para executar este comando.' });
    });

    it('should handle database errors gracefully', async () => {
      // Mocking the database response for user role check
      (db as any).mockReturnValueOnce({
        where: jest.fn().mockReturnValueOnce({
          first: jest.fn().mockResolvedValueOnce({ papel: 'Gerente' }),
        }),
      });
      // Mocking a database error during project insertion
      (db as any).mockReturnValueOnce({
        insert: jest.fn().mockRejectedValueOnce(new Error('Database error')),
      });

      await controller.cadastrarProjeto(mockRequest, mockResponse as unknown as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Erro ao criar projeto.', error: expect.any(Error) });
    });
  });
});
