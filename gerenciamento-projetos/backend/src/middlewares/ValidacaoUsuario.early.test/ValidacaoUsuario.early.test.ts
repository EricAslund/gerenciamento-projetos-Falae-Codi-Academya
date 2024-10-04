
// Unit tests for: ValidacaoUsuario


import { NextFunction, Request, Response } from 'express';
import { ValidacaoUsuario } from '../ValidacaoUsuario';



describe('ValidacaoUsuario() ValidacaoUsuario method', () => {
  
  // Mocking the Request, Response, and NextFunction
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

  describe('Happy Path', () => {
    it('should call next() when email and senha are valid', () => {
      // Arrange
      req.body = { email: 'test@example.com', senha: '123456' };

      // Act
      ValidacaoUsuario(req as Request, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should return 400 if senha is less than 6 characters', () => {
      // Arrange
      req.body = { email: 'test@example.com', senha: '12345' };

      // Act
      ValidacaoUsuario(req as Request, res as Response, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'A senha deve ter pelo menos 6 caracteres.' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 if email is invalid', () => {
      // Arrange
      req.body = { email: 'invalid-email', senha: '123456' };

      // Act
      ValidacaoUsuario(req as Request, res as Response, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email inválido.' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 if email is missing', () => {
      // Arrange
      req.body = { senha: '123456' };

      // Act
      ValidacaoUsuario(req as Request, res as Response, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email inválido.' });
      expect(next).not.toHaveBeenCalled();
    });

  
  });
});

// End of unit tests for: ValidacaoUsuario
