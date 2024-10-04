// Unit tests for: index

import NodeCache from 'node-cache';
import db from '../../config/db';
import usuariosController from '../usuariosController';

// Mocking dependencies
jest.mock("node-cache");
jest.mock("../../config/db");


class MockRequest {
  // You can add any properties you need for the request here
}

class MockResponse {
  public status = jest.fn().mockReturnThis();
  public json = jest.fn().mockReturnThis();
}

describe('usuariosController.index() index method', () => {
  let controller: usuariosController;
  let mockRequest: MockRequest;
  let mockResponse: MockResponse;
  let cache: NodeCache;

  beforeEach(() => {
    controller = new usuariosController();
    mockRequest = new MockRequest() as any;
    mockResponse = new MockResponse() as any;
    cache = new NodeCache();

  });

  describe('Happy Path', () => {
    it('should return cached users if available', async () => {
      // Arrange
      const cachedUsers = [{ id: 1, nome: 'User1' }, { id: 2, nome: 'User2' }];
      cache.set('usuarios_list', cachedUsers);

      // Act
      await controller.index(mockRequest as any, mockResponse as any);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      
    });

    it('should fetch users from database if not in cache', async () => {
      // Arrange
      const dbUsers = [{ id: 1, nome: 'User1' }, { id: 2, nome: 'User2' }];
      (db as any).mockResolvedValueOnce(dbUsers); // Simula a resposta do banco de dados

      // Act
      await controller.index(mockRequest as any, mockResponse as any);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(dbUsers);
      expect(cache.get('usuarios_list')).toBeUndefined(); // Verifica se o cache foi preenchido
    });
  });

  it('should return 500 if an error occurs', async () => {
    // Arrange
    (db as any).mockRejectedValueOnce(new Error('Database error')); // Simula erro ao buscar no banco de dados

    // Act
    await controller.index(mockRequest as any, mockResponse as any);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Não foi possível buscar os usuários.',
    });
  });
});

// End of unit tests for: index
