import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../util/axiosConfig';
import axios from 'axios';

interface UploadCSVModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UploadCSVModal: React.FC<UploadCSVModalProps> = ({ isOpen, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Estado de carregamento

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Por favor, selecione um arquivo.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsLoading(true); // Inicia o carregamento

    try {
      const response = await api.post('/upload-csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Arquivo enviado com sucesso!');
      console.log('Resposta do servidor:', response.data);
      onClose(); // Fecha o modal ao finalizar o upload
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Erro ao enviar o arquivo. Tente novamente.';
        toast.error(errorMessage);
      } else {
        console.error('Erro inesperado:', error);
        toast.error('Erro inesperado. Tente novamente.');
      }
    } finally {
      setIsLoading(false); // Finaliza o carregamento
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-2xl font-semibold mb-4 text-center">Upload de Arquivo CSV</h3>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full p-2 border border-gray-300 rounded-md mb-4"
          disabled={isLoading} // Desabilita o input durante o upload
        />
        <div className="flex justify-between mt-4">
          <button
            onClick={handleUpload}
            className={`bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isLoading} // Desabilita o botão enquanto carrega
          >
            {isLoading ? 'Enviando...' : 'Enviar'}
          </button>
          <button
            onClick={onClose}
            className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            disabled={isLoading} // Desabilita o botão cancelar durante o upload
          >
            Cancelar
          </button>
        </div>
        {isLoading && (
          <div className="text-center mt-4">
            <span className="text-gray-500">Carregando...</span>
            {/* Aqui você pode adicionar um spinner de carregamento */}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadCSVModal;
