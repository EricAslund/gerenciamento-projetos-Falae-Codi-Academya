
// Unit tests for: autenticarJWT


import jwt from 'jsonwebtoken';
import { autenticarJWT } from '../autenticarJWT';
import 'dotenv/config'

// src/middleware/auth.test.ts


// src/middleware/auth.test.ts
// Mocking the necessary interfaces and functions
interface MockCustomRequest {
  headers: {
    authorization?: string;
  };
  userId?: number;
}

class MockResponse {
  status = jest.fn().mockReturnThis();
  json = jest.fn().mockReturnThis();
}

const mockNextFunction = jest.fn();

describe('autenticarJWT() autenticarJWT method', () => {
  let mockRequest: MockCustomRequest;
  let mockResponse: MockResponse;

  beforeEach(() => {
    mockRequest = {
      headers: {}
    } as any;
    mockResponse = new MockResponse() as any;
    mockNextFunction.mockClear();
  });

  // Happy Path
  it('should call next function when token is valid', () => {
    // Arrange
  
    const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET || '',
      {
        expiresIn: '1d',
      });
    mockRequest.headers.authorization = `Bearer ${token}`;

    // Act
    autenticarJWT(mockRequest as any, mockResponse as any, mockNextFunction as any);

    // Assert
    expect(mockNextFunction).toHaveBeenCalled();
    expect(mockRequest.userId).toBe(1);
  });

  // Edge Cases
  it('should return 401 if authorization header is missing', () => {
    // Arrange
    mockRequest.headers.authorization = undefined;

    // Act
    autenticarJWT(mockRequest as any, mockResponse as any, mockNextFunction as any);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Token não fornecido' });
  });

  it('should return 401 if token is malformed', () => {
    // Arrange
    mockRequest.headers.authorization = 'Bearer';

    // Act
    autenticarJWT(mockRequest as any, mockResponse as any, mockNextFunction as any);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Token malformatado ou não fornecido' });
  });

  it('should return 401 if token is invalid', () => {
    // Arrange
    mockRequest.headers.authorization = 'Bearer invalidtoken';
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error('Invalid token');
    });

    // Act
    autenticarJWT(mockRequest as any, mockResponse as any, mockNextFunction as any);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Token inválido ou expirado' });
  });

  it('should return 401 if token is expired', () => {
    // Arrange
    const expiredToken = jwt.sign({ id: 1 }, process.env.JWT_SECRET || 'secret', { expiresIn: '-1s' });
    mockRequest.headers.authorization = `Bearer ${expiredToken}`;

    // Act
    autenticarJWT(mockRequest as any, mockResponse as any, mockNextFunction as any);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Token inválido ou expirado' });
  });
});

// End of unit tests for: autenticarJWT
