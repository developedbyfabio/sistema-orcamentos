import React, { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  BuildingOfficeIcon, 
  ChartBarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  cargo: string;
  setor: string;
  ativo: boolean;
  admin: boolean;
  podeVerTodosOrcamentos: boolean;
  createdAt: string;
  usuarioNiveis?: Array<{ nivel: Nivel }>;
}

interface Nivel {
  id: number;
  nome: string;
  prioridade: number;
  podeCriarOrcamento: boolean;
  podeAprovar: boolean;
  nivelFinal: boolean;
  ativo: boolean;
}

interface Filial {
  id: number;
  nome: string;
  endereco?: string;
  telefone?: string;
  ativo: boolean;
}

interface DashboardStats {
  totalUsuarios: number;
  usuariosAtivos: number;
  totalNiveis: number;
  niveisAtivos: number;
  totalFiliais: number;
  filiaisAtivas: number;
}

// Modal reutilizável para cadastro/edição de usuário
interface UserModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (form: any) => void;
  initialData: any;
  niveis: Nivel[];
  usuarios: Usuario[];
}

interface NivelModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (form: any) => void;
  initialData: any;
}

interface FilialModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (form: any) => void;
  initialData: any;
}

const UserModal: React.FC<UserModalProps & {usuarios: Usuario[]}> = ({ open, onClose, onSave, initialData, niveis, usuarios }) => {
  const [form, setForm] = useState<{
    nome: string;
    email: string;
    senha: string;
    cargo: string;
    setor: string;
    admin: boolean;
    podeVerTodosOrcamentos: boolean;
    ativo: boolean;
    niveis: number[];
    usuariosPermitidos: number[];
  }>({
    nome: '',
    email: '',
    senha: '',
    cargo: '',
    setor: '',
    admin: false,
    podeVerTodosOrcamentos: false,
    ativo: true,
    niveis: [],
    usuariosPermitidos: [],
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        nome: initialData.nome || '',
        email: initialData.email || '',
        senha: '',
        cargo: initialData.cargo || '',
        setor: initialData.setor || '',
        admin: initialData.admin || false,
        podeVerTodosOrcamentos: initialData.podeVerTodosOrcamentos || false,
        ativo: initialData.ativo ?? true,
        niveis: initialData.niveis
          ? initialData.niveis.map((n: any) => typeof n === 'object' && n !== null ? n.id : n)
          : [],
        usuariosPermitidos: initialData.usuariosPermitidos
          ? initialData.usuariosPermitidos.map((u: any) => typeof u === 'object' && u !== null ? u.id : u)
          : [],
      });
    } else {
      setForm({
        nome: '',
        email: '',
        senha: '',
        cargo: '',
        setor: '',
        admin: false,
        podeVerTodosOrcamentos: false,
        ativo: true,
        niveis: [],
        usuariosPermitidos: [],
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  if (!open) return null;
  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${open ? '' : 'hidden'}`}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">
            {initialData ? 'Editar Usuário' : 'Novo Usuário'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome *
            </label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {initialData ? 'Nova Senha (deixe em branco para manter)' : 'Senha *'}
            </label>
            <input
              type="password"
              value={form.senha}
              onChange={(e) => setForm({ ...form, senha: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required={!initialData}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cargo
            </label>
            <input
              type="text"
              value={form.cargo}
              onChange={(e) => setForm({ ...form, cargo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Setor
            </label>
            <input
              type="text"
              value={form.setor}
              onChange={(e) => setForm({ ...form, setor: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="admin"
                checked={form.admin}
                onChange={(e) => setForm({ ...form, admin: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="admin" className="ml-2 block text-sm text-gray-900">
                Administrador
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="ativo"
                checked={form.ativo}
                onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="ativo" className="ml-2 block text-sm text-gray-900">
                Ativo
              </label>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="podeVerTodosOrcamentos"
              checked={form.podeVerTodosOrcamentos}
              onChange={(e) => setForm({ ...form, podeVerTodosOrcamentos: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="podeVerTodosOrcamentos" className="ml-2 block text-sm text-gray-900">
              Pode ver todos os orçamentos (Alta Liderança)
            </label>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Níveis do usuário
            </label>
            <div className="flex flex-wrap gap-2">
              {niveis.map((nivel) => (
                <label key={nivel.id} className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    checked={form.niveis.includes(nivel.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setForm((prev) => ({
                          ...prev,
                          niveis: [...prev.niveis, nivel.id],
                        }));
                      } else {
                        setForm((prev) => ({
                          ...prev,
                          niveis: prev.niveis.filter((id) => id !== nivel.id),
                        }));
                      }
                    }}
                  />
                  <span className="text-sm">{nivel.nome}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pode ver orçamentos de:
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {usuarios.filter(u => !initialData || u.id !== initialData.id).map((u) => (
                <label key={u.id} className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    checked={form.usuariosPermitidos.includes(u.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setForm((prev) => ({
                          ...prev,
                          usuariosPermitidos: [...prev.usuariosPermitidos, u.id],
                        }));
                      } else {
                        setForm((prev) => ({
                          ...prev,
                          usuariosPermitidos: prev.usuariosPermitidos.filter((id) => id !== u.id),
                        }));
                      }
                    }}
                  />
                  <span className="text-sm">{u.nome}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              {initialData ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const NivelModal: React.FC<NivelModalProps> = ({ open, onClose, onSave, initialData }) => {
  const [form, setForm] = useState<{
    nome: string;
    prioridade: number;
    podeCriarOrcamento: boolean;
    podeAprovar: boolean;
    nivelFinal: boolean;
    ativo: boolean;
  }>({
    nome: '',
    prioridade: 1,
    podeCriarOrcamento: true,
    podeAprovar: false,
    nivelFinal: false,
    ativo: true,
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        nome: initialData.nome || '',
        prioridade: initialData.prioridade || 1,
        podeCriarOrcamento: initialData.podeCriarOrcamento ?? true,
        podeAprovar: initialData.podeAprovar ?? false,
        nivelFinal: initialData.nivelFinal ?? false,
        ativo: initialData.ativo ?? true,
      });
    } else {
      setForm({
        nome: '',
        prioridade: 1,
        podeCriarOrcamento: true,
        podeAprovar: false,
        nivelFinal: false,
        ativo: true,
      });
    }
  }, [initialData, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium mb-4">
          {initialData ? 'Editar Nível' : 'Novo Nível'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome
            </label>
            <input
              type="text"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prioridade
            </label>
            <input
              type="number"
              name="prioridade"
              value={form.prioridade}
              onChange={handleChange}
              min="1"
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="podeCriarOrcamento"
                checked={form.podeCriarOrcamento}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-sm">Pode criar orçamentos</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="podeAprovar"
                checked={form.podeAprovar}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-sm">Pode aprovar orçamentos</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="nivelFinal"
                checked={form.nivelFinal}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-sm">Nível final de aprovação</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="ativo"
                checked={form.ativo}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-sm">Ativo</span>
            </label>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FilialModal: React.FC<FilialModalProps> = ({ open, onClose, onSave, initialData }) => {
  const [form, setForm] = useState<{
    nome: string;
    endereco: string;
    telefone: string;
    ativo: boolean;
  }>({
    nome: '',
    endereco: '',
    telefone: '',
    ativo: true,
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        nome: initialData.nome || '',
        endereco: initialData.endereco || '',
        telefone: initialData.telefone || '',
        ativo: initialData.ativo ?? true,
      });
    } else {
      setForm({
        nome: '',
        endereco: '',
        telefone: '',
        ativo: true,
      });
    }
  }, [initialData, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium mb-4">
          {initialData ? 'Editar Filial' : 'Nova Filial'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Filial
            </label>
            <input
              type="text"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Endereço
            </label>
            <input
              type="text"
              name="endereco"
              value={form.endereco}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone
            </label>
            <input
              type="text"
              name="telefone"
              value={form.telefone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="ativo"
                checked={form.ativo}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-sm">Ativa</span>
            </label>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Admin: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [niveis, setNiveis] = useState<Nivel[]>([]);
  const [filiais, setFiliais] = useState<Filial[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsuarios: 0,
    usuariosAtivos: 0,
    totalNiveis: 0,
    niveisAtivos: 0,
    totalFiliais: 0,
    filiaisAtivas: 0
  });
  const [fluxoModal, setFluxoModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [userFluxo, setUserFluxo] = useState<any[]>([]);
  const [availableNiveis, setAvailableNiveis] = useState<Nivel[]>([]);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [nivelModalOpen, setNivelModalOpen] = useState(false);
  const [editingNivel, setEditingNivel] = useState<Nivel | null>(null);
  const [filialModalOpen, setFilialModalOpen] = useState(false);
  const [editingFilial, setEditingFilial] = useState<Filial | null>(null);
  const [viewingFilial, setViewingFilial] = useState<Filial | null>(null);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Buscar dados em paralelo
      const [usuariosRes, niveisRes, filiaisRes] = await Promise.all([
        fetch(`http://192.168.1.120:5000/api/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`http://192.168.1.120:5000/api/niveis`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`http://192.168.1.120:5000/api/filiais`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (usuariosRes.ok) {
        const usuariosData = await usuariosRes.json();
        setUsuarios(usuariosData);
      }

      if (niveisRes.ok) {
        const niveisData = await niveisRes.json();
        setNiveis(niveisData);
      }

      if (filiaisRes.ok) {
        const filiaisData = await filiaisRes.json();
        setFiliais(filiaisData);
      }

      // Calcular estatísticas
      setStats({
        totalUsuarios: usuarios.length,
        usuariosAtivos: usuarios.filter(u => u.ativo).length,
        totalNiveis: niveis.length,
        niveisAtivos: niveis.filter(n => n.ativo).length,
        totalFiliais: filiais.length,
        filiaisAtivas: filiais.filter(f => f.ativo).length
      });

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (type: 'usuario' | 'nivel' | 'filial', id: number, currentStatus: boolean) => {
    try {
      console.log(`Tentando alterar status do ${type} ID ${id} de ${currentStatus} para ${!currentStatus}`);
      
      const token = localStorage.getItem('token');
      console.log('Token obtido:', token ? token.substring(0, 20) + '...' : 'Token não encontrado');
      
      const endpoint = type === 'usuario' ? 'users' : type === 'nivel' ? 'niveis' : 'filiais';
      
      console.log(`Fazendo requisição PATCH para: http://192.168.1.120:5000/api/${endpoint}/${id}`);
      
      const response = await fetch(`http://192.168.1.120:5000/api/${endpoint}/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ativo: !currentStatus })
      });

      console.log(`Resposta recebida: ${response.status} ${response.statusText}`);

      if (response.ok) {
        console.log(`${type} ${currentStatus ? 'desativado' : 'ativado'} com sucesso!`);
        fetchData(); // Recarregar dados
      } else {
        const errorData = await response.json();
        console.error(`Erro na resposta:`, errorData);
        alert(`Erro ao alterar status do ${type}: ${errorData.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error(`Erro ao alterar status do ${type}:`, error);
      alert(`Erro ao alterar status do ${type}: ${error}`);
    }
  };

  const handleDelete = async (type: 'usuario' | 'nivel' | 'filial', id: number) => {
    if (!window.confirm(`Tem certeza que deseja excluir este ${type}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const endpoint = type === 'usuario' ? 'users' : type === 'nivel' ? 'niveis' : 'filiais';
      
      const response = await fetch(`http://192.168.1.120:5000/api/${endpoint}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchData(); // Recarregar dados
      }
    } catch (error) {
      console.error(`Erro ao excluir ${type}:`, error);
    }
  };

  // Carregar fluxo de um usuário
  const loadUserFluxo = async (userId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://192.168.1.120:5000/api/users/${userId}/fluxo`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const fluxo = await response.json();
        setUserFluxo(fluxo);
      } else {
        setUserFluxo([]);
      }
    } catch (error) {
      console.error('Erro ao carregar fluxo:', error);
      setUserFluxo([]);
    }
  };

  // Salvar fluxo de um usuário
  const saveUserFluxo = async () => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem('token');
      const niveis = userFluxo.map(item => item.nivelId || item.nivel.id);
      
      const response = await fetch(`http://192.168.1.120:5000/api/users/${selectedUser.id}/fluxo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ niveis }),
      });

      if (response.ok) {
        const fluxo = await response.json();
        setUserFluxo(fluxo);
        alert('Fluxo salvo com sucesso!');
      } else {
        const error = await response.json();
        alert(`Erro ao salvar fluxo: ${error.error}`);
      }
    } catch (error) {
      console.error('Erro ao salvar fluxo:', error);
      alert('Erro ao salvar fluxo');
    }
  };

  // Remover fluxo de um usuário
  const removeUserFluxo = async () => {
    if (!selectedUser) return;

    if (!window.confirm('Tem certeza que deseja remover o fluxo personalizado deste usuário?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://192.168.1.120:5000/api/users/${selectedUser.id}/fluxo`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setUserFluxo([]);
        alert('Fluxo removido com sucesso!');
      } else {
        const error = await response.json();
        alert(`Erro ao remover fluxo: ${error.error}`);
      }
    } catch (error) {
      console.error('Erro ao remover fluxo:', error);
      alert('Erro ao remover fluxo');
    }
  };

  // Adicionar nível ao fluxo
  const addNivelToFluxo = (nivel: Nivel) => {
    const novoItem = {
      id: Date.now(), // ID temporário
      nivelId: nivel.id,
      nivel: nivel,
      ordem: userFluxo.length + 1,
      ativo: true,
    };
    setUserFluxo([...userFluxo, novoItem]);
  };

  // Remover nível do fluxo
  const removeNivelFromFluxo = (index: number) => {
    setUserFluxo(userFluxo.filter((_, i) => i !== index));
  };

  // Mover nível no fluxo
  const moveNivelInFluxo = (fromIndex: number, toIndex: number) => {
    const newFluxo = [...userFluxo];
    const [removed] = newFluxo.splice(fromIndex, 1);
    newFluxo.splice(toIndex, 0, removed);
    setUserFluxo(newFluxo);
  };

  // Abrir modal de fluxo
  const openFluxoModal = async (user: Usuario) => {
    console.log('Abrindo modal de fluxo para usuário:', user);
    setSelectedUser(user);
    setFluxoModal(true);
    await loadUserFluxo(user.id);
  };

  // Função para criar usuário
  const handleCreateUser = async (form: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://192.168.1.120:5000/api/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...form, usuariosPermitidos: form.usuariosPermitidos })
      });

      if (response.ok) {
        alert('Usuário criado com sucesso!');
        setUserModalOpen(false);
        fetchData();
      } else {
        const errorData = await response.json();
        alert(`Erro ao criar usuário: ${errorData.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      alert('Erro ao criar usuário');
    }
  };

  // Função para editar usuário
  const handleUpdateUser = async (form: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://192.168.1.120:5000/api/users/${editingUser?.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...form, usuariosPermitidos: form.usuariosPermitidos })
      });

      if (response.ok) {
        alert('Usuário atualizado com sucesso!');
        setUserModalOpen(false);
        setEditingUser(null);
        fetchData();
      } else {
        const errorData = await response.json();
        alert(`Erro ao atualizar usuário: ${errorData.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      alert('Erro ao atualizar usuário');
    }
  };

  // Substituir handleEditUser
  const handleEditUser = (user: Usuario) => {
    const niveisIds = user.usuarioNiveis ? user.usuarioNiveis.map((un: any) => un.nivel.id) : [];
    setEditingUser({ ...(user as any), niveis: niveisIds });
    setUserModalOpen(true);
  };

  const handleCreateNivel = async (form: {
    nome: string;
    prioridade: number;
    podeCriarOrcamento: boolean;
    podeAprovar: boolean;
    nivelFinal: boolean;
    ativo: boolean;
  }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://192.168.1.120:5000/api/niveis`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });

      if (response.ok) {
        setNivelModalOpen(false);
        setEditingNivel(null);
        fetchData();
        alert('Nível criado com sucesso!');
      } else {
        const error = await response.json();
        alert(`Erro ao criar nível: ${error.error}`);
      }
    } catch (error) {
      console.error('Erro ao criar nível:', error);
      alert('Erro ao criar nível');
    }
  };

  const handleUpdateNivel = async (form: {
    nome: string;
    prioridade: number;
    podeCriarOrcamento: boolean;
    podeAprovar: boolean;
    nivelFinal: boolean;
    ativo: boolean;
  }) => {
    if (!editingNivel) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://192.168.1.120:5000/api/niveis/${editingNivel.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });

      if (response.ok) {
        setNivelModalOpen(false);
        setEditingNivel(null);
        fetchData();
        alert('Nível atualizado com sucesso!');
      } else {
        const error = await response.json();
        alert(`Erro ao atualizar nível: ${error.error}`);
      }
    } catch (error) {
      console.error('Erro ao atualizar nível:', error);
      alert('Erro ao atualizar nível');
    }
  };

  const handleEditNivel = (nivel: Nivel) => {
    setEditingNivel(nivel);
    setNivelModalOpen(true);
  };

  const handleCreateFilial = async (form: {
    nome: string;
    endereco: string;
    telefone: string;
    ativo: boolean;
  }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://192.168.1.120:5000/api/filiais`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });

      if (response.ok) {
        setFilialModalOpen(false);
        setEditingFilial(null);
        fetchData();
        alert('Filial criada com sucesso!');
      } else {
        const error = await response.json();
        alert(`Erro ao criar filial: ${error.error}`);
      }
    } catch (error) {
      console.error('Erro ao criar filial:', error);
      alert('Erro ao criar filial');
    }
  };

  const handleUpdateFilial = async (form: {
    nome: string;
    endereco: string;
    telefone: string;
    ativo: boolean;
  }) => {
    if (!editingFilial) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://192.168.1.120:5000/api/filiais/${editingFilial.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });

      if (response.ok) {
        setFilialModalOpen(false);
        setEditingFilial(null);
        fetchData();
        alert('Filial atualizada com sucesso!');
      } else {
        const error = await response.json();
        alert(`Erro ao atualizar filial: ${error.error}`);
      }
    } catch (error) {
      console.error('Erro ao atualizar filial:', error);
      alert('Erro ao atualizar filial');
    }
  };

  const handleEditFilial = (filial: Filial) => {
    setEditingFilial(filial);
    setFilialModalOpen(true);
  };

  const handleViewFilial = (filial: Filial) => {
    setViewingFilial(filial);
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
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Administração</h1>
        <p className="mt-2 text-gray-600">
          Gerencie usuários, níveis de aprovação e filiais do sistema.
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ChartBarIcon className="h-5 w-5 inline mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('usuarios')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'usuarios'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <UsersIcon className="h-5 w-5 inline mr-2" />
              Usuários
            </button>
            <button
              onClick={() => setActiveTab('niveis')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'niveis'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ChartBarIcon className="h-5 w-5 inline mr-2" />
              Níveis
            </button>
            <button
              onClick={() => setActiveTab('filiais')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'filiais'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BuildingOfficeIcon className="h-5 w-5 inline mr-2" />
              Filiais
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <UsersIcon className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-blue-600">Usuários</p>
                      <p className="text-2xl font-bold text-blue-900">{stats.totalUsuarios}</p>
                      <p className="text-sm text-blue-600">{stats.usuariosAtivos} ativos</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <ChartBarIcon className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-green-600">Níveis</p>
                      <p className="text-2xl font-bold text-green-900">{stats.totalNiveis}</p>
                      <p className="text-sm text-green-600">{stats.niveisAtivos} ativos</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <BuildingOfficeIcon className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-purple-600">Filiais</p>
                      <p className="text-2xl font-bold text-purple-900">{stats.totalFiliais}</p>
                      <p className="text-sm text-purple-600">{stats.filiaisAtivas} ativas</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Usuários Tab */}
          {activeTab === 'usuarios' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Usuários do Sistema</h3>
                <button
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  onClick={() => { setEditingUser(null); setUserModalOpen(true); }}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Novo Usuário
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuário
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cargo/Setor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Admin
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {usuarios.map((usuario) => (
                      <tr key={usuario.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{usuario.nome}</div>
                            <div className="text-sm text-gray-500">{usuario.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{usuario.cargo}</div>
                          <div className="text-sm text-gray-500">{usuario.setor}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            usuario.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {usuario.ativo ? <CheckCircleIcon className="h-4 w-4 mr-1" /> : <XCircleIcon className="h-4 w-4 mr-1" />}
                            {usuario.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            usuario.admin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {usuario.admin ? 'Sim' : 'Não'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditUser(usuario)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Editar usuário"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openFluxoModal(usuario)}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 border border-green-300 rounded hover:bg-green-200"
                              title="Configurar fluxo de aprovação"
                            >
                              <ArrowPathIcon className="h-3 w-3 mr-1" />
                              Fluxo
                            </button>
                            <button
                              onClick={() => {
                                console.log('Botão de ativar/desativar clicado para usuário:', usuario);
                                handleToggleStatus('usuario', usuario.id, usuario.ativo);
                              }}
                              className="text-yellow-600 hover:text-yellow-900"
                              title={usuario.ativo ? 'Desativar usuário' : 'Ativar usuário'}
                            >
                              {usuario.ativo ? <XCircleIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => handleDelete('usuario', usuario.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Excluir usuário"
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
            </div>
          )}

          {/* Níveis Tab */}
          {activeTab === 'niveis' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Níveis de Aprovação</h3>
                <button 
                  onClick={() => setNivelModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Novo Nível
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nível
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prioridade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Permissões
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {niveis.map((nivel) => (
                      <tr key={nivel.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{nivel.nome}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{nivel.prioridade}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-2 items-center">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                              nivel.podeCriarOrcamento ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {nivel.podeCriarOrcamento ? 'Criar' : 'Não Criar'}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                              nivel.podeAprovar ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {nivel.podeAprovar ? 'Aprovar' : 'Não Aprovar'}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                              nivel.nivelFinal ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {nivel.nivelFinal ? 'Final' : 'Não Final'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            nivel.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {nivel.ativo ? <CheckCircleIcon className="h-4 w-4 mr-1" /> : <XCircleIcon className="h-4 w-4 mr-1" />}
                            {nivel.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button 
                              onClick={() => handleEditNivel(nivel)}
                              className="text-green-600 hover:text-green-900"
                              title="Editar nível"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete('nivel', nivel.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Excluir nível"
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
            </div>
          )}

          {/* Ferramentas de Teste (apenas admin) */}
          {user?.admin && (
            <div className="mt-8 p-4 border rounded bg-yellow-50">
              <h4 className="font-bold mb-2 text-yellow-800">Ferramentas de Teste</h4>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={async () => {
                  if (window.confirm('Tem certeza que deseja limpar TODOS os orçamentos do banco? Esta ação não pode ser desfeita!')) {
                    try {
                      const token = localStorage.getItem('token');
                      const res = await fetch(`http://192.168.1.120:5000/api/orcamentos/limpar-todos`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                      });
                      if (res.ok) {
                        alert('Todos os orçamentos foram removidos com sucesso!');
                      } else {
                        const data = await res.json();
                        alert('Erro ao limpar orçamentos: ' + (data.error || 'Erro desconhecido.'));
                      }
                    } catch (e) {
                      alert('Erro ao conectar com o servidor.');
                    }
                  }
                }}
              >
                Limpar banco de orçamentos (TESTE)
              </button>
              <p className="text-xs text-yellow-700 mt-2">Este botão remove todos os orçamentos, aprovações e rejeições do banco. Use apenas para testes! No projeto final, remova este botão.</p>
            </div>
          )}

          {/* Filiais Tab */}
          {activeTab === 'filiais' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Filiais</h3>
                <button 
                  onClick={() => setFilialModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Nova Filial
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Filial
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contato
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filiais.map((filial) => (
                      <tr key={filial.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{filial.nome}</div>
                            {filial.endereco && (
                              <div className="text-sm text-gray-500">{filial.endereco}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{filial.telefone || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            filial.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {filial.ativo ? <CheckCircleIcon className="h-4 w-4 mr-1" /> : <XCircleIcon className="h-4 w-4 mr-1" />}
                            {filial.ativo ? 'Ativa' : 'Inativa'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button 
                              onClick={() => handleViewFilial(filial)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Visualizar filial"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleEditFilial(filial)}
                              className="text-green-600 hover:text-green-900"
                              title="Editar filial"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete('filial', filial.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Excluir filial"
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
            </div>
          )}
        </div>
      </div>

      {/* Modal de Fluxo Personalizado */}
      {fluxoModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Fluxo de Aprovação - {selectedUser.nome}
              </h3>
              <button
                onClick={() => setFluxoModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Configure a ordem de aprovação para este usuário. Os orçamentos seguirão esta sequência.
              </p>
              
              {/* Fluxo atual */}
              <div className="mb-4">
                <h4 className="font-medium mb-2">Fluxo Atual:</h4>
                {userFluxo.length === 0 ? (
                  <p className="text-gray-500 italic">Nenhum fluxo personalizado configurado (usará fluxo padrão)</p>
                ) : (
                  <div className="space-y-2">
                    {userFluxo.map((item, index) => (
                      <div key={item.id || index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                        <div className="flex items-center space-x-3">
                          <span className="bg-blue-500 text-white px-2 py-1 rounded text-sm">
                            {index + 1}
                          </span>
                          <span className="font-medium">{item.nivel.nome}</span>
                        </div>
                        <div className="flex space-x-2">
                          {index > 0 && (
                            <button
                              onClick={() => moveNivelInFluxo(index, index - 1)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              ↑
                            </button>
                          )}
                          {index < userFluxo.length - 1 && (
                            <button
                              onClick={() => moveNivelInFluxo(index, index + 1)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              ↓
                            </button>
                          )}
                          <button
                            onClick={() => removeNivelFromFluxo(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Adicionar níveis */}
              <div className="mb-4">
                <h4 className="font-medium mb-2">Adicionar Nível:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {niveis
                    .filter(nivel => !userFluxo.some(item => item.nivelId === nivel.id || item.nivel?.id === nivel.id))
                    .map(nivel => (
                      <button
                        key={nivel.id}
                        onClick={() => addNivelToFluxo(nivel)}
                        className="text-left p-2 border rounded hover:bg-gray-50"
                      >
                        {nivel.nome}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={removeUserFluxo}
                className="px-4 py-2 text-red-600 border border-red-600 rounded hover:bg-red-50"
              >
                Remover Fluxo
              </button>
              <button
                onClick={saveUserFluxo}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Salvar Fluxo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de usuário */}
      <UserModal
        open={userModalOpen}
        onClose={() => { setUserModalOpen(false); setEditingUser(null); }}
        onSave={editingUser ? handleUpdateUser : handleCreateUser}
        initialData={editingUser}
        niveis={niveis}
        usuarios={usuarios}
      />

      {/* Modal de nível */}
      <NivelModal
        open={nivelModalOpen}
        onClose={() => { setNivelModalOpen(false); setEditingNivel(null); }}
        onSave={editingNivel ? handleUpdateNivel : handleCreateNivel}
        initialData={editingNivel}
      />

      {/* Modal de filial */}
      <FilialModal
        open={filialModalOpen}
        onClose={() => { setFilialModalOpen(false); setEditingFilial(null); }}
        onSave={editingFilial ? handleUpdateFilial : handleCreateFilial}
        initialData={editingFilial}
      />

      {/* Modal de visualização de filial */}
      {viewingFilial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Detalhes da Filial</h3>
              <button
                onClick={() => setViewingFilial(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Filial
                </label>
                <p className="text-sm text-gray-900">{viewingFilial.nome}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço
                </label>
                <p className="text-sm text-gray-900">{viewingFilial.endereco || 'Não informado'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <p className="text-sm text-gray-900">{viewingFilial.telefone || 'Não informado'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  viewingFilial.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {viewingFilial.ativo ? <CheckCircleIcon className="h-4 w-4 mr-1" /> : <XCircleIcon className="h-4 w-4 mr-1" />}
                  {viewingFilial.ativo ? 'Ativa' : 'Inativa'}
                </span>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewingFilial(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin; 