import { Request, Response } from 'express';
import { processCSV } from '../csvController';
import fs from 'fs';
import db from '../../config/db';

jest.mock('fs');
jest.mock('csv-parser');
jest.mock('../../config/db');

interface MockCustomRequest extends Request {
  userId?: number;
  file?: any;
}

class MockResponse {
  status = jest.fn().mockReturnThis();
  json = jest.fn().mockReturnThis();
}

describe('processCSV() method', () => {
  let mockRequest: MockCustomRequest;
  let mockResponse: MockResponse;
  let mockDb: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      userId: 1,
      file: { path: 'path/to/file.csv' },
    } as any;

    mockResponse = new MockResponse() as any;

    mockDb = db as any;
    mockDb.mockClear();
    mockDb.mockImplementation(() => {
      return {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null), // Simular usuário não encontrado
        insert: jest.fn().mockResolvedValue(undefined), // Simular inserção
      };
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 if user is not found', async () => {
    mockDb.mockImplementationOnce(() => {
      return {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null), // Simular usuário não encontrado
      };
    });

    await processCSV(mockRequest as any, mockResponse as any);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Usuário não encontrado.' });
  });

  it('should return 403 if user does not have permission', async () => {
    mockDb.mockImplementationOnce(() => {
      return {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({ papel: 'Funcionario' })
      };
    });

    await processCSV(mockRequest as any, mockResponse as any);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Permissão insuficiente para executar este comando.' });
  });

  // Continue com os outros testes...
});
