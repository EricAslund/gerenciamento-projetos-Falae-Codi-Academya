import { Request, Response } from 'express';
import usuariosController from '../usuariosController'; // ajuste o caminho conforme necessário
import db from '../../config/db'; // ajuste o caminho conforme necessário

jest.mock('../../config/db'); // Mock do db

describe('usuariosController.dadosUsuarioAutenticado', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let json: jest.Mock;
  let status: jest.Mock;
  const controller = new usuariosController();

  beforeEach(() => {
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });
    mockResponse = { status } as Partial<Response>;

    // Configura o mockRequest com userId
    mockRequest = {
      userId: 1, // ID do usuário autenticado
    } as Partial<Request>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  

  it('deve retornar 404 se o usuário não for encontrado no banco de dados', async () => {
    (db as any).mockReturnValueOnce({
      where: jest.fn().mockReturnValueOnce({
        first: jest.fn().mockResolvedValueOnce(undefined),
      }),
    });

    await controller.dadosUsuarioAutenticado(mockRequest as Request, mockResponse as Response);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({ message: 'Usuário não encontrado.' });
  });

  it('deve retornar 500 se ocorrer um erro', async () => {
    (db as any).mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    await controller.dadosUsuarioAutenticado(mockRequest as Request, mockResponse as Response);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ message: 'Erro ao buscar dados do usuário.' });
  });
  it('deve retornar os dados do usuário se encontrado no banco de dados', async () => {
    const usuario = { id: 1, nome: 'User1', email: 'user1@example.com', papel: 'admin' };
    (db as any).mockReturnValueOnce({
      where: jest.fn().mockReturnValueOnce({
        first: jest.fn().mockResolvedValueOnce(usuario),
      }),
    });

    await controller.dadosUsuarioAutenticado(mockRequest as Request, mockResponse as Response);

    expect(status).toHaveBeenCalledWith(201);
    expect(json).toHaveBeenCalledWith(usuario);
  });
});
