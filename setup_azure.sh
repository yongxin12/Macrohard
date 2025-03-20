#!/bin/bash
# Job Coach AI Assistant - Azure Setup Script

echo "======================================================="
echo "   Job Coach AI Assistant - Azure Services Setup       "
echo "======================================================="
echo
echo "This script will help you set up Azure services for the Job Coach AI Assistant."
echo "You will need an Azure subscription and the Azure CLI installed."
echo

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "Azure CLI is not installed. Please install it first."
    echo "Visit: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if logged in to Azure
echo "Checking Azure login status..."
az account show &> /dev/null
if [ $? -ne 0 ]; then
    echo "You are not logged in to Azure. Please log in."
    az login
    if [ $? -ne 0 ]; then
        echo "Login failed. Exiting."
        exit 1
    fi
fi

echo "You are logged in to Azure."
echo

# Select subscription
echo "Available subscriptions:"
az account list --output table
echo
echo "Please enter the subscription ID to use:"
read SUBSCRIPTION_ID
az account set --subscription $SUBSCRIPTION_ID

# Create resource group
echo "Creating a resource group for the Job Coach AI Assistant..."
echo "Please enter a resource group name:"
read RESOURCE_GROUP
echo "Please enter a location (e.g., eastus, westus2):"
read LOCATION

az group create --name $RESOURCE_GROUP --location $LOCATION
if [ $? -ne 0 ]; then
    echo "Resource group creation failed. Exiting."
    exit 1
fi

echo "Resource group created successfully!"
echo

# Create Cosmos DB account
echo "Creating Azure Cosmos DB account..."
COSMOS_ACCOUNT="jobcoachai-cosmos-$RANDOM"
az cosmosdb create --name $COSMOS_ACCOUNT --resource-group $RESOURCE_GROUP --kind GlobalDocumentDB --locations regionName=$LOCATION
if [ $? -ne 0 ]; then
    echo "Cosmos DB account creation failed. Continuing with other services."
else
    echo "Creating database..."
    az cosmosdb sql database create --account-name $COSMOS_ACCOUNT --resource-group $RESOURCE_GROUP --name jobcoachai
    echo "Cosmos DB account and database created successfully!"
    
    # Get Cosmos DB key
    COSMOS_KEY=$(az cosmosdb keys list --name $COSMOS_ACCOUNT --resource-group $RESOURCE_GROUP --query primaryMasterKey -o tsv)
    COSMOS_ENDPOINT=$(az cosmosdb show --name $COSMOS_ACCOUNT --resource-group $RESOURCE_GROUP --query documentEndpoint -o tsv)
fi
echo

# Create Storage account
echo "Creating Azure Storage account..."
STORAGE_ACCOUNT="jobcoachaist$RANDOM"
az storage account create --name $STORAGE_ACCOUNT --resource-group $RESOURCE_GROUP --location $LOCATION --sku Standard_LRS
if [ $? -ne 0 ]; then
    echo "Storage account creation failed. Continuing with other services."
else
    echo "Creating container..."
    STORAGE_KEY=$(az storage account keys list --account-name $STORAGE_ACCOUNT --resource-group $RESOURCE_GROUP --query [0].value -o tsv)
    az storage container create --name documents --account-name $STORAGE_ACCOUNT --account-key $STORAGE_KEY
    echo "Storage account and container created successfully!"
    
    # Get Storage connection string
    STORAGE_CONNECTION_STRING=$(az storage account show-connection-string --name $STORAGE_ACCOUNT --resource-group $RESOURCE_GROUP -o tsv)
fi
echo

# Create Document Intelligence service
echo "Creating Azure AI Document Intelligence service..."
DOC_INTELLIGENCE_NAME="jobcoachai-doc-$RANDOM"
az cognitiveservices account create --name $DOC_INTELLIGENCE_NAME --resource-group $RESOURCE_GROUP --kind FormRecognizer --sku S0 --location $LOCATION --yes
if [ $? -ne 0 ]; then
    echo "Document Intelligence service creation failed. Continuing with other services."
else
    echo "Document Intelligence service created successfully!"
    
    # Get Document Intelligence key and endpoint
    DOC_INTELLIGENCE_KEY=$(az cognitiveservices account keys list --name $DOC_INTELLIGENCE_NAME --resource-group $RESOURCE_GROUP --query key1 -o tsv)
    DOC_INTELLIGENCE_ENDPOINT=$(az cognitiveservices account show --name $DOC_INTELLIGENCE_NAME --resource-group $RESOURCE_GROUP --query properties.endpoint -o tsv)
fi
echo

echo "Note: Azure OpenAI requires special access. Please visit https://aka.ms/oai/access to apply."
echo

# Update .env file
echo "Updating .env file with Azure credentials..."
cat > backend/.env << EOF
# Job Coach AI Assistant - Environment Variables

# Backend settings
BACKEND_PORT=8000

# Security
SECRET_KEY=azure-integration-secret-key

# Demo mode flag
DEMO_MODE=false

# Azure Document Intelligence
AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=$DOC_INTELLIGENCE_ENDPOINT
AZURE_DOCUMENT_INTELLIGENCE_KEY=$DOC_INTELLIGENCE_KEY

# Azure OpenAI (you need to fill these out manually after provisioning the service)
AZURE_OPENAI_ENDPOINT=
AZURE_OPENAI_KEY=
AZURE_OPENAI_DEPLOYMENT=

# Azure Storage
AZURE_STORAGE_CONNECTION_STRING=$STORAGE_CONNECTION_STRING
AZURE_STORAGE_CONTAINER_NAME=documents

# Azure Cosmos DB
AZURE_COSMOS_ENDPOINT=$COSMOS_ENDPOINT
AZURE_COSMOS_KEY=$COSMOS_KEY
AZURE_COSMOS_DATABASE_NAME=jobcoachai
EOF

echo ".env file updated with Azure credentials."
echo

# Install Azure Python packages
echo "Installing Azure Python packages..."
cd backend
source venv/bin/activate
pip install azure-ai-formrecognizer>=3.2.0 azure-storage-blob>=12.13.0 azure-identity>=1.10.0 azure-cosmos>=4.3.0
echo "Azure Python packages installed."
echo

echo "======================================================="
echo "Azure services setup completed!"
echo "======================================================="
echo 
echo "The following services have been provisioned:"
echo "- Resource Group: $RESOURCE_GROUP"
echo "- Azure Cosmos DB: $COSMOS_ACCOUNT"
echo "- Azure Storage: $STORAGE_ACCOUNT"
echo "- Azure Document Intelligence: $DOC_INTELLIGENCE_NAME"
echo
echo "For Azure OpenAI, you need to apply for access and provision the service manually."
echo "After provisioning, update the AZURE_OPENAI_* values in backend/.env"
echo
echo "To start the application with Azure integration:"
echo "1. Make sure DEMO_MODE=false in backend/.env"
echo "2. Run ./start.sh to start the application"
echo 