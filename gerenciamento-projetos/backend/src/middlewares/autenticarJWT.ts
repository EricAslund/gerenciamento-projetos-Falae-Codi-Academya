// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface CustomRequest extends Request {
    userId?: number;
  }

export function autenticarJWT(req: CustomRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  // Verifica se o header Authorization está presente
  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  // Divide o header e verifica se segue o padrão "Bearer <token>"
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Token malformatado ou não fornecido' });
  }

  try {
    // Verifica e decodifica o token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { id: number };

    // Define o userId no request
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
}
