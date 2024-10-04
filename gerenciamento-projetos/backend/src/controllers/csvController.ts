import { Request, Response } from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import db from '../config/db'; // Atualize com o caminho para sua configuração de banco de dados

interface CustomRequest extends Request {
    userId?: number;
  }
// Criar o diretório de uploads se não existir
const uploadDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do multer para armazenar o arquivo
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

// Função para processar e inserir dados do CSV
export async function processCSV (req: CustomRequest, res: Response) {
    const file = req.file;
    const usuarioId = req.userId;

    if (!usuarioId) {
        return res.status(400).json({ message: 'ID do usuário não fornecido.' });
    }

    const usuario = await db('usuarios').where({ id: usuarioId }).first();

    // Verifique se o usuário foi encontrado
    if (!usuario) {
        return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const { papel } = usuario;

    // Verifique a permissão do usuário
    if (papel !== 'Gerente') {
        return res.status(403).json({ message: 'Permissão insuficiente para executar este comando.' });
    }

    // Verifique se o arquivo foi enviado
    if (!file) {
        return res.status(400).json({ message: 'Arquivo não enviado.' });
    }

    const results: { nome: string; descricao: string; data_inicio: string; data_fim: string; status: string }[] = [];

    // Ler e processar o arquivo CSV
    fs.createReadStream(file.path)
        .pipe(csv({ separator: ';' }))
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                // Inserir dados no banco de dados
                for (const row of results) {
                    await db('projetos').insert({
                        nome: row.nome,
                        descricao: row.descricao,
                        data_inicio: row.data_inicio,
                        data_fim: row.data_fim,
                        status: row.status,
                    });
                }

                res.status(200).json({ message: 'Arquivo processado e dados inseridos com sucesso!' });
            } catch (error) {
                  // Verificar se error é uma instância de Error antes de acessar suas propriedades
                  if (error instanceof Error) {
                    res.status(500).json({ message: 'Erro ao inserir dados no banco de dados.', error: error.message });
                } else {
                    res.status(500).json({ message: 'Erro desconhecido.' });
                }
            } finally {
                try {
                    // Remove o arquivo após o processamento
                    fs.unlinkSync(file.path);
                } catch (unlinkError) {
                    console.error('Erro ao remover o arquivo:', unlinkError);
                }
            }
        });
}

export default {
    upload,
    processCSV
};
