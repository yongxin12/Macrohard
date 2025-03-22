import os
import logging
import json
from dotenv import load_dotenv
from azure.core.credentials import AzureKeyCredential
from azure.ai.formrecognizer import DocumentAnalysisClient
from typing import Dict, Any, List

# Load environment variables
load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)

class DocumentService:
    """Service for processing documents using Azure AI Document Intelligence"""

    def __init__(self):
        """Initialize the document service with Azure credentials"""
        self.endpoint = os.getenv("AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT")
        self.key = os.getenv("AZURE_DOCUMENT_INTELLIGENCE_KEY")
        
        if not self.endpoint or not self.key:
            logger.warning("Azure Document Intelligence credentials not found. Using mock data.")
            self.client = None
        else:
            self.client = DocumentAnalysisClient(
                endpoint=self.endpoint, 
                credential=AzureKeyCredential(self.key)
            )
            logger.info("Document Intelligence client initialized")
        
        # Document type mappings
        self.document_types = {
            "i9": self._process_i9_form,
            "schedule_a": self._process_schedule_a_form,
            "tax_1040": self._process_tax_1040_form,
            "job_application": self._process_job_application,
            "generic": self._process_generic_document
        }

    async def process_document(self, file_path: str, document_type: str) -> Dict[str, Any]:
        """
        Process a document using Azure AI Document Intelligence
        
        Args:
            file_path: Path to the document file
            document_type: Type of document to process
            
        Returns:
            Extracted fields from the document
        """
        try:
            # Check if we have a specialized processor for this document type
            if document_type in self.document_types:
                processor = self.document_types[document_type]
                return await processor(file_path)
            else:
                # Default to generic document processing
                return await self._process_generic_document(file_path)
        except Exception as e:
            logger.error(f"Error processing document: {str(e)}")
            # For demo purposes, return mock data if an error occurs
            return self._get_mock_data(document_type)
    
    async def _process_i9_form(self, file_path: str) -> Dict[str, Any]:
        """Process an I-9 Employment Eligibility Verification form"""
        try:
            # If we have a client, use Azure Document Intelligence
            if self.client:
                with open(file_path, "rb") as f:
                    logger.info("Starting I-9 form analysis with prebuilt-document model")
                    poller = self.client.begin_analyze_document(
                        "prebuilt-document", document=f.read()
                    )
                result = poller.result()
                
                # Extract relevant fields for I-9 form
                extracted_data = {
                    "document_type": "I-9 Form",
                    "fields_detected": 0,
                    "fields": {},
                    "tables": []
                }

                # Extract all text content first
                all_text = ""
                for page in result.pages:
                    for line in page.lines:
                        all_text += line.content + "\n"
                
                # Look for common I-9 fields in the text
                field_patterns = {
                    "last_name": r"Last Name.{0,50}?([A-Za-z\- ]+)",
                    "first_name": r"First Name.{0,50}?([A-Za-z\- ]+)",
                    "middle_initial": r"Middle Initial.{0,50}?([A-Za-z])",
                    "address": r"Address.{0,50}?([A-Za-z0-9\- ,\.]+)",
                    "apt_number": r"Apt\. Number.{0,50}?([A-Za-z0-9\- ]+)",
                    "city": r"City.{0,50}?([A-Za-z\- ]+)",
                    "state": r"State.{0,50}?([A-Z]{2})",
                    "zip_code": r"ZIP Code.{0,50}?(\d{5})",
                    "ssn": r"Social Security Number.{0,50}?(\d{3}-\d{2}-\d{4})",
                    "email": r"E-mail Address.{0,50}?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})",
                    "phone": r"Telephone Number.{0,50}?(\(\d{3}\) \d{3}-\d{4}|\d{3}-\d{3}-\d{4})"
                }

                import re
                for field, pattern in field_patterns.items():
                    match = re.search(pattern, all_text)
                    if match:
                        extracted_data["fields"][field] = match.group(1).strip()
                        extracted_data["fields_detected"] += 1

                # Extract tables (for List A/B/C documents)
                if hasattr(result, 'tables'):
                    for table in result.tables:
                        table_data = []
                        for cell in table.cells:
                            table_data.append({
                                "row_index": cell.row_index,
                                "column_index": cell.column_index,
                                "content": cell.content
                            })
                        extracted_data["tables"].append(table_data)

                # Extract key-value pairs
                if hasattr(result, 'key_value_pairs'):
                    for field in result.key_value_pairs:
                        key = field.key.content if field.key else ""
                        value = field.value.content if field.value else ""
                        
                        clean_key = key.strip().replace(" ", "_").lower()
                        if clean_key and value:
                            extracted_data["fields"][clean_key] = value.strip()
                            extracted_data["fields_detected"] += 1
                
                logger.info(f"Completed I-9 form analysis. Detected {extracted_data['fields_detected']} fields.")
                return extracted_data
            else:
                # Return mock data if no client
                logger.warning("No Azure client available, returning mock data")
                return self._get_mock_data("i9")
        except Exception as e:
            logger.error(f"Error processing I-9 form: {str(e)}")
            return self._get_mock_data("i9")
    
    async def _process_schedule_a_form(self, file_path: str) -> Dict[str, Any]:
        """Process a Schedule A form for Federal Employment"""
        try:
            # Similar implementation as _process_i9_form
            # Would use Document Intelligence with custom model trained for Schedule A forms
            if self.client:
                with open(file_path, "rb") as f:
                    poller = self.client.begin_analyze_document(
                        "prebuilt-document", document=f.read()
                    )
                result = poller.result()
                
                # Extract relevant fields for Schedule A form
                extracted_data = {}
                
                # Extract specific fields from form
                for field in result.key_value_pairs:
                    key = field.key.content if field.key else ""
                    value = field.value.content if field.value else ""
                    
                    # Map common Schedule A fields
                    clean_key = key.strip().replace(" ", "_").lower()
                    if clean_key and value:
                        extracted_data[clean_key] = value
                
                return extracted_data
            else:
                return self._get_mock_data("schedule_a")
        except Exception as e:
            logger.error(f"Error processing Schedule A form: {str(e)}")
            return self._get_mock_data("schedule_a")
    
    async def _process_tax_1040_form(self, file_path: str) -> Dict[str, Any]:
        """Process a 1040 tax form"""
        try:
            # Similar implementation
            if self.client:
                with open(file_path, "rb") as f:
                    poller = self.client.begin_analyze_document(
                        "prebuilt-tax.us.1040", document=f.read()
                    )
                result = poller.result()
                
                # Extract tax form data
                extracted_data = {}
                
                for field in result.fields.items():
                    field_name, field_value = field
                    extracted_data[field_name] = field_value.value if field_value else ""
                
                return extracted_data
            else:
                return self._get_mock_data("tax_1040")
        except Exception as e:
            logger.error(f"Error processing 1040 tax form: {str(e)}")
            return self._get_mock_data("tax_1040")
    
    async def _process_job_application(self, file_path: str) -> Dict[str, Any]:
        """Process a job application form"""
        try:
            # Similar implementation
            if self.client:
                with open(file_path, "rb") as f:
                    poller = self.client.begin_analyze_document(
                        "prebuilt-document", document=f.read()
                    )
                result = poller.result()
                
                # Extract job application data
                extracted_data = {}
                
                for field in result.key_value_pairs:
                    key = field.key.content if field.key else ""
                    value = field.value.content if field.value else ""
                    
                    # Map common job application fields
                    clean_key = key.strip().replace(" ", "_").lower()
                    if clean_key and value:
                        extracted_data[clean_key] = value
                
                return extracted_data
            else:
                return self._get_mock_data("job_application")
        except Exception as e:
            logger.error(f"Error processing job application: {str(e)}")
            return self._get_mock_data("job_application")
    
    async def _process_generic_document(self, file_path: str) -> Dict[str, Any]:
        """Process a generic document for text extraction"""
        try:
            if self.client:
                with open(file_path, "rb") as f:
                    poller = self.client.begin_analyze_document(
                        "prebuilt-document", document=f.read()
                    )
                result = poller.result()
                
                # Extract text content and any key-value pairs
                extracted_data = {
                    "content": [],
                    "key_value_pairs": {}
                }
                
                # Extract text by page
                for page in result.pages:
                    page_text = ""
                    for line in page.lines:
                        page_text += line.content + "\n"
                    
                    extracted_data["content"].append({
                        "page_number": page.page_number,
                        "text": page_text
                    })
                
                # Extract key-value pairs
                for field in result.key_value_pairs:
                    key = field.key.content if field.key else ""
                    value = field.value.content if field.value else ""
                    
                    clean_key = key.strip().replace(" ", "_").lower()
                    if clean_key and value:
                        extracted_data["key_value_pairs"][clean_key] = value
                
                return extracted_data
            else:
                return self._get_mock_data("generic")
        except Exception as e:
            logger.error(f"Error processing generic document: {str(e)}")
            return self._get_mock_data("generic")
    
    def _get_mock_data(self, document_type: str) -> Dict[str, Any]:
        """Return mock data for demonstration purposes"""
        mock_data = {
            "i9": {
                "employee_name": "John Doe",
                "address": "123 Main St, Anytown, USA 12345",
                "ssn": "XXX-XX-1234",
                "date_of_birth": "01/01/1980",
                "citizenship_status": "U.S. Citizen",
                "document_title": "U.S. Passport",
                "document_number": "123456789",
                "expiration_date": "01/01/2030"
            },
            "schedule_a": {
                "applicant_name": "Jane Smith",
                "disability_type": "Hearing impairment",
                "job_title": "Administrative Assistant",
                "reasonable_accommodation": "Sign language interpreter for meetings",
                "certifying_official": "Dr. Robert Johnson",
                "certification_date": "01/15/2023"
            },
            "tax_1040": {
                "tax_year": "2022",
                "taxpayer_name": "John Doe",
                "filing_status": "Single",
                "total_income": "45000",
                "adjusted_gross_income": "42500",
                "deductions": "12950",
                "taxable_income": "29550",
                "tax": "3300",
                "refund": "1200"
            },
            "job_application": {
                "applicant_name": "Jane Smith",
                "position": "Cashier",
                "phone_number": "(555) 123-4567",
                "email": "jane.smith@example.com",
                "education": "High School Diploma",
                "previous_employer": "ABC Store",
                "work_experience": "2 years retail",
                "references": "John Doe, (555) 987-6543",
                "availability": "Weekdays and weekends"
            },
            "generic": {
                "content": [
                    {
                        "page_number": 1,
                        "text": "This is a sample document with some generic content.\nIt contains multiple lines of text that could be extracted.\nThis is for demonstration purposes only."
                    }
                ],
                "key_value_pairs": {
                    "name": "Sample Document",
                    "date": "01/01/2023",
                    "reference_number": "REF-12345"
                }
            }
        }
        
        return mock_data.get(document_type, mock_data["generic"]) 