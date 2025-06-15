import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  UserIcon,
  LinkIcon,
  PhotoIcon,
  PaperClipIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  ChartBarIcon,
  ShoppingCartIcon,
  ShoppingBagIcon,
  TruckIcon,
  CheckBadgeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

interface Orcamento {
  id: number;
  titulo: string;
  descricao: string;
  valor: number;
  quantidade: number;
  fornecedor?: string;
  links?: string;
  fotos?: string;
  anexos?: string;
  status: string;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
  dataCompra?: string;
  dataBaixa?: string;
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
    prioridade: number;
  };
  filial: {
    id: number;
    nome: string;
    endereco?: string;
  };
  proximoNivel?: {
    id: number;
    nome: string;
  };
  aprovacoes: Array<{
    id: number;
    aprovador: {
      id: number;
      nome: string;
      email: string;
    };
    observacoes?: string;
    createdAt: string;
  }>;
  rejeicoes: Array<{
    id: number;
    rejeitador: {
      id: number;
      nome: string;
      email: string;
    };
    motivo: string;
    observacoes?: string;
    createdAt: string;
  }>;
}

const OrcamentoDetalhes: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orcamento, setOrcamento] = useState<Orcamento | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAprovar, setShowAprovar] = useState(false);
  const [showRejeitar, setShowRejeitar] = useState(false);
  const [obsAprovacao, setObsAprovacao] = useState('');
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [obsRejeicao, setObsRejeicao] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOrcamento();
    }
  }, [id]);

  const fetchOrcamento = async () => {
    if (submitting) return; // Não buscar se estiver submetendo
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://192.168.1.120:5000/api/orcamentos/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrcamento(data);
      } else {
        console.error('Erro ao buscar orçamento');
      }
    } catch (error) {
      console.error('Erro ao buscar orçamento:', error);
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
      case 'COMPRA_EFETUADA': return 'bg-purple-100 text-purple-800';
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
      case 'COMPRA_EFETUADA': return <ShoppingBagIcon className="h-4 w-4" />;
      case 'FINALIZADO': return <CheckBadgeIcon className="h-4 w-4" />;
      default: return <DocumentTextIcon className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDENTE': return 'Pendente';
      case 'APROVADO': return 'Aprovado';
      case 'REJEITADO': return 'Rejeitado';
      case 'AGUARDANDO_COMPRA': return 'Aguardando Compra';
      case 'COMPRA_EFETUADA': return 'Compra Efetuada';
      case 'FINALIZADO': return 'Finalizado';
      default: return status;
    }
  };

  // Verifica se o usuário pode aprovar/rejeitar
  const podeAprovarOuRejeitar =
    user &&
    user.usuarioNiveis &&
    orcamento &&
    orcamento.status === 'PENDENTE' &&
    user.usuarioNiveis.some(un => un.nivel.podeAprovar && un.nivel.id === orcamento.nivelAtual.id);

  // Verifica se o usuário pode marcar como comprado (nível final/compras)
  const podeMarcarComoComprado =
    user &&
    user.usuarioNiveis &&
    orcamento &&
    orcamento.status === 'AGUARDANDO_COMPRA' &&
    user.usuarioNiveis.some(un => un.nivel.nivelFinal && un.nivel.id === orcamento.nivelAtual.id);

  // Verifica se o usuário pode dar baixa (nível final/compras)
  const podeDarBaixa =
    user &&
    user.usuarioNiveis &&
    orcamento &&
    orcamento.status === 'COMPRA_EFETUADA' &&
    user.usuarioNiveis.some(un => un.nivel.nivelFinal && un.nivel.id === orcamento.nivelAtual.id);

  // Função para aprovar orçamento
  const handleAprovar = async () => {
    // Definir submitting imediatamente para evitar qualquer renderização
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://192.168.1.120:5000/api/orcamentos/${orcamento?.id}/aprovar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ observacao: obsAprovacao || '' })
      });

      if (response.ok) {
        alert('Orçamento aprovado com sucesso!');
        // Redirecionar usando navigate para manter autenticação
        navigate('/dashboard', { replace: true });
        return;
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Erro ao aprovar orçamento');
        setSubmitting(false); // Só resetar se der erro
      }
    } catch (error) {
      console.error('Erro ao aprovar orçamento:', error);
      alert('Erro ao aprovar orçamento');
      setSubmitting(false); // Só resetar se der erro
    }
  };

  // Função para rejeitar orçamento
  const handleRejeitar = async () => {
    // Definir submitting imediatamente para evitar qualquer renderização
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://192.168.1.120:5000/api/orcamentos/${orcamento?.id}/rejeitar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ observacao: obsRejeicao || '' })
      });

      if (response.ok) {
        alert('Orçamento rejeitado com sucesso!');
        // Redirecionar usando navigate para manter autenticação
        navigate('/dashboard', { replace: true });
        return;
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Erro ao rejeitar orçamento');
        setSubmitting(false); // Só resetar se der erro
      }
    } catch (error) {
      console.error('Erro ao rejeitar orçamento:', error);
      alert('Erro ao rejeitar orçamento');
      setSubmitting(false); // Só resetar se der erro
    }
  };

  // Função para marcar como comprado
  const handleMarcarComoComprado = async () => {
    if (!window.confirm('Tem certeza que deseja marcar este orçamento como comprado?')) {
      return;
    }
    
    // Definir submitting imediatamente para evitar qualquer renderização
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://192.168.1.120:5000/api/orcamentos/${orcamento?.id}/comprado`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        alert('Orçamento marcado como comprado com sucesso!');
        // Redirecionar usando navigate para manter autenticação
        navigate('/dashboard', { replace: true });
        return;
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Erro ao marcar como comprado');
        setSubmitting(false); // Só resetar se der erro
      }
    } catch (error) {
      console.error('Erro ao marcar como comprado:', error);
      alert('Erro ao marcar como comprado');
      setSubmitting(false); // Só resetar se der erro
    }
  };

  // Função para dar baixa no orçamento
  const handleDarBaixa = async () => {
    if (!window.confirm('Tem certeza que deseja dar baixa neste orçamento? O item chegou?')) {
      return;
    }
    
    // Definir submitting imediatamente para evitar qualquer renderização
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://192.168.1.120:5000/api/orcamentos/${orcamento?.id}/baixa`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        alert('Baixa realizada com sucesso! Orçamento finalizado.');
        // Redirecionar usando navigate para manter autenticação
        navigate('/dashboard', { replace: true });
        return;
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Erro ao dar baixa');
        setSubmitting(false);
      }
    } catch (error) {
      console.error('Erro ao dar baixa:', error);
      alert('Erro ao dar baixa no orçamento');
      setSubmitting(false);
    }
  };

  // Se estiver submetendo, não renderizar nada
  if (submitting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processando...</p>
        </div>
      </div>
    );
  }

  // Se estiver carregando, mostrar loader
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando orçamento...</p>
        </div>
      </div>
    );
  }

  if (!orcamento) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Orçamento não encontrado</p>
      </div>
    );
  }

  const aprovacoesOrdenadas = [...orcamento.aprovacoes].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const rejeicoesOrdenadas = [...orcamento.rejeicoes].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Orçamento #{orcamento.id}</h1>
              <p className="mt-1 text-gray-600">{orcamento.titulo}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(orcamento.status)}`}>
              {getStatusIcon(orcamento.status)}
              <span className="ml-1">{orcamento.status}</span>
            </span>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <EyeIcon className="h-4 w-4 mr-2" />
              Imprimir
            </button>
            {/* Botões de Aprovar/Rejeitar */}
            {podeAprovarOuRejeitar && (
              <>
                <button
                  className="inline-flex items-center px-4 py-2 border border-green-600 text-green-700 bg-green-50 rounded-md shadow-sm text-sm font-medium hover:bg-green-100 ml-2"
                  onClick={() => setShowAprovar(true)}
                  disabled={submitting}
                >
                  <CheckCircleIcon className="h-4 w-4 mr-2" /> Aprovar
                </button>
                <button
                  className="inline-flex items-center px-4 py-2 border border-red-600 text-red-700 bg-red-50 rounded-md shadow-sm text-sm font-medium hover:bg-red-100 ml-2"
                  onClick={() => setShowRejeitar(true)}
                  disabled={submitting}
                >
                  <XCircleIcon className="h-4 w-4 mr-2" /> Rejeitar
                </button>
              </>
            )}
            {/* Botão Marcar como Compra Efetuada */}
            {podeMarcarComoComprado && (
              <button
                onClick={handleMarcarComoComprado}
                className="inline-flex items-center px-3 py-1 border border-purple-600 text-purple-700 bg-purple-50 rounded-md shadow-sm text-xs font-medium hover:bg-purple-100"
              >
                <ShoppingBagIcon className="h-4 w-4 mr-2" /> Marcar como Compra Efetuada
              </button>
            )}

            {/* Botão Dar Baixa */}
            {podeDarBaixa && (
              <button
                className="inline-flex items-center px-4 py-2 border border-indigo-600 text-indigo-700 bg-indigo-50 rounded-md shadow-sm text-sm font-medium hover:bg-indigo-100 ml-2"
                onClick={handleDarBaixa}
                disabled={submitting}
              >
                <CheckBadgeIcon className="h-4 w-4 mr-2" /> Dar Baixa
              </button>
            )}

            {orcamento.solicitante && user && orcamento.solicitante.id === user.id && (
              <>
                <button
                  onClick={() => navigate(`/orcamentos/${orcamento.id}/editar`)}
                  className="text-green-600 hover:text-green-900 p-1"
                  title="Editar"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={async () => {
                    if (window.confirm('Tem certeza que deseja excluir este orçamento?')) {
                      // lógica de exclusão
                    }
                  }}
                  className="text-red-600 hover:text-red-900 p-1"
                  title="Excluir"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Modais de Aprovação/Rejeição */}
      {showAprovar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Aprovar Orçamento</h2>
            <textarea
              className="w-full border rounded p-2 mb-4"
              placeholder="Observações (opcional)"
              value={obsAprovacao}
              onChange={e => setObsAprovacao(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => setShowAprovar(false)}
                disabled={submitting}
              >Cancelar</button>
              <button
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                onClick={handleAprovar}
                disabled={submitting}
              >Confirmar Aprovação</button>
            </div>
          </div>
        </div>
      )}
      {showRejeitar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Rejeitar Orçamento</h2>
            <input
              className="w-full border rounded p-2 mb-2"
              placeholder="Motivo da rejeição (obrigatório)"
              value={motivoRejeicao}
              onChange={e => setMotivoRejeicao(e.target.value)}
            />
            <textarea
              className="w-full border rounded p-2 mb-4"
              placeholder="Observações (opcional)"
              value={obsRejeicao}
              onChange={e => setObsRejeicao(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => setShowRejeitar(false)}
                disabled={submitting}
              >Cancelar</button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={handleRejeitar}
                disabled={submitting}
              >Confirmar Rejeição</button>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Principais */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detalhes do Orçamento */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-600" />
                Detalhes do Orçamento
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <p className="text-gray-900">{orcamento.titulo}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <p className="text-gray-900 whitespace-pre-wrap">{orcamento.descricao}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor Unitário</label>
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(orcamento.valor)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                  <p className="text-lg font-semibold text-gray-900">{orcamento.quantidade}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor Total</label>
                  <p className="text-lg font-semibold text-blue-600">{formatCurrency(orcamento.valor * orcamento.quantidade)}</p>
                </div>
              </div>

              {orcamento.fornecedor && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor</label>
                  <p className="text-gray-900">{orcamento.fornecedor}</p>
                </div>
              )}

              {orcamento.observacoes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{orcamento.observacoes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Links e Anexos */}
          {(orcamento.links || orcamento.fotos || orcamento.anexos) && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Links e Anexos</h3>
              </div>
              <div className="p-6 space-y-4">
                {orcamento.links && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Links
                    </label>
                    <div className="space-y-2">
                      {orcamento.links.split(',').map((link, index) => (
                        <a
                          key={index}
                          href={link.trim()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-blue-600 hover:text-blue-800 underline"
                        >
                          {link.trim()}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {orcamento.fotos && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <PhotoIcon className="h-4 w-4 mr-2" />
                      Fotos
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {orcamento.fotos.split(',').map((foto, index) => {
                        const fotoUrl = foto.trim();
                        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fotoUrl);
                        
                        return (
                          <div key={index} className="relative">
                            {isImage ? (
                              <img
                                src={`http://localhost:5000${fotoUrl}`}
                                alt={`Foto ${index + 1}`}
                                className="h-24 w-full object-cover rounded-lg border cursor-pointer hover:opacity-80"
                                onClick={() => window.open(`http://localhost:5000${fotoUrl}`, '_blank')}
                              />
                            ) : (
                              <a
                                href={`http://localhost:5000${fotoUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block h-24 w-full bg-gray-100 rounded-lg border flex items-center justify-center text-gray-500 hover:bg-gray-200"
                              >
                                <PaperClipIcon className="h-8 w-8" />
                              </a>
                            )}
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              {fotoUrl.split('/').pop() || `Arquivo ${index + 1}`}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {orcamento.anexos && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <PaperClipIcon className="h-4 w-4 mr-2" />
                      Anexos
                    </label>
                    <div className="space-y-2">
                      {orcamento.anexos.split(',').map((anexo, index) => {
                        const anexoUrl = anexo.trim();
                        const fileName = anexoUrl.split('/').pop() || `Anexo ${index + 1}`;
                        const fileExtension = fileName.split('.').pop()?.toLowerCase();
                        
                        // Determinar ícone baseado na extensão
                        const getFileIcon = (ext: string) => {
                          switch (ext) {
                            case 'pdf': return '📄';
                            case 'doc':
                            case 'docx': return '📝';
                            case 'xls':
                            case 'xlsx': return '📊';
                            case 'txt': return '📄';
                            case 'zip':
                            case 'rar': return '📦';
                            default: return '📎';
                          }
                        };
                        
                        return (
                          <a
                            key={index}
                            href={`http://localhost:5000${anexoUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <span className="text-2xl mr-3">{getFileIcon(fileExtension || '')}</span>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{fileName}</p>
                              <p className="text-xs text-gray-500">Clique para baixar</p>
                            </div>
                            <PaperClipIcon className="h-4 w-4 text-gray-400" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Histórico de Aprovações */}
          {orcamento.aprovacoes.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <CheckCircleIcon className="h-5 w-5 mr-2 text-green-600" />
                  Aprovações
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {aprovacoesOrdenadas.map((aprovacao) => (
                    <div key={aprovacao.id} className="border-l-4 border-green-500 pl-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{aprovacao.aprovador.nome}</p>
                          <p className="text-sm text-gray-500">{aprovacao.aprovador.email}</p>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(aprovacao.createdAt).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(aprovacao.createdAt).toLocaleTimeString('pt-BR')}
                        </span>
                      </div>
                      {aprovacao.observacoes && (
                        <p className="mt-2 text-gray-700">{aprovacao.observacoes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Histórico de Rejeições */}
          {orcamento.rejeicoes.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <XCircleIcon className="h-5 w-5 mr-2 text-red-600" />
                  Rejeições
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {rejeicoesOrdenadas.map((rejeicao) => (
                    <div key={rejeicao.id} className="border-l-4 border-red-500 pl-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{rejeicao.rejeitador.nome}</p>
                          <p className="text-sm text-gray-500">{rejeicao.rejeitador.email}</p>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(rejeicao.createdAt).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(rejeicao.createdAt).toLocaleTimeString('pt-BR')}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-medium text-red-600">Motivo: {rejeicao.motivo}</p>
                      {rejeicao.observacoes && (
                        <p className="mt-2 text-gray-700">{rejeicao.observacoes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Histórico Completo de Datas e Horários */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2 text-blue-600" />
                Histórico Completo
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {/* Data de Criação */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <div>
                      <p className="font-medium text-gray-900">Orçamento Criado</p>
                      <p className="text-sm text-gray-500">por {orcamento.solicitante.nome}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(orcamento.createdAt).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(orcamento.createdAt).toLocaleTimeString('pt-BR')}
                  </span>
                </div>

                {/* Aprovações */}
                {aprovacoesOrdenadas.map((aprovacao, index) => (
                  <div key={aprovacao.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <div>
                        <p className="font-medium text-gray-900">Aprovado pelo Nível {index + 1}</p>
                        <p className="text-sm text-gray-500">por {aprovacao.aprovador.nome} ({aprovacao.aprovador.email})</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(aprovacao.createdAt).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(aprovacao.createdAt).toLocaleTimeString('pt-BR')}
                    </span>
                  </div>
                ))}

                {/* Rejeições */}
                {rejeicoesOrdenadas.map((rejeicao) => (
                  <div key={rejeicao.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                      <div>
                        <p className="font-medium text-gray-900">Rejeitado</p>
                        <p className="text-sm text-gray-500">por {rejeicao.rejeitador.nome} ({rejeicao.rejeitador.email})</p>
                        <p className="text-sm text-gray-600">Motivo: {rejeicao.motivo}</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(rejeicao.createdAt).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(rejeicao.createdAt).toLocaleTimeString('pt-BR')}
                    </span>
                  </div>
                ))}

                {/* Data de Compra */}
                {orcamento.dataCompra && (
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                      <div>
                        <p className="font-medium text-gray-900">Marcado como Comprado</p>
                        <p className="text-sm text-gray-500">Compra efetuada pelo comprador</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(orcamento.dataCompra).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(orcamento.dataCompra).toLocaleTimeString('pt-BR')}
                    </span>
                  </div>
                )}

                {/* Data de Baixa */}
                {orcamento.dataBaixa && (
                  <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-indigo-500 rounded-full mr-3"></div>
                      <div>
                        <p className="font-medium text-gray-900">Baixa Efetuada</p>
                        <p className="text-sm text-gray-500">Orçamento finalizado</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(orcamento.dataBaixa).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(orcamento.dataBaixa).toLocaleTimeString('pt-BR')}
                    </span>
                  </div>
                )}

                {/* Status Atual */}
                <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-500 rounded-full mr-3"></div>
                    <div>
                      <p className="font-medium text-gray-900">Status Atual</p>
                      <p className="text-sm text-gray-500">{getStatusText(orcamento.status)}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    Última atualização: {new Date(orcamento.updatedAt).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(orcamento.updatedAt).toLocaleTimeString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Informações do Solicitante */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
                Solicitante
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome</label>
                  <p className="text-gray-900">{orcamento.solicitante.nome}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{orcamento.solicitante.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cargo</label>
                  <p className="text-gray-900">{orcamento.solicitante.cargo}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Setor</label>
                  <p className="text-gray-900">{orcamento.solicitante.setor}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Informações do Nível */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <ChartBarIcon className="h-5 w-5 mr-2 text-green-600" />
                Nível de Aprovação
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nível Atual</label>
                  <p className="text-gray-900">{orcamento.nivelAtual.nome}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prioridade</label>
                  <p className="text-gray-900">{orcamento.nivelAtual.prioridade}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Informações da Filial */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <BuildingOfficeIcon className="h-5 w-5 mr-2 text-purple-600" />
                Filial
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome</label>
                  <p className="text-gray-900">{orcamento.filial.nome}</p>
                </div>
                {orcamento.filial.endereco && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Endereço</label>
                    <p className="text-gray-900">{orcamento.filial.endereco}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Informações de Data */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Datas</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Criado em</label>
                  <p className="text-gray-900">
                    {new Date(orcamento.createdAt).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(orcamento.createdAt).toLocaleTimeString('pt-BR')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Última atualização</label>
                  <p className="text-gray-900">
                    {new Date(orcamento.updatedAt).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(orcamento.updatedAt).toLocaleTimeString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrcamentoDetalhes; 