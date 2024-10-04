import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import FormularioProjeto from '../../components/FormularioProjeto/FormularioProjeto';
import { toast } from 'react-toastify';
import './GestaoProjetos.css';
import api from '../../util/axiosConfig';
import FormularioAgendamento from '../../components/FormularioAgendamenro/FormularioAgendamenro';
import UploadCSVModal from '../../components/UploadCSVModal/UploadCSVModal';
import { setCache, getCache } from '../../util/cacheUtils';


interface Projeto {
  id: number;
  nome: string;
  descricao: string;
  data_inicio: string;
  data_fim: string | null;
  status: string;
}

interface Usuario {
  id: number;
  nome: string;
}

const ListaProjetos = () => {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [projetoSelecionado, setProjetoSelecionado] = useState<Projeto | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [modalIsOpen, setModalIsOpen] = useState(false); // Modal para agendamento
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false); // Modal para upload CSV

  const [paginaAtual, setPaginaAtual] = useState<number>(1);
  const [totalPaginas, setTotalPaginas] = useState<number>(0);
  const [limite] = useState<number>(10);

  const [filtroUsuario, setFiltroUsuario] = useState<string>('');
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const [dataInicioFiltro, setDataInicioFiltro] = useState<string>('');
  const [dataFimFiltro, setDataFimFiltro] = useState<string>('');

  const [ordenarPor, setOrdenarPor] = useState<string>('nome');
  const [ordem, setOrdem] = useState<'asc' | 'desc'>('asc');

  const buscarProjetos = async (pagina: number) => {
    try {
      const params: any = {
        page: pagina,
        limit: limite,
        ordenarPor,
        ordem
      };

      // Adiciona os filtros apenas se não estiverem vazios
      if (filtroUsuario) params.usuario = filtroUsuario;
      if (filtroStatus) params.status = filtroStatus;
      if (dataInicioFiltro) params.dataInicio = dataInicioFiltro;
      if (dataFimFiltro) params.dataFim = dataFimFiltro;

      const response = await api.get('/projetos', { params });

      setProjetos(response.data.projetos);
      setTotalPaginas(response.data.totalPages);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Erro ao buscar projetos. Tente novamente.';
        toast.error(errorMessage);
        setProjetos([]);
      } else {
        console.error('Erro ao buscar projetos:', error);
        toast.error('Erro ao buscar projetos');
      }
    }
  };

  const fetchUsuarios = async () => {
    const cachedUsuarios = getCache('usuarios'); // Tenta obter os dados do cache
  
    if (cachedUsuarios) {
      setUsuarios(cachedUsuarios); // Se os dados estiverem no cache, usa-os
    } else {
      try {
        const response = await api.get('/usuarios'); // Requisição para a API
        setUsuarios(response.data); // Atualiza o estado com os dados recebidos
  
        // Armazena os dados no cache por 10 minutos (10 * 60 * 1000 milissegundos)
        setCache('usuarios', response.data, 10 * 60 * 1000);
      } catch (error) {
        console.error('Erro ao buscar usuários', error);
        toast.error('Erro ao buscar usuários');
      }
    }
  };

  useEffect(() => {
    buscarProjetos(paginaAtual);
    fetchUsuarios();
  }, [paginaAtual, filtroUsuario, filtroStatus, dataInicioFiltro, dataFimFiltro, ordenarPor, ordem]);

  const adicionarProjeto = () => {
    setProjetoSelecionado(null);
    setMostrarFormulario(true);
    buscarProjetos(paginaAtual);
  };

  const editarProjeto = (projeto: Projeto) => {
    setProjetoSelecionado(projeto);
    setMostrarFormulario(true);
    buscarProjetos(paginaAtual);
  };

  const excluirProjeto = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este projeto?')) {
      try {
        await api.delete(`/projetos/${id}`);
        toast.success('Projeto excluído com sucesso!');
        buscarProjetos(paginaAtual);
      } catch (error) {
        console.error('Erro ao excluir projeto:', error);
        toast.error('Erro ao excluir o projeto. Tente novamente.');
      }
    }
  };

  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);

  const openCSVModal = () => setIsCSVModalOpen(true);
  const closeCSVModal = () => setIsCSVModalOpen(false);

  const fecharFormulario = () => {
    setMostrarFormulario(false);
    setProjetoSelecionado(null);
    buscarProjetos(paginaAtual);
  };

  const paginaAnterior = () => {
    if (paginaAtual > 1) setPaginaAtual(paginaAtual - 1);
  };

  const proximaPagina = () => {
    if (paginaAtual < totalPaginas) setPaginaAtual(paginaAtual + 1);
  };

  const handleOrdenar = (campo: string) => {
    if (ordenarPor === campo) {
      setOrdem(ordem === 'asc' ? 'desc' : 'asc');
    } else {
      setOrdenarPor(campo);
      setOrdem('asc');
    }
  };

  return (
    <div className="projetos-container">
      <h2 className="projetos-title">Lista de Projetos</h2>
      <div className="buttons-container m-4">
        <button onClick={adicionarProjeto} className="button-base add-projeto-button">
          Adicionar Projeto
        </button>

        <button onClick={openModal} className="button-base add-projeto-button">
          Agendar Reunião
        </button>

        <button
          onClick={openCSVModal}
          className="button-base upload-csv-button"
        >
          Upload CSV
        </button>
      </div>
      <div className="filters-container">
        <select
          value={filtroUsuario}
          onChange={(e) => setFiltroUsuario(e.target.value)}
        >
          <option value="">Selecione um Usuário</option>
          {usuarios.map((usuario) => (
            <option key={usuario.id} value={usuario.id}>
              {usuario.nome}
            </option>
          ))}
        </select>
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
        >
          <option value="">Todos os Status</option>
          <option value="Em andamento">Em andamento</option>
          <option value="Concluído">Concluído</option>
          <option value="Pendentes">Pendentes</option>
        </select>
        <input
          type="date"
          value={dataInicioFiltro}
          onChange={(e) => setDataInicioFiltro(e.target.value)}
        />
        <input
          type="date"
          value={dataFimFiltro}
          onChange={(e) => setDataFimFiltro(e.target.value)}
        />
      </div>
      {projetos.length === 0 ? (
        <p>Não há projetos cadastrados.</p>
      ) : (
        <>
          <table className="projetos-table">
            <thead>
              <tr>
                <th>ID</th>
                <th onClick={() => handleOrdenar('nome')}>Nome {ordenarPor === 'nome' && (ordem === 'asc' ? '↑' : '↓')}</th>
                <th onClick={() => handleOrdenar('descricao')}>Descrição {ordenarPor === 'descricao' && (ordem === 'asc' ? '↑' : '↓')}</th>
                <th onClick={() => handleOrdenar('data_inicio')}>Data de Início {ordenarPor === 'data_inicio' && (ordem === 'asc' ? '↑' : '↓')}</th>
                <th onClick={() => handleOrdenar('data_fim')}>Data de Fim {ordenarPor === 'data_fim' && (ordem === 'asc' ? '↑' : '↓')}</th>
                <th onClick={() => handleOrdenar('status')}>Status {ordenarPor === 'status' && (ordem === 'asc' ? '↑' : '↓')}</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {projetos.map((projeto) => (
                <tr key={projeto.id}>
                  <td>{projeto.id}</td>
                  <td>
                    <Link
                      to={`/projetos/${projeto.id}/usuarios`}
                      className="text-blue-500 hover:text-blue-700 underline"
                    >
                      {projeto.nome}
                    </Link>
                  </td>
                  <td>{projeto.descricao}</td>
                  <td>{projeto.data_inicio}</td>
                  <td>{projeto.data_fim || 'Em andamento'}</td>
                  <td>{projeto.status}</td>
                  <td>
                    <button onClick={() => editarProjeto(projeto)} className="edit-button">Editar</button>
                    <button onClick={() => excluirProjeto(projeto.id)} className="delete-button">Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination-controls">
            <button onClick={paginaAnterior} disabled={paginaAtual === 1} className="pagination-button">
              Anterior
            </button>
            <span>
              Página {paginaAtual} de {totalPaginas}
            </span>
            <button onClick={proximaPagina} disabled={paginaAtual === totalPaginas} className="pagination-button">
              Próxima
            </button>
          </div>
        </>
      )}
      {mostrarFormulario && (
        <FormularioProjeto
          projetoExistente={projetoSelecionado}
          fecharFormulario={fecharFormulario}
          atualizarProjetos={(projetoAtualizado) => {
            if (projetoSelecionado) {
              setProjetos(projetos.map((p) => (p.id === projetoAtualizado.id ? projetoAtualizado : p)));
            } else {
              setProjetos([...projetos, projetoAtualizado]);
            }
            fecharFormulario();
          }}
        />
      )}
      <FormularioAgendamento
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
      />
      <UploadCSVModal isOpen={isCSVModalOpen} onClose={closeCSVModal} />
    </div>
  );
};

export default ListaProjetos;
