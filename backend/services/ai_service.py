import os
import logging
import json
from dotenv import load_dotenv
from typing import Dict, Any, List, Optional
import openai

# Conditionally import Azure services
try:
    import azure.cognitiveservices.speech as speechsdk
    SPEECH_SDK_AVAILABLE = True
except ImportError:
    SPEECH_SDK_AVAILABLE = False
    logging.warning("Azure Speech SDK not available. Speech features will be disabled.")

try:
    from azure.ai.language.questionanswering import QuestionAnsweringClient
    from azure.core.credentials import AzureKeyCredential
    LANGUAGE_SDK_AVAILABLE = True
except ImportError:
    LANGUAGE_SDK_AVAILABLE = False
    logging.warning("Azure Language SDK not available. Language features will be disabled.")

# Load environment variables
load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)

class AIService:
    """Service for AI capabilities using Azure OpenAI and other Azure AI services"""

    def __init__(self):
        """Initialize the AI service with Azure credentials"""
        # Azure OpenAI configuration
        self.azure_openai_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
        self.azure_openai_key = os.getenv("AZURE_OPENAI_KEY")
        self.azure_openai_deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4")
        
        # Azure Language Service configuration
        self.language_endpoint = os.getenv("AZURE_LANGUAGE_ENDPOINT")
        self.language_key = os.getenv("AZURE_LANGUAGE_KEY")
        
        # Azure Speech Service configuration
        self.speech_key = os.getenv("AZURE_SPEECH_KEY")
        self.speech_region = os.getenv("AZURE_SPEECH_REGION")
        
        # Demo mode flag
        self.demo_mode = os.getenv("DEMO_MODE", "true").lower() == "true"
        
        # Initialize OpenAI client
        if not self.demo_mode and self.azure_openai_endpoint and self.azure_openai_key:
            openai.api_type = "azure"
            openai.api_base = self.azure_openai_endpoint
            openai.api_key = self.azure_openai_key
            openai.api_version = "2023-05-15"
            logger.info("Azure OpenAI client initialized")
        else:
            logger.warning("Azure OpenAI credentials not found or demo mode enabled. Using mock responses.")
        
        # Initialize Language Service client
        self.qa_client = None
        if not self.demo_mode and LANGUAGE_SDK_AVAILABLE and self.language_endpoint and self.language_key:
            self.qa_client = QuestionAnsweringClient(
                endpoint=self.language_endpoint,
                credential=AzureKeyCredential(self.language_key)
            )
            logger.info("Azure Language Service client initialized")
        
        # Initialize Speech Service client
        if self.speech_key and self.speech_region:
            self.speech_config = speechsdk.SpeechConfig(
                subscription=self.speech_key,
                region=self.speech_region
            )
            logger.info("Azure Speech Service client initialized")
        else:
            self.speech_config = None
            logger.warning("Azure Speech Service credentials not found")
    
    async def process_query(self, query: str, client_id: Optional[str] = None, user_id: str = None) -> Dict[str, Any]:
        """
        Process a natural language query using Azure OpenAI
        
        Args:
            query: The user's query
            client_id: Optional client ID for context
            user_id: The ID of the user making the query
            
        Returns:
            AI assistant response
        """
        try:
            # Check if we have the necessary credentials for Azure OpenAI
            if self.azure_openai_endpoint and self.azure_openai_key:
                # Prepare system message with context
                system_message = self._get_system_message(client_id)
                
                # Call Azure OpenAI
                response = openai.ChatCompletion.create(
                    engine=self.azure_openai_deployment,
                    messages=[
                        {"role": "system", "content": system_message},
                        {"role": "user", "content": query}
                    ],
                    temperature=0.7,
                    max_tokens=800,
                    top_p=0.95,
                    frequency_penalty=0,
                    presence_penalty=0,
                    user=user_id
                )
                
                # Extract and return the response
                ai_response = response.choices[0].message.content
                
                return {
                    "response_text": ai_response,
                    "sources": [],
                    "context": {"client_id": client_id} if client_id else {}
                }
            else:
                # Return mock response if no credentials
                return self._get_mock_response(query, client_id)
        except Exception as e:
            logger.error(f"Error processing AI query: {str(e)}")
            return {
                "response_text": "I'm sorry, I encountered an error processing your request. Please try again later.",
                "error": str(e)
            }
    
    async def process_voice_query(self, audio_file_path: str, client_id: Optional[str] = None, user_id: str = None) -> Dict[str, Any]:
        """
        Process a voice query using Azure Speech and OpenAI
        
        Args:
            audio_file_path: Path to the audio file
            client_id: Optional client ID for context
            user_id: The ID of the user making the query
            
        Returns:
            AI assistant response with transcription
        """
        try:
            # Check if we have the necessary credentials for Azure Speech Service
            if self.speech_config:
                # Configure audio input
                audio_input = speechsdk.AudioConfig(filename=audio_file_path)
                
                # Create speech recognizer
                speech_recognizer = speechsdk.SpeechRecognizer(
                    speech_config=self.speech_config, 
                    audio_config=audio_input
                )
                
                # Recognize speech
                result = speech_recognizer.recognize_once_async().get()
                
                if result.reason == speechsdk.ResultReason.RecognizedSpeech:
                    transcription = result.text
                    
                    # Process the transcribed query using OpenAI
                    ai_response = await self.process_query(transcription, client_id, user_id)
                    
                    # Add transcription to the response
                    ai_response["transcription"] = transcription
                    
                    return ai_response
                else:
                    error_message = f"Speech recognition failed: {result.reason}"
                    logger.error(error_message)
                    return {
                        "response_text": "I'm sorry, I couldn't understand the audio. Please try again or type your question.",
                        "error": error_message
                    }
            else:
                # Return mock response if no credentials
                return {
                    "response_text": "This is a mock response to your voice query. In a real implementation, I would use Azure Speech Services to transcribe your audio and then process your query.",
                    "transcription": "This is a mock transcription of your voice query.",
                    "sources": [],
                    "context": {"client_id": client_id} if client_id else {}
                }
        except Exception as e:
            logger.error(f"Error processing voice query: {str(e)}")
            return {
                "response_text": "I'm sorry, I encountered an error processing your voice query. Please try again later or type your question.",
                "error": str(e)
            }
    
    async def generate_task_breakdown(self, task_description: str, client_id: Optional[str] = None, user_id: str = None) -> List[Dict[str, Any]]:
        """
        Break down a complex task into simpler steps for clients with disabilities
        
        Args:
            task_description: Description of the task to break down
            client_id: Optional client ID for context
            user_id: The ID of the user making the request
            
        Returns:
            List of steps with descriptions and optional images
        """
        try:
            # Check if we have the necessary credentials for Azure OpenAI
            if self.azure_openai_endpoint and self.azure_openai_key:
                # Prepare system message with context
                system_message = """You are a helpful assistant that breaks down complex tasks into simple, 
                clear steps for individuals with intellectual disabilities. For each step, provide:
                1. A short, simple instruction (1-2 sentences max)
                2. A visual description that could be used to generate an image
                Keep language simple and concrete. Avoid abstract concepts or complex terminology.
                Format your response as a JSON array of steps."""
                
                # Call Azure OpenAI
                response = openai.ChatCompletion.create(
                    engine=self.azure_openai_deployment,
                    messages=[
                        {"role": "system", "content": system_message},
                        {"role": "user", "content": f"Break down this task into simple steps: {task_description}"}
                    ],
                    temperature=0.7,
                    max_tokens=1000,
                    top_p=0.95,
                    frequency_penalty=0,
                    presence_penalty=0,
                    user=user_id
                )
                
                # Extract and parse the response
                ai_response = response.choices[0].message.content
                
                try:
                    # Try to parse as JSON
                    steps = json.loads(ai_response)
                    return steps
                except json.JSONDecodeError:
                    # If not valid JSON, try to extract steps manually
                    logger.warning("Failed to parse AI response as JSON, extracting steps manually")
                    steps = []
                    lines = ai_response.split("\n")
                    current_step = {}
                    
                    for line in lines:
                        if "Step" in line and ":" in line:
                            if current_step and "instruction" in current_step:
                                steps.append(current_step)
                                current_step = {}
                            
                            parts = line.split(":", 1)
                            if len(parts) > 1:
                                current_step["instruction"] = parts[1].strip()
                                current_step["step_number"] = len(steps) + 1
                        elif "Visual" in line and ":" in line:
                            parts = line.split(":", 1)
                            if len(parts) > 1 and "instruction" in current_step:
                                current_step["visual_description"] = parts[1].strip()
                    
                    if current_step and "instruction" in current_step:
                        steps.append(current_step)
                    
                    return steps
            else:
                # Return mock response if no credentials
                return self._get_mock_task_breakdown(task_description)
        except Exception as e:
            logger.error(f"Error generating task breakdown: {str(e)}")
            return [{
                "step_number": 1,
                "instruction": "I'm sorry, I encountered an error breaking down this task. Please try again later.",
                "error": str(e)
            }]
    
    def _get_system_message(self, client_id: Optional[str] = None) -> str:
        """Generate the system message with context for OpenAI"""
        base_message = """You are a helpful assistant for job coaches who support people with disabilities. 
        Your primary goal is to assist the job coach in supporting their clients to find and maintain employment.
        
        You can help with:
        1. Explaining complex forms and paperwork (I-9, Schedule A, tax forms, job applications)
        2. Providing guidance on supporting clients with specific disabilities
        3. Offering strategies for job coaching and training
        4. Suggesting accommodations and adaptations for various work environments
        5. Answering questions about relevant laws, regulations, and resources
        
        Keep your answers clear, concise, and practical. Use simple language when explaining complex topics.
        Always maintain a supportive and positive tone."""
        
        if client_id:
            # In a real implementation, we would fetch client-specific information
            return base_message + f"\n\nYou are currently helping with client ID: {client_id}. Tailor your responses to this client's needs if relevant."
        
        return base_message
    
    def _get_mock_response(self, query: str, client_id: Optional[str] = None) -> Dict[str, Any]:
        """Generate a mock response for demonstration purposes"""
        # Sample responses for different types of queries
        if "i-9" in query.lower() or "i9" in query.lower():
            return {
                "response_text": "The I-9 form is used to verify employment eligibility in the United States. When helping your client complete this form, make sure they bring the appropriate identification documents from List A or a combination from Lists B and C. Common documents include a U.S. passport, permanent resident card, driver's license, Social Security card, or birth certificate. Section 1 must be completed by the employee on their first day, while Section 2 must be completed by the employer within 3 business days of the employee's start date.",
                "sources": ["USCIS I-9 Guidelines"],
                "context": {"client_id": client_id} if client_id else {}
            }
        elif "schedule a" in query.lower():
            return {
                "response_text": "Schedule A is a hiring authority that federal agencies can use to hire individuals with disabilities non-competitively. To qualify, your client will need a certification letter from a licensed medical professional, vocational rehabilitation specialist, or any federal or state agency that issues or provides disability benefits. The letter should state that your client has a qualifying intellectual disability, severe physical disability, or psychiatric disability. This can be a great pathway to federal employment for your clients.",
                "sources": ["OPM Schedule A Guidelines"],
                "context": {"client_id": client_id} if client_id else {}
            }
        elif "tax" in query.lower() or "1040" in query.lower():
            return {
                "response_text": "For the 1040 tax form, your client may qualify for the Earned Income Tax Credit (EITC) if they have a low to moderate income. They might also be eligible for tax credits related to their disability status. Make sure to check if they qualify for the Credit for the Elderly or Disabled (Schedule R), or if their medical expenses exceed 7.5% of their adjusted gross income, as these can be deducted. Consider connecting them with free tax preparation services like VITA (Volunteer Income Tax Assistance) which specifically helps people with disabilities.",
                "sources": ["IRS Tax Guidelines for People with Disabilities"],
                "context": {"client_id": client_id} if client_id else {}
            }
        elif "job application" in query.lower():
            return {
                "response_text": "When helping your client with a job application, focus on highlighting their strengths and abilities rather than their limitations. Help them identify transferable skills from previous work, volunteer, or life experiences. For the employment history section, be honest but positive about any gaps, perhaps framing them as periods of skill development or managing health conditions. Regarding disability disclosure, remind them this is a personal choice - they are only required to disclose if they need accommodations. If they choose to disclose, help them frame it positively, focusing on their abilities and any accommodations that would help them succeed.",
                "sources": ["Job Accommodation Network (JAN)"],
                "context": {"client_id": client_id} if client_id else {}
            }
        else:
            return {
                "response_text": "As a job coach, your role in supporting clients with disabilities is invaluable. Focus on building a trusting relationship with your client, understanding their specific needs and goals, and serving as a bridge between them and their employer. Remember to gradually fade your support as your client becomes more independent in their role. Document their progress and any accommodations that prove helpful, as this information can be valuable for future placements. If you have questions about specific forms, accommodation strategies, or resources, feel free to ask me for more targeted assistance.",
                "sources": ["Best Practices in Supported Employment"],
                "context": {"client_id": client_id} if client_id else {}
            }
    
    def _get_mock_task_breakdown(self, task_description: str) -> List[Dict[str, Any]]:
        """Generate mock task breakdown steps for demonstration purposes"""
        if "cashier" in task_description.lower():
            return [
                {
                    "step_number": 1,
                    "instruction": "Greet the customer with a smile and say 'Hello'.",
                    "visual_description": "Person smiling and waving at a customer approaching the counter."
                },
                {
                    "step_number": 2,
                    "instruction": "Scan each item by moving it over the scanner. Listen for the beep.",
                    "visual_description": "Hands holding an item and passing it over a barcode scanner with a visible red light."
                },
                {
                    "step_number": 3,
                    "instruction": "Tell the customer the total amount to pay.",
                    "visual_description": "Person pointing to the display screen showing the total price."
                },
                {
                    "step_number": 4,
                    "instruction": "Take the customer's money or card.",
                    "visual_description": "Hands receiving cash or a credit card from a customer."
                },
                {
                    "step_number": 5,
                    "instruction": "If they pay with cash, count out their change carefully.",
                    "visual_description": "Hands counting dollar bills and coins from a cash register drawer."
                },
                {
                    "step_number": 6,
                    "instruction": "Put the items in a bag.",
                    "visual_description": "Hands placing purchased items into a shopping bag."
                },
                {
                    "step_number": 7,
                    "instruction": "Hand the bag and receipt to the customer. Say 'Thank you'.",
                    "visual_description": "Person smiling and handing a bag and receipt to the customer."
                }
            ]
        elif "cleaning" in task_description.lower():
            return [
                {
                    "step_number": 1,
                    "instruction": "Get your cleaning supplies: spray bottle, cloth, and gloves.",
                    "visual_description": "Cleaning supplies neatly arranged - spray bottle, microfiber cloth, and rubber gloves."
                },
                {
                    "step_number": 2,
                    "instruction": "Put on your gloves to protect your hands.",
                    "visual_description": "Hands putting on rubber gloves."
                },
                {
                    "step_number": 3,
                    "instruction": "Spray the cleaner on the surface you want to clean.",
                    "visual_description": "Hand holding spray bottle and spraying cleaner on a counter surface."
                },
                {
                    "step_number": 4,
                    "instruction": "Wipe the surface with your cloth in circles.",
                    "visual_description": "Hand wiping a surface with a cloth in a circular motion."
                },
                {
                    "step_number": 5,
                    "instruction": "Check if the surface looks clean. If not, spray and wipe again.",
                    "visual_description": "Person looking closely at a surface to check if it's clean."
                },
                {
                    "step_number": 6,
                    "instruction": "When finished, put away your supplies.",
                    "visual_description": "Hands placing cleaning supplies back in a storage container."
                }
            ]
        else:
            return [
                {
                    "step_number": 1,
                    "instruction": "Get ready for the task by gathering what you need.",
                    "visual_description": "Person standing by a table with various tools or supplies needed for the task."
                },
                {
                    "step_number": 2,
                    "instruction": "Start with the first part of the task. Take your time.",
                    "visual_description": "Person calmly beginning the first step of a process, focused on the task."
                },
                {
                    "step_number": 3,
                    "instruction": "Move to the next part when you're ready.",
                    "visual_description": "Person moving from one completed task to the next step."
                },
                {
                    "step_number": 4,
                    "instruction": "Ask for help if you need it.",
                    "visual_description": "Person raising hand or approaching another person to ask a question."
                },
                {
                    "step_number": 5,
                    "instruction": "Check your work when you finish.",
                    "visual_description": "Person reviewing completed work with a satisfied expression."
                }
            ] 