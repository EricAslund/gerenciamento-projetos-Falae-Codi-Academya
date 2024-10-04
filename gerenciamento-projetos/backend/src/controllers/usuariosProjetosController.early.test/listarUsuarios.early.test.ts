// Unit tests for: listarUsuarios

import { Request, Response } from 'express';
import db from '../../config/db';
import UsuariosProjetosController from '../usuariosProjetosController';
import { ParsedQs } from 'qs';

// Mocking the database
jest.mock("../../config/db");

// Mock interfaces
interface MockCustomRequest extends Request {
  params: { [key: string]: string };
  query: { [key: string]: string }; // Alterado para 'string' para compatibilidade com ParsedQs
}

interface MockResponse extends Response {
  status: jest.Mock;
  json: jest.Mock;
}

describe('UsuariosProjetosController.listarUsuarios() method', () => {
  let controller: UsuariosProjetosController;
  let mockRequest: MockCustomRequest;
  let mockResponse: MockResponse;

  beforeEach(() => {
    controller = new UsuariosProjetosController();

    mockRequest = {
      params: { projetoId: '1' },
      query: { page: '1', limit: '10' }, // Valores agora são strings
    } as any;

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;
  });

  describe('Happy Path', () => {
    it('should return a list of users for a valid project ID', async () => {
      // Arrange
      const mockUsers = [
        { id: 1, nome: 'User1', email: 'user1@example.com', papel: 'Developer' },
        { id: 2, nome: 'User2', email: 'user2@example.com', papel: 'Tester' },
      ];
      const mockTotalCount = [{ count: 2 }];

      (db as any).mockImplementation((table: string) => {
        if (table === 'projetos_usuarios') {
          return {
            where: jest.fn().mockReturnThis(),
            count: jest.fn().mockResolvedValue(mockTotalCount),
            join: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            offset: jest.fn().mockResolvedValue(mockUsers),
          };
        }
        return {
          where: jest.fn().mockReturnThis(),
          count: jest.fn().mockResolvedValue(mockTotalCount),
        };
      });

      // Act
      await controller.listarUsuarios(mockRequest as any, mockResponse as any);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        usuarios: mockUsers,
        totalCount: 2,
        totalPages: 1,
        currentPage: 1,
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle no users found for a valid project ID', async () => {
      // Arrange
      const mockTotalCount = [{ count: 0 }];
      const mockUsers: any[] = [];

      (db as any).mockImplementation((table: string) => {
        if (table === 'projetos_usuarios') {
          return {
            where: jest.fn().mockReturnThis(),
            count: jest.fn().mockResolvedValue(mockTotalCount),
            join: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            offset: jest.fn().mockResolvedValue(mockUsers),
          };
        }
        return {
          where: jest.fn().mockReturnThis(),
          count: jest.fn().mockResolvedValue(mockTotalCount),
        };
      });

      // Act
      await controller.listarUsuarios(mockRequest as any, mockResponse as any);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        usuarios: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
      });
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      const mockError = new Error('Database error');
      (db as any).mockImplementation(() => {
        throw mockError;
      });

      // Act
      await controller.listarUsuarios(mockRequest as any, mockResponse as any);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Erro ao buscar usuários.',
        error: mockError,
      });
    });

    it('should handle invalid project ID gracefully', async () => {
      // Arrange
      mockRequest.params.projetoId = 'invalid';

      // Act
      await controller.listarUsuarios(mockRequest as any, mockResponse as any);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Erro ao buscar usuários.',
        error: expect.any(Error),
      });
    });
  });
});

// End of unit tests for: listarUsuarios
