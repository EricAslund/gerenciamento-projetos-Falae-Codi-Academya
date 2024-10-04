import { Request, Response, NextFunction } from 'express';


export function ValidarProjeto(req: Request, res: Response, next: NextFunction){
    const { nome, descricao,data_inicio,status,data_fim } = req.body;
    
    if (!nome || !descricao || !data_inicio || !status ) {
        return res.status(400).json({ message: 'Os campos nome, descrição, data de início e status são obrigatórios.' });
      }
    
      if (data_fim && new Date(data_fim) < new Date(data_inicio)) {
        return res.status(400).json({ message: 'A data de fim não pode ser anterior à data de início.' });
      }
      next()
}