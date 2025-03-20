# Job Coach AI Assistant - Backend Implementation Guide

This document provides a detailed guide to the backend implementation of the Job Coach AI Assistant.

## Overview

The backend is built with Python using FastAPI for the web framework. It interfaces with various Azure services for AI capabilities, document processing, and data storage.

## Architecture

The backend follows a service-oriented architecture with the following components:

1. **API Layer** - HTTP endpoints for frontend communication
2. **Service Layer** - Core business logic implementation
3. **Model Layer** - Data models and schemas
4. **Azure Integration** - Connections to Azure cloud services

## Service Layer

### Document Service

The Document Service processes and extracts information from various document types using Azure AI Document Intelligence.

**Key Features:**
- Process I-9 forms
- Process Schedule A letters
- Process job applications
- Extract relevant information based on document type
- Mock implementation for demo mode

**Implementation:**
```python
# Example usage
document_service = DocumentService()
extracted_data = await document_service.process_document(
    file_path="path/to/document.pdf",
    document_type="i9"
)
```

### AI Service

The AI Service provides natural language processing capabilities using Azure OpenAI and other Azure AI services.

**Key Features:**
- Process text queries
- Contextual responses based on job coaching domain
- Voice processing capabilities
- Task breakdown generation
- Mock implementation for demo mode

**Implementation:**
```python
# Example usage
ai_service = AIService()
response = await ai_service.process_query(
    query="How can I help my client complete an I-9 form?",
    client_id="client123"
)
```

### Storage Service

The Storage Service handles data persistence using Azure Cosmos DB and Azure Blob Storage.

**Key Features:**
- Store and retrieve documents
- Manage client information
- Record interaction history
- Mock implementation for demo mode

**Implementation:**
```python
# Example usage
storage_service = StorageService()
document_info = await storage_service.store_document(
    client_id="client123",
    document_type="i9",
    file_data=file_bytes,
    extracted_data=extracted_data
)
```

### Report Service

The Report Service generates various reports based on client data and interactions.

**Key Features:**
- Generate government reports
- Generate employer reports
- Generate client progress reports
- Customizable templates
- Mock implementation for demo mode

**Implementation:**
```python
# Example usage
report_service = ReportService()
report = await report_service.generate_report(
    client_id="client123",
    report_type="government"
)
```

### Auth Service

The Auth Service handles authentication and authorization using Azure AD B2C.

**Key Features:**
- User authentication
- Role-based authorization
- Token validation
- Mock implementation for demo mode

**Implementation:**
```python
# Example usage
auth_service = AuthService()
user_info = await auth_service.validate_token(token)
```

## API Endpoints

### Health Check

```
GET /health
```

Returns the health status of the application.

### Documents

```
POST /documents/process
```

Processes a document file and extracts relevant information.

**Request:**
- Form data with `file`, `client_id`, and `document_type`

**Response:**
```json
{
  "document_id": "doc123",
  "document_type": "i9",
  "extracted_fields": {
    "employee_name": "John Doe",
    "address": "123 Main St, Anytown, USA 12345",
    "ssn": "XXX-XX-1234",
    "citizenship_status": "U.S. Citizen"
  }
}
```

```
GET /documents/{client_id}
```

Retrieves documents for a specific client.

### AI Assistant

```
POST /assistant/query
```

Processes a natural language query and returns a response.

**Request:**
```json
{
  "query": "How can I help my client complete an I-9 form?",
  "client_id": "client123"
}
```

**Response:**
```json
{
  "response": "To help your client complete the I-9 form:\n\n1. Ensure they bring identification documents (List A or Lists B & C)\n2. Complete Section 1 together\n3. Explain that the employer will complete Section 2\n4. Make sure they understand the attestation they are signing"
}
```

### Reports

```
POST /reports/generate
```

Generates a report for a specific client.

**Request:**
```json
{
  "client_id": "client123",
  "report_type": "government"
}
```

**Response:**
```json
{
  "report": {
    "title": "Government Report",
    "client": {
      "id": "client123",
      "name": "John Doe",
      "disability": "Autism",
      "job_status": "Employed"
    },
    "date": "2023-08-20",
    "content": "This is a government report for demonstration purposes.",
    "sections": [
      {
        "heading": "Summary",
        "text": "Client has made good progress in their job search."
      },
      // Additional sections...
    ]
  }
}
```

### Clients

```
GET /clients
```

Retrieves a list of all clients.

```
GET /clients/{client_id}
```

Retrieves information for a specific client.

## Demo Mode

In demo mode, the backend simulates Azure services using mock data. This is useful for development and testing without needing actual Azure credentials.

Demo mode is enabled by setting `DEMO_MODE=true` in the `.env` file.

**Example Mock Data Implementation:**

```python
def _get_mock_data(self, document_type: str) -> Dict[str, Any]:
    """Provide mock data for demo mode"""
    if document_type == "i9":
        return {
            "employee_name": "John Doe",
            "address": "123 Main St, Anytown, USA 12345",
            "ssn": "XXX-XX-1234",
            "citizenship_status": "U.S. Citizen"
        }
    elif document_type == "schedule_a":
        return {
            "applicant_name": "Jane Smith",
            "disability_type": "Hearing impairment",
            "job_title": "Administrative Assistant",
            "reasonable_accommodation": "Sign language interpreter for meetings"
        }
    # Additional document types...
```

## Error Handling

The backend implements standardized error handling using FastAPI's `HTTPException` mechanism.

Common error responses:
- 400 Bad Request - Missing required fields
- 401 Unauthorized - Invalid or missing credentials
- 404 Not Found - Resource not found
- 500 Internal Server Error - Unexpected errors

## Extending the Backend

### Adding a New Document Type

1. Define a new processor method in `DocumentService`:
   ```python
   async def _process_new_document_type(self, file_path: str) -> Dict[str, Any]:
       # Implementation...
   ```

2. Add it to the document types mapping in `__init__`:
   ```python
   self.document_types = {
       # Existing types...
       "new_type": self._process_new_document_type,
   }
   ```

3. Add mock data for demo mode:
   ```python
   def _get_mock_data(self, document_type: str) -> Dict[str, Any]:
       # Existing types...
       elif document_type == "new_type":
           return {
               "field1": "value1",
               "field2": "value2",
           }
   ```

### Adding a New AI Capability

1. Define a new method in `AIService`:
   ```python
   async def new_ai_capability(self, params) -> Dict[str, Any]:
       # Implementation...
   ```

2. Create a new API endpoint in `main.py`:
   ```python
   @app.post("/ai/new-capability")
   async def new_capability(request: Request):
       data = await request.json()
       # Process data and call AI service
       return {"result": result}
   ```

## Deployment

For production deployment, replace mock data with actual Azure service connections by:

1. Setting Azure credentials in the `.env` file
2. Setting `DEMO_MODE=false`
3. Ensuring all required Azure services are properly configured

For detailed deployment instructions, refer to the `DEPLOYMENT.md` document. 