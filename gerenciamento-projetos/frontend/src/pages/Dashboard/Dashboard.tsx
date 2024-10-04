import React, { useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { toast } from 'react-toastify';
import api from '../../util/axiosConfig';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import './Dashboard.css';
import { setCache, getCache } from '../../util/cacheUtils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ProjetoStats {
  total: number;
  concluidos: number;
  emAndamento: number;
  pendentes: number;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

interface ProjetoDuracao {
  id: number;
  nome: string;
  duracao: number;
  qtd_usuarios: number;
  dias_restantes: number | null;
  atrasado: boolean;
}

interface Usuario {
  id: number;
  nome: string;
}

const Dashboard = () => {
  
  const [projetoStats, setProjetoStats] = useState<ProjetoStats | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [pieChartData, setPieChartData] = useState<ChartData | null>(null);
  const [projetosDuracao, setProjetosDuracao] = useState<ProjetoDuracao[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [dataFiltro, setDataFiltro] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [duracaoChartData, setDuracaoChartData] = useState<ChartData | null>(null);
  const projetosPerPage = 10;
  

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

  const fetchDashboardData = async () => {
    try {
      const params = { userId: selectedUserId, dataFiltro };

      const response = await api.get('/dashboard', { params });
      const { chartData, projetos, statusCounts } = response.data;

      setProjetoStats(statusCounts);
      setProjetosDuracao(projetos);
      
      setChartData({
        labels: chartData.labels || [],
        datasets: [{
          label: 'Projetos por Mês',
          data: chartData.datasets,
          backgroundColor: ['rgba(75, 192, 192, 0.2)'],
          borderColor: ['rgba(75, 192, 192, 1)'],
          borderWidth: 1,
        }],
      });

      
      setPieChartData({
        labels: ['Concluídos', 'Em Andamento', 'Pendentes'],
        datasets: [{
          label: 'Status dos Projetos',
          data: [statusCounts.concluidos, statusCounts.emAndamento, statusCounts.pendentes],
          backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 159, 64, 0.6)', 'rgba(255, 99, 132, 0.6)'],
          borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 159, 64, 1)', 'rgba(255, 99, 132, 1)'],
          borderWidth: 1,
        }],
      });

      // Dados do gráfico de Duração dos Projetos
     

      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard', error);
      toast.error('Erro ao buscar dados do dashboard');
      setLoading(false);
    }
  };

  const changePage = (direction: 'next' | 'prev') => {
    if (direction === 'next' && currentPage * projetosPerPage < projetosDuracao.length) {
      setCurrentPage(currentPage + 1);
    } else if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  useEffect(() => {
   
    const indexOfLastProject = currentPage * projetosPerPage;
      const indexOfFirstProject = indexOfLastProject - projetosPerPage;
      const currentProjetos = projetosDuracao.slice(indexOfFirstProject, indexOfLastProject);

      const paginatedProjetosDuracao = {
        labels: currentProjetos.map((item:any) => item.nome),
        datasets: [
          {
            label: 'Duração dos Projetos (dias)',
            data: currentProjetos.map((item:any)=> item.duracao),
            backgroundColor: ['rgba(75, 192, 192, 0.2)'],
            borderColor: ['rgba(75, 192, 192, 1)'],
            borderWidth: 1,
          },
          {
            label: 'Quantidade de Usuários',
            data: currentProjetos.map((item:any)=> item.qtd_usuarios),
            backgroundColor: ['rgba(153, 102, 255, 0.2)'],
            borderColor: ['rgba(153, 102, 255, 1)'],
            borderWidth: 1,
          },
          {
            label: 'Status de Atraso (1 = Atrasado)',
            data: currentProjetos.map((item:any)=> (item.atrasado ? 1 : 0)),
            backgroundColor: ['rgba(255, 206, 86, 0.2)'],
            borderColor: ['rgba(255, 206, 86, 1)'],
            borderWidth: 1,
          },
          {
            label: 'Dias Restantes para Conclusão',
            data: currentProjetos.map((item:any)=> item.dias_restantes ?? 0),
            backgroundColor: ['rgba(255, 99, 132, 0.2)'],
            borderColor: ['rgba(255, 99, 132, 1)'],
            borderWidth: 1,
          },
        ],
      };
     

      setDuracaoChartData(paginatedProjetosDuracao);
    fetchUsuarios();
  }, [projetosDuracao, currentPage]);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedUserId, dataFiltro]);

  if (loading) {
    return <div className="loading-container">Carregando...</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      <div className="filters-container">
        <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}>
          <option value="">Selecione um Usuário</option>
          {usuarios.map(usuario => (
            <option key={usuario.id} value={usuario.id}>
              {usuario.nome}
            </option>
          ))}
        </select>
        <input type="date" value={dataFiltro} onChange={e => setDataFiltro(e.target.value)} />
      </div>

      <div className="widgets-container">
        <div className="widget"><h2>Total de Projetos</h2><p>{projetoStats?.total}</p></div>
        <div className="widget"><h2>Projetos Concluídos</h2><p>{projetoStats?.concluidos}</p></div>
        <div className="widget"><h2>Projetos em Andamento</h2><p>{projetoStats?.emAndamento}</p></div>
      </div>

      <div className="charts-container">
        <div className="chart-container">
          <h2>Projetos por Mês</h2>
          {chartData && <Bar data={chartData} options={{ responsive: true }} />}
        </div>
        <div className="pie-chart-container">
          <h2>Status dos Projetos</h2>
          {pieChartData && <Pie data={pieChartData} options={{ responsive: true }} />}
        </div>
      </div>

      <div className="duracao-container m-10">
        <h2>Duração dos Projetos</h2>
        {duracaoChartData && <Bar data={duracaoChartData} options={{ responsive: true }} />}

        <div className="pagination">
    <button onClick={() => changePage('prev')} disabled={currentPage === 1} className="btn-pagination">Anterior</button>
    <span>Página {currentPage}</span>
    <button onClick={() => changePage('next')} disabled={currentPage * projetosPerPage >= projetosDuracao.length} className="btn-pagination">Próxima</button>
  </div>
      </div>

     
    </div>
  );
};

export default Dashboard;
