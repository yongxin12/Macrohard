# Azure Services Setup Guide

This guide provides detailed instructions for setting up and configuring Azure services for the Macrohard application.

## Prerequisites

1. Azure Account
   - Create an [Azure account](https://azure.microsoft.com/free)
   - Set up a subscription
   - Install [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)

2. Required Azure Services
   - Azure OpenAI
   - Azure Document Intelligence
   - Azure Storage
   - Azure Cosmos DB

## Setting Up Azure Services

### 1. Azure OpenAI Setup

1. Create Azure OpenAI Resource:
   ```bash
   az group create --name macrohard-rg --location eastus
   az cognitiveservices account create --name macrohard-openai --resource-group macrohard-rg --kind OpenAI
   ```

2. Deploy a Model:
   - Go to Azure Portal → Your OpenAI Resource → Model Deployments
   - Deploy `gpt-35-turbo` or `gpt-4`
   - Note the deployment name exactly as shown

3. Get Credentials:
   ```bash
   az cognitiveservices account keys list --name macrohard-openai --resource-group macrohard-rg
   ```

### 2. Azure Document Intelligence Setup

1. Create Document Intelligence Resource:
   ```bash
   az cognitiveservices account create --name macrohard-docintel --resource-group macrohard-rg --kind FormRecognizer
   ```

2. Get Credentials:
   ```bash
   az cognitiveservices account keys list --name macrohard-docintel --resource-group macrohard-rg
   ```

### 3. Azure Storage Setup

1. Create Storage Account:
   ```bash
   az storage account create --name macrohardstorage --resource-group macrohard-rg --sku Standard_LRS
   ```

2. Create Container:
   ```bash
   az storage container create --name documents --account-name macrohardstorage
   ```

3. Get Connection String:
   ```bash
   az storage account show-connection-string --name macrohardstorage --resource-group macrohard-rg
   ```

### 4. Azure Cosmos DB Setup

1. Create Cosmos DB Account:
   ```bash
   az cosmosdb create --name macrohard-cosmos --resource-group macrohard-rg
   ```

2. Create Database:
   ```bash
   az cosmosdb sql database create --account-name macrohard-cosmos --resource-group macrohard-rg --name jobcoach
   ```

3. Get Credentials:
   ```bash
   az cosmosdb keys list --name macrohard-cosmos --resource-group macrohard-rg
   ```

## Environment Configuration

1. Create Azure Environment File:
   ```bash
   cp .env.azure.example .env.azure
   ```

2. Update `.env.azure` with your credentials:
   ```bash
   # Azure OpenAI
   AZURE_OPENAI_ENDPOINT=https://macrohard-openai.openai.azure.com/
   AZURE_OPENAI_KEY=your-key-here
   AZURE_OPENAI_DEPLOYMENT=your-deployment-name

   # Azure Document Intelligence
   AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=https://macrohard-docintel.cognitiveservices.azure.com/
   AZURE_DOCUMENT_INTELLIGENCE_KEY=your-key-here

   # Azure Storage
   AZURE_STORAGE_CONNECTION_STRING=your-connection-string
   AZURE_STORAGE_CONTAINER_NAME=documents

   # Azure Cosmos DB
   AZURE_COSMOS_ENDPOINT=https://macrohard-cosmos.documents.azure.com:443/
   AZURE_COSMOS_KEY=your-key-here
   AZURE_COSMOS_DATABASE_NAME=jobcoach
   ```

## Running with Azure Services

1. Start the application:
   ```bash
   ./run.sh -a
   ```

2. Verify Azure connectivity:
   ```bash
   curl http://localhost:8000/health
   ```

## Security Best Practices

1. **Credential Management**
   - Never commit `.env.azure` to version control
   - Use Azure Key Vault for production
   - Rotate keys regularly

2. **Access Control**
   - Use Managed Identities where possible
   - Implement least privilege access
   - Enable Azure Defender for Cloud

3. **Monitoring**
   - Set up Azure Monitor
   - Configure alerts
   - Enable logging

## Troubleshooting

### Common Issues

1. **Authentication Failures**
   - Verify credentials in `.env.azure`
   - Check Azure service status
   - Verify network connectivity

2. **Resource Not Found**
   - Confirm resource names
   - Check resource group
   - Verify deployment status

3. **Rate Limits**
   - Check service quotas
   - Implement retry logic
   - Consider upgrading tier

### Health Checks

1. Backend Health:
   ```bash
   curl http://localhost:8000/health
   ```

2. Azure Service Status:
   - Check Azure Portal → Service Health
   - Monitor Azure Monitor metrics
   - Review application logs

## Cost Management

1. **Resource Optimization**
   - Use appropriate service tiers
   - Implement auto-scaling
   - Monitor usage patterns

2. **Cost Control**
   - Set up budget alerts
   - Use Azure Cost Management
   - Review and optimize resources

3. **Development vs Production**
   - Use different resource groups
   - Implement cost tagging
   - Set up resource cleanup 