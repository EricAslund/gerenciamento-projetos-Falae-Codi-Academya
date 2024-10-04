import React, { useState } from 'react';

import api from '../../util/axiosConfig';
import { toast } from 'react-toastify';
import axios from 'axios';

interface CalendarioModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
}

const CalendarioModal: React.FC<CalendarioModalProps> = ({ isOpen, onRequestClose }) => {
  const [eventTitle, setEventTitle] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventStart, setEventStart] = useState('');
  const [eventEnd, setEventEnd] = useState('');
  const [attendees, setAttendees] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddAttendee = () => {
    setAttendees([...attendees, '']);
  };

  const handleAttendeeChange = (index: number, value: string) => {
    const updatedAttendees = [...attendees];
    updatedAttendees[index] = value;
    setAttendees(updatedAttendees);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
  
try{
  const eventData = {
    summary: eventTitle,
    location: eventLocation,
    description: eventDescription,
    start: {
      dateTime: eventStart, // Formata a data de início
     
    },
    end: {
      dateTime: eventEnd,   // Formata a data de término
      
    },
    attendees: attendees.filter(email => email !== '').map(email => ({ email })),
  };
      // Chamada ao backend para criar o evento no Google Calendar
      const response = await api.post('/calendar-event', eventData);
      
      console.log('Evento criado com sucesso:', response.data);
      toast.success('Evento criado com sucesso');
      setEventTitle('')
      setEventLocation('')
      setEventDescription('')
      setEventStart('')
      setEventEnd('')
      setAttendees([])
      onRequestClose(); // Fecha o modal
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Erro ao salvar o projeto. Tente novamente.';
        toast.error(errorMessage);
      } else {
        console.error('Erro desconhecido ao salvar projeto:', error);
        toast.error('Erro desconhecido. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-2xl font-semibold mb-4 text-center">Adicionar Evento</h3>

        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título do Evento:
            <input
              type="text"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              required
            />
          </label>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Local:
            <input
              type="text"
              value={eventLocation}
              onChange={(e) => setEventLocation(e.target.value)}
              className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição:
            <textarea
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Início do Evento:
            <input
              type="datetime-local"
              value={eventStart}
              onChange={(e) => setEventStart(e.target.value)}
              className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              required
            />
          </label>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fim do Evento:
            <input
              type="datetime-local"
              value={eventEnd}
              onChange={(e) => setEventEnd(e.target.value)}
              className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              required
            />
          </label>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Participantes:
            {attendees.map((attendee, index) => (
              <input
                key={index}
                type="email"
                value={attendee}
                onChange={(e) => handleAttendeeChange(index, e.target.value)}
                placeholder="Email do participante"
                className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              />
            ))}
            <button
              type="button"
              onClick={handleAddAttendee}
              className="text-blue-500 hover:text-blue-700 text-sm"
            >
              Adicionar Participante
            </button>
          </label>

          <div className="flex justify-between mt-4">
            <button
              type="submit"
              className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={isLoading}
            >
              {isLoading ? 'Criando...' : 'Criar Evento'}
            </button>
            <button
              type="button"
              onClick={onRequestClose}
              className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CalendarioModal;
