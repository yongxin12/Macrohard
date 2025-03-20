# Job Coach AI Assistant - Azure Integration Guide

This guide provides instructions for integrating the Job Coach AI Assistant with Azure services for production use.

## Azure Services Used

The Job Coach AI Assistant integrates with the following Azure services:

1. **Azure AI Document Intelligence** - For processing and extracting information from documents
2. **Azure OpenAI** - For natural language processing and AI capabilities
3. **Azure Cosmos DB** - For data storage and retrieval
4. **Azure Blob Storage** - For document storage
5. **Azure AD B2C** (optional) - For authentication and authorization

## Prerequisites

- Azure subscription
- Azure CLI installed
- Access to Azure OpenAI (requires application approval)

## Azure Setup Options

### Option 1: Automated Setup (Recommended)

We provide a setup script that creates the necessary Azure resources and configures the application to use them.

```bash
# Run the setup script
./setup_azure.sh
```

The script will:
1. Create a resource group
2. Provision Azure Cosmos DB
3. Provision Azure Storage
4. Provision Azure Document Intelligence
5. Update your `.env` file with the necessary credentials

After running the script, you'll need to:
1. Manually provision Azure OpenAI (requires special access)
2. Update the OpenAI credentials in the `.env` file

### Option 2: Manual Setup

If you prefer to set up the resources manually or need more control over the configuration:

#### 1. Create a Resource Group

```bash
az group create --name JobCoachAI --location eastus
```

#### 2. Provision Azure Cosmos DB

```bash
# Create Cosmos DB account
az cosmosdb create --name jobcoachai-cosmos --resource-group JobCoachAI --kind GlobalDocumentDB

# Create database
az cosmosdb sql database create --account-name jobcoachai-cosmos --resource-group JobCoachAI --name jobcoachai
```

#### 3. Provision Azure Storage

```bash
# Create storage account
az storage account create --name jobcoachaist --resource-group JobCoachAI --location eastus --sku Standard_LRS

# Create container
az storage container create --name documents --account-name jobcoachaist
```

#### 4. Provision Azure Document Intelligence

```bash
az cognitiveservices account create --name jobcoachai-doc --resource-group JobCoachAI --kind FormRecognizer --sku S0 --location eastus
```

#### 5. Provision Azure OpenAI (Requires Special Access)

Azure OpenAI requires special access. Apply at https://aka.ms/oai/access.

After approval:
1. Create an Azure OpenAI resource in the Azure Portal
2. Deploy a model (e.g., GPT-4)
3. Note the endpoint, key, and deployment name

## Configuring the Application

Update the `.env` file in the `backend` directory with your Azure credentials:

```
# Demo mode flag - set to false to use Azure services
DEMO_MODE=false

# Azure Document Intelligence
AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
AZURE_DOCUMENT_INTELLIGENCE_KEY=your-key

# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_KEY=your-key
AZURE_OPENAI_DEPLOYMENT=your-deployment-name

# Azure Storage
AZURE_STORAGE_CONNECTION_STRING=your-connection-string
AZURE_STORAGE_CONTAINER_NAME=documents

# Azure Cosmos DB
AZURE_COSMOS_ENDPOINT=https://your-cosmosdb.documents.azure.com:443/
AZURE_COSMOS_KEY=your-key
AZURE_COSMOS_DATABASE_NAME=jobcoachai
```

## Installing Azure Package Dependencies

Install the necessary Azure packages:

```bash
cd backend
source venv/bin/activate
pip install azure-ai-formrecognizer azure-storage-blob azure-identity azure-cosmos
```

## Starting the Application with Azure Integration

1. Ensure `DEMO_MODE=false` in your `.env` file
2. Start the application as normal:
   ```bash
   ./start.sh
   ```

## Verifying Azure Integration

To verify that the application is using Azure services:

1. Process a document through the Document Processor
2. Check the Azure Portal to see the document in your Blob Storage
3. Check the Azure Portal to see the data in your Cosmos DB
4. Make a query to the AI Assistant to verify Azure OpenAI integration

## Troubleshooting

### Common Issues

#### Document Processing Fails

- Check the Document Intelligence endpoint and key in the `.env` file
- Ensure the service is properly provisioned and active
- Check the log for specific error messages

#### AI Assistant Doesn't Use Azure OpenAI

- Verify the OpenAI endpoint, key, and deployment name
- Ensure your deployment is operational
- Check the models available in your deployment

#### Data Not Being Stored

- Verify the Cosmos DB endpoint and key
- Check the connection string for Azure Blob Storage
- Ensure the container exists

### Debugging Tips

1. Set logging level to DEBUG in the backend to get more detailed logs
2. Test individual Azure services using the Azure Portal or CLI
3. Check the application logs for specific error messages

## Security Considerations

For production deployments, ensure:

1. Store secrets securely (consider Azure Key Vault)
2. Implement proper authentication and authorization
3. Use HTTPS for all connections
4. Implement proper data retention and privacy controls
5. Follow the principle of least privilege for all Azure resources

## Next Steps

After successful integration with Azure services, consider:

1. Setting up CI/CD pipelines for deployment
2. Implementing monitoring and alerting
3. Setting up backup and disaster recovery
4. Scaling the application for production loads

For more information, refer to the Azure documentation for each service. 