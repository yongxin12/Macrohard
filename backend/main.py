from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import json
import time
import io
import base64
from typing import Dict, Any, List, Optional
import openai
import requests

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Job Coach AI Assistant API",
    description="API for Job Coach AI Assistant supporting employment for people with disabilities",
    version="0.1.0",
)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    demo_mode = os.getenv("DEMO_MODE", "true").lower() == "true"
    mode = "demo" if demo_mode else "azure"
    return {"status": "healthy", "version": "0.1.0", "mode": mode}

# Mock clients data
MOCK_CLIENTS = [
    {"id": "client1", "name": "John Doe", "disability": "Autism", "job_status": "Employed"},
    {"id": "client2", "name": "Jane Smith", "disability": "Hearing impairment", "job_status": "Job seeking"},
    {"id": "client3", "name": "Bob Johnson", "disability": "Physical disability", "job_status": "In training"}
]

# Document processing endpoint
@app.post("/documents/process")
async def process_document(request: Request):
    form_data = await request.form()
    client_id = form_data.get("client_id")
    document_type = form_data.get("document_type")
    file = form_data.get("file")
    
    # Check if we're in demo mode
    demo_mode = os.getenv("DEMO_MODE", "true").lower() == "true"
    
    if demo_mode:
        # Mock extraction based on document type
        extracted_fields = {}
        if document_type == "i9":
            extracted_fields = {
                "employee_name": "John Doe",
                "address": "123 Main St, Anytown, USA 12345",
                "ssn": "XXX-XX-1234",
                "citizenship_status": "U.S. Citizen"
            }
        elif document_type == "schedule_a":
            extracted_fields = {
                "applicant_name": "Jane Smith",
                "disability_type": "Hearing impairment",
                "job_title": "Administrative Assistant",
                "reasonable_accommodation": "Sign language interpreter for meetings"
            }
        elif document_type == "job_application":
            extracted_fields = {
                "applicant_name": "Bob Johnson",
                "position": "Cashier",
                "phone_number": "(555) 123-4567",
                "email": "bob.johnson@example.com"
            }
    else:
        # Use Azure Document Intelligence
        try:
            # Get Azure Document Intelligence credentials
            endpoint = os.getenv("AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT")
            key = os.getenv("AZURE_DOCUMENT_INTELLIGENCE_KEY")
            
            if not endpoint or not key:
                raise HTTPException(status_code=500, detail="Azure Document Intelligence credentials not found")
            
            # Prepare the file for upload
            file_content = await file.read()
            file_bytes = io.BytesIO(file_content)
            
            # Choose the right model based on document type
            model_id = "prebuilt-document" # Default model
            if document_type == "i9":
                model_id = "prebuilt-layout" # For form extraction
            elif document_type == "schedule_a":
                model_id = "prebuilt-document" # For document extraction
            elif document_type == "job_application":
                model_id = "prebuilt-layout" # For form extraction
            
            # Set up API endpoint
            url = f"{endpoint}formrecognizer/documentModels/{model_id}:analyze?api-version=2023-07-31"
            
            # Call Azure Document Intelligence API
            headers = {
                "Content-Type": "application/octet-stream",
                "Ocp-Apim-Subscription-Key": key
            }
            
            # Make the request
            response = requests.post(url, headers=headers, data=file_bytes)
            
            if response.status_code != 202:
                raise Exception(f"Failed to analyze document: {response.text}")
            
            # Get the operation location to check status
            operation_location = response.headers["Operation-Location"]
            
            # Poll for results (with timeout)
            max_retries = 50
            for i in range(max_retries):
                # Check status
                status_response = requests.get(
                    operation_location, 
                    headers={"Ocp-Apim-Subscription-Key": key}
                )
                
                result = status_response.json()
                
                if "status" in result:
                    if result["status"] == "succeeded":
                        break
                    if result["status"] == "failed":
                        raise Exception(f"Document analysis failed: {result}")
                
                # Wait before polling again
                time.sleep(1)
                
                if i == max_retries - 1:
                    raise Exception("Document analysis timed out")
            
            # Extract fields based on document type
            extracted_fields = {}
            
            # Basic extraction from analysis results
            if "analyzeResult" in result:
                extracted_content = result["analyzeResult"]
                
                # Simplified extraction - in a real app, you'd parse specific fields
                if document_type == "i9":
                    # Get form fields
                    extracted_fields = {
                        "document_type": "I-9 Form",
                        "extracted_text": "Document processed with Azure Document Intelligence",
                        "fields_detected": len(extracted_content.get("documents", [{}])[0].get("fields", {})) if "documents" in extracted_content and extracted_content["documents"] else 0
                    }
                elif document_type == "schedule_a":
                    extracted_fields = {
                        "document_type": "Schedule A Letter",
                        "extracted_text": "Document processed with Azure Document Intelligence",
                        "fields_detected": len(extracted_content.get("documents", [{}])[0].get("fields", {})) if "documents" in extracted_content and extracted_content["documents"] else 0
                    }
                elif document_type == "job_application":
                    extracted_fields = {
                        "document_type": "Job Application",
                        "extracted_text": "Document processed with Azure Document Intelligence",
                        "fields_detected": len(extracted_content.get("documents", [{}])[0].get("fields", {})) if "documents" in extracted_content and extracted_content["documents"] else 0
                    }
                else:
                    extracted_fields = {
                        "document_type": document_type,
                        "extracted_text": "Document processed with Azure Document Intelligence",
                        "fields_detected": len(extracted_content.get("documents", [{}])[0].get("fields", {})) if "documents" in extracted_content and extracted_content["documents"] else 0
                    }
            
        except Exception as e:
            # If Azure Document Intelligence fails, fallback to demo extraction
            print(f"Error using Azure Document Intelligence: {str(e)}")
            
            # Fallback to mock data when real processing fails
            extracted_fields = {
                "error": f"Failed to process document with Azure: {str(e)}",
                "fallback": "Using mock data instead"
            }
            
            # Add mock data based on document type
            if document_type == "i9":
                extracted_fields["extracted_data"] = {
                    "employee_name": "John Doe (Mock)",
                    "address": "123 Main St, Anytown, USA 12345",
                }
            elif document_type == "schedule_a":
                extracted_fields["extracted_data"] = {
                    "applicant_name": "Jane Smith (Mock)",
                    "disability_type": "Hearing impairment",
                }
            elif document_type == "job_application":
                extracted_fields["extracted_data"] = {
                    "applicant_name": "Bob Johnson (Mock)",
                    "position": "Cashier",
                }
    
    # Generate a document ID (in production, you would save this to Azure Storage/Cosmos DB)
    document_id = f"doc-{int(time.time())}"
    
    return {
        "document_id": document_id,
        "document_type": document_type,
        "extracted_fields": extracted_fields
    }

# Get client documents
@app.get("/documents/{client_id}")
async def get_client_documents(client_id: str):
    # Check if we're in demo mode
    demo_mode = os.getenv("DEMO_MODE", "true").lower() == "true"
    
    if demo_mode:
        # Return mock documents
        mock_documents = [
            {
                "id": "doc1",
                "client_id": client_id,
                "document_type": "i9",
                "original_file_name": "i9_form.pdf",
                "processed_at": "2023-08-15T14:30:00Z",
                "data": {"employee_name": "John Doe", "ssn": "XXX-XX-1234"}
            },
            {
                "id": "doc2",
                "client_id": client_id,
                "document_type": "schedule_a",
                "original_file_name": "schedule_a.pdf",
                "processed_at": "2023-08-10T09:15:00Z",
                "data": {"applicant_name": "John Doe", "disability_type": "Autism"}
            }
        ]
        return {"client_id": client_id, "documents": mock_documents}
    else:
        # Use Azure Cosmos DB to retrieve document metadata
        try:
            # Get Azure Cosmos DB credentials
            cosmos_endpoint = os.getenv("AZURE_COSMOS_ENDPOINT")
            cosmos_key = os.getenv("AZURE_COSMOS_KEY")
            cosmos_database = os.getenv("AZURE_COSMOS_DATABASE_NAME")
            
            if not cosmos_endpoint or not cosmos_key or not cosmos_database:
                raise HTTPException(status_code=500, detail="Azure Cosmos DB credentials not found")
            
            # Create a simple HTTP request to query documents
            # In a real application, you would use the Azure Cosmos DB SDK
            url = f"{cosmos_endpoint}dbs/{cosmos_database}/colls/documents/docs"
            headers = {
                "Authorization": f"type=master&ver=1.0&sig={cosmos_key}",
                "Content-Type": "application/query+json",
                "x-ms-version": "2018-12-31",
                "x-ms-documentdb-isquery": "true",
                "x-ms-documentdb-query-enablecrosspartition": "true"
            }
            
            # Query for documents belonging to this client
            query = {
                "query": "SELECT * FROM documents d WHERE d.client_id = @client_id",
                "parameters": [
                    {"name": "@client_id", "value": client_id}
                ]
            }
            
            # Make the request to Cosmos DB
            response = requests.post(url, headers=headers, json=query)
            
            if response.status_code != 200:
                print(f"Cosmos DB query failed: {response.text}")
                raise Exception(f"Failed to query documents: {response.text}")
            
            documents = response.json().get("Documents", [])
            
            # If no documents found, return empty list
            if not documents:
                print("No documents found for client in Cosmos DB")
                return {"client_id": client_id, "documents": [], "source": "azure"}
                
            # For each document, get the file URLs from Azure Storage
            storage_connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
            container_name = os.getenv("AZURE_STORAGE_CONTAINER_NAME")
            
            if not storage_connection_string or not container_name:
                # Return just the metadata without file URLs
                return {"client_id": client_id, "documents": documents, "source": "azure"}
            
            # In a real app, you would generate SAS URLs for each file using Azure Storage SDK
            for doc in documents:
                doc["file_url"] = f"azure-storage://{container_name}/{doc.get('id')}.pdf"
            
            return {"client_id": client_id, "documents": documents, "source": "azure"}
            
        except Exception as e:
            # If Azure services fail, fallback to mock data
            print(f"Error using Azure services: {str(e)}")
            
            # Fallback to mock data
            mock_documents = [
                {
                    "id": "doc1-fallback",
                    "client_id": client_id,
                    "document_type": "i9",
                    "original_file_name": "i9_form.pdf",
                    "processed_at": "2023-08-15T14:30:00Z",
                    "data": {"employee_name": "John Doe (Fallback)", "ssn": "XXX-XX-1234"},
                    "error": f"Azure error: {str(e)}"
                },
                {
                    "id": "doc2-fallback",
                    "client_id": client_id,
                    "document_type": "schedule_a",
                    "original_file_name": "schedule_a.pdf",
                    "processed_at": "2023-08-10T09:15:00Z",
                    "data": {"applicant_name": "John Doe (Fallback)", "disability_type": "Autism"},
                    "error": f"Azure error: {str(e)}"
                }
            ]
            return {"client_id": client_id, "documents": mock_documents, "source": "fallback"}

# AI Assistant query endpoint
@app.post("/assistant/query")
async def assistant_query(request: Request):
    data = await request.json()
    query = data.get("query")
    client_id = data.get("client_id")
    
    if not query:
        raise HTTPException(status_code=400, detail="Query is required")
    
    # Check if we're in demo mode
    demo_mode = os.getenv("DEMO_MODE", "true").lower() == "true"
    
    if demo_mode:
        # Generate mock response based on query
        response = ""
        if "i9" in query.lower():
            response = "To help your client complete the I-9 form:\n\n1. Ensure they bring identification documents (List A or Lists B & C)\n2. Complete Section 1 together\n3. Explain that the employer will complete Section 2\n4. Make sure they understand the attestation they are signing"
        elif "schedule a" in query.lower():
            response = "A Schedule A letter should include:\n\n1. Confirmation of the individual's disability\n2. Description of how the disability affects major life activities\n3. Statement that the person can perform the essential job functions\n4. Signature from a licensed professional"
        elif "accommodation" in query.lower():
            response = "Common reasonable accommodations include:\n\n1. Flexible work schedules\n2. Modified equipment or devices\n3. Accessible workspaces\n4. Job restructuring\n5. Communication aids\n\nAlways focus on the individual's specific needs."
        elif "retail" in query.lower():
            response = "Strategies for supporting a client in a retail position:\n\n1. Develop visual guides for tasks\n2. Practice customer service scripts\n3. Create a structured routine\n4. Identify a workplace mentor\n5. Schedule regular check-ins\n6. Use assistive technology if needed"
        else:
            response = "I can provide guidance on completing government forms, suggesting reasonable accommodations, job coaching strategies, and supporting clients with specific disabilities. How can I assist you with your client today?"
    else:
        # Use Azure OpenAI
        try:
            azure_openai_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
            azure_openai_key = os.getenv("AZURE_OPENAI_KEY")
            azure_openai_deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT")
            
            if not azure_openai_endpoint or not azure_openai_key:
                raise HTTPException(status_code=500, detail="Azure OpenAI credentials not found")
            
            # Initialize OpenAI client
            openai.api_type = "azure"
            openai.api_base = azure_openai_endpoint
            openai.api_key = azure_openai_key
            openai.api_version = "2023-07-01-preview"
            
            # Prepare prompt
            system_prompt = "You are a helpful job coach assistant. Keep answers brief and practical."
            
            if client_id:
                system_prompt += f" Helping client ID: {client_id}."
            
            # Call Azure OpenAI using ChatCompletion
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": query}
            ]
            
            # Implement rate limiting with retries
            max_retries = 5
            response = None
            
            for retry in range(max_retries):
                try:
                    completion = openai.ChatCompletion.create(
                        engine=azure_openai_deployment,
                        messages=messages,
                        temperature=0.7,
                        max_tokens=250,  # Significantly reduced to avoid rate limits
                        top_p=0.95,
                        frequency_penalty=0,
                        presence_penalty=0
                    )
                    
                    response = completion.choices[0].message.content.strip()
                    break  # Exit the loop if successful
                except Exception as e:
                    error_msg = str(e)
                    print(f"Attempt {retry+1}/{max_retries} - Error calling Azure OpenAI: {error_msg}")
                    
                    if "rate limit" in error_msg.lower() or "exceeded token rate limit" in error_msg.lower():
                        # Rate limit errors need longer waits
                        wait_time = 65 if retry == 0 else (retry + 1) * 65
                        print(f"Rate limit exceeded. Waiting {wait_time} seconds before retry...")
                        time.sleep(wait_time)
                    elif retry < max_retries - 1:
                        # Other errors with exponential backoff
                        wait_time = (2 ** retry) * 10
                        print(f"Waiting {wait_time} seconds before retry...")
                        time.sleep(wait_time)
                    else:
                        # On the last retry, set the error response
                        response = f"I apologize, but there was an error processing your request. Please try again later. Error: {error_msg}"
            
            # If response is still None after all retries, set a default error message
            if response is None:
                response = "I apologize, but there was an error processing your request. Please try again later."
                
        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            response = f"I apologize, but there was an error processing your request. Please try again later. Error: {str(e)}"
    
    return {"response": response}

# Report generation endpoint
@app.post("/reports/generate")
async def generate_report(request: Request):
    data = await request.json()
    client_id = data.get("client_id")
    report_type = data.get("report_type")
    
    if not client_id or not report_type:
        raise HTTPException(status_code=400, detail="Client ID and report type are required")
    
    # Check if we're in demo mode
    demo_mode = os.getenv("DEMO_MODE", "true").lower() == "true"
    
    if demo_mode:
        # Generate mock report based on type
        report = {
            "title": f"{report_type.capitalize()} Report",
            "client": next((c for c in MOCK_CLIENTS if c["id"] == client_id), None),
            "date": "2023-08-20",
            "content": f"This is a mock {report_type} report for demonstration purposes.",
            "sections": [
                {"heading": "Summary", "text": "Client has made good progress in their job search."},
                {"heading": "Activities", "text": "Completed job applications, attended 2 interviews."},
                {"heading": "Goals", "text": "Secure employment in customer service within 30 days."},
                {"heading": "Recommendations", "text": "Continue practicing interview skills, follow up on pending applications."}
            ]
        }
    else:
        try:
            # Get client data from Azure Cosmos DB
            cosmos_endpoint = os.getenv("AZURE_COSMOS_ENDPOINT")
            cosmos_key = os.getenv("AZURE_COSMOS_KEY")
            cosmos_database = os.getenv("AZURE_COSMOS_DATABASE_NAME")
            
            # If Cosmos DB credentials not available, use mock client
            client = None
            if not cosmos_endpoint or not cosmos_key or not cosmos_database:
                print("Cosmos DB credentials not available, using mock client data")
                client = next((c for c in MOCK_CLIENTS if c["id"] == client_id), None)
            else:
                # Try to get client from Cosmos DB
                try:
                    # Create a simple HTTP request to query specific client
                    url = f"{cosmos_endpoint}dbs/{cosmos_database}/colls/clients/docs"
                    headers = {
                        "Authorization": f"type=master&ver=1.0&sig={cosmos_key}",
                        "Content-Type": "application/query+json",
                        "x-ms-version": "2018-12-31",
                        "x-ms-documentdb-isquery": "true",
                        "x-ms-documentdb-query-enablecrosspartition": "true"
                    }
                    
                    # Query for specific client
                    query = {
                        "query": "SELECT * FROM clients c WHERE c.id = @client_id",
                        "parameters": [
                            {"name": "@client_id", "value": client_id}
                        ]
                    }
                    
                    response = requests.post(url, headers=headers, json=query)
                    
                    if response.status_code == 200:
                        clients = response.json().get("Documents", [])
                        if clients and len(clients) > 0:
                            client = clients[0]
                    
                    # If client not found in Cosmos DB, use mock client
                    if not client:
                        client = next((c for c in MOCK_CLIENTS if c["id"] == client_id), None)
                        
                except Exception as e:
                    print(f"Error querying client from Cosmos DB: {str(e)}")
                    client = next((c for c in MOCK_CLIENTS if c["id"] == client_id), None)
            
            if not client:
                raise HTTPException(status_code=404, detail="Client not found")
            
            # Get Azure OpenAI credentials
            azure_openai_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
            azure_openai_key = os.getenv("AZURE_OPENAI_KEY")
            azure_openai_deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT")
            
            if not azure_openai_endpoint or not azure_openai_key:
                # Fallback to mock report
                print("Azure OpenAI credentials not available, using mock report")
                report = {
                    "title": f"{report_type.capitalize()} Report (Azure Fallback)",
                    "client": client,
                    "date": "2023-08-20",
                    "content": f"This is a mock {report_type} report for demonstration purposes.",
                    "sections": [
                        {"heading": "Summary", "text": "Client has made progress in their job search."},
                        {"heading": "Activities", "text": "Completed job applications, attended interviews."},
                        {"heading": "Goals", "text": "Secure employment within 30 days."},
                        {"heading": "Recommendations", "text": "Continue practicing interview skills, follow up on applications."}
                    ],
                    "note": "Azure OpenAI not available, using fallback report"
                }
            else:
                # Use Azure OpenAI to generate report content
                openai.api_type = "azure"
                openai.api_base = azure_openai_endpoint
                openai.api_key = azure_openai_key
                openai.api_version = "2023-07-01-preview"
                
                # Prompt for report generation
                system_prompt = f"""You are a professional job coach assistant. Generate a {report_type} report for a client with the following details:
                
                Client Name: {client.get('name', 'Unknown')}
                Disability: {client.get('disability', 'Not specified')}
                Job Status: {client.get('job_status', 'Unknown')}
                
                The report should include 4 sections: Summary, Activities, Goals, and Recommendations.
                Format the response as JSON with the following structure:
                {{
                    "sections": [
                        {{"heading": "Summary", "text": "summary text here"}},
                        {{"heading": "Activities", "text": "activities text here"}},
                        {{"heading": "Goals", "text": "goals text here"}},
                        {{"heading": "Recommendations", "text": "recommendations text here"}}
                    ]
                }}
                """
                
                user_prompt = f"Generate a professional {report_type} report for {client.get('name', 'the client')}."
                
                try:
                    # Make the OpenAI request
                    messages = [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ]
                    
                    completion = openai.ChatCompletion.create(
                        engine=azure_openai_deployment,
                        messages=messages,
                        temperature=0.7,
                        max_tokens=500,
                        top_p=0.95,
                        response_format={"type": "json_object"}
                    )
                    
                    response_text = completion.choices[0].message.content.strip()
                    
                    # Parse the JSON response
                    response_json = json.loads(response_text)
                    
                    # Create the report
                    report = {
                        "title": f"{report_type.capitalize()} Report",
                        "client": client,
                        "date": time.strftime("%Y-%m-%d"),
                        "content": f"Report generated using Azure OpenAI",
                        "sections": response_json.get("sections", []),
                        "source": "azure"
                    }
                    
                except Exception as e:
                    print(f"Error using Azure OpenAI for report generation: {str(e)}")
                    # Fallback to mock report
                    report = {
                        "title": f"{report_type.capitalize()} Report (OpenAI Error)",
                        "client": client,
                        "date": time.strftime("%Y-%m-%d"),
                        "content": f"This is a fallback {report_type} report. Azure OpenAI error: {str(e)}",
                        "sections": [
                            {"heading": "Summary", "text": "Client has shown progress despite challenges."},
                            {"heading": "Activities", "text": "Client has been actively engaged in job search activities."},
                            {"heading": "Goals", "text": "Set clear and achievable employment goals."},
                            {"heading": "Recommendations", "text": "Continue with current strategies while refining approach."}
                        ],
                        "error": str(e),
                        "source": "fallback"
                    }
                
        except Exception as e:
            print(f"Error in report generation: {str(e)}")
            # Complete fallback
            report = {
                "title": f"{report_type.capitalize()} Report (Error)",
                "client_id": client_id,
                "date": time.strftime("%Y-%m-%d"),
                "content": f"Error generating report: {str(e)}",
                "sections": [
                    {"heading": "Error", "text": f"Could not generate report due to error: {str(e)}"}
                ],
                "source": "error"
            }
    
    return {"report": report}

# Get clients endpoint
@app.get("/clients")
async def get_clients():
    # Check if we're in demo mode
    demo_mode = os.getenv("DEMO_MODE", "true").lower() == "true"
    
    if demo_mode:
        # Return mock clients
        return {"clients": MOCK_CLIENTS}
    else:
        # Use Azure Cosmos DB to retrieve clients
        try:
            # Get Azure Cosmos DB credentials
            cosmos_endpoint = os.getenv("AZURE_COSMOS_ENDPOINT")
            cosmos_key = os.getenv("AZURE_COSMOS_KEY")
            cosmos_database = os.getenv("AZURE_COSMOS_DATABASE_NAME")
            
            if not cosmos_endpoint or not cosmos_key or not cosmos_database:
                raise HTTPException(status_code=500, detail="Azure Cosmos DB credentials not found")
            
            # Create a simple HTTP request to query clients
            # In a real application, you would use the Azure Cosmos DB SDK
            url = f"{cosmos_endpoint}dbs/{cosmos_database}/colls/clients/docs"
            headers = {
                "Authorization": f"type=master&ver=1.0&sig={cosmos_key}",
                "Content-Type": "application/query+json",
                "x-ms-version": "2018-12-31",
                "x-ms-documentdb-isquery": "true",
                "x-ms-documentdb-query-enablecrosspartition": "true"
            }
            
            # Query for all clients
            query = {
                "query": "SELECT * FROM clients c"
            }
            
            # Make the request to Cosmos DB
            response = requests.post(url, headers=headers, json=query)
            
            if response.status_code != 200:
                print(f"Cosmos DB query failed: {response.text}")
                raise Exception(f"Failed to query clients: {response.text}")
            
            clients = response.json().get("Documents", [])
            
            # If no clients found, return empty list
            if not clients:
                print("No clients found in Cosmos DB")
                return {"clients": [], "source": "azure"}
                
            return {"clients": clients, "source": "azure"}
            
        except Exception as e:
            # If Azure services fail, fallback to mock data
            print(f"Error using Azure services for clients: {str(e)}")
            return {"clients": MOCK_CLIENTS, "source": "fallback", "error": str(e)}

# Get client details endpoint
@app.get("/clients/{client_id}")
async def get_client(client_id: str):
    # Check if we're in demo mode
    demo_mode = os.getenv("DEMO_MODE", "true").lower() == "true"
    
    if demo_mode:
        # Return mock client
        client = next((c for c in MOCK_CLIENTS if c["id"] == client_id), None)
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        return {"client": client}
    else:
        # Use Azure Cosmos DB to retrieve client
        try:
            # Get Azure Cosmos DB credentials
            cosmos_endpoint = os.getenv("AZURE_COSMOS_ENDPOINT")
            cosmos_key = os.getenv("AZURE_COSMOS_KEY")
            cosmos_database = os.getenv("AZURE_COSMOS_DATABASE_NAME")
            
            if not cosmos_endpoint or not cosmos_key or not cosmos_database:
                raise HTTPException(status_code=500, detail="Azure Cosmos DB credentials not found")
            
            # Create a simple HTTP request to query specific client
            # In a real application, you would use the Azure Cosmos DB SDK
            url = f"{cosmos_endpoint}dbs/{cosmos_database}/colls/clients/docs"
            headers = {
                "Authorization": f"type=master&ver=1.0&sig={cosmos_key}",
                "Content-Type": "application/query+json",
                "x-ms-version": "2018-12-31",
                "x-ms-documentdb-isquery": "true",
                "x-ms-documentdb-query-enablecrosspartition": "true"
            }
            
            # Query for specific client
            query = {
                "query": "SELECT * FROM clients c WHERE c.id = @client_id",
                "parameters": [
                    {"name": "@client_id", "value": client_id}
                ]
            }
            
            # Make the request to Cosmos DB
            response = requests.post(url, headers=headers, json=query)
            
            if response.status_code != 200:
                print(f"Cosmos DB query failed: {response.text}")
                raise Exception(f"Failed to query client: {response.text}")
            
            clients = response.json().get("Documents", [])
            
            # If client not found
            if not clients or len(clients) == 0:
                # Try fallback
                client = next((c for c in MOCK_CLIENTS if c["id"] == client_id), None)
                if not client:
                    raise HTTPException(status_code=404, detail="Client not found")
                return {"client": client, "source": "fallback"}
                
            return {"client": clients[0], "source": "azure"}
            
        except Exception as e:
            # If Azure services fail, fallback to mock data
            print(f"Error using Azure services for client details: {str(e)}")
            
            # Try to find client in mock data
            client = next((c for c in MOCK_CLIENTS if c["id"] == client_id), None)
            if not client:
                raise HTTPException(status_code=404, detail="Client not found")
            return {"client": client, "source": "fallback", "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("BACKEND_PORT", 8000)), reload=True) 