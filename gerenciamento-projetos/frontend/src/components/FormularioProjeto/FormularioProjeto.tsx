import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './FormularioProjeto.css';
import api from '../../util/axiosConfig'

interface Projeto {
  id: number;
  nome: string;
  descricao: string;
  data_inicio: string;
  data_fim: string | null;
  status: string;
}

interface FormularioProjetoProps {
  projetoExistente: Projeto | null;
  fecharFormulario: () => void;
  atualizarProjetos: (projeto: Projeto) => void;
}

const FormularioProjeto: React.FC<FormularioProjetoProps> = ({
  projetoExistente,
  fecharFormulario,
  atualizarProjetos,
}) => {
  const [nome, setNome] = useState(projetoExistente?.nome || '');
  const [descricao, setDescricao] = useState(projetoExistente?.descricao || '');
  const [dataInicio, setDataInicio] = useState(projetoExistente?.data_inicio || '');
  const [dataFim, setDataFim] = useState(projetoExistente?.data_fim || '');
  const [status, setStatus] = useState(projetoExistente?.status || 'Em andamento');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const novoProjeto = {
      id: projetoExistente?.id || 0,
      nome,
      descricao,
      data_inicio: dataInicio,
      data_fim: dataFim || null,
      status,
    };

    if (!nome || !descricao || !dataInicio || !status) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (dataFim && new Date(dataFim) < new Date(dataInicio)) {
      toast.error('A data de fim não pode ser anterior à data de início.');
      return;
    }

    try {
      if (projetoExistente) {
        const response = await api.put(`/projetos/${projetoExistente.id}`, novoProjeto);
        atualizarProjetos(response.data);
        toast.success('Projeto editado com sucesso!');
      } else {
        const response = await api.post('/projetos', novoProjeto);
        atualizarProjetos(response.data);
        toast.success('Projeto criado com sucesso!');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Erro ao salvar o projeto. Tente novamente.';
        toast.error(errorMessage);
      } else {
        console.error('Erro desconhecido ao salvar projeto:', error);
        toast.error('Erro desconhecido. Tente novamente.');
      }
    }
    fecharFormulario();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-2xl font-semibold mb-4 text-center">
          {projetoExistente ? 'Editar Projeto' : 'Adicionar Projeto'}
        </h3>

        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome:
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              required
            />
          </label>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição:
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data de Início:
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data de Fim:
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status:
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            >
              <option value="Em andamento">Em andamento</option>
              <option value="Concluído">Concluído</option>
              <option value="Pendente">Pendente</option>
            </select>
          </label>

          <div className="flex justify-between mt-4">
            <button
              type="submit"
              className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {projetoExistente ? 'Atualizar' : 'Adicionar'}
            </button>
            <button
              type="button"
              onClick={fecharFormulario}
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

export default FormularioProjeto;
