# Job Coach AI Assistant - Development Guide

This document provides instructions for setting up and running the Job Coach AI Assistant project for development purposes.

## Prerequisites

- Python 3.8 or higher
- Node.js 16+ (Node.js 18 is recommended for best compatibility)
- npm or yarn
- Git

## Project Structure

```
Job Coach AI Assistant/
├── backend/                # Python FastAPI backend
│   ├── api/                # API endpoint implementations
│   ├── models/             # Data models
│   ├── services/           # Service implementations
│   ├── temp/               # Temporary storage for uploads
│   ├── venv/               # Python virtual environment
│   ├── .env                # Environment variables
│   ├── main.py             # Main application entry point
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── public/             # Static assets
│   ├── src/                # Source code
│   ├── package.json        # Node.js dependencies
│   └── demo.html           # Simplified HTML demo
└── docs/                   # Documentation
```

## Backend Setup

### 1. Create and activate a virtual environment

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

The backend uses a `.env` file to manage configuration. A sample file with demo mode settings is provided.

For integration with Azure services, you'll need to add your own Azure credentials:

```
# Azure Document Intelligence
AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=your-endpoint
AZURE_DOCUMENT_INTELLIGENCE_KEY=your-key

# Azure OpenAI
AZURE_OPENAI_ENDPOINT=your-endpoint
AZURE_OPENAI_KEY=your-key
AZURE_OPENAI_DEPLOYMENT=your-deployment-name

# Azure Language Service
AZURE_LANGUAGE_ENDPOINT=your-endpoint
AZURE_LANGUAGE_KEY=your-key

# Azure Speech Service
AZURE_SPEECH_KEY=your-key
AZURE_SPEECH_REGION=your-region

# Azure Storage
AZURE_STORAGE_CONNECTION_STRING=your-connection-string
AZURE_STORAGE_CONTAINER_NAME=your-container-name

# Azure Cosmos DB
AZURE_COSMOS_ENDPOINT=your-endpoint
AZURE_COSMOS_KEY=your-key
AZURE_COSMOS_DATABASE_NAME=your-database
```

### 4. Run the backend server

```bash
# Make sure your virtual environment is activated
cd backend
python main.py
```

The backend server will start on port 8000 by default. You can access the API at http://localhost:8000.

## Frontend Setup

### Option 1: React Application (Work in Progress)

> Note: The React application has compatibility issues with Node.js v22. Node.js v16 or v18 is recommended.

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

### Option 2: Simplified HTML Demo

We've created a simplified HTML demo that can be used without complex React dependencies:

```bash
# Navigate to the frontend directory
cd frontend

# Start a simple HTTP server
python -m http.server 3000
```

Then open http://localhost:3000/demo.html in your browser.

## Running in Demo Mode

The application includes a demo mode that simulates Azure services using mock data. This is enabled by default.

To use demo mode:

1. Set `DEMO_MODE=true` in the backend `.env` file
2. Start the backend server
3. Start the frontend (either React or HTML demo)
4. Access the application in your browser

The demo mode provides pre-configured mock data for:
- Document processing
- AI assistant responses
- Client information
- Report generation

## Development Workflow

### Backend Development

1. Make changes to the Python code
2. The server will automatically reload due to `uvicorn` hot-reloading
3. Test your changes using the frontend or API tools like Postman/curl

### Frontend Development

For the React application:
1. Make changes to the React components
2. The development server will automatically reload

For the HTML demo:
1. Edit the HTML/CSS/JS in `demo.html`
2. Refresh your browser to see changes

## Testing

To run the backend tests:

```bash
cd backend
pytest
```

## API Documentation

When the backend server is running, API documentation is available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Deployment

For deployment to Azure, refer to the `DEPLOYMENT.md` document.

## Troubleshooting

### Node.js Version Issues

If you encounter errors related to Node.js compatibility:

1. Use Node Version Manager (nvm) to install Node.js v18:
   ```bash
   nvm install 18
   nvm use 18
   ```

2. For newer Node.js versions, try setting the OpenSSL legacy provider:
   ```bash
   export NODE_OPTIONS=--openssl-legacy-provider
   npm start
   ```

### Backend Connection Issues

If the frontend cannot connect to the backend:

1. Ensure the backend server is running on port 8000
2. Check that CORS is properly configured in `main.py`
3. Verify that API endpoints match what the frontend is calling

### Missing Dependencies

If you encounter errors about missing Python packages:

```bash
pip install -r requirements.txt
```

For npm packages:

```bash
npm install
``` 