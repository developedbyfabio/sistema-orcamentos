# Sistema de Orçamentos com Controle de Níveis

Sistema completo de gestão de orçamentos com controle de níveis de aprovação, desenvolvido em Node.js/Express (backend) e React/TypeScript (frontend).

## 📋 Índice

- [Requisitos do Sistema](#requisitos-do-sistema)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalação e Configuração](#instalação-e-configuração)
- [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
- [Configuração das Variáveis de Ambiente](#configuração-das-variáveis-de-ambiente)
- [Executando o Projeto](#executando-o-projeto)
- [🚀 Execução em Produção](#execução-em-produção)
- [Funcionalidades](#funcionalidades)
- [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
- [API Endpoints](#api-endpoints)
- [Troubleshooting](#troubleshooting)

## 🖥️ Requisitos do Sistema

### Versões Exatas Testadas e Funcionais:

- **Node.js**: v18.20.8 ou superior
- **npm**: v10.8.2 ou superior
- **Yarn**: v1.22.22 ou superior
- **PostgreSQL**: v14.18 ou superior
- **Linux**: Ubuntu 22.04 LTS (testado)

### Requisitos Mínimos de Hardware:
- **RAM**: 2GB mínimo (4GB recomendado)
- **CPU**: 2 cores mínimo
- **Armazenamento**: 10GB de espaço livre
- **Rede**: Conexão com internet para download de dependências

## 🛠️ Tecnologias Utilizadas

### Backend:
- **Node.js** v18.20.8
- **Express.js** v4.18.2
- **TypeScript** v5.3.3
- **Prisma ORM** v5.7.1
- **PostgreSQL** v14.18
- **JWT** para autenticação
- **bcrypt** para hash de senhas
- **multer** para upload de arquivos
- **helmet** para segurança
- **cors** para CORS
- **express-rate-limit** para rate limiting
- **zod** para validação

### Frontend:
- **React** v18.2.0
- **TypeScript** v5.3.3
- **React Router DOM** v6.20.1
- **Axios** v1.6.2
- **Tailwind CSS** v3.3.6
- **Headless UI** v1.7.17
- **Heroicons** v2.0.18
- **React Hot Toast** v2.4.1

## 📁 Estrutura do Projeto

```
/
├── backend/                 # Servidor Node.js/Express
│   ├── src/
│   │   ├── routes/         # Rotas da API
│   │   ├── middleware/     # Middlewares
│   │   ├── scripts/        # Scripts utilitários
│   │   ├── server.ts       # Servidor principal
│   │   └── seed.ts         # Seed do banco
│   ├── prisma/
│   │   ├── schema.prisma   # Schema do banco
│   │   └── seed.ts         # Seed do Prisma
│   ├── uploads/            # Arquivos enviados
│   ├── package.json
│   ├── tsconfig.json
│   └── env.example
├── frontend/               # Aplicação React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── contexts/       # Contextos React
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── env.example
└── README.md
```

## 🚀 Instalação e Configuração

### 1. Preparação do Sistema

```bash
# Atualizar o sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js v18.20.8
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar versões
node --version  # Deve mostrar v18.20.8
npm --version   # Deve mostrar v10.8.2

# Instalar Yarn
curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | gpg --dearmor | sudo tee /usr/share/keyrings/yarnkey.gpg >/dev/null
echo "deb [signed-by=/usr/share/keyrings/yarnkey.gpg] https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt update && sudo apt install yarn

# Verificar Yarn
yarn --version  # Deve mostrar v1.22.22

# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Verificar PostgreSQL
psql --version  # Deve mostrar v14.18
```

### 2. Configuração do PostgreSQL

```bash
# Acessar PostgreSQL como superusuário
sudo -u postgres psql

# Criar usuário e banco de dados
CREATE USER orcamentos_user WITH PASSWORD 'Jgr34eng02@';
CREATE DATABASE orcamentos_db OWNER orcamentos_user;
GRANT ALL PRIVILEGES ON DATABASE orcamentos_db TO orcamentos_user;
\q
```

### 3. Clonar e Configurar o Projeto

```bash
# Navegar para o diretório desejado
cd /var/www

# Clonar o projeto (substitua pela URL do seu repositório)
git clone <URL_DO_REPOSITORIO> sistema-orcamentos
cd sistema-orcamentos

# Configurar permissões
sudo chown -R $USER:$USER .
chmod -R 755 .
```

## 🗄️ Configuração do Banco de Dados

### 1. Configurar Backend

```bash
cd backend

# Instalar dependências
yarn install

# Copiar arquivo de ambiente
cp env.example .env

# Editar variáveis de ambiente
nano .env
```

### 2. Configurar Frontend

```bash
cd ../frontend

# Instalar dependências
yarn install

# Copiar arquivo de ambiente
cp env.example .env

# Editar variáveis de ambiente
nano .env
```

## ⚙️ Configuração das Variáveis de Ambiente

### Backend (.env)

```env
# Configurações do Banco de Dados
DATABASE_URL="postgresql://orcamentos_user:Jgr34eng02@@localhost:5432/orcamentos_db"

# Configurações JWT
JWT_SECRET="sua_chave_secreta_jwt_aqui_mude_em_producao"
JWT_EXPIRES_IN="7d"

# Configurações do Servidor
PORT=5000
NODE_ENV=development

# Configurações de Upload
UPLOAD_PATH="./uploads"
MAX_FILE_SIZE=10485760

# Configurações de Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=1000
```

### Frontend (.env)

```env
# Configurações da API
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_JWT_SECRET=sua_chave_secreta_jwt_aqui

# Configurações da aplicação
REACT_APP_APP_NAME=Sistema de Orçamentos
REACT_APP_APP_VERSION=1.0.0
```

## 🏃‍♂️ Executando o Projeto

### 1. Configurar Banco de Dados

```bash
cd backend

# Gerar cliente Prisma
yarn db:generate

# Executar migrações
yarn db:push

# Executar seed (dados iniciais)
yarn db:seed
```

### 2. Iniciar Backend

```bash
# Desenvolvimento
yarn dev

# Produção
yarn build
yarn start
```

### 3. Iniciar Frontend

```bash
cd ../frontend

# Desenvolvimento
yarn start

# Produção
yarn build
```

### 4. Verificar Funcionamento

- **Backend**: http://localhost:5000/api/health
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:5000/api

## 🚀 Execução em Produção

Para rodar o projeto em segundo plano (sem `yarn dev` e `yarn start`), temos várias opções:

### ⚡ Inicialização Rápida

```bash
# Dar permissão aos scripts
chmod +x start-services.sh stop-services.sh

# Iniciar serviços (menu interativo)
./start-services.sh

# Parar serviços
./stop-services.sh
```

### 📦 Métodos Disponíveis

#### 1. **PM2 (Recomendado)** ⭐
```bash
# Instalar PM2
npm install -g pm2

# Build e iniciar
cd backend && yarn build && cd ..
cd frontend && yarn build && cd ..
pm2 start ecosystem.config.js --env production

# Comandos úteis
pm2 status          # Ver status
pm2 logs            # Ver logs
pm2 monit           # Monitoramento
pm2 stop all        # Parar tudo
```

#### 2. **nohup (Simples)**
```bash
# Backend
cd backend
nohup node dist/server.js > logs/server.log 2>&1 &

# Frontend
cd frontend
nohup npx serve -s build -l 3000 > logs/frontend.log 2>&1 &
```

#### 3. **systemd (Produção)**
```bash
# Configurar serviços do sistema
sudo systemctl enable orcamentos-backend
sudo systemctl enable orcamentos-frontend
sudo systemctl start orcamentos-backend
sudo systemctl start orcamentos-frontend
```

### 📚 Documentação Completa

Para instruções detalhadas sobre produção, consulte o arquivo **[PRODUCAO.md](PRODUCAO.md)** que inclui:

- Guia completo de cada método
- Configuração de logs
- Monitoramento
- Troubleshooting
- Comandos úteis
- Recomendações para diferentes cenários

### 🔧 Scripts Disponíveis

#### Backend
```bash
cd backend
yarn start:prod        # Produção
yarn start:background  # nohup
yarn start:pm2         # PM2
```

#### Frontend
```bash
cd frontend
yarn build:prod        # Build otimizado
yarn serve             # Servir build
yarn serve:background  # nohup
yarn start:pm2         # PM2
```

## 🎯 Funcionalidades

### Sistema de Autenticação
- Login com email e senha
- JWT para autenticação
- Controle de sessão
- Middleware de autenticação

### Gestão de Usuários
- CRUD completo de usuários
- Controle de níveis de acesso
- Permissões por setor
- Ativação/desativação de usuários

### Sistema de Níveis
- Configuração de níveis hierárquicos
- Permissões por nível
- Fluxo de aprovação configurável
- Níveis finais de aprovação

### Gestão de Orçamentos
- Criação de orçamentos
- Upload de arquivos e fotos
- Fluxo de aprovação automático
- Histórico de aprovações/rejeições
- Status tracking (PENDENTE, APROVADO, REPROVADO, etc.)

### Dashboard e Relatórios
- Dashboard com métricas
- Filtros por status, usuário, período
- Relatórios de orçamentos
- Estatísticas de aprovação

### Gestão de Filiais
- CRUD de filiais
- Associação de orçamentos por filial
- Controle de acesso por filial

### Upload de Arquivos
- Suporte a múltiplos formatos
- Limite de tamanho configurável
- Armazenamento local
- Validação de arquivos

## 🗃️ Estrutura do Banco de Dados

### Tabelas Principais:

1. **usuarios** - Usuários do sistema
2. **niveis** - Níveis hierárquicos
3. **usuarios_niveis** - Relação usuário-nível
4. **orcamentos** - Orçamentos
5. **aprovacoes** - Histórico de aprovações
6. **rejeicoes** - Histórico de rejeições
7. **filiais** - Filiais da empresa
8. **regras_fluxo** - Regras de fluxo entre níveis
9. **fluxos_usuario** - Fluxo personalizado por usuário

### Relacionamentos:
- Usuário pode ter múltiplos níveis
- Orçamento pertence a um solicitante e filial
- Orçamento tem nível atual e próximo nível
- Sistema de aprovações e rejeições rastreado

## 🔌 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Usuários
- `GET /api/users` - Listar usuários
- `POST /api/users` - Criar usuário
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário

### Níveis
- `GET /api/niveis` - Listar níveis
- `POST /api/niveis` - Criar nível
- `PUT /api/niveis/:id` - Atualizar nível
- `DELETE /api/niveis/:id` - Deletar nível

### Orçamentos
- `GET /api/orcamentos` - Listar orçamentos
- `POST /api/orcamentos` - Criar orçamento
- `PUT /api/orcamentos/:id` - Atualizar orçamento
- `DELETE /api/orcamentos/:id` - Deletar orçamento
- `POST /api/orcamentos/:id/approve` - Aprovar orçamento
- `POST /api/orcamentos/:id/reject` - Rejeitar orçamento

### Filiais
- `GET /api/filiais` - Listar filiais
- `POST /api/filiais` - Criar filial
- `PUT /api/filiais/:id` - Atualizar filial
- `DELETE /api/filiais/:id` - Deletar filial

### Dashboard
- `GET /api/dashboard/stats` - Estatísticas gerais
- `GET /api/dashboard/charts` - Dados para gráficos

## 🔧 Troubleshooting

### Problemas Comuns:

1. **Erro de conexão com banco**
   ```bash
   # Verificar se PostgreSQL está rodando
   sudo systemctl status postgresql
   
   # Reiniciar PostgreSQL
   sudo systemctl restart postgresql
   ```

2. **Erro de permissões**
   ```bash
   # Corrigir permissões
   sudo chown -R $USER:$USER /var/www/sistema-orcamentos
   chmod -R 755 /var/www/sistema-orcamentos
   ```

3. **Porta já em uso**
   ```bash
   # Verificar processos na porta
   sudo lsof -i :5000
   sudo lsof -i :3000
   
   # Matar processo se necessário
   sudo kill -9 <PID>
   ```

4. **Erro de dependências**
   ```bash
   # Limpar cache e reinstalar
   rm -rf node_modules package-lock.json yarn.lock
   yarn install
   ```

5. **Erro de build**
   ```bash
   # Limpar cache do TypeScript
   rm -rf dist/
   yarn build
   ```

### Logs e Debug:

```bash
# Ver logs do backend
cd backend
yarn dev

# Ver logs do frontend
cd frontend
yarn start

# Verificar status dos serviços
sudo systemctl status postgresql
```

## 📝 Notas Importantes

1. **Segurança**: Sempre altere as senhas padrão e chaves JWT em produção
2. **Backup**: Configure backup regular do banco PostgreSQL
3. **Monitoramento**: Configure logs e monitoramento para produção
4. **SSL**: Use HTTPS em produção com certificados válidos
5. **Rate Limiting**: Ajuste os limites conforme a necessidade da aplicação

## 🤝 Suporte

Para suporte técnico ou dúvidas sobre o projeto, entre em contato com a equipe de desenvolvimento.

---

**Versão**: 1.0.0  
**Última atualização**: Dezembro 2024  
**Compatibilidade**: Node.js 18+, PostgreSQL 14+, Ubuntu 22.04+ 