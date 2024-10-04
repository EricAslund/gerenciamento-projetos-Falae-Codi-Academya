import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './UsuariosProjeto.css';
import api from '../../util/axiosConfig';
import { setCache, getCache } from '../../util/cacheUtils';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  papel: string;
}

const UsuariosProjeto = () => {
  const { projetoId } = useParams<{ projetoId: string }>();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [todosUsuarios, setTodosUsuarios] = useState<Usuario[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUsuarioId, setSelectedUsuarioId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const limit = 10;

  const buscarUsuarios = async (page: number) => {
    try {
      const response = await api.get(`/projetos/${projetoId}/usuarios`, {
        params: { page, limit },
      });
      setUsuarios(response.data.usuarios);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  useEffect(() => {
    buscarUsuarios(page);
    fetchUsuarios()
  }, [projetoId, page]);

  const fetchUsuarios = async () => {
    const cachedUsuarios = getCache('usuarios'); // Tenta obter os dados do cache
  
    if (cachedUsuarios) {
      setTodosUsuarios(cachedUsuarios); // Se os dados estiverem no cache, usa-os
    } else {
      try {
        const response = await api.get('/usuarios'); // Requisição para a API
        setTodosUsuarios(response.data); // Atualiza o estado com os dados recebidos
  
        // Armazena os dados no cache por 10 minutos (10 * 60 * 1000 milissegundos)
        setCache('usuarios', response.data, 10 * 60 * 1000);
      } catch (error) {
        console.error('Erro ao buscar usuários', error);
        toast.error('Erro ao buscar usuários');
      }
    }
  };
 

  const adicionarUsuario = async () => {
    if (selectedUsuarioId) {
      try {
        const response = await api.post(`/projetos/${projetoId}/usuarios`, { usuario_id: selectedUsuarioId });
        setUsuarios([...usuarios, response.data]);
        setShowModal(false);
        toast.success('Usuário adicionado com sucesso!');
        buscarUsuarios(page);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const errorMessage = error.response?.data?.message || 'Erro ao adicionar o usuário. Tente novamente.';
          toast.error(errorMessage);
        } else {
          console.error('Erro desconhecido ao adicionar usuário:', error);
          toast.error('Erro desconhecido. Tente novamente.');
        }
      }
    } else {
      toast.error('Por favor, selecione um usuário para adicionar.');
    }
  };

  const removerUsuario = async (usuarioId: number) => {
    if (window.confirm('Tem certeza que deseja remover este usuário do projeto?')) {
      try {
        await api.delete(`/projetos/${projetoId}/usuarios/${usuarioId}`);
        setUsuarios(usuarios.filter(usuario => usuario.id !== usuarioId));
        toast.success('Usuário removido com sucesso!');
        buscarUsuarios(page);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const errorMessage = error.response?.data?.message || 'Erro ao remover o usuário. Tente novamente.';
          toast.error(errorMessage);
        } else {
          console.error('Erro desconhecido ao remover usuário:', error);
          toast.error('Erro desconhecido. Tente novamente.');
        }
      }
    }
  };

  const handleSort = (column: string) => {
    const direction = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(direction);

    const sortedUsuarios = [...usuarios].sort((a, b) => {
      if (a[column as keyof Usuario] < b[column as keyof Usuario]) {
        return direction === 'asc' ? -1 : 1;
      }
      if (a[column as keyof Usuario] > b[column as keyof Usuario]) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    setUsuarios(sortedUsuarios);
  };

  return (
    <div className="usuarios-projeto-container">
      <h2 className="title">Usuários do Projeto</h2>
      <button
        onClick={() => setShowModal(true)}
        className="btn-add-user m-4"
      >
        Adicionar Usuário
      </button>
      {usuarios.length === 0 ? (
        <p className="no-users">Não há usuários cadastrados neste projeto.</p>
      ) : (
        <>
          <table className="table-users">
            <thead>
              <tr>
                <th className="table-header" onClick={() => handleSort('id')}>
                  ID {sortColumn === 'id' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="table-header" onClick={() => handleSort('nome')}>
                  Nome {sortColumn === 'nome' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="table-header" onClick={() => handleSort('email')}>
                  Email {sortColumn === 'email' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="table-header" onClick={() => handleSort('papel')}>
                  Papel {sortColumn === 'papel' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="table-header">Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(usuario => (
                <tr key={usuario.id}>
                  <td className="table-cell">{usuario.id}</td>
                  <td className="table-cell">{usuario.nome}</td>
                  <td className="table-cell">{usuario.email}</td>
                  <td className="table-cell">{usuario.papel}</td>
                  <td className="table-cell">
                    <button
                      onClick={() => removerUsuario(usuario.id)}
                      className="btn-remove-user"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="btn-pagination"
            >
              Anterior
            </button>
            <span>Página {page} de {totalPages}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="btn-pagination"
            >
              Próxima
            </button>
          </div>
        </>
      )}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Adicionar Usuário</h3>
            <select
              value={selectedUsuarioId || ''}
              onChange={(e) => setSelectedUsuarioId(Number(e.target.value))}
              className="select-user"
            >
              <option value="" disabled>Selecione um usuário</option>
              {todosUsuarios.map(usuario => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nome} - {usuario.email}
                </option>
              ))}
            </select>
            <div className="modal-actions">
              <button
                onClick={adicionarUsuario}
                className="btn-modal-action bg-blue-500"
              >
                Adicionar
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="btn-modal-action bg-gray-500"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuariosProjeto;
