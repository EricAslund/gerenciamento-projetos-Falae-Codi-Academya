import { Request, Response } from 'express';
import db from '../../config/db';
import projetosController from '../projetosController';


// Mocking the database module
jest.mock("../../config/db");
interface CustomRequest extends Request {
  userId?: any; 
}
describe('projetosController.listarProjetos() method', () => {
  let controller: projetosController;
  let mockRequest: Partial<CustomRequest>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    controller = new projetosController();
    mockRequest = {
      query: {
        page: '1',
        limit: '10',
        usuario: '123',
        status: 'Ativo',
        dataInicio: '2024-01-01',
        dataFim: '2024-12-31',
        ordenarPor: 'id',
        ordem: 'asc'
      }
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('Successful Project Retrieval', () => {
    it('should return projects with pagination', async () => {
      // Mocking the database response
      (db as any).mockReturnValueOnce({
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        countDistinct: jest.fn().mockResolvedValueOnce([{ count: 1 }]), // Total count
      });

      (db as any).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValueOnce([{ id: '1', nome: 'Projeto 1', data_inicio: '2024-01-01', data_fim: '2024-12-31', status: 'Ativo' }]), // Mocked project
      });

      await controller.listarProjetos(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        projetos: [{
          id: '1',
          nome: 'Projeto 1',
          data_inicio: '2024-01-01',
          data_fim: '2024-12-31',
          status: 'Ativo'
        }],
        totalPages: 1,
        currentPage: 1
      });
    });
  });

  describe('No Projects Found', () => {
    it('should return 404 if no projects found', async () => {
      (db as any).mockReturnValueOnce({
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        countDistinct: jest.fn().mockResolvedValueOnce([{ count: 0 }]), // No projects
      });

      await controller.listarProjetos(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Nenhum projeto encontrado.' });
    });
  });

  describe('Error Handling', () => {
    it('should return 500 on database error', async () => {
      (db as any).mockReturnValueOnce({
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        countDistinct: jest.fn().mockRejectedValueOnce(new Error('Database error')), // Simulando erro no banco de dados
      });

      await controller.listarProjetos(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Erro ao buscar projetos.', error: expect.any(Error) });
    });
  });
});
