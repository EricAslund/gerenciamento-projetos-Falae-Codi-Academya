
// Unit tests for: removerProjeto


import { Request } from 'express';
import db from '../../config/db';
import projetosController from '../projetosController';



// Mocking the database module
jest.mock("../../config/db");

// Mocking the Request and Response from express
class MockResponse {
  status = jest.fn().mockReturnThis();
  json = jest.fn().mockReturnThis();
}

interface MockCustomRequest extends Request {
  userId?: number;
  params: { id: string };
}

describe('projetosController.removerProjeto() removerProjeto method', () => {
  let controller: projetosController;
  let mockRequest: MockCustomRequest;
  let mockResponse: MockResponse;

  beforeEach(() => {
    controller = new projetosController();
    mockRequest = {
      userId: 1,
      params: { id: '1' },
    } as any;
    mockResponse = new MockResponse() as any;
  });

  describe('Happy Path', () => {
    it('should remove a project successfully when user is a manager and project is completed', async () => {
      // Mocking database responses
      (db as any).mockImplementation(() => ({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({ papel: 'Gerente', status: 'Concluído' }),
        del: jest.fn().mockResolvedValue(1),
      }));

      await controller.removerProjeto(mockRequest as any, mockResponse as any);

      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Projeto removido com sucesso.' });
    });
  });

  describe('Edge Cases', () => {
    it('should return 404 if user is not a manager', async () => {
      (db as any).mockImplementation(() => ({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({ papel: 'Desenvolvedor' }),
      }));

      await controller.removerProjeto(mockRequest as any, mockResponse as any);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Permissão insuficiente para executar este comando.' });
    });

   

    it('should return 400 if project is not completed', async () => {
      (db as any).mockImplementation(() => ({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({ papel: 'Gerente', status: 'Em andamento' }),
      }));

      await controller.removerProjeto(mockRequest as any, mockResponse as any);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'O projeto não pode ser removido porque não está concluído.' });
    });

  
  });
});

// End of unit tests for: removerProjeto
