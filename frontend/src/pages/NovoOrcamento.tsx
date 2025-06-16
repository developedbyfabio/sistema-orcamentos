import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

interface UploadedFile {
  file: File;
  preview: string;
  name: string;
  type: 'image' | 'document';
}

const NovoOrcamento: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filiais, setFiliais] = useState<Filial[]>([]);
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
    fetchFiliais();
  }, []);

  useEffect(() => {
    let valor = parseFloat(formData.valor.replace(',', '.') || '0');
    let quantidade = parseInt(formData.quantidade || '0');
    if (isNaN(valor)) valor = 0;
    if (isNaN(quantidade)) quantidade = 0;
    const total = valor * quantidade;
    setValorTotal(total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  }, [formData.valor, formData.quantidade]);

  const fetchFiliais = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/filiais`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFiliais(data);
      }
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
    } finally {
      setLoading(false);
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles: UploadedFile[] = Array.from(files).map(file => ({
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        type: 'image'
      }));
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles: UploadedFile[] = Array.from(files).map(file => ({
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        type: 'document'
      }));
      setUploadedDocuments(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    const fileToRemove = uploadedFiles[index];
    URL.revokeObjectURL(fileToRemove.preview);
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeDocument = (index: number) => {
    const fileToRemove = uploadedDocuments[index];
    URL.revokeObjectURL(fileToRemove.preview);
    setUploadedDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'Título é obrigatório';
    }

    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    }

    if (!formData.valor || parseFloat(formData.valor.replace(',', '.')) <= 0) {
      newErrors.valor = 'Valor deve ser maior que zero';
    }

    if (!formData.filialId) {
      newErrors.filialId = 'Filial é obrigatória';
    }

    if (!formData.quantidade || parseInt(formData.quantidade) <= 0) {
      newErrors.quantidade = 'Quantidade deve ser maior que zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const valor = parseFloat(formData.valor.replace(',', '.'));
      const quantidade = parseInt(formData.quantidade);
      
      // Criar FormData para enviar arquivos
      const formDataToSend = new FormData();
      formDataToSend.append('titulo', formData.titulo);
      formDataToSend.append('descricao', formData.descricao);
      formDataToSend.append('valor', valor.toString());
      formDataToSend.append('quantidade', quantidade.toString());
      formDataToSend.append('fornecedor', formData.fornecedor);
      formDataToSend.append('links', formData.links);
      formDataToSend.append('observacoes', formData.observacoes);
      formDataToSend.append('filialId', formData.filialId);

      // Adicionar fotos
      uploadedFiles.forEach((uploadedFile, index) => {
        formDataToSend.append(`fotos`, uploadedFile.file);
      });

      // Adicionar anexos
      uploadedDocuments.forEach((uploadedFile, index) => {
        formDataToSend.append(`anexos`, uploadedFile.file);
      });
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/orcamentos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        setNotification({
          type: 'success',
          message: 'Orçamento criado com sucesso!',
          isVisible: true
        });
        navigate('/dashboard');
      } else {
        const errorData = await response.json();
        setNotification({
          type: 'error',
          message: errorData.error || 'Erro ao criar orçamento',
          isVisible: true
        });
      }
    } catch (error) {
      console.error('Erro ao criar orçamento:', error);
      setNotification({
        type: 'error',
        message: 'Erro ao criar orçamento. Tente novamente.',
        isVisible: true
      });
    } finally {
      setSubmitting(false);
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
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Novo Orçamento</h1>
                <p className="mt-1 text-gray-600">
                  Crie um novo orçamento para solicitar compras.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
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
                    min="1"
                    value={formData.quantidade}
                    onChange={handleInputChange}
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div>
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
                      placeholder="URLs separadas por vírgula (opcional)"
                    />
                  </div>
                </div>
              </div>

              {/* Upload de Fotos */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fotos
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Fazer upload de fotos</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          multiple
                          accept="image/*"
                          onChange={handleFileUpload}
                        />
                      </label>
                      <p className="pl-1">ou arraste e solte</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF até 10MB</p>
                  </div>
                </div>
                
                {/* Preview das fotos */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Fotos selecionadas:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={file.preview}
                            alt={file.name}
                            className="h-24 w-full object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                          <p className="text-xs text-gray-500 mt-1 truncate">{file.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Upload de Anexos */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anexos
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <PaperClipIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="document-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Fazer upload de anexos</span>
                        <input
                          id="document-upload"
                          name="document-upload"
                          type="file"
                          className="sr-only"
                          multiple
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
                          onChange={handleDocumentUpload}
                        />
                      </label>
                      <p className="pl-1">ou arraste e solte</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF, DOC, XLS, TXT, ZIP até 10MB</p>
                  </div>
                </div>
                
                {/* Preview dos anexos */}
                {uploadedDocuments.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Anexos selecionados:</h4>
                    <div className="space-y-2">
                      {uploadedDocuments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <PaperClipIcon className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {(file.file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDocument(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                {submitting ? 'Criando...' : 'Criar Orçamento'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NovoOrcamento; 