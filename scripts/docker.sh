#!/bin/bash

# Docker helper script for auth-service

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  dev         Start development environment"
    echo "  prod        Start production environment"
    echo "  stop        Stop all services"
    echo "  logs        Show logs for all services"
    echo "  logs-dev    Show logs for development services"
    echo "  logs-prod   Show logs for production services"
    echo "  clean       Clean up containers, networks, and volumes"
    echo "  reset       Reset everything and start fresh"
    echo "  status      Show status of all services"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev      # Start development environment"
    echo "  $0 prod     # Start production environment"
    echo "  $0 logs     # Show logs for all services"
}

# Function to start development environment
start_dev() {
    print_status "Starting development environment..."
    docker-compose -f docker-compose.dev.yml up --build -d
    print_success "Development environment started!"
    print_status "Services available at:"
    echo "  - Auth Service: http://localhost:3000"
    echo "  - GraphQL Playground: http://localhost:3000/graphql"
    echo "  - Health Check: http://localhost:3000/health"
    echo "  - MongoDB Express: http://localhost:8081 (admin/password123)"
}

# Function to start production environment
start_prod() {
    print_status "Starting production environment..."
    docker-compose up --build -d
    print_success "Production environment started!"
    print_status "Services available at:"
    echo "  - Auth Service: http://localhost:3000"
    echo "  - GraphQL Playground: http://localhost:3000/graphql"
    echo "  - Health Check: http://localhost:3000/health"
    echo "  - MongoDB Express: http://localhost:8081 (admin/password123)"
}

# Function to stop all services
stop_services() {
    print_status "Stopping all services..."
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    print_success "All services stopped!"
}

# Function to show logs
show_logs() {
    print_status "Showing logs for all services..."
    docker-compose logs -f
}

# Function to show development logs
show_dev_logs() {
    print_status "Showing logs for development services..."
    docker-compose -f docker-compose.dev.yml logs -f
}

# Function to show production logs
show_prod_logs() {
    print_status "Showing logs for production services..."
    docker-compose logs -f
}

# Function to show status
show_status() {
    print_status "Production services status:"
    docker-compose ps
    echo ""
    print_status "Development services status:"
    docker-compose -f docker-compose.dev.yml ps
}

# Function to clean up
clean_up() {
    print_warning "This will remove all containers, networks, and volumes. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Cleaning up..."
        docker-compose down -v --remove-orphans
        docker-compose -f docker-compose.dev.yml down -v --remove-orphans
        docker system prune -f
        print_success "Cleanup completed!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Function to reset everything
reset_all() {
    print_warning "This will reset everything and start fresh. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Resetting everything..."
        docker-compose down -v --remove-orphans --rmi all
        docker-compose -f docker-compose.dev.yml down -v --remove-orphans --rmi all
        docker system prune -af
        print_success "Reset completed!"
        print_status "You can now run '$0 dev' or '$0 prod' to start fresh."
    else
        print_status "Reset cancelled."
    fi
}

# Main script logic
main() {
    check_docker
    
    case "${1:-help}" in
        dev)
            start_dev
            ;;
        prod)
            start_prod
            ;;
        stop)
            stop_services
            ;;
        logs)
            show_logs
            ;;
        logs-dev)
            show_dev_logs
            ;;
        logs-prod)
            show_prod_logs
            ;;
        status)
            show_status
            ;;
        clean)
            clean_up
            ;;
        reset)
            reset_all
            ;;
        help|--help|-h)
            show_usage
            ;;
        *)
            print_error "Unknown command: $1"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
