// Unit tests for: removerUsuario

import { Request } from 'express';
import db from '../../config/db';
import UsuariosProjetosController from '../usuariosProjetosController';
import mailer from '../../config/mailer';
// Mocking the database module
jest.mock("../../config/db");

// Mocking the Request and Response from express
class MockResponse {
  status = jest.fn().mockReturnThis();
  json = jest.fn().mockReturnThis();
}

interface MockCustomRequest extends Request {
  userId?: number;
  params: { projetoId: string; usuarioId: string };
}
jest.mock('../../config/mailer', () => ({
  sendMail: jest.fn().mockResolvedValue(true), // ou mockRejectedValue para testar falhas
}));

describe('UsuariosProjetosController.removerUsuario() method', () => {
  let controller: UsuariosProjetosController;
  let mockRequest: MockCustomRequest;
  let mockResponse: MockResponse;

  beforeEach(() => {
    controller = new UsuariosProjetosController();
    mockRequest = {
      userId: 1,
      params: { projetoId: '1', usuarioId: '2' },
    } as any;
    mockResponse = new MockResponse() as any;
    (mailer.sendMail as jest.Mock).mockClear();

  });

  describe('Happy Path', () => {
    it('should remove a user from a project successfully when user is a manager', async () => {
      // Mocking database responses
      (db as any).mockImplementation(() => ({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({ id: 1,papel: 'Gerente' }), // Mock user role
        del: jest.fn().mockResolvedValue(1), // Simulating successful delete
      }));

      await controller.removerUsuario(mockRequest as any, mockResponse as any);

      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Usuário removido do projeto com sucesso.' });
    });
  });

  describe('Edge Cases', () => {
    it('should return 404 if user is not a manager', async () => {
      (db as any).mockImplementation(() => ({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({ papel: 'Desenvolvedor' }), // Mock user role
      }));

      await controller.removerUsuario(mockRequest as any, mockResponse as any);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Permissão insuficiente para executar este comando.' });
    });

  
});
})

// End of unit tests for: removerUsuario
