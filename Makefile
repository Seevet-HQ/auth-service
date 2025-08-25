.PHONY: help dev prod stop logs clean reset build test install

# Default target
help:
	@echo "Available commands:"
	@echo "  make dev      - Start development environment"
	@echo "  make prod     - Start production environment"
	@echo "  make stop     - Stop all services"
	@echo "  make logs     - Show logs for all services"
	@echo "  make clean    - Clean up containers, networks, and volumes"
	@echo "  make reset    - Reset everything and start fresh"
	@echo "  make build    - Build the application"
	@echo "  make test     - Run tests"
	@echo "  make install  - Install dependencies"

# Development environment
dev:
	@echo "Starting development environment..."
	docker-compose -f docker-compose.dev.yml up --build -d
	@echo "Development environment started!"
	@echo "Services available at:"
	@echo "  - Auth Service: http://localhost:3000"
	@echo "  - GraphQL Playground: http://localhost:3000/graphql"
	@echo "  - Health Check: http://localhost:3000/health"
	@echo "  - MongoDB Express: http://localhost:8081 (admin/password123)"

# Production environment
prod:
	@echo "Starting production environment..."
	docker-compose up --build -d
	@echo "Production environment started!"
	@echo "Services available at:"
	@echo "  - Auth Service: http://localhost:3000"
	@echo "  - GraphQL Playground: http://localhost:3000/graphql"
	@echo "  - Health Check: http://localhost:3000/health"
	@echo "  - MongoDB Express: http://localhost:8081 (admin/password123)"

# Stop all services
stop:
	@echo "Stopping all services..."
	docker-compose down
	docker-compose -f docker-compose.dev.yml down
	@echo "All services stopped!"

# Show logs
logs:
	@echo "Showing logs for all services..."
	docker-compose logs -f

# Show development logs
logs-dev:
	@echo "Showing logs for development services..."
	docker-compose -f docker-compose.dev.yml logs -f

# Show production logs
logs-prod:
	@echo "Showing logs for production services..."
	docker-compose logs -f

# Clean up
clean:
	@echo "Cleaning up containers, networks, and volumes..."
	docker-compose down -v --remove-orphans
	docker-compose -f docker-compose.dev.yml down -v --remove-orphans
	docker system prune -f
	@echo "Cleanup completed!"

# Reset everything
reset:
	@echo "Resetting everything..."
	docker-compose down -v --remove-orphans --rmi all
	docker-compose -f docker-compose.dev.yml down -v --remove-orphans --rmi all
	docker system prune -af
	@echo "Reset completed!"

# Build the application
build:
	@echo "Building the application..."
	npm run build
	@echo "Build completed!"

# Run tests
test:
	@echo "Running tests..."
	npm run test
	@echo "Tests completed!"

# Install dependencies
install:
	@echo "Installing dependencies..."
	npm install --legacy-peer-deps
	@echo "Dependencies installed!"

# Show status
status:
	@echo "Production services status:"
	docker-compose ps
	@echo ""
	@echo "Development services status:"
	docker-compose -f docker-compose.dev.yml ps
