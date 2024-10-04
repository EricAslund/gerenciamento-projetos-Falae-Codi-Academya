// Unit tests for: registrarUsuario

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../../config/db';
import mailer from '../../config/mailer';
import usuariosController from '../usuariosController';

// Mocking dependencies
jest.mock("bcrypt");
jest.mock("jsonwebtoken");
jest.mock("../../config/db");
jest.mock("../../config/mailer");

class MockRequest {
  public body: any = {};
}

class MockResponse {
  public status = jest.fn().mockReturnThis();
  public json = jest.fn().mockReturnThis();
}

describe('usuariosController.registrarUsuario() registrarUsuario method', () => {
  let controller: usuariosController;
  let mockRequest: MockRequest;
  let mockResponse: MockResponse;

  beforeEach(() => {
    controller = new usuariosController();
    mockRequest = new MockRequest() as any;
    mockResponse = new MockResponse() as any;
  });

  describe('Happy Path', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      mockRequest.body = {
        nome: 'John Doe',
        email: 'john.doe@example.com',
        senha: 'password123',
        papel: 'user',
      };

      (db as any).mockImplementation(() => ({
        where: jest.fn().mockReturnValueOnce({
          first: jest.fn().mockResolvedValueOnce(null), // Usuário não existe
        }),
        insert: jest.fn().mockResolvedValueOnce([1]), // Simula inserção
      }));
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashedPassword');
      (jwt.sign as jest.Mock).mockReturnValueOnce('jwtToken');
      (mailer.sendMail as jest.Mock).mockResolvedValueOnce(true);

      // Act
      await controller.registrarUsuario(mockRequest as any, mockResponse as any);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        id: 1,
        nome: 'John Doe',
        email: 'john.doe@example.com',
        papel: 'user',
        token: 'jwtToken',
      });
    });
  });

  describe('Edge Cases', () => {
    it('should return 400 if required fields are missing', async () => {
      // Arrange
      mockRequest.body = {
        nome: '',
        email: '',
        senha: '',
        papel: '',
      };

      // Act
      await controller.registrarUsuario(mockRequest as any, mockResponse as any);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Todos os campos são obrigatórios',
      });
    });

    it('should return 400 if user already exists', async () => {
      // Arrange
      mockRequest.body = {
        nome: 'John Doe',
        email: 'john.doe@example.com',
        senha: 'password123',
        papel: 'user',
      };

      (db as any).mockImplementation(() => ({
        where: jest.fn().mockReturnValueOnce({
          first: jest.fn().mockResolvedValueOnce({ id: 1 }), // Usuário já existe
        }),
      }));

      // Act
      await controller.registrarUsuario(mockRequest as any, mockResponse as any);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Usuário já registrado.',
      });
    });

    it('should return 400 if email is invalid and rollback user creation', async () => {
      // Arrange
      mockRequest.body = {
        nome: 'John Doe',
        email: 'qwed.doe@example.com',
        senha: 'password123',
        papel: 'user',
      };

      (db as any).mockImplementation(() => ({
        where: jest.fn().mockReturnValueOnce({
          first: jest.fn().mockResolvedValueOnce(null), // Usuário não existe
         
        }),
        insert: jest.fn().mockResolvedValueOnce([1]), // Simula inserção
        del: jest.fn().mockResolvedValueOnce(true),
        
      }));
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashedPassword');
      (mailer.sendMail as jest.Mock).mockRejectedValueOnce(new Error('Invalid email'));

      // Act
      await controller.registrarUsuario(mockRequest as any, mockResponse as any);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Email inválido. O cadastro foi cancelado.',
      });
    });

    
  });
})
// End of unit tests for: registrarUsuario
