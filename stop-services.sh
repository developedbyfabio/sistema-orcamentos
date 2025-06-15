#!/bin/bash

# Script para parar o Sistema de Orçamentos
# Autor: Sistema de Orçamentos
# Data: Dezembro 2024

echo "🛑 Parando Sistema de Orçamentos..."

# Função para parar PM2
stop_pm2() {
    echo "🔄 Parando serviços PM2..."
    pm2 stop all 2>/dev/null
    pm2 delete all 2>/dev/null
    echo "✅ Serviços PM2 parados!"
}

# Função para parar nohup
stop_nohup() {
    echo "🔄 Parando processos nohup..."
    
    # Parar backend
    if [ -f backend.pid ]; then
        BACKEND_PID=$(cat backend.pid)
        if kill -0 $BACKEND_PID 2>/dev/null; then
            kill $BACKEND_PID
            echo "✅ Backend parado (PID: $BACKEND_PID)"
        fi
        rm -f backend.pid
    fi
    
    # Parar frontend
    if [ -f frontend.pid ]; then
        FRONTEND_PID=$(cat frontend.pid)
        if kill -0 $FRONTEND_PID 2>/dev/null; then
            kill $FRONTEND_PID
            echo "✅ Frontend parado (PID: $FRONTEND_PID)"
        fi
        rm -f frontend.pid
    fi
    
    # Matar processos por nome (fallback)
    pkill -f "node.*server.js" 2>/dev/null
    pkill -f "serve.*build" 2>/dev/null
    
    echo "✅ Processos nohup parados!"
}

# Função para parar systemd
stop_systemd() {
    echo "🔄 Parando serviços systemd..."
    sudo systemctl stop orcamentos-backend 2>/dev/null
    sudo systemctl stop orcamentos-frontend 2>/dev/null
    echo "✅ Serviços systemd parados!"
}

# Função para parar tudo
stop_all() {
    echo "🔄 Parando todos os serviços..."
    stop_pm2
    stop_nohup
    stop_systemd
    echo "✅ Todos os serviços parados!"
}

# Menu principal
show_menu() {
    echo ""
    echo "🎯 Escolha o que parar:"
    echo "1) PM2"
    echo "2) nohup"
    echo "3) systemd"
    echo "4) Todos (Recomendado)"
    echo "5) Sair"
    echo ""
    read -p "Digite sua escolha (1-5): " choice
}

# Execução principal
main() {
    show_menu
    
    case $choice in
        1)
            stop_pm2
            ;;
        2)
            stop_nohup
            ;;
        3)
            stop_systemd
            ;;
        4)
            stop_all
            ;;
        5)
            echo "👋 Saindo..."
            exit 0
            ;;
        *)
            echo "❌ Opção inválida!"
            exit 1
            ;;
    esac
    
    echo ""
    echo "✅ Sistema parado com sucesso!"
    echo ""
}

# Executar script
main 