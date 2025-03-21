# Environment Setup Guide

This guide explains how to configure the Job Coach AI Assistant in different modes and environments.

## Table of Contents
1. [Environment Files Overview](#environment-files-overview)
2. [Quick Decision Guide](#quick-decision-guide)
3. [Demo Mode Setup](#demo-mode-setup)
4. [Local Development Setup](#local-development-setup)
5. [Docker Development Setup](#docker-development-setup)
6. [Azure Production Setup](#azure-production-setup)

## Environment Files Overview

The application uses several `.env` files for different purposes:

- `backend/.env`: Main configuration file for the backend service
- `.env`: Root-level configuration used by Docker and frontend
- `.env.azure`: Azure-specific configuration for production deployment

## Quick Decision Guide

Choose your setup based on your needs:

1. **First time user or testing?**
   - Use Demo Mode
   - No Azure credentials needed
   - Works with both Docker and local setup

2. **Developer working on the code?**
   - Use Local Development Setup
   - Requires Python and development tools
   - Can use either mock data or Azure services

3. **Want containerized environment?**
   - Use Docker Development Setup
   - Only requires Docker installed
   - Can use either mock data or Azure services

4. **Production deployment?**
   - Use Azure Production Setup
   - Requires all Azure credentials
   - Uses Docker Compose with Azure configuration

## Demo Mode Setup

Demo mode uses mock data and doesn't require Azure services.

1. Configure Environment:
   - In `backend/.env`:
     ```env
     DEMO_MODE=true
     BACKEND_PORT=8000
     ```
   - Other Azure-related variables can be left as placeholders

2. Choose how to run:

   A. **Using Docker (Recommended)**:
   ```bash
   # In project root directory
   docker compose up --build
   # Access at http://localhost:3000/demo.html
   ```

   B. **Local Development**:
   ```bash
   # Terminal 1 - Start Backend
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python app.py

   # Terminal 2 - Start Frontend
   cd frontend
   python -m http.server 3000
   # Access at http://localhost:3000/demo.html
   ```

## Local Development Setup

For local development with Azure services:

1. Configure Environment:
   - In `backend/.env`:
     ```env
     DEMO_MODE=false
     BACKEND_PORT=8000
     
     # Azure OpenAI Configuration
     AZURE_OPENAI_ENDPOINT=your-endpoint
     AZURE_OPENAI_KEY=your-key
     AZURE_OPENAI_DEPLOYMENT=your-deployment-name

     # Other Azure Services (if needed)
     AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=your-endpoint
     AZURE_DOCUMENT_INTELLIGENCE_KEY=your-key
     AZURE_STORAGE_CONNECTION_STRING=your-connection-string
     AZURE_COSMOS_ENDPOINT=your-endpoint
     AZURE_COSMOS_KEY=your-key
     ```

2. Setup Python Environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Start the Services:
   ```bash
   # Terminal 1 - Start Backend
   cd backend
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   python app.py

   # Terminal 2 - Start Frontend
   cd frontend
   python -m http.server 3000
   ```

4. Access the Application:
   - Frontend: http://localhost:3000/demo.html
   - Backend API: http://localhost:8000

## Docker Development Setup

For Docker with Azure services:

1. Configure Environment:
   - In `backend/.env`:
     ```env
     DEMO_MODE=false
     BACKEND_PORT=8000
     
     # Azure OpenAI Configuration
     AZURE_OPENAI_ENDPOINT=your-endpoint
     AZURE_OPENAI_KEY=your-key
     AZURE_OPENAI_DEPLOYMENT=your-deployment-name

     # Other Azure Services
     AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=your-endpoint
     AZURE_DOCUMENT_INTELLIGENCE_KEY=your-key
     AZURE_STORAGE_CONNECTION_STRING=your-connection-string
     AZURE_COSMOS_ENDPOINT=your-endpoint
     AZURE_COSMOS_KEY=your-key
     ```

2. Start with Docker:
   ```bash
   # In project root directory
   docker compose up --build
   ```

3. Access the Application:
   - Frontend: http://localhost:3000/demo.html
   - Backend API: http://localhost:8000

4. Common Docker Commands:
   ```bash
   # Stop the application
   docker compose down

   # View logs
   docker compose logs -f

   # Rebuild after changes
   docker compose up --build

   # Remove all containers and start fresh
   docker compose down --volumes --remove-orphans
   docker compose up --build
   ```

## Azure Production Setup

For production deployment with Azure:

1. Create `.env.azure` in the root directory:
   ```env
   DEMO_MODE=false
   BACKEND_PORT=8000
   
   # Azure OpenAI Configuration
   AZURE_OPENAI_ENDPOINT=your-endpoint
   AZURE_OPENAI_KEY=your-key
   AZURE_OPENAI_DEPLOYMENT=your-deployment-name

   # Other Azure Services
   AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=your-endpoint
   AZURE_DOCUMENT_INTELLIGENCE_KEY=your-key
   AZURE_STORAGE_CONNECTION_STRING=your-connection-string
   AZURE_COSMOS_ENDPOINT=your-endpoint
   AZURE_COSMOS_KEY=your-key
   ```

2. Deploy using Azure Docker Compose:
   ```bash
   docker compose -f docker-compose.azure.yml up --build
   ```

## Important Notes

1. **Environment Variables Priority**:
   - Docker uses variables from both `backend/.env` and root `.env`
   - Azure deployment uses `.env.azure`
   - Local development uses `backend/.env`

2. **Demo Mode**:
   - Set `DEMO_MODE=true` to use mock data
   - Set `DEMO_MODE=false` to use Azure services

3. **Frontend**:
   - The frontend is a static HTML file (`demo.html`)
   - No additional environment configuration needed for frontend
   - Access via `/demo.html` in all modes

4. **Security**:
   - Never commit real credentials to version control
   - Keep `.env` files in `.gitignore`
   - Use secure secrets management in production

## Troubleshooting

1. If Azure services aren't working:
   - Check `DEMO_MODE=false` in `backend/.env`
   - Verify Azure credentials are correct
   - Ensure all required environment variables are set

2. If Docker isn't using Azure:
   - Check both `backend/.env` and root `.env` files
   - Rebuild containers with `docker compose up --build`

3. Common Issues:
   - Missing environment variables
   - Incorrect Azure credentials
   - Wrong deployment names
   - Demo mode still enabled 