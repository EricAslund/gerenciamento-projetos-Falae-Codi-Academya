// Unit tests for: loginUsuario

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import NodeCache from 'node-cache';
import db from '../../config/db';
import usuariosController from '../usuariosController';

// Mocking dependencies
jest.mock("bcrypt");
jest.mock("jsonwebtoken");
jest.mock("../../config/db");
jest.mock("node-cache");

class MockRequest {
  public body: any = {};
}

class MockResponse {
  public status = jest.fn().mockReturnThis();
  public json = jest.fn().mockReturnThis();
}

describe('usuariosController.loginUsuario() loginUsuario method', () => {
  let controller: usuariosController;
  let mockRequest: MockRequest;
  let mockResponse: MockResponse;

  beforeEach(() => {
    controller = new usuariosController();
    mockRequest = new MockRequest() as any;
    mockResponse = new MockResponse() as any;
  });

  describe('Edge Cases', () => {
    it('should return 400 if email or password is missing', async () => {
      // Arrange
      mockRequest.body = {
        email: '',
        senha: '',
      };

      // Act
      await controller.loginUsuario(mockRequest as any, mockResponse as any);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Email e senha são obrigatórios.',
      });
    });

    it('should return 400 if user is not found', async () => {
      // Arrange
      mockRequest.body = {
        email: 'nonexistent@example.com',
        senha: 'password123',
      };

      (db as any).mockImplementation(() => ({
        where: jest.fn().mockReturnValueOnce({
          first: jest.fn().mockResolvedValueOnce(null), // Usuário não encontrado
        }),
      }));

      // Act
      await controller.loginUsuario(mockRequest as any, mockResponse as any);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Email ou senha inválidos.',
      });
    });

    it('should return 400 if password is invalid', async () => {
      // Arrange
      mockRequest.body = {
        email: 'user@example.com',
        senha: 'wrongPassword',
      };

      (db as any).mockImplementation(() => ({
        where: jest.fn().mockReturnValueOnce({
          first: jest.fn().mockResolvedValueOnce({
            id: 1,
            nome: 'User',
            senha: 'hashedPassword', // Senha em formato hash
          }),
        }),
      }));
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false); // Senha inválida

      // Act
      await controller.loginUsuario(mockRequest as any, mockResponse as any);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Email ou senha inválidos.',
      });
    });

    it('should return a token on successful login', async () => {
      // Arrange
      mockRequest.body = {
        email: 'user@example.com',
        senha: 'password123',
      };

      (db as any).mockImplementation(() => ({
        where: jest.fn().mockReturnValueOnce({
          first: jest.fn().mockResolvedValueOnce({
            id: 1,
            nome: 'User',
            senha: 'hashedPassword', // Senha em formato hash
          }),
        }),
      }));
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true); // Senha válida
      (jwt.sign as jest.Mock).mockReturnValueOnce('jwtToken'); // Simula token

      // Act
      await controller.loginUsuario(mockRequest as any, mockResponse as any);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        token: 'jwtToken',
      });
    });

    it('should return 500 if an unexpected error occurs', async () => {
      // Arrange
      mockRequest.body = {
        email: 'user@example.com',
        senha: 'password123',
      };

      (db as any).mockImplementation(() => ({
        where: jest.fn().mockReturnValueOnce({
          first: jest.fn().mockRejectedValueOnce(new Error('Database error')), // Simula erro
        }),
      }));

      // Act
      await controller.loginUsuario(mockRequest as any, mockResponse as any);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Erro ao fazer login.',
      });
    });
  });
});

// End of unit tests for: loginUsuario
