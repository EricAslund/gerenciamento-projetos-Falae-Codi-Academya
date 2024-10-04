import { Request, Response, NextFunction } from 'express';


export function ValidacaoUsuario(req: Request, res: Response, next: NextFunction){
    const { email, senha} = req.body;
      
    if (senha.length < 6) {
       res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres.' });
      return;
    }
    
    // Validação simples de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
     res.status(400).json({ message: 'Email inválido.' });
      return;
    }
    next()
}