# 🚀 Guia de Produção - Sistema de Orçamentos

Este guia mostra como rodar o Sistema de Orçamentos em segundo plano, sem usar `yarn dev` e `yarn start`.

## 📋 Métodos Disponíveis

### 1. **PM2 (Recomendado)** ⭐
- Gerenciamento avançado de processos
- Monitoramento em tempo real
- Reinício automático
- Logs organizados
- Interface web para monitoramento

### 2. **nohup (Simples)**
- Rodar em segundo plano
- Logs em arquivos
- Controle via PIDs
- Ideal para testes

### 3. **systemd (Produção)**
- Serviços do sistema Linux
- Inicia automaticamente com o sistema
- Gerenciamento via systemctl
- Ideal para servidores de produção

## 🛠️ Instalação de Dependências

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Instalar serve para o frontend
npm install -g serve
```

## 🚀 Inicialização Automática

### Usando o Script Automático (Mais Fácil)

```bash
# Dar permissão de execução
chmod +x start-services.sh stop-services.sh

# Iniciar serviços
./start-services.sh

# Parar serviços
./stop-services.sh
```

O script oferece um menu interativo para escolher o método de inicialização.

## 📦 Método 1: PM2 (Recomendado)

### Inicialização Manual

```bash
# Build do projeto
cd backend && yarn build && cd ..
cd frontend && yarn build && cd ..

# Iniciar com PM2
pm2 start ecosystem.config.js --env production

# Ver status
pm2 status

# Ver logs
pm2 logs

# Parar todos
pm2 stop all

# Reiniciar
pm2 restart all
```

### Comandos PM2 Úteis

```bash
# Listar processos
pm2 list

# Monitorar em tempo real
pm2 monit

# Interface web (porta 9615)
pm2 plus

# Salvar configuração
pm2 save

# Configurar para iniciar com o sistema
pm2 startup

# Ver logs específicos
pm2 logs orcamentos-backend
pm2 logs orcamentos-frontend
```

### Scripts do Package.json

```bash
# Backend
cd backend
yarn start:pm2      # Iniciar
yarn stop:pm2       # Parar
yarn restart:pm2    # Reiniciar

# Frontend
cd frontend
yarn start:pm2      # Iniciar
yarn stop:pm2       # Parar
yarn restart:pm2    # Reiniciar
```

## 📦 Método 2: nohup (Simples)

### Inicialização Manual

```bash
# Build do projeto
cd backend && yarn build && cd ..
cd frontend && yarn build && cd ..

# Iniciar backend
cd backend
nohup node dist/server.js > logs/server.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../backend.pid
cd ..

# Iniciar frontend
cd frontend
nohup npx serve -s build -l 3000 > logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../frontend.pid
cd ..
```

### Scripts do Package.json

```bash
# Backend
cd backend
yarn start:background

# Frontend
cd frontend
yarn serve:background
```

### Controle de Processos

```bash
# Verificar PIDs
cat backend.pid
cat frontend.pid

# Parar processos
kill $(cat backend.pid)
kill $(cat frontend.pid)

# Ver logs
tail -f backend/logs/server.log
tail -f frontend/logs/frontend.log
```

## 📦 Método 3: systemd (Produção)

### Configuração Manual

```bash
# Criar serviço do backend
sudo tee /etc/systemd/system/orcamentos-backend.service > /dev/null <<EOF
[Unit]
Description=Sistema de Orçamentos Backend
After=network.target postgresql.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)/backend
ExecStart=/usr/bin/node dist/server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# Criar serviço do frontend
sudo tee /etc/systemd/system/orcamentos-frontend.service > /dev/null <<EOF
[Unit]
Description=Sistema de Orçamentos Frontend
After=network.target orcamentos-backend.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)/frontend
ExecStart=/usr/bin/npx serve -s build -l 3000
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# Habilitar e iniciar serviços
sudo systemctl daemon-reload
sudo systemctl enable orcamentos-backend
sudo systemctl enable orcamentos-frontend
sudo systemctl start orcamentos-backend
sudo systemctl start orcamentos-frontend
```

### Comandos systemd

```bash
# Ver status
sudo systemctl status orcamentos-backend
sudo systemctl status orcamentos-frontend

# Iniciar
sudo systemctl start orcamentos-backend
sudo systemctl start orcamentos-frontend

# Parar
sudo systemctl stop orcamentos-backend
sudo systemctl stop orcamentos-frontend

# Reiniciar
sudo systemctl restart orcamentos-backend
sudo systemctl restart orcamentos-frontend

# Ver logs
sudo journalctl -u orcamentos-backend -f
sudo journalctl -u orcamentos-frontend -f
```

## 🔧 Configuração de Logs

### PM2
- Logs automáticos em `backend/logs/` e `frontend/logs/`
- Rotação automática de logs
- Interface web para visualização

### nohup
- Logs salvos em arquivos específicos
- Controle manual de rotação

### systemd
- Logs integrados ao journald
- Comando `journalctl` para visualização

## 📊 Monitoramento

### PM2 Dashboard
```bash
# Interface web
pm2 plus

# Monitoramento via terminal
pm2 monit

# Status detalhado
pm2 show orcamentos-backend
pm2 show orcamentos-frontend
```

### Verificar Funcionamento
```bash
# Testar backend
curl http://localhost:5000/api/health

# Testar frontend
curl http://localhost:3000

# Verificar portas em uso
netstat -tlnp | grep -E ':(3000|5000)'
```

## 🛠️ Troubleshooting

### Problemas Comuns

1. **Porta já em uso**
   ```bash
   # Verificar processos
   sudo lsof -i :3000
   sudo lsof -i :5000
   
   # Matar processo
   sudo kill -9 <PID>
   ```

2. **Erro de permissões**
   ```bash
   # Corrigir permissões
   sudo chown -R $USER:$USER .
   chmod -R 755 .
   ```

3. **PM2 não inicia**
   ```bash
   # Limpar PM2
   pm2 kill
   pm2 start ecosystem.config.js
   ```

4. **systemd falha**
   ```bash
   # Verificar logs
   sudo journalctl -u orcamentos-backend -n 50
   sudo journalctl -u orcamentos-frontend -n 50
   
   # Recarregar
   sudo systemctl daemon-reload
   ```

### Comandos de Debug

```bash
# Verificar processos ativos
ps aux | grep -E "(node|serve)"

# Verificar portas
netstat -tlnp

# Verificar logs em tempo real
tail -f backend/logs/server.log
tail -f frontend/logs/frontend.log

# Verificar uso de memória
pm2 monit
```

## 📝 Recomendações

### Para Desenvolvimento
- Use **PM2** para facilidade de gerenciamento
- Mantenha logs organizados
- Use `pm2 monit` para monitoramento

### Para Produção
- Use **systemd** para integração com o sistema
- Configure backup de logs
- Monitore recursos (CPU, RAM, disco)
- Configure alertas

### Para Testes
- Use **nohup** para simplicidade
- Mantenha PIDs salvos para controle
- Use logs em arquivos para debug

## 🔄 Atualizações

### Atualizar Aplicação

```bash
# Parar serviços
./stop-services.sh

# Atualizar código
git pull

# Rebuild
cd backend && yarn build && cd ..
cd frontend && yarn build && cd ..

# Reiniciar serviços
./start-services.sh
```

### Atualizar PM2

```bash
# Parar
pm2 stop all

# Rebuild
cd backend && yarn build && cd ..
cd frontend && yarn build && cd ..

# Reiniciar
pm2 start ecosystem.config.js
```

---

**Nota**: Sempre teste em ambiente de desenvolvimento antes de aplicar em produção! 