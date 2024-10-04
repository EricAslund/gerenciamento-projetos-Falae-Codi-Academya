import { Request, Response } from 'express';
import db from '../config/db';
import dayjs from 'dayjs';

// Controller para o Dashboard
class DashboardController {

  // Método para buscar todos os dados do dashboard, com filtros por usuário e por data
  async getDashboardData(req: Request, res: Response) {
    try {
      const { userId, dataFiltro } = req.query; // Pega os filtros do query params

      // Convertendo o filtro de data (se fornecido) para formato dayjs
      const dataFiltroParsed = dataFiltro && typeof dataFiltro === 'string' ? dayjs(dataFiltro) : null;


      let projetos = await db('projetos')
        .leftJoin('projetos_usuarios', 'projetos.id', 'projetos_usuarios.projeto_id')
        .select(
          'projetos.id',
          'projetos.nome',
          'projetos.data_inicio',
          'projetos.data_fim',
          'projetos.status',
          db.raw('COUNT(projetos_usuarios.usuario_id) as qtd_usuarios'),
          db.raw('MONTH(projetos.data_inicio) as mes')
        )
        .groupBy('projetos.id', 'mes')
        .where((qb) => {
          // Filtrar por userId se fornecido
          if (userId) {
            qb.where('projetos_usuarios.usuario_id', userId);
          }

          // Filtrar por data se fornecido
          if (dataFiltroParsed) {
            qb.where('projetos.data_inicio', '<=', dataFiltroParsed.format('YYYY-MM-DD'))
              .andWhere(function () {
                this.where('projetos.data_fim', '>=', dataFiltroParsed.format('YYYY-MM-DD'))
                    .orWhereNull('projetos.data_fim'); // Para projetos que ainda estão em andamento
              });
          }
        });

      // Mapeamento para calcular duração, atraso e dias restantes
      const projetosComDuracao = projetos.map(projeto => {
        const inicio = dayjs(projeto.data_inicio);
        const fim = projeto.data_fim ? dayjs(projeto.data_fim) : dayjs();
        const duracao = fim.diff(inicio, 'day'); // Diferença em dias

        // Calcular atraso e dias restantes
        const atrasado = projeto.data_fim ? dayjs().isAfter(fim) : false;
        const dias_restantes = projeto.data_fim ? fim.diff(dayjs(), 'day') : null;

        return {
          ...projeto,
          duracao, // Dias de duração do projeto
          atrasado, // Se o projeto está atrasado
          dias_restantes // Dias restantes para conclusão
        };
      });

      // Contagem de projetos por status
      const statusCounts = projetos.reduce((acc, projeto) => {
        // Contar o total de projetos
        acc.total++;
      
        // Contar projetos por status
        if (projeto.status === 'Concluido') acc.concluidos++;
        if (projeto.status === 'Em andamento') acc.emAndamento++;
        if (projeto.status === 'Pendente') acc.pendentes++;
        
        return acc;
      }, { total: 0, concluidos: 0, emAndamento: 0, pendentes: 0 });

      // Preparar os dados do gráfico de projetos por mês
      const nomeMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      const projetosPorMesCompleto = Array(12).fill(0);
      projetos.forEach(projeto => {
        const mesIndex = Number(projeto.mes) - 1;
        if (!isNaN(mesIndex) && mesIndex >= 0 && mesIndex < 12) {
          projetosPorMesCompleto[mesIndex]++;
        }
      });

      // Retornar todos os dados do dashboard
      return res.json({
        projetos: projetosComDuracao,
        statusCounts,
        chartData: {
          labels: nomeMeses,
          datasets: projetosPorMesCompleto
        }
      });
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      return res.status(500).json({ error: 'Erro ao buscar dados do dashboard' });
    }
  }

}

export default new DashboardController();
