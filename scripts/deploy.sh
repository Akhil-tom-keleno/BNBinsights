#!/bin/bash

# Keleno App Deployment Script for AWS EC2
# Usage: ./scripts/deploy.sh [command]
# Commands: setup, build, start, stop, restart, logs, backup, update

set -e

APP_NAME="keleno-app"
COMPOSE_FILE="docker-compose.yml"
BACKUP_DIR="./backups"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
check_env() {
    if [ ! -f .env ]; then
        log_error ".env file not found!"
        log_info "Creating .env from .env.example..."
        cp .env.example .env
        log_warn "Please edit .env file with your production values before starting!"
        exit 1
    fi
}

# Initial EC2 setup
setup() {
    log_info "Setting up EC2 instance for deployment..."
    
    # Update system
    sudo apt-get update && sudo apt-get upgrade -y
    
    # Install Docker
    if ! command -v docker &> /dev/null; then
        log_info "Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        rm get-docker.sh
        log_warn "Please log out and back in for Docker group changes to take effect"
    else
        log_info "Docker already installed"
    fi
    
    # Install Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_info "Installing Docker Compose..."
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    else
        log_info "Docker Compose already installed"
    fi
    
    # Create backup directory
    mkdir -p $BACKUP_DIR
    
    log_info "Setup complete!"
}

# Build Docker images
build() {
    log_info "Building Docker images..."
    check_env
    docker-compose -f $COMPOSE_FILE build --no-cache
    log_info "Build complete!"
}

# Start services
start() {
    log_info "Starting services..."
    check_env
    docker-compose -f $COMPOSE_FILE up -d
    log_info "Services started!"
    log_info "Checking health..."
    sleep 10
    docker-compose -f $COMPOSE_FILE ps
}

# Start with nginx
start_with_nginx() {
    log_info "Starting services with Nginx..."
    check_env
    docker-compose -f $COMPOSE_FILE --profile with-nginx up -d
    log_info "Services started with Nginx!"
}

# Stop services
stop() {
    log_info "Stopping services..."
    docker-compose -f $COMPOSE_FILE down
    log_info "Services stopped!"
}

# Restart services
restart() {
    log_info "Restarting services..."
    stop
    start
}

# View logs
logs() {
    docker-compose -f $COMPOSE_FILE logs -f --tail=100
}

# Backup database
backup() {
    log_info "Creating database backup..."
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/bnbinsights_$TIMESTAMP.db"
    
    # Copy database from Docker volume
    docker run --rm \
        -v keleno-app_db_data:/data \
        -v $(pwd)/$BACKUP_DIR:/backup \
        alpine \
        cp /data/bnbinsights.db /backup/bnbinsights_$TIMESTAMP.db
    
    log_info "Backup created: $BACKUP_FILE"
    
    # Keep only last 7 backups
    ls -t $BACKUP_DIR/bnbinsights_*.db | tail -n +8 | xargs -r rm
    log_info "Old backups cleaned up (keeping last 7)"
}

# Update application (pull latest, rebuild, restart)
update() {
    log_info "Updating application..."
    
    # Backup before update
    backup
    
    # Pull latest code
    git pull origin main
    
    # Rebuild and restart
    build
    restart
    
    log_info "Update complete!"
}

# Show status
status() {
    log_info "Service Status:"
    docker-compose -f $COMPOSE_FILE ps
    echo ""
    log_info "Container Resources:"
    docker stats --no-stream $(docker-compose -f $COMPOSE_FILE ps -q) 2>/dev/null || true
}

# Show help
help() {
    echo "Keleno App Deployment Script"
    echo ""
    echo "Usage: ./scripts/deploy.sh [command]"
    echo ""
    echo "Commands:"
    echo "  setup          - Initial EC2 setup (install Docker, etc.)"
    echo "  build          - Build Docker images"
    echo "  start          - Start services (app only)"
    echo "  start-nginx    - Start services with Nginx reverse proxy"
    echo "  stop           - Stop all services"
    echo "  restart        - Restart all services"
    echo "  logs           - View service logs"
    echo "  backup         - Backup SQLite database"
    echo "  update         - Pull latest code and redeploy"
    echo "  status         - Show service status"
    echo "  help           - Show this help message"
}

# Main command handler
case "${1:-help}" in
    setup)
        setup
        ;;
    build)
        build
        ;;
    start)
        start
        ;;
    start-nginx)
        start_with_nginx
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    logs)
        logs
        ;;
    backup)
        backup
        ;;
    update)
        update
        ;;
    status)
        status
        ;;
    help|*)
        help
        ;;
esac
