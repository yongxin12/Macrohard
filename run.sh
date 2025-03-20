#!/bin/bash

# Script to run the Job Coach AI Assistant in different modes

show_help() {
    echo "Usage: ./run.sh [OPTIONS]"
    echo "Run the Job Coach AI Assistant with different configurations."
    echo ""
    echo "Options:"
    echo "  -d, --demo        Run in demo mode (default)"
    echo "  -a, --azure       Run with Azure services"
    echo "  -b, --build       Force rebuild of containers"
    echo "  -s, --stop        Stop all containers"
    echo "  -h, --help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./run.sh -d       # Run in demo mode"
    echo "  ./run.sh -a       # Run with Azure services"
    echo "  ./run.sh -a -b    # Rebuild and run with Azure services"
    echo "  ./run.sh -s       # Stop all running containers"
}

# Default values
MODE="demo"
BUILD=false
STOP=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--demo)
            MODE="demo"
            shift
            ;;
        -a|--azure)
            MODE="azure"
            shift
            ;;
        -b|--build)
            BUILD=true
            shift
            ;;
        -s|--stop)
            STOP=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Stop containers if requested
if $STOP; then
    echo "Stopping all containers..."
    docker-compose down
    exit 0
fi

# Check for environment files
if [ "$MODE" = "demo" ]; then
    if [ ! -f .env.demo ]; then
        echo "Error: .env.demo file not found."
        echo "Creating default .env.demo file..."
        cat > .env.demo << EOL
# Demo Mode Environment Variables
# No real Azure credentials needed

# Application mode
DEMO_MODE=true

# Backend settings
BACKEND_PORT=8000

# Frontend settings
REACT_APP_API_URL=http://localhost:8000
REACT_APP_DEMO_MODE=true
EOL
        echo ".env.demo file created."
    fi
else
    if [ ! -f .env.azure ]; then
        echo "Error: .env.azure file not found. Please create this file with your Azure credentials."
        echo "You can copy .env.azure.example and modify it with your Azure settings."
        echo ""
        echo "cp .env.azure.example .env.azure"
        echo "nano .env.azure  # edit with your credentials"
        exit 1
    fi
fi

# Run the appropriate docker-compose command
if [ "$MODE" = "demo" ]; then
    echo "Starting in DEMO mode..."
    if $BUILD; then
        docker-compose up -d --build
    else
        docker-compose up -d
    fi
    echo "Services started. Access the application at:"
    echo "  - Frontend: http://localhost:3000"
    echo "  - Backend API: http://localhost:8000"
else
    echo "Starting with AZURE services..."
    if $BUILD; then
        docker-compose -f docker-compose.azure.yml up -d --build
    else
        docker-compose -f docker-compose.azure.yml up -d
    fi
    echo "Services started with Azure integration. Access the application at:"
    echo "  - Frontend: http://localhost:3000"
    echo "  - Backend API: http://localhost:8000"
fi 