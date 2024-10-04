import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../config/db';
import mailer from '../config/mailer'; // Importar mailer
import NodeCache from 'node-cache';



// Inicializar cache com duração padrão de 1 hora (3600 segundos)
const cache = new NodeCache({ stdTTL: 3600 });

interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha: string;
  papel: string;
}

interface CustomRequest extends Request {
  userId?: number;
}

export default class usuariosController {
  
  // Registrar novo usuário
  public async registrarUsuario(req: Request, res: Response): Promise<void> {
    try {
      const { nome, email, senha, papel } = req.body;

      if (!nome || !email || !senha || !papel) {
        res.status(400).json({ message: 'Todos os campos são obrigatórios' });
        return;
      }

      // Verificar se o usuário já existe no cache ou banco de dados
      const cachedUsuario = cache.get<Usuario>(`usuario_${email}`);
      let usuarioExistente = cachedUsuario;

      if (!usuarioExistente) {
        usuarioExistente = await db('usuarios').where({ email }).first();
      }

      if (usuarioExistente) {
        res.status(400).json({ message: 'Usuário já registrado.' });
        return;
      }

      // Criptografar senha
      const hashSenha = await bcrypt.hash(senha, 10);

    

      // Tentar enviar o e-mail de confirmação
      
      try {
        await mailer.sendMail({
          to: email,
          subject: 'Confirmação de Cadastro',
          text: `Olá ${nome}, seu cadastro foi realizado com sucesso!`,
        });
      } catch (error) {
        // Se o envio do e-mail falhar, apagar o usuário do banco
        
         res.status(400).json({ message: 'Email inválido. O cadastro foi cancelado.' });
        return;
      }
        // Inserir novo usuário no banco
        const [id] = await db('usuarios').insert({
          nome,
          email,
          senha: hashSenha,
          papel,
        });
        // Limpar o cache da lista de usuários, pois a lista mudou
      cache.del('usuarios_list'); // Limpa a lista de usuários do cache
  
        // Gerar token JWT
        const token = jwt.sign(
          { id: id, nome: nome },
          process.env.JWT_SECRET || '',
          {
            expiresIn: '1d',
          }
        );
        // Adicionar o novo usuário ao cache
        cache.set(`usuario_${email}`, { id, nome, email, papel });

        res.status(201).json({ id, nome, email, papel, token });
     
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      res.status(500).json({ message: 'Erro ao registrar usuário.' });
    }
  }

  // Login de usuário
  public async loginUsuario(req: Request, res: Response): Promise<void> {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        res.status(400).json({ message: 'Email e senha são obrigatórios.' });
        return;
      }

      // Verificar se o usuário está no cache
      let usuario: Usuario | undefined = cache.get(`usuario_${email}`);

      if (!usuario) {
        // Se não estiver no cache, buscar do banco de dados
        usuario = await db<Usuario>('usuarios').where({ email }).first();
        if (usuario) {
          // Adicionar o usuário ao cache
          cache.set(`usuario_${email}`, usuario);
        }
      }

      if (!usuario) {
        res.status(400).json({ message: 'Email ou senha inválidos.' });
        return;
      }

      // Comparar senha
      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (!senhaValida) {
        res.status(400).json({ message: 'Email ou senha inválidos.' });
        return;
      }

      // Gerar token JWT
      const token = jwt.sign(
        { id: usuario.id, nome: usuario.nome },
        process.env.JWT_SECRET || '',
        {
          expiresIn: '1d',
        }
      );

      res.status(201).json({ token });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao fazer login.' });
    }
  }

  // Retornar dados do usuário autenticado
  public async dadosUsuarioAutenticado(req: CustomRequest, res: Response): Promise<void> {
    try {
      const usuarioId = req.userId;

      // Verificar se o usuário está no cache
      let usuario = cache.get<Usuario>(`usuario_${usuarioId}`);

      if (!usuario) {
        usuario = await db('usuarios').where({ id: usuarioId }).first();

        if (!usuario) {
          res.status(404).json({ message: 'Usuário não encontrado.' });
          return;
        }

        // Adicionar usuário ao cache
        cache.set(`usuario_${usuarioId}`, usuario);
      }

      res.status(201).json({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        papel: usuario.papel,
      });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar dados do usuário.' });
    }
  }

  // Listar todos os usuários
  public async index(req: CustomRequest, res: Response): Promise<void> {
    try {
      // Verificar se os usuários estão no cache
      let usuarios = await cache.get<Usuario[]>('usuarios_list');
      
  
      if (!usuarios) {
        // Se não estiver no cache, buscar do banco de dados
        usuarios = await db('usuarios');
        
  
        // Adicionar ao cache se existirem usuários
        if (usuarios && usuarios.length) {
          cache.set('usuarios_list', usuarios);
        }
      }
  
      res.status(200).json(usuarios);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      res.status(500).json({ message: 'Não foi possível buscar os usuários.' });
    }
  }
}
