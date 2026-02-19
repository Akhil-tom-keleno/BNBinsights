#!/bin/bash

# Keleno App Deployment Script for AWS EC2
# Usage: ./scripts/deploy.sh [command]
# Commands: setup, build, start, stop, restart, logs, backup, update

set -e

APP_NAME="bnb-insights"
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

# Detect docker compose command (v1 vs v2)
DOCKER_COMPOSE="docker compose"
if ! docker compose version &>/dev/null 2>&1; then
    if command -v docker-compose &>/dev/null; then
        DOCKER_COMPOSE="docker-compose"
    else
        log_error "Neither 'docker compose' nor 'docker-compose' found!"
        exit 1
    fi
fi
log_info "Using: $DOCKER_COMPOSE"

# Build Docker images
build() {
    log_info "Building Docker images..."
    check_env
    $DOCKER_COMPOSE -f $COMPOSE_FILE build --no-cache
    log_info "Build complete!"
}

# Start services
start() {
    log_info "Starting services..."
    check_env
    $DOCKER_COMPOSE -f $COMPOSE_FILE up -d
    log_info "Services started!"
    log_info "Checking health..."
    sleep 10
    $DOCKER_COMPOSE -f $COMPOSE_FILE ps
}

# Start with nginx
start_with_nginx() {
    log_info "Starting services with Nginx..."
    check_env
    $DOCKER_COMPOSE -f $COMPOSE_FILE --profile with-nginx up -d
    log_info "Services started with Nginx!"
}

# Stop services
stop() {
    log_info "Stopping services..."
    $DOCKER_COMPOSE -f $COMPOSE_FILE down
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
    $DOCKER_COMPOSE -f $COMPOSE_FILE logs -f --tail=100
}

# Migrate database schema without resetting data
# Uses a temporary alpine+sqlite3 container to add missing columns directly
migrate_db() {
    log_info "Running database schema migration on the persistent volume..."

    VOLUME_NAME=$(docker volume ls --format "{{.Name}}" | grep db_data | head -1)
    if [ -z "$VOLUME_NAME" ]; then
        log_error "Database volume not found! Is the app running?"
        exit 1
    fi
    log_info "Using volume: $VOLUME_NAME"

    DB_FILE="/data/bnbinsights.db"

    # Build the SQL: use ALTER TABLE ... ADD COLUMN IF NOT EXISTS is not supported
    # in older SQLite, so we attempt each and ignore errors
    MIGRATION_SQL="
ALTER TABLE reviews ADD COLUMN email TEXT;
ALTER TABLE reviews ADD COLUMN is_verified_owner INTEGER DEFAULT 0;
ALTER TABLE reviews ADD COLUMN booking_performance INTEGER;
ALTER TABLE reviews ADD COLUMN property_care INTEGER;
ALTER TABLE reviews ADD COLUMN guest_satisfaction INTEGER;
ALTER TABLE reviews ADD COLUMN communication INTEGER;
ALTER TABLE reviews ADD COLUMN financial_transparency INTEGER;
ALTER TABLE reviews ADD COLUMN would_recommend INTEGER DEFAULT 0;
ALTER TABLE reviews ADD COLUMN property_address TEXT;
ALTER TABLE reviews ADD COLUMN stay_duration TEXT;
ALTER TABLE reviews ADD COLUMN status TEXT DEFAULT 'pending';
ALTER TABLE reviews ADD COLUMN manager_response TEXT;
ALTER TABLE reviews ADD COLUMN manager_responded_at DATETIME;
ALTER TABLE reviews ADD COLUMN is_flagged INTEGER DEFAULT 0;
ALTER TABLE reviews ADD COLUMN flag_reason TEXT;
ALTER TABLE reviews ADD COLUMN edited_at DATETIME;
ALTER TABLE reviews ADD COLUMN original_comment TEXT;
"

    log_info "Applying migrations (errors for already-existing columns are safe to ignore)..."
    docker run --rm \
        -v "$VOLUME_NAME:/data" \
        alpine \
        sh -c "apk add -q sqlite && printf '%s' \"$MIGRATION_SQL\" | sqlite3 $DB_FILE 2>&1" \
        | (grep -v "duplicate column name" || true)

    log_info "Migration SQL applied. Verifying status column..."
    HAS_STATUS=$(docker run --rm \
        -v "$VOLUME_NAME:/data" \
        alpine \
        sh -c "apk add -q sqlite && sqlite3 $DB_FILE 'PRAGMA table_info(reviews);'" \
        2>/dev/null | grep -w "status" | wc -l)

    if [ "$HAS_STATUS" -gt 0 ]; then
        log_info "✓ 'status' column confirmed present in reviews table."
    else
        log_error "✗ 'status' column still missing! Manual intervention required."
        exit 1
    fi

    log_info "Restarting app to pick up schema changes..."
    $DOCKER_COMPOSE -f $COMPOSE_FILE restart app
    sleep 5
    $DOCKER_COMPOSE -f $COMPOSE_FILE logs app --tail 10
    log_info "Migration complete!"
}

# Backup database
backup() {
    log_info "Creating database backup..."
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/bnbinsights_$TIMESTAMP.db"
    mkdir -p $BACKUP_DIR

    # Get the actual volume name (it depends on directory name)
    VOLUME_NAME=$(docker volume ls --format "{{.Name}}" | grep db_data | head -1)
    
    if [ -z "$VOLUME_NAME" ]; then
        log_error "Database volume not found!"
        log_warn "Skipping backup..."
        return 0
    fi
    
    log_info "Using volume: $VOLUME_NAME"
    
    # Copy database from Docker volume
    docker run --rm \
        -v $VOLUME_NAME:/data \
        -v $(pwd)/$BACKUP_DIR:/backup \
        alpine \
        cp /data/bnbinsights.db /backup/bnbinsights_$TIMESTAMP.db 2>/dev/null || {
            log_warn "Database file not found in volume, skipping backup..."
            return 0
        }
    
    log_info "Backup created: $BACKUP_FILE"
    
    # Keep only last 7 backups
    ls -t $BACKUP_DIR/bnbinsights_*.db 2>/dev/null | tail -n +8 | xargs -r rm
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
    $DOCKER_COMPOSE -f $COMPOSE_FILE ps
    echo ""
    log_info "Container Resources:"
    docker stats --no-stream $($DOCKER_COMPOSE -f $COMPOSE_FILE ps -q) 2>/dev/null || true
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
    echo "  migrate-db     - Add missing DB columns without losing data"
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
    migrate-db)
        migrate_db
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
