import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import {
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShoppingCartIcon,
  TruckIcon,
  PlusIcon,
  ChartBarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  CheckBadgeIcon,
  CalendarIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalOrcamentos: number;
  orcamentosPendentes: number;
  orcamentosAprovados: number;
  orcamentosRejeitados: number;
  orcamentosAguardandoCompra: number;
  orcamentosComprados: number;
  orcamentosCompraEfetuada: number;
  orcamentosFinalizados: number;
  valorTotal: number;
  mediaAprovacao: number;
  orcamentosPorNivel: { nivel: string; quantidade: number }[];
  orcamentosRecentes: {
    id: number;
    titulo: string;
    valor: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    solicitante: string;
    nivelAtual: string;
    filial: string;
    aprovacoes: {
      id: number;
      aprovador: string;
      observacoes: string | null;
      dataAprovacao: string;
    }[];
    rejeicoes: {
      id: number;
      rejeitador: string;
      motivo: string;
      observacoes: string | null;
      dataRejeicao: string;
    }[];
    ultimaAprovacao: {
      aprovador: string;
      dataAprovacao: string;
      observacoes: string | null;
    } | null;
    ultimaRejeicao: {
      rejeitador: string;
      dataRejeicao: string;
      motivo: string;
      observacoes: string | null;
    } | null;
    dataCompra: string | null;
    dataBaixa: string | null;
  }[];
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrcamentos: 0,
    orcamentosPendentes: 0,
    orcamentosAprovados: 0,
    orcamentosRejeitados: 0,
    orcamentosAguardandoCompra: 0,
    orcamentosComprados: 0,
    orcamentosCompraEfetuada: 0,
    orcamentosFinalizados: 0,
    valorTotal: 0,
    mediaAprovacao: 0,
    orcamentosPorNivel: [],
    orcamentosRecentes: []
  });
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({ q: '', status: '', dataInicial: '', dataFinal: '' });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (params = {}) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const query = new URLSearchParams(params as any).toString();
      const response = await fetch(`http://192.168.1.120:5000/api/dashboard${query ? '?' + query : ''}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const aplicarFiltros = () => {
    fetchDashboardData(filtros);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDENTE': return 'bg-yellow-100 text-yellow-800';
      case 'APROVADO': return 'bg-green-100 text-green-800';
      case 'REJEITADO': return 'bg-red-100 text-red-800';
      case 'AGUARDANDO_COMPRA': return 'bg-blue-100 text-blue-800';
      case 'COMPRA_EFETUADA': return 'bg-purple-100 text-purple-800';
      case 'FINALIZADO': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bem-vindo, {user?.nome}!
          </h1>
          <p className="text-gray-600 mt-2 md:mt-0">
            Aqui está um resumo dos seus orçamentos e atividades do sistema.
          </p>
        </div>
        {user && !user.admin && (
          <Link
            to="/orcamentos/novo"
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Novo Orçamento
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* Card Total de Orçamentos */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center min-w-0 w-full">
          <DocumentTextIcon className="h-8 w-8 text-blue-500 mb-2" />
          <p className="text-sm font-medium text-gray-600">Total de Orçamentos</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalOrcamentos}</p>
        </div>
        {/* Card Pendentes */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center min-w-0 w-full">
          <ClockIcon className="h-8 w-8 text-yellow-500 mb-2" />
          <p className="text-sm font-medium text-gray-600">Pendentes</p>
          <p className="text-2xl font-bold text-gray-900">{stats.orcamentosPendentes}</p>
        </div>
        {/* Card Rejeitados */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center min-w-0 w-full">
          <XCircleIcon className="h-8 w-8 text-red-500 mb-2" />
          <p className="text-sm font-medium text-gray-600">Rejeitados</p>
          <p className="text-2xl font-bold text-gray-900">{stats.orcamentosRejeitados}</p>
        </div>
        {/* Card Aguardando Compra */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center min-w-0 w-full">
          <ShoppingCartIcon className="h-8 w-8 text-blue-400 mb-2" />
          <p className="text-sm font-medium text-gray-600">Aguardando Compra</p>
          <p className="text-2xl font-bold text-gray-900">{stats.orcamentosAguardandoCompra}</p>
        </div>
        {/* Card Compra Efetuada */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center min-w-0 w-full">
          <TruckIcon className="h-8 w-8 text-purple-500 mb-2" />
          <p className="text-sm font-medium text-gray-600">Compra Efetuada</p>
          <p className="text-2xl font-bold text-gray-900">{stats.orcamentosCompraEfetuada}</p>
        </div>
        {/* Card Finalizados */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center min-w-0 w-full">
          <CheckBadgeIcon className="h-8 w-8 text-gray-500 mb-2" />
          <p className="text-sm font-medium text-gray-600">Finalizados</p>
          <p className="text-2xl font-bold text-gray-900">{stats.orcamentosFinalizados}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row md:items-end md:space-x-4 space-y-2 md:space-y-0">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">Buscar por título</label>
          <div className="relative">
            <input
              type="text"
              name="q"
              value={filtros.q}
              onChange={handleFiltroChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite o título do orçamento..."
            />
            <MagnifyingGlassIcon className="absolute right-2 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
          <select
            name="status"
            value={filtros.status}
            onChange={handleFiltroChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="PENDENTE">Pendente</option>
            <option value="APROVADO">Aprovado</option>
            <option value="REJEITADO">Rejeitado</option>
            <option value="AGUARDANDO_COMPRA">Aguardando Compra</option>
            <option value="COMPRA_EFETUADA">Compra Efetuada</option>
            <option value="FINALIZADO">Finalizado</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Data Inicial</label>
          <div className="relative">
            <input
              type="date"
              name="dataInicial"
              value={filtros.dataInicial}
              onChange={handleFiltroChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <CalendarIcon className="absolute right-2 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Data Final</label>
          <div className="relative">
            <input
              type="date"
              name="dataFinal"
              value={filtros.dataFinal}
              onChange={handleFiltroChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <CalendarIcon className="absolute right-2 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div>
          <button
            onClick={aplicarFiltros}
            className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition"
          >
            Aplicar Filtros
          </button>
        </div>
      </div>

      {/* Recent Orçamentos */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Orçamentos Recentes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Título
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Solicitante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nível Atual
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Criação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.orcamentosRecentes.map((orcamento) => (
                <tr key={orcamento.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{orcamento.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {orcamento.titulo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {orcamento.solicitante}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(orcamento.valor)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(orcamento.status)}`}>
                      {orcamento.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {orcamento.nivelAtual}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(orcamento.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      to={`/orcamentos/${orcamento.id}`}
                      className="inline-flex items-center px-3 py-1 border border-blue-600 text-blue-700 bg-blue-50 rounded-md shadow-sm text-xs font-medium hover:bg-blue-100"
                    >
                      <DocumentTextIcon className="h-3 w-3 mr-1" />
                      Visualizar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 