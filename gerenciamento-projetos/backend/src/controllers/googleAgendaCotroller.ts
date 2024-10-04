import { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import getAccessToken from '../config/getAccessToken'; // Atualize o caminho conforme necessário
import db from '../config/db';
dotenv.config();
interface CustomRequest extends Request {
  userId?: number;
}

const createEvent = async (req: CustomRequest, res: Response) => {
  const usuarioId = req.userId;  
  const usuario = await db('usuarios').where({ id: usuarioId }).first();

  if (usuario.papel  !== 'Gerente') {
    res.status(404).json({ message: 'Permissão insuficiente para executar este comando.' });
    return;
  }
  const formatDateTime = (dateTime:any) => {
    const d = new Date(dateTime);
    const offset = -d.getTimezoneOffset() / 60;
    const offsetStr = (offset >= 0 ? '+' : '-') + String(Math.abs(offset)).padStart(2, '0') + ':00';
    return d.toISOString().slice(0, 19) + offsetStr; // Formata a data com o offset do fuso horário
  };
  
  try {
    const { summary, description, start, end, attendees, location } = req.body;

      // Formatar as datas corretamente
      const cleanStart = formatDateTime(start.dateTime);
      const cleanEnd = formatDateTime(end.dateTime);
  
    // Ajuste o formato da data para garantir que inclua o fuso horário
    const event = {
      summary,
      description,
      location,
      start: {
        dateTime: cleanStart,
        timeZone: 'America/Sao_Paulo', // Ajuste o fuso horário conforme necessário
      },
      end: {
        dateTime: cleanEnd,
        timeZone: 'America/Sao_Paulo', // Ajuste o fuso horário conforme necessário
      },
      attendees: attendees
        .filter((attendee: { email: string }) => attendee.email) // Remove emails vazios
        .map((attendee: { email: string }) => ({ email: attendee.email })),
    };

    const accessToken = await getAccessToken();

    const response = await axios.post(
      `https://www.googleapis.com/calendar/v3/calendars/${process.env.GOOGLE_CALENDAR_ID}/events`,
      event,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.status(200).json({ message: 'Evento agendado com sucesso!', event: response.data });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Erro ao agendar evento:', error.response?.data || error.message);
      res.status(error.response?.status || 500).json({ message: 'Erro ao agendar evento.', error: error.response?.data || error.message });
    } else {
      console.error('Erro inesperado:', error);
      res.status(500).json({ message: 'Erro inesperado.', error: error instanceof Error ? error.message : 'Erro desconhecido' });
    }
  }
};

export default {
  createEvent,
};
