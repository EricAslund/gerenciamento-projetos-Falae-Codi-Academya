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
  params: { projetoId: string };
  body: { usuario_id: number };
}

jest.mock('../../config/mailer', () => ({
  sendMail: jest.fn().mockResolvedValue(true), // ou mockRejectedValue para testar falhas
}));

describe('UsuariosProjetosController.cadastrarUsuario() method', () => {
  let controller: UsuariosProjetosController;
  let mockRequest: MockCustomRequest;
  let mockResponse: MockResponse;

  beforeEach(() => {
    controller = new UsuariosProjetosController();
    mockRequest = {
      userId: 1, // Usuário autenticado
      params: { projetoId: '1' },
      body: { usuario_id: 2 }, // ID do usuário a ser adicionado
    } as any;
    mockResponse = new MockResponse() as any;
    (mailer.sendMail as jest.Mock).mockClear();
  });

  describe('Happy Path', () => {
    it('should add a user to a project successfully when user is a manager', async () => {
      const mockUsuariosProjetos = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValueOnce(null),
      };

      const mockProjetos = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValueOnce({ id: 1, nome: 'Projeto Teste' }),
      };

      const mockUsuarios = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValueOnce({ id: 1, papel: 'Gerente' }),
      };

      const mockUsuarioAdicionado = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValueOnce({ id: 2, email: 'usuario@example.com', nome: 'Usuário Teste' }),
      };

      const mockInsert = jest.fn().mockResolvedValueOnce([{ projeto_id: 1, usuario_id: 2 }]);

      (db as any).mockImplementation((table: string) => {
        if (table === 'projetos_usuarios') {
          return { ...mockUsuariosProjetos, insert: mockInsert };
        }
        if (table === 'projetos') {
          return mockProjetos;
        }
        if (table === 'usuarios') {
          return mockUsuarios; // Mock do usuário logado
        }
        return {
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
        };
      });

      const mockRequest = {
        params: { projetoId: '1' },
        body: { usuario_id: 2 },
        userId: 1,
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      mailer.sendMail = jest.fn().mockResolvedValueOnce({});

      await controller.cadastrarUsuario(mockRequest as any, mockResponse as any);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Usuário adicionado ao projeto com sucesso.',
      });


      expect(mockUsuariosProjetos.where).toHaveBeenCalledWith('projeto_id', 1);
      expect(mockUsuariosProjetos.andWhere).toHaveBeenCalledWith('usuario_id', 2);
      expect(mockInsert).toHaveBeenCalledWith({
        projeto_id: 1,
        usuario_id: 2,
      });
    });
  });
  
  
  

  describe('Edge Cases', () => {
    it('should return 404 if user is not a manager', async () => {
      (db as any).mockImplementation(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValueOnce({ papel: 'Desenvolvedor' }), // Mock user role
      }));

      await controller.cadastrarUsuario(mockRequest as any, mockResponse as any);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Permissão insuficiente para executar este comando.' });
    });

    it('should return 400 if user is already added to the project', async () => {
      (db as any).mockImplementation(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValueOnce({ id: 1, papel: 'Gerente' }) // Mock manager role
                        .mockResolvedValueOnce({ projeto_id: 1, usuario_id: 2 }), // Mock user already in project
      }));

      await controller.cadastrarUsuario(mockRequest as any, mockResponse as any);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Usuário já cadastrado neste projeto.' });
    });

   
  });
});
