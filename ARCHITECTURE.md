# Job Coach AI Assistant - Architecture Overview

This document provides an overview of the system architecture for the Job Coach AI Assistant project.

## System Architecture

The Job Coach AI Assistant is built as a modern web application with a clear separation between frontend and backend components:

```
┌───────────────────────────────────────┐     ┌──────────────────────────────────────┐
│            Frontend (React)           │     │           Backend (Python)           │
│                                       │     │                                      │
│  ┌───────────┐       ┌─────────────┐  │     │  ┌────────────┐      ┌────────────┐ │
│  │   React   │       │    Azure    │  │     │  │  FastAPI   │      │  Service   │ │
│  │  Router   │◄─────►│   Auth      │  │     │  │  Endpoints │◄────►│   Layer    │ │
│  └───────────┘       └─────────────┘  │     │  └────────────┘      └────────────┘ │
│        ▲                              │     │        ▲                   ▲         │
│        │                              │     │        │                   │         │
│        ▼                              │     │        ▼                   ▼         │
│  ┌───────────┐       ┌─────────────┐  │     │  ┌────────────┐      ┌────────────┐ │
│  │  UI       │       │  API Client │  │     │  │ Auth &     │      │ Data       │ │
│  │ Components│◄─────►│  Services   │──┼─────┼─►│ Security   │      │ Models     │ │
│  └───────────┘       └─────────────┘  │     │  └────────────┘      └────────────┘ │
│                                       │     │                                      │
└───────────────────────────────────────┘     └──────────────────────────────────────┘
                  ▲                                             ▲
                  │                                             │
                  ▼                                             ▼
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                                   Azure Cloud Services                                │
│                                                                                      │
│  ┌────────────┐  ┌────────────┐  ┌─────────────┐  ┌────────────┐  ┌────────────┐    │
│  │  Azure AD  │  │ Document   │  │   Azure     │  │   Azure    │  │   Azure    │    │
│  │    B2C     │  │Intelligence│  │   OpenAI    │  │   Cosmos   │  │    Blob    │    │
│  └────────────┘  └────────────┘  └─────────────┘  └────────────┘  └────────────┘    │
│                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

## Component Details

### Frontend (React)

The frontend is built with React and uses the following key components:

1. **Authentication (MSAL)** - Microsoft Authentication Library for secure user authentication
2. **UI Components (Fluent UI)** - Microsoft's Fluent UI design system for consistent look and feel
3. **Routing (React Router)** - For navigation between different application sections
4. **API Client** - For communication with the backend services

Main features implemented in the frontend:
- Document processing and upload interface
- AI assistant chat interface
- Report generation and viewing
- Client management

### Backend (Python FastAPI)

The backend is built with Python using FastAPI and provides the following services:

1. **Document Service** - Processes forms using Azure AI Document Intelligence
2. **AI Service** - Powers the AI assistant using Azure OpenAI
3. **Storage Service** - Manages document storage and retrieval
4. **Report Service** - Generates reports for different stakeholders

### Azure Services

The application leverages several Azure services:

1. **Azure Active Directory B2C** - For user authentication and authorization
2. **Azure AI Document Intelligence** - For intelligent document processing
3. **Azure OpenAI Service** - For the AI assistant capabilities
4. **Azure Cosmos DB** - For storing document metadata and application data
5. **Azure Blob Storage** - For storing original document files
6. **Azure Speech Services** - For voice interface capabilities

## Data Flow

### Document Processing Flow

1. User uploads a document through the frontend
2. The document is sent to the backend API
3. Document is temporarily stored and processed using Azure AI Document Intelligence
4. Extracted data is stored in Azure Cosmos DB
5. Original document is stored in Azure Blob Storage
6. Results are returned to the frontend for display and validation

### AI Assistant Flow

1. User sends a question through the chat interface
2. Question is sent to the backend API
3. Backend enhances the query with relevant context
4. Enhanced query is sent to Azure OpenAI
5. Response is processed and returned to the frontend
6. Conversation history is maintained for context

### Report Generation Flow

1. User selects a client and report type
2. Request is sent to the backend API
3. Backend gathers necessary data from Cosmos DB
4. For AI-enhanced reports, data is sent to Azure OpenAI for processing
5. Report is formatted and returned to the frontend for display
6. User can download or share the report

## Security Considerations

1. **Authentication** - Azure AD B2C for secure user authentication
2. **Authorization** - Role-based access control for different user types
3. **Data Protection** - Encryption for sensitive data at rest and in transit
4. **API Security** - JWT token-based authentication for API calls
5. **Responsible AI** - Content filtering and PII protection

## Deployment Architecture

The application can be deployed using the following Azure services:

1. **Frontend** - Azure Static Web Apps or Azure App Service
2. **Backend** - Azure App Service or Azure Container Apps
3. **API Management** - Azure API Management for API gateway and management
4. **Monitoring** - Azure Application Insights for monitoring and telemetry

## Local Development Setup

For local development, the application can be run using:
- Backend: Python with FastAPI's built-in development server
- Frontend: Node.js with React's development server

## Future Extensions

The architecture is designed to be modular and extensible. Potential future extensions include:

1. **Mobile Application** - Native mobile apps using React Native
2. **Offline Support** - Progressive Web App features for offline functionality
3. **Advanced Analytics** - Power BI integration for analytics dashboards
4. **Multi-tenant Support** - Supporting multiple organizations with data isolation 