#!/bin/bash
set -e

# Default ACR server if not provided
export ACR_SERVER=${ACR_SERVER:-macrohardacr.azurecr.io}

echo "=== Macrohard Deployment from ACR ==="
echo "Using ACR Server: $ACR_SERVER"

# Verify that Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed. Please install Docker first."
    exit 1
fi

# Verify that Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Error: Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if we're already logged into ACR
LOGGED_IN=$(docker info 2>/dev/null | grep -c "Username:" || echo "0")
if [ "$LOGGED_IN" -eq "0" ]; then
    echo "You need to log in to ACR first."
    if [ -z "$ACR_USERNAME" ] || [ -z "$ACR_PASSWORD" ]; then
        echo "Please run the login script first:"
        echo "./acr-login.sh"
        exit 1
    else
        echo "Logging in to ACR using provided credentials..."
        docker login $ACR_SERVER -u $ACR_USERNAME -p $ACR_PASSWORD
    fi
fi

# Ensure ACR_SERVER is in .env file
if [ ! -f .env ]; then
    echo "Creating .env file..."
    echo "ACR_SERVER=$ACR_SERVER" > .env
else
    if ! grep -q "ACR_SERVER" .env; then
        echo "Adding ACR_SERVER to .env file..."
        echo "ACR_SERVER=$ACR_SERVER" >> .env
    fi
fi

# Pull latest images
echo "Pulling latest images from ACR..."
docker pull $ACR_SERVER/assistant-frontend:latest
docker pull $ACR_SERVER/assistant-backend:latest

# Check which compose file to use
COMPOSE_FILE="docker-compose.yml"
if [ "$1" == "azure" ]; then
    COMPOSE_FILE="docker-compose.azure.yml"
    echo "Using Azure-specific compose file: $COMPOSE_FILE"
fi

# Stop any existing containers
echo "Stopping any existing containers..."
docker-compose -f $COMPOSE_FILE down || true

# Start the application
echo "Starting the application..."
docker-compose -f $COMPOSE_FILE up -d

echo "Deployment complete! Services are starting up."

# Check if services are running correctly
echo "Checking service status..."
sleep 5  # Give containers a moment to start
BACKEND_RUNNING=$(docker-compose -f $COMPOSE_FILE ps | grep "backend" | grep -c "Up" || echo "0")
FRONTEND_RUNNING=$(docker-compose -f $COMPOSE_FILE ps | grep "frontend" | grep -c "Up" || echo "0")

if [ "$BACKEND_RUNNING" -eq "0" ] || [ "$FRONTEND_RUNNING" -eq "0" ]; then
    echo "WARNING: One or more services may not be running correctly."
    echo "Showing recent logs:"
    docker-compose -f $COMPOSE_FILE logs --tail=20
    echo ""
    echo "For more detailed logs, run: docker-compose -f $COMPOSE_FILE logs -f"
else
    echo "All services appear to be running."
    echo "To check logs, run: docker-compose -f $COMPOSE_FILE logs -f"
fi 