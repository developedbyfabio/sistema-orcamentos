import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ShoppingCartIcon,
  ShoppingBagIcon,
  TruckIcon,
  CheckBadgeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

interface Orcamento {
  id: number;
  titulo: string;
  descricao: string;
  valor: number;
  quantidade: number;
  fornecedor?: string;
  status: string;
  createdAt: string;
  nivelAtual: {
    nome: string;
  };
  filial: {
    nome: string;
  };
}

const Orcamentos: React.FC = () => {
  const { user } = useAuth();
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchOrcamentos();
  }, []);

  const fetchOrcamentos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://192.168.1.120:5000/api/orcamentos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.orcamentos && Array.isArray(data.orcamentos)) {
          setOrcamentos(data.orcamentos);
        } else if (Array.isArray(data)) {
          setOrcamentos(data);
        } else {
          setOrcamentos([]);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error);
      setOrcamentos([]);
    } finally {
      setLoading(false);
    }
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
      case 'COMPRADO': return 'bg-purple-100 text-purple-800';
      case 'COMPRA_EFETUADA': return 'bg-indigo-100 text-indigo-800';
      case 'FINALIZADO': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDENTE': return <ClockIcon className="h-4 w-4" />;
      case 'APROVADO': return <CheckCircleIcon className="h-4 w-4" />;
      case 'REJEITADO': return <XCircleIcon className="h-4 w-4" />;
      case 'AGUARDANDO_COMPRA': return <ShoppingCartIcon className="h-4 w-4" />;
      case 'COMPRADO': return <ShoppingBagIcon className="h-4 w-4" />;
      case 'COMPRA_EFETUADA': return <TruckIcon className="h-4 w-4" />;
      case 'FINALIZADO': return <CheckBadgeIcon className="h-4 w-4" />;
      default: return <DocumentTextIcon className="h-4 w-4" />;
    }
  };

  const filteredOrcamentos = Array.isArray(orcamentos) ? orcamentos.filter(orcamento => {
    const matchesSearch = orcamento.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         orcamento.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (orcamento.fornecedor && orcamento.fornecedor.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'TODOS' || orcamento.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) : [];

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este orçamento?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://192.168.1.120:5000/api/orcamentos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchOrcamentos();
      } else {
        const errorData = await response.json();
        alert(`Erro ao excluir orçamento: ${errorData.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao excluir orçamento:', error);
      alert('Erro ao excluir orçamento. Tente novamente.');
    }
  };

  // Verifica se o usuário pode criar orçamento
  const podeCriarOrcamento = user?.usuarioNiveis?.some((un: any) => un.nivel?.podeCriarOrcamento && un.nivel?.ativo);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orçamentos</h1>
            <p className="mt-2 text-gray-600">
              Gerencie todos os seus orçamentos e acompanhe o status de aprovação.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            {podeCriarOrcamento && (
              <Link
                to="/orcamentos/novo"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Novo Orçamento
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar orçamentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Filtros
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="TODOS">Todos os Status</option>
                    <option value="PENDENTE">Pendente</option>
                    <option value="APROVADO">Aprovado</option>
                    <option value="REJEITADO">Rejeitado</option>
                    <option value="AGUARDANDO_COMPRA">Aguardando Compra</option>
                    <option value="COMPRA_EFETUADA">Compra Efetuada</option>
                    <option value="FINALIZADO">Finalizado</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full divide-y divide-gray-200 min-w-[600px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 sm:px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  ID
                </th>
                <th className="px-2 sm:px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Título
                </th>
                <th className="hidden md:table-cell px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Valor
                </th>
                <th className="px-2 sm:px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  Status
                </th>
                <th className="hidden lg:table-cell px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  Nível
                </th>
                <th className="hidden xl:table-cell px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  Filial
                </th>
                <th className="hidden sm:table-cell px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  Data
                </th>
                <th className="px-2 sm:px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrcamentos.map((orcamento) => (
                <tr key={orcamento.id} className="hover:bg-gray-50">
                  <td className="px-2 sm:px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-12">
                    #{orcamento.id}
                  </td>
                  <td className="px-2 sm:px-3 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-[150px] lg:max-w-[200px]">
                        {orcamento.titulo.length > 20 ? `${orcamento.titulo.substring(0, 20)}...` : orcamento.titulo}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-[120px] sm:max-w-[150px] lg:max-w-[200px]">
                        {orcamento.descricao.length > 25 ? `${orcamento.descricao.substring(0, 25)}...` : orcamento.descricao}
                      </div>
                      <div className="md:hidden text-sm text-gray-900 mt-1">
                        {formatCurrency(orcamento.valor)}
                      </div>
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-3 py-4 whitespace-nowrap text-sm text-gray-900 w-24">
                    {formatCurrency(orcamento.valor * orcamento.quantidade)}
                  </td>
                  <td className="px-2 sm:px-3 py-4 whitespace-nowrap w-20">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(orcamento.status)}`}>
                      {getStatusIcon(orcamento.status)}
                      <span className="ml-1">{orcamento.status}</span>
                    </span>
                  </td>
                  <td className="hidden lg:table-cell px-3 py-4 whitespace-nowrap text-sm text-gray-900 w-20">
                    {orcamento.nivelAtual.nome}
                  </td>
                  <td className="hidden xl:table-cell px-3 py-4 whitespace-nowrap text-sm text-gray-900 w-20">
                    {orcamento.filial.nome}
                  </td>
                  <td className="hidden sm:table-cell px-3 py-4 whitespace-nowrap text-sm text-gray-500 w-20">
                    {new Date(orcamento.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-2 sm:px-3 py-4 whitespace-nowrap text-right text-sm font-medium w-24">
                    <div className="flex items-center justify-end space-x-1 sm:space-x-2">
                      <Link
                        to={`/orcamentos/${orcamento.id}`}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Visualizar"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/orcamentos/${orcamento.id}/editar`}
                        className="text-green-600 hover:text-green-900 p-1"
                        title="Editar"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(orcamento.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Excluir"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrcamentos.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              {searchTerm || statusFilter !== 'TODOS' ? (
                <p>Nenhum orçamento encontrado com os filtros aplicados.</p>
              ) : (
                <p>Nenhum orçamento encontrado. Crie seu primeiro orçamento!</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orcamentos; 