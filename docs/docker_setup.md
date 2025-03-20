# Docker Setup Guide

This guide provides detailed instructions for running the Macrohard application using Docker.

## Prerequisites

1. Install Docker Desktop:
   - [Download Docker Desktop](https://www.docker.com/products/docker-desktop)
   - Follow the installation instructions for your operating system
   - Start Docker Desktop and ensure it's running

2. Verify Docker Installation:
   ```bash
   docker --version
   docker compose version
   ```

## Running the Application

### Quick Start with Demo Mode

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/Macrohard.git
   cd Macrohard
   ```

2. Make the run script executable:
   ```bash
   chmod +x run.sh
   ```

3. Start the application in demo mode:
   ```bash
   ./run.sh -d
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

### Running with Azure Services

1. Set up Azure credentials:
   ```bash
   cp .env.azure.example .env.azure
   # Edit .env.azure with your Azure credentials
   ```

2. Start the application with Azure services:
   ```bash
   ./run.sh -a
   ```

### Common Docker Commands

1. Stop all containers:
   ```bash
   ./run.sh -s
   # or
   docker compose down
   ```

2. Rebuild and restart containers:
   ```bash
   ./run.sh -d -b  # for demo mode
   ./run.sh -a -b  # for Azure mode
   ```

3. View container logs:
   ```bash
   docker compose logs -f
   ```

4. View specific service logs:
   ```bash
   docker compose logs -f backend
   docker compose logs -f frontend
   ```

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   - Ensure ports 3000 and 8000 are not in use
   - Check running containers: `docker ps`
   - Stop conflicting containers: `docker stop <container_id>`

2. **Container Won't Start**
   - Check logs: `docker compose logs`
   - Verify environment files exist
   - Ensure Docker Desktop is running

3. **Build Failures**
   - Clean Docker cache: `docker compose build --no-cache`
   - Check Docker logs: `docker compose logs build`

### Health Checks

1. Backend Health:
   ```bash
   curl http://localhost:8000/health
   ```

2. Frontend Health:
   - Open http://localhost:3000 in your browser
   - Check browser console for errors

## Development Workflow

### Making Changes

1. Stop containers:
   ```bash
   ./run.sh -s
   ```

2. Make your changes to the code

3. Rebuild and restart:
   ```bash
   ./run.sh -d -b  # for demo mode
   ./run.sh -a -b  # for Azure mode
   ```

### Debugging

1. View real-time logs:
   ```bash
   docker compose logs -f
   ```

2. Access container shell:
   ```bash
   docker compose exec backend bash
   docker compose exec frontend sh
   ```

3. Check container status:
   ```bash
   docker compose ps
   ```

## Best Practices

1. **Resource Management**
   - Stop unused containers: `./run.sh -s`
   - Clean up unused images: `docker image prune`
   - Monitor resource usage in Docker Desktop

2. **Development**
   - Use volume mounts for live code updates
   - Keep environment files secure
   - Use appropriate run modes for testing

3. **Production**
   - Use Azure mode with proper credentials
   - Implement proper logging
   - Set up monitoring and alerts 