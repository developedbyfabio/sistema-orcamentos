import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { CheckCircleIcon, EyeIcon } from '@heroicons/react/24/outline';

interface Orcamento {
  id: number;
  titulo: string;
  valor: number;
  status: string;
  createdAt: string;
  solicitante: {
    id: number;
    nome: string;
    email: string;
    cargo: string;
    setor: string;
  };
  nivelAtual: {
    id: number;
    nome: string;
  };
  filial: {
    id: number;
    nome: string;
  };
}

const Pendentes: React.FC = () => {
  const { user } = useAuth();
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendentes();
  }, []);

  const fetchPendentes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/orcamentos/pendentes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOrcamentos(data.orcamentos);
      }
    } catch (error) {
      console.error('Erro ao buscar orçamentos pendentes:', error);
    } finally {
      setLoading(false);
    }
  };

  const aprovarOrcamento = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/orcamentos/${id}/aprovar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      if (response.ok) {
        setOrcamentos((prev) => prev.filter(o => o.id !== id));
      }
    } catch (error) {
      console.error('Erro ao aprovar orçamento:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Orçamentos Pendentes de Aprovação</h1>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">Carregando...</div>
        ) : orcamentos.length === 0 ? (
          <div className="text-center text-gray-500 py-8">Nenhum orçamento pendente para aprovação.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Solicitante</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nível Atual</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Filial</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Data Criação</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orcamentos.map((orcamento) => (
                  <tr key={orcamento.id}>
                    <td className="px-4 py-2 font-mono">#{orcamento.id}</td>
                    <td className="px-4 py-2">{orcamento.titulo}</td>
                    <td className="px-4 py-2">{orcamento.solicitante.nome}</td>
                    <td className="px-4 py-2">R$ {orcamento.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-2">{orcamento.nivelAtual?.nome}</td>
                    <td className="px-4 py-2">{orcamento.filial?.nome}</td>
                    <td className="px-4 py-2">{new Date(orcamento.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-2 flex gap-2">
                      <Link to={`/orcamentos/${orcamento.id}`} className="inline-flex items-center px-2 py-1 text-xs border rounded text-blue-600 border-blue-200 hover:bg-blue-50">
                        <EyeIcon className="h-4 w-4 mr-1" /> Visualizar
                      </Link>
                      <button
                        onClick={() => aprovarOrcamento(orcamento.id)}
                        className="inline-flex items-center px-2 py-1 text-xs border rounded text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-1" /> Aprovar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pendentes; 