import os
import logging
import json
import uuid
from datetime import datetime
from dotenv import load_dotenv
from typing import Dict, Any, List, Optional
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient
from azure.cosmos import CosmosClient, exceptions
from azure.identity import DefaultAzureCredential

# Load environment variables
load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)

class StorageService:
    """Service for storing and retrieving data in Azure Storage"""

    def __init__(self):
        """Initialize the storage service with Azure credentials"""
        # Azure Blob Storage configuration
        self.blob_connection_string = os.getenv("AZURE_BLOB_CONNECTION_STRING")
        self.blob_container_name = os.getenv("AZURE_BLOB_CONTAINER_NAME", "documents")
        
        # Azure Cosmos DB configuration
        self.cosmos_endpoint = os.getenv("AZURE_COSMOS_ENDPOINT")
        self.cosmos_key = os.getenv("AZURE_COSMOS_KEY")
        self.cosmos_database_name = os.getenv("AZURE_COSMOS_DATABASE_NAME", "job-coach-assistant")
        self.cosmos_container_name = os.getenv("AZURE_COSMOS_CONTAINER_NAME", "documents")
        
        # Initialize Azure Blob Storage client
        if self.blob_connection_string:
            try:
                self.blob_service_client = BlobServiceClient.from_connection_string(self.blob_connection_string)
                
                # Create container if it doesn't exist
                container_exists = False
                containers = self.blob_service_client.list_containers()
                for container in containers:
                    if container.name == self.blob_container_name:
                        container_exists = True
                        break
                
                if not container_exists:
                    self.blob_service_client.create_container(self.blob_container_name)
                
                self.blob_container_client = self.blob_service_client.get_container_client(self.blob_container_name)
                logger.info(f"Azure Blob Storage client initialized with container: {self.blob_container_name}")
            except Exception as e:
                logger.error(f"Error initializing Azure Blob Storage: {str(e)}")
                self.blob_service_client = None
                self.blob_container_client = None
        else:
            logger.warning("Azure Blob Storage connection string not found")
            self.blob_service_client = None
            self.blob_container_client = None
        
        # Initialize Azure Cosmos DB client
        if self.cosmos_endpoint and self.cosmos_key:
            try:
                self.cosmos_client = CosmosClient(self.cosmos_endpoint, self.cosmos_key)
                
                # Create database if it doesn't exist
                try:
                    self.cosmos_database = self.cosmos_client.create_database_if_not_exists(id=self.cosmos_database_name)
                    logger.info(f"Azure Cosmos DB database initialized: {self.cosmos_database_name}")
                except exceptions.CosmosResourceExistsError:
                    self.cosmos_database = self.cosmos_client.get_database_client(self.cosmos_database_name)
                
                # Create container if it doesn't exist
                try:
                    self.cosmos_container = self.cosmos_database.create_container_if_not_exists(
                        id=self.cosmos_container_name,
                        partition_key="/client_id"
                    )
                    logger.info(f"Azure Cosmos DB container initialized: {self.cosmos_container_name}")
                except exceptions.CosmosResourceExistsError:
                    self.cosmos_container = self.cosmos_database.get_container_client(self.cosmos_container_name)
            except Exception as e:
                logger.error(f"Error initializing Azure Cosmos DB: {str(e)}")
                self.cosmos_client = None
                self.cosmos_database = None
                self.cosmos_container = None
        else:
            logger.warning("Azure Cosmos DB credentials not found")
            self.cosmos_client = None
            self.cosmos_database = None
            self.cosmos_container = None
    
    async def save_document_data(self, client_id: str, document_type: str, data: Dict[str, Any], 
                               original_file_name: str, user_id: str) -> str:
        """
        Save document data to storage
        
        Args:
            client_id: ID of the client
            document_type: Type of document
            data: Extracted data from the document
            original_file_name: Name of the original document file
            user_id: ID of the user who processed the document
            
        Returns:
            Document ID
        """
        document_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat()
        
        # Create metadata
        document_metadata = {
            "id": document_id,
            "client_id": client_id,
            "document_type": document_type,
            "original_file_name": original_file_name,
            "processed_by": user_id,
            "processed_at": timestamp,
            "data": data
        }
        
        try:
            # Save metadata to Cosmos DB
            if self.cosmos_container:
                self.cosmos_container.create_item(body=document_metadata)
                logger.info(f"Document metadata saved to Cosmos DB: {document_id}")
            else:
                # For demo purposes, log the metadata if no Cosmos DB connection
                logger.info(f"[MOCK] Document metadata would be saved to Cosmos DB: {json.dumps(document_metadata)}")
            
            return document_id
        except Exception as e:
            logger.error(f"Error saving document data: {str(e)}")
            raise
    
    async def save_document_file(self, file_path: str, client_id: str, document_id: str) -> str:
        """
        Save document file to Blob Storage
        
        Args:
            file_path: Path to the document file
            client_id: ID of the client
            document_id: ID of the document
            
        Returns:
            Blob URL
        """
        try:
            # Generate a blob name using client_id and document_id
            blob_name = f"{client_id}/{document_id}/{os.path.basename(file_path)}"
            
            if self.blob_container_client:
                # Upload the file to Blob Storage
                with open(file_path, "rb") as data:
                    blob_client = self.blob_container_client.upload_blob(name=blob_name, data=data, overwrite=True)
                
                # Get the blob URL
                blob_url = f"{self.blob_service_client.url}/{self.blob_container_name}/{blob_name}"
                logger.info(f"Document file saved to Blob Storage: {blob_url}")
                
                return blob_url
            else:
                # For demo purposes, log the blob name if no Blob Storage connection
                logger.info(f"[MOCK] Document file would be saved to Blob Storage: {blob_name}")
                return f"mock-url/{blob_name}"
        except Exception as e:
            logger.error(f"Error saving document file: {str(e)}")
            raise
    
    async def get_client_documents(self, client_id: str) -> List[Dict[str, Any]]:
        """
        Get all documents for a specific client
        
        Args:
            client_id: ID of the client
            
        Returns:
            List of document metadata
        """
        try:
            if self.cosmos_container:
                # Query Cosmos DB for documents with the given client_id
                query = f"SELECT * FROM c WHERE c.client_id = '{client_id}'"
                items = list(self.cosmos_container.query_items(query=query, enable_cross_partition_query=True))
                
                logger.info(f"Retrieved {len(items)} documents for client: {client_id}")
                return items
            else:
                # Return mock data if no Cosmos DB connection
                return self._get_mock_client_documents(client_id)
        except Exception as e:
            logger.error(f"Error retrieving client documents: {str(e)}")
            return self._get_mock_client_documents(client_id)
    
    async def get_document(self, document_id: str) -> Dict[str, Any]:
        """
        Get a specific document by ID
        
        Args:
            document_id: ID of the document
            
        Returns:
            Document metadata
        """
        try:
            if self.cosmos_container:
                # Query Cosmos DB for the document with the given ID
                query = f"SELECT * FROM c WHERE c.id = '{document_id}'"
                items = list(self.cosmos_container.query_items(query=query, enable_cross_partition_query=True))
                
                if items:
                    logger.info(f"Retrieved document: {document_id}")
                    return items[0]
                else:
                    logger.warning(f"Document not found: {document_id}")
                    return {}
            else:
                # Return mock data if no Cosmos DB connection
                return self._get_mock_document(document_id)
        except Exception as e:
            logger.error(f"Error retrieving document: {str(e)}")
            return self._get_mock_document(document_id)
    
    def _get_mock_client_documents(self, client_id: str) -> List[Dict[str, Any]]:
        """Generate mock client documents for demonstration purposes"""
        mock_documents = []
        
        # Generate some mock documents
        document_types = ["i9", "schedule_a", "tax_1040", "job_application"]
        for i, doc_type in enumerate(document_types):
            document_id = f"mock-doc-{i+1}"
            timestamp = datetime.utcnow().isoformat()
            
            mock_documents.append({
                "id": document_id,
                "client_id": client_id,
                "document_type": doc_type,
                "original_file_name": f"{doc_type}_form.pdf",
                "processed_by": "mock-user-1",
                "processed_at": timestamp,
                "data": self._get_mock_document_data(doc_type)
            })
        
        logger.info(f"[MOCK] Retrieved {len(mock_documents)} documents for client: {client_id}")
        return mock_documents
    
    def _get_mock_document(self, document_id: str) -> Dict[str, Any]:
        """Generate a mock document for demonstration purposes"""
        # Parse the document type from the ID
        if "i9" in document_id:
            doc_type = "i9"
        elif "schedule" in document_id:
            doc_type = "schedule_a"
        elif "tax" in document_id:
            doc_type = "tax_1040"
        elif "job" in document_id:
            doc_type = "job_application"
        else:
            doc_type = "generic"
        
        timestamp = datetime.utcnow().isoformat()
        
        mock_document = {
            "id": document_id,
            "client_id": "mock-client-1",
            "document_type": doc_type,
            "original_file_name": f"{doc_type}_form.pdf",
            "processed_by": "mock-user-1",
            "processed_at": timestamp,
            "data": self._get_mock_document_data(doc_type)
        }
        
        logger.info(f"[MOCK] Retrieved document: {document_id}")
        return mock_document
    
    def _get_mock_document_data(self, document_type: str) -> Dict[str, Any]:
        """Generate mock document data for demonstration purposes"""
        mock_data = {
            "i9": {
                "employee_name": "John Doe",
                "address": "123 Main St, Anytown, USA 12345",
                "ssn": "XXX-XX-1234",
                "date_of_birth": "01/01/1980",
                "citizenship_status": "U.S. Citizen"
            },
            "schedule_a": {
                "applicant_name": "Jane Smith",
                "disability_type": "Hearing impairment",
                "job_title": "Administrative Assistant",
                "reasonable_accommodation": "Sign language interpreter for meetings"
            },
            "tax_1040": {
                "tax_year": "2022",
                "taxpayer_name": "John Doe",
                "filing_status": "Single",
                "total_income": "45000",
                "adjusted_gross_income": "42500"
            },
            "job_application": {
                "applicant_name": "Jane Smith",
                "position": "Cashier",
                "phone_number": "(555) 123-4567",
                "email": "jane.smith@example.com",
                "education": "High School Diploma"
            },
            "generic": {
                "name": "Sample Document",
                "date": "01/01/2023",
                "reference_number": "REF-12345"
            }
        }
        
        return mock_data.get(document_type, mock_data["generic"]) 