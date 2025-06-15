#!/bin/bash

# Script para iniciar o Sistema de Orçamentos em segundo plano
# Autor: Sistema de Orçamentos
# Data: Dezembro 2024

echo "🚀 Iniciando Sistema de Orçamentos..."

# Criar diretórios de logs se não existirem
mkdir -p backend/logs
mkdir -p frontend/logs

# Função para verificar se o PM2 está instalado
check_pm2() {
    if ! command -v pm2 &> /dev/null; then
        echo "❌ PM2 não está instalado. Instalando..."
        npm install -g pm2
    fi
}

# Função para verificar se o serve está instalado
check_serve() {
    if ! command -v serve &> /dev/null; then
        echo "📦 Instalando serve para o frontend..."
        npm install -g serve
    fi
}

# Função para build do projeto
build_project() {
    echo "🔨 Fazendo build do projeto..."
    
    # Build do backend
    echo "📦 Build do Backend..."
    cd backend
    yarn build
    cd ..
    
    # Build do frontend
    echo "📦 Build do Frontend..."
    cd frontend
    yarn build
    cd ..
    
    echo "✅ Build concluído!"
}

# Função para iniciar com PM2 (Recomendado)
start_with_pm2() {
    echo "🔄 Iniciando com PM2..."
    
    # Parar processos existentes
    pm2 stop all 2>/dev/null
    pm2 delete all 2>/dev/null
    
    # Iniciar com PM2
    pm2 start ecosystem.config.js --env production
    
    # Salvar configuração do PM2
    pm2 save
    
    # Configurar para iniciar com o sistema
    pm2 startup
    
    echo "✅ Serviços iniciados com PM2!"
    echo "📊 Status: pm2 status"
    echo "📋 Logs: pm2 logs"
    echo "🛑 Parar: pm2 stop all"
}

# Função para iniciar com nohup (Alternativo)
start_with_nohup() {
    echo "🔄 Iniciando com nohup..."
    
    # Parar processos existentes
    pkill -f "node.*server.js" 2>/dev/null
    pkill -f "serve.*build" 2>/dev/null
    
    # Iniciar backend
    cd backend
    nohup node dist/server.js > logs/server.log 2>&1 &
    BACKEND_PID=$!
    echo "✅ Backend iniciado (PID: $BACKEND_PID)"
    cd ..
    
    # Iniciar frontend
    cd frontend
    nohup npx serve -s build -l 3000 > logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo "✅ Frontend iniciado (PID: $FRONTEND_PID)"
    cd ..
    
    # Salvar PIDs
    echo $BACKEND_PID > backend.pid
    echo $FRONTEND_PID > frontend.pid
    
    echo "✅ Serviços iniciados com nohup!"
    echo "📋 Logs: tail -f backend/logs/server.log ou tail -f frontend/logs/frontend.log"
    echo "🛑 Parar: ./stop-services.sh"
}

# Função para iniciar com systemd (Para produção)
start_with_systemd() {
    echo "🔄 Configurando systemd..."
    
    # Criar arquivo de serviço do backend
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

    # Criar arquivo de serviço do frontend
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

    # Recarregar systemd e habilitar serviços
    sudo systemctl daemon-reload
    sudo systemctl enable orcamentos-backend
    sudo systemctl enable orcamentos-frontend
    sudo systemctl start orcamentos-backend
    sudo systemctl start orcamentos-frontend
    
    echo "✅ Serviços configurados com systemd!"
    echo "📊 Status: sudo systemctl status orcamentos-backend orcamentos-frontend"
    echo "🛑 Parar: sudo systemctl stop orcamentos-backend orcamentos-frontend"
}

# Menu principal
show_menu() {
    echo ""
    echo "🎯 Escolha o método de inicialização:"
    echo "1) PM2 (Recomendado - Gerenciamento avançado)"
    echo "2) nohup (Simples - Segundo plano)"
    echo "3) systemd (Produção - Inicia com o sistema)"
    echo "4) Sair"
    echo ""
    read -p "Digite sua escolha (1-4): " choice
}

# Execução principal
main() {
    echo "🔍 Verificando dependências..."
    check_pm2
    check_serve
    
    echo "🔨 Fazendo build do projeto..."
    build_project
    
    show_menu
    
    case $choice in
        1)
            start_with_pm2
            ;;
        2)
            start_with_nohup
            ;;
        3)
            start_with_systemd
            ;;
        4)
            echo "👋 Saindo..."
            exit 0
            ;;
        *)
            echo "❌ Opção inválida!"
            exit 1
            ;;
    esac
    
    echo ""
    echo "🌐 Acesse:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend:  http://localhost:5000/api/health"
    echo ""
}

# Executar script
main 