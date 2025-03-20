# Job Coach AI Assistant - Quick Start Guide

This guide will help you get the Job Coach AI Assistant prototype up and running on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.9+** - For the backend API
- **Node.js 18+** - For the React frontend
- **Azure Account** - To access Azure AI services
- **Azure CLI** - For resource creation and management

## Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd job-coach-ai-assistant
```

### 2. Set Up Backend

Navigate to the backend directory and create a virtual environment:

```bash
cd backend
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Set Up Frontend

Navigate to the frontend directory and install dependencies:

```bash
cd ../frontend
npm install
```

### 4. Configure Azure Resources

For a complete experience, you'll need to set up the following Azure resources:

- **Azure AD B2C** - For authentication
- **Azure AI Document Intelligence** - For document processing
- **Azure OpenAI Service** - For the AI assistant
- **Azure Blob Storage** - For storing documents
- **Azure Cosmos DB** - For storing extracted data

You can use the Azure Portal or the following Azure CLI commands to create these resources:

```bash
# Create a resource group
az group create --name job-coach-ai-rg --location eastus

# Create Azure Document Intelligence (Form Recognizer)
az cognitiveservices account create --name job-coach-doc-intel \
    --resource-group job-coach-ai-rg \
    --kind FormRecognizer \
    --sku S0 \
    --location eastus

# Create Azure OpenAI Service
az cognitiveservices account create --name job-coach-openai \
    --resource-group job-coach-ai-rg \
    --kind OpenAI \
    --sku S0 \
    --location eastus

# Deploy a model in Azure OpenAI
az cognitiveservices account deployment create \
    --name job-coach-openai \
    --resource-group job-coach-ai-rg \
    --deployment-name gpt-4 \
    --model-name gpt-4 \
    --model-version "1" \
    --model-format OpenAI \
    --scale-settings-scale-type Standard

# Create Azure Storage Account
az storage account create \
    --name jobcoachdocs \
    --resource-group job-coach-ai-rg \
    --location eastus \
    --sku Standard_LRS

# Create Blob Container
az storage container create \
    --name documents \
    --account-name jobcoachdocs

# Create Azure Cosmos DB
az cosmosdb create \
    --name job-coach-db \
    --resource-group job-coach-ai-rg

# Create Cosmos DB Database
az cosmosdb sql database create \
    --account-name job-coach-db \
    --resource-group job-coach-ai-rg \
    --name job-coach-assistant

# Create Cosmos DB Container
az cosmosdb sql container create \
    --account-name job-coach-db \
    --resource-group job-coach-ai-rg \
    --database-name job-coach-assistant \
    --name documents \
    --partition-key-path "/client_id"
```

### 5. Configure Environment Variables

Copy the `.env` file and update it with your Azure resource credentials:

```bash
cp .env.example .env
```

Edit the `.env` file with your Azure resource credentials and configuration values.

### 6. Run the Application

Start the backend server:

```bash
cd backend
uvicorn main:app --reload
```

In a new terminal, start the frontend development server:

```bash
cd frontend
npm start
```

The application should now be running at [http://localhost:3000](http://localhost:3000).

## Demo Mode

This prototype includes a demo mode that simulates Azure services using mock data. To use demo mode:

1. Leave the Azure credential fields empty in the `.env` file
2. The application will automatically detect missing credentials and operate in demo mode
3. You can test all features with simulated responses

## Key Features

- **Document Processing** - Upload and process I-9 forms, Schedule A letters, tax forms, and job applications
- **AI Assistant** - Get guidance on form completion, job coaching strategies, and client support
- **Report Generation** - Create reports for different stakeholders (government, employers, clients)
- **Client Management** - Track client information and documents

## Getting Help

If you encounter any issues or have questions, please:

1. Check the comprehensive documentation in the `docs` directory
2. File an issue on the project repository
3. Contact the development team at [example@example.com](mailto:example@example.com)

## Contributing

We welcome contributions to improve the Job Coach AI Assistant! See our [CONTRIBUTING.md](CONTRIBUTING.md) file for guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 