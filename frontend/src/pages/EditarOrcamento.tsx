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
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import Notification from '../components/Notification';

interface Filial {
  id: number;
  nome: string;
}

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
  observacoes?: string;
  status: string;
  filial: {
    id: number;
    nome: string;
  };
}

interface UploadedFile {
  file: File;
  preview: string;
  name: string;
}

const EditarOrcamento: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filiais, setFiliais] = useState<Filial[]>([]);
  const [orcamento, setOrcamento] = useState<Orcamento | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedFile[]>([]);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    isVisible: boolean;
  }>({
    type: 'success',
    message: '',
    isVisible: false
  });

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    valor: '',
    quantidade: '1',
    fornecedor: '',
    links: '',
    anexos: '',
    observacoes: '',
    filialId: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [valorTotal, setValorTotal] = useState('0,00');

  useEffect(() => {
    if (id) {
      fetchOrcamento();
      fetchFiliais();
    }
  }, [id]);

  useEffect(() => {
    let valor = parseFloat(formData.valor.replace(',', '.') || '0');
    let quantidade = parseInt(formData.quantidade || '0');
    if (isNaN(valor)) valor = 0;
    if (isNaN(quantidade)) quantidade = 0;
    const total = valor * quantidade;
    setValorTotal(total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  }, [formData.valor, formData.quantidade]);

  const fetchOrcamento = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/orcamentos/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrcamento(data);
        
        // Preencher o formulário com os dados do orçamento
        setFormData({
          titulo: data.titulo,
          descricao: data.descricao,
          valor: data.valor.toString(),
          quantidade: data.quantidade.toString(),
          fornecedor: data.fornecedor || '',
          links: data.links || '',
          anexos: data.anexos || '',
          observacoes: data.observacoes || '',
          filialId: data.filial.id.toString()
        });
      } else {
        alert('Orçamento não encontrado');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Erro ao carregar orçamento:', error);
      alert('Erro ao carregar orçamento');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchFiliais = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/filiais`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFiliais(data);
      }
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (name === 'valor') {
      let numericValue = value.replace(/[^\d,]/g, '');
      numericValue = numericValue.replace(/,+/g, ',');
      const commaIndex = numericValue.indexOf(',');
      if (commaIndex !== -1) {
        const beforeComma = numericValue.substring(0, commaIndex);
        const afterComma = numericValue.substring(commaIndex + 1).replace(/,/g, '');
        const limitedAfterComma = afterComma.substring(0, 2);
        numericValue = beforeComma + ',' + limitedAfterComma;
      }
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else if (name === 'quantidade') {
      // Garante que quantidade nunca fique vazia e só aceita números inteiros positivos
      let quantidade = value.replace(/[^\d]/g, '');
      if (quantidade === '' || quantidade === '0') quantidade = '1';
      setFormData(prev => ({
        ...prev,
        [name]: quantidade
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'fotos' | 'anexos') => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      const uploadedFile: UploadedFile = {
        file,
        preview: URL.createObjectURL(file),
        name: file.name
      };

      if (type === 'fotos') {
        setUploadedFiles(prev => [...prev, uploadedFile]);
      } else {
        setUploadedDocuments(prev => [...prev, uploadedFile]);
      }
    });
  };

  const removeFile = (index: number, type: 'fotos' | 'anexos') => {
    if (type === 'fotos') {
      setUploadedFiles(prev => {
        const newFiles = [...prev];
        URL.revokeObjectURL(newFiles[index].preview);
        newFiles.splice(index, 1);
        return newFiles;
      });
    } else {
      setUploadedDocuments(prev => {
        const newFiles = [...prev];
        URL.revokeObjectURL(newFiles[index].preview);
        newFiles.splice(index, 1);
        return newFiles;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'Título é obrigatório';
    }

    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    }

    if (!formData.valor.trim()) {
      newErrors.valor = 'Valor é obrigatório';
    } else {
      const valor = parseFloat(formData.valor.replace(',', '.'));
      if (isNaN(valor) || valor <= 0) {
        newErrors.valor = 'Valor deve ser um número positivo';
      }
    }

    if (!formData.quantidade.trim()) {
      newErrors.quantidade = 'Quantidade é obrigatória';
    } else {
      const quantidade = parseInt(formData.quantidade);
      if (isNaN(quantidade) || quantidade <= 0) {
        newErrors.quantidade = 'Quantidade deve ser um número positivo';
      }
    }

    if (!formData.filialId) {
      newErrors.filialId = 'Filial é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validação
    const newErrors: Record<string, string> = {};
    if (!formData.titulo.trim()) newErrors.titulo = 'Título é obrigatório';
    if (!formData.descricao.trim()) newErrors.descricao = 'Descrição é obrigatória';
    if (!formData.valor || parseFloat(formData.valor.replace(',', '.')) <= 0) {
      newErrors.valor = 'Valor deve ser maior que zero';
    }
    if (!formData.filialId) newErrors.filialId = 'Filial é obrigatória';
    if (!formData.quantidade || parseInt(formData.quantidade) <= 0) {
      newErrors.quantidade = 'Quantidade deve ser maior que zero';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const valorNumerico = parseFloat(formData.valor.replace(',', '.'));
      const quantidade = parseInt(formData.quantidade);
      
      const dataToSend = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        valor: valorNumerico,
        quantidade: quantidade,
        fornecedor: formData.fornecedor,
        links: formData.links,
        observacoes: formData.observacoes
      };
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/orcamentos/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        setNotification({
          type: 'success',
          message: 'Orçamento atualizado com sucesso!',
          isVisible: true
        });
        
        // Redirecionar após 2 segundos
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        const errorData = await response.json();
        setNotification({
          type: 'error',
          message: errorData.error || errorData.message || 'Erro ao atualizar orçamento',
          isVisible: true
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar orçamento:', error);
      setNotification({
        type: 'error',
        message: 'Erro ao atualizar orçamento. Tente novamente.',
        isVisible: true
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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

  // Verificar se o orçamento pode ser editado
  if (orcamento.status !== 'PENDENTE') {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Editar Orçamento #{orcamento.id}</h1>
              <p className="mt-1 text-gray-600">{orcamento.titulo}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Orçamento não pode ser editado
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Este orçamento não pode ser editado porque seu status atual é "{orcamento.status}".
                  Apenas orçamentos com status "PENDENTE" podem ser editados.
                </p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-yellow-50 px-2 py-1.5 rounded-md text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
                >
                  Voltar para Orçamentos
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
      />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Editar Orçamento #{orcamento.id}</h1>
              <p className="mt-1 text-gray-600">{orcamento.titulo}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            {/* Informações Básicas */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-600" />
                Informações Básicas
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    id="titulo"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.titulo ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Digite o título do orçamento"
                  />
                  {errors.titulo && (
                    <p className="mt-1 text-sm text-red-600">{errors.titulo}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="quantidade" className="block text-sm font-medium text-gray-700 mb-2">
                    Quantidade *
                  </label>
                  <input
                    type="number"
                    id="quantidade"
                    name="quantidade"
                    value={formData.quantidade}
                    onChange={handleInputChange}
                    min="1"
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.quantidade ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="1"
                  />
                  {errors.quantidade && (
                    <p className="mt-1 text-sm text-red-600">{errors.quantidade}</p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="valor" className="block text-sm font-medium text-gray-700 mb-2">
                  Valor Unitário (R$) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="valor"
                    name="valor"
                    value={formData.valor}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.valor ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0,00"
                  />
                </div>
                {errors.valor && (
                  <p className="mt-1 text-sm text-red-600">{errors.valor}</p>
                )}
              </div>

              {/* Valor Total */}
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-blue-900">Valor Total:</span>
                  <span className="text-2xl font-bold text-blue-600">R$ {valorTotal}</span>
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição *
                </label>
                <textarea
                  id="descricao"
                  name="descricao"
                  rows={4}
                  value={formData.descricao}
                  onChange={handleInputChange}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.descricao ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Descreva detalhadamente o que está sendo solicitado"
                />
                {errors.descricao && (
                  <p className="mt-1 text-sm text-red-600">{errors.descricao}</p>
                )}
              </div>
            </div>

            {/* Configurações */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <BuildingOfficeIcon className="h-5 w-5 mr-2 text-green-600" />
                Configurações
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div>
                  <label htmlFor="filialId" className="block text-sm font-medium text-gray-700 mb-2">
                    Filial *
                  </label>
                  <select
                    id="filialId"
                    name="filialId"
                    value={formData.filialId}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.filialId ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Selecione uma filial</option>
                    {filiais.map((filial) => (
                      <option key={filial.id} value={filial.id}>
                        {filial.nome}
                      </option>
                    ))}
                  </select>
                  {errors.filialId && (
                    <p className="mt-1 text-sm text-red-600">{errors.filialId}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Informações Adicionais */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-purple-600" />
                Informações Adicionais
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div>
                  <label htmlFor="fornecedor" className="block text-sm font-medium text-gray-700 mb-2">
                    Fornecedor
                  </label>
                  <input
                    type="text"
                    id="fornecedor"
                    name="fornecedor"
                    value={formData.fornecedor}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Nome do fornecedor (opcional)"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="links" className="block text-sm font-medium text-gray-700 mb-2">
                  Links
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="links"
                    name="links"
                    value={formData.links}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Links úteis (opcional)"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  id="observacoes"
                  name="observacoes"
                  rows={3}
                  value={formData.observacoes}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Observações adicionais (opcional)"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Atualizando...' : 'Atualizar Orçamento'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditarOrcamento; 