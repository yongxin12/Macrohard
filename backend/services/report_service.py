import os
import logging
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv
from typing import Dict, Any, List, Optional
import openai
import pandas as pd
from jinja2 import Environment, FileSystemLoader, select_autoescape

# Load environment variables
load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)

class ReportService:
    """Service for generating reports using AI and templates"""

    def __init__(self):
        """Initialize the report service"""
        # Azure OpenAI configuration
        self.azure_openai_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
        self.azure_openai_key = os.getenv("AZURE_OPENAI_KEY")
        self.azure_openai_deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4")
        
        # Initialize OpenAI client
        if self.azure_openai_endpoint and self.azure_openai_key:
            openai.api_type = "azure"
            openai.api_base = self.azure_openai_endpoint
            openai.api_key = self.azure_openai_key
            openai.api_version = "2023-05-15"
            logger.info("Azure OpenAI client initialized for reporting")
        else:
            logger.warning("Azure OpenAI credentials not found. Using mock reporting.")
        
        # Create templates directory if it doesn't exist
        os.makedirs("templates", exist_ok=True)
        
        # Initialize Jinja2 template environment
        self.jinja_env = Environment(
            loader=FileSystemLoader("templates"),
            autoescape=select_autoescape(['html', 'xml'])
        )
        
        # Report type mappings
        self.report_types = {
            "government": self._generate_government_report,
            "employer": self._generate_employer_report,
            "client": self._generate_client_report,
            "summary": self._generate_summary_report
        }
    
    async def generate_report(self, client_id: str, report_type: str, 
                              date_range: Dict[str, str] = None, user_id: str = None) -> Dict[str, Any]:
        """
        Generate a report based on client data
        
        Args:
            client_id: ID of the client
            report_type: Type of report to generate
            date_range: Optional date range for the report
            user_id: ID of the user generating the report
            
        Returns:
            Generated report
        """
        try:
            # Process date range
            if not date_range:
                # Default to last month
                end_date = datetime.now()
                start_date = end_date - timedelta(days=30)
                date_range = {
                    "start": start_date.strftime("%Y-%m-%d"),
                    "end": end_date.strftime("%Y-%m-%d")
                }
            
            # Get client data
            client_data = await self._get_client_data(client_id)
            
            # Check if we have a specialized generator for this report type
            if report_type in self.report_types:
                generator = self.report_types[report_type]
                report = await generator(client_id, client_data, date_range, user_id)
            else:
                # Default to summary report
                report = await self._generate_summary_report(client_id, client_data, date_range, user_id)
            
            return report
        except Exception as e:
            logger.error(f"Error generating report: {str(e)}")
            # For demo purposes, return mock data if an error occurs
            return self._get_mock_report(client_id, report_type, date_range)
    
    async def _get_client_data(self, client_id: str) -> Dict[str, Any]:
        """Get client data for reporting"""
        # In a real implementation, this would fetch data from various sources
        # For the prototype, we'll return mock data
        
        return {
            "client_id": client_id,
            "name": "John Doe",
            "disability_type": "Intellectual disability",
            "job_title": "Retail Associate",
            "employer": "ABC Retail Store",
            "start_date": "2023-05-15",
            "work_hours": 20,
            "wage": 15.50,
            "accommodations": ["Visual task list", "Job coach presence for first month", "Extended training period"],
            "progress_notes": [
                {"date": "2023-05-15", "note": "First day at work. John was nervous but followed instructions well."},
                {"date": "2023-05-18", "note": "John is learning the cash register system. Needs some additional practice."},
                {"date": "2023-05-25", "note": "Successfully completed a full shift independently."},
                {"date": "2023-06-01", "note": "Manager reported John is doing well with customer interactions."}
            ],
            "goals": [
                {"goal": "Learn to operate the cash register independently", "status": "Completed"},
                {"goal": "Interact confidently with customers", "status": "In progress"},
                {"goal": "Manage stock rotation", "status": "Not started"}
            ],
            "documents": [
                {"type": "i9", "status": "Completed", "date": "2023-05-10"},
                {"type": "job_application", "status": "Completed", "date": "2023-04-20"},
                {"type": "schedule_a", "status": "Pending", "date": "2023-05-05"}
            ]
        }
    
    async def _generate_government_report(self, client_id: str, client_data: Dict[str, Any], 
                                        date_range: Dict[str, str], user_id: str = None) -> Dict[str, Any]:
        """Generate a report for government agencies"""
        try:
            if self.azure_openai_endpoint and self.azure_openai_key:
                # Use Azure OpenAI to generate report content
                system_message = """You are an expert job coach assistant that generates formal reports for government agencies.
                Focus on employment outcomes, hours worked, wages earned, and support provided. 
                Keep language professional and factual.
                Focus on quantifiable achievements and compliance with regulations.
                Format your response as a formal report with sections and bullet points as needed."""
                
                # Prepare client data summary for the prompt
                client_summary = f"""
                Client: {client_data['name']}
                Disability: {client_data['disability_type']}
                Job: {client_data['job_title']} at {client_data['employer']}
                Start Date: {client_data['start_date']}
                Hours: {client_data['work_hours']} hours per week
                Wage: ${client_data['wage']} per hour
                Accommodations: {', '.join(client_data['accommodations'])}
                
                Progress Notes:
                {json.dumps(client_data['progress_notes'], indent=2)}
                
                Goals:
                {json.dumps(client_data['goals'], indent=2)}
                """
                
                # Call Azure OpenAI
                response = openai.ChatCompletion.create(
                    engine=self.azure_openai_deployment,
                    messages=[
                        {"role": "system", "content": system_message},
                        {"role": "user", "content": f"Generate a government agency report for the period {date_range['start']} to {date_range['end']} using this client data: {client_summary}"}
                    ],
                    temperature=0.7,
                    max_tokens=1000,
                    top_p=0.95,
                    frequency_penalty=0,
                    presence_penalty=0,
                    user=user_id
                )
                
                # Extract the response
                report_content = response.choices[0].message.content
                
                # Create the report object
                report = {
                    "report_id": f"gov-{client_id}-{datetime.now().strftime('%Y%m%d')}",
                    "client_id": client_id,
                    "report_type": "government",
                    "date_range": date_range,
                    "generated_at": datetime.now().isoformat(),
                    "generated_by": user_id,
                    "content": report_content,
                    "metrics": {
                        "hours_worked": client_data["work_hours"] * 4,  # Approximation for a month
                        "wage_earned": client_data["work_hours"] * 4 * client_data["wage"],
                        "goals_completed": sum(1 for goal in client_data["goals"] if goal["status"] == "Completed"),
                        "goals_in_progress": sum(1 for goal in client_data["goals"] if goal["status"] == "In progress")
                    }
                }
                
                return report
            else:
                # Return mock data if no OpenAI connection
                return self._get_mock_report(client_id, "government", date_range)
        except Exception as e:
            logger.error(f"Error generating government report: {str(e)}")
            return self._get_mock_report(client_id, "government", date_range)
    
    async def _generate_employer_report(self, client_id: str, client_data: Dict[str, Any], 
                                      date_range: Dict[str, str], user_id: str = None) -> Dict[str, Any]:
        """Generate a report for employers"""
        try:
            if self.azure_openai_endpoint and self.azure_openai_key:
                # Similar implementation as government report but tailored for employers
                system_message = """You are an expert job coach assistant that generates reports for employers.
                Focus on employee performance, achievements, and areas for potential development.
                Keep language positive and constructive, highlighting successes.
                Suggest specific accommodations or strategies that are working well.
                Format your response as a professional report suitable for a manager."""
                
                # Prepare client data summary for the prompt
                client_summary = f"""
                Employee: {client_data['name']}
                Position: {client_data['job_title']}
                Start Date: {client_data['start_date']}
                Hours: {client_data['work_hours']} hours per week
                Accommodations: {', '.join(client_data['accommodations'])}
                
                Progress Notes:
                {json.dumps(client_data['progress_notes'], indent=2)}
                
                Goals:
                {json.dumps(client_data['goals'], indent=2)}
                """
                
                # Call Azure OpenAI
                response = openai.ChatCompletion.create(
                    engine=self.azure_openai_deployment,
                    messages=[
                        {"role": "system", "content": system_message},
                        {"role": "user", "content": f"Generate an employer report for the period {date_range['start']} to {date_range['end']} using this employee data: {client_summary}"}
                    ],
                    temperature=0.7,
                    max_tokens=1000,
                    top_p=0.95,
                    frequency_penalty=0,
                    presence_penalty=0,
                    user=user_id
                )
                
                # Extract the response
                report_content = response.choices[0].message.content
                
                # Create the report object
                report = {
                    "report_id": f"emp-{client_id}-{datetime.now().strftime('%Y%m%d')}",
                    "client_id": client_id,
                    "report_type": "employer",
                    "date_range": date_range,
                    "generated_at": datetime.now().isoformat(),
                    "generated_by": user_id,
                    "content": report_content,
                    "metrics": {
                        "attendance_rate": 95,  # Mock data
                        "productivity_rate": 85,  # Mock data
                        "goals_completed": sum(1 for goal in client_data["goals"] if goal["status"] == "Completed"),
                        "goals_in_progress": sum(1 for goal in client_data["goals"] if goal["status"] == "In progress")
                    }
                }
                
                return report
            else:
                # Return mock data if no OpenAI connection
                return self._get_mock_report(client_id, "employer", date_range)
        except Exception as e:
            logger.error(f"Error generating employer report: {str(e)}")
            return self._get_mock_report(client_id, "employer", date_range)
    
    async def _generate_client_report(self, client_id: str, client_data: Dict[str, Any], 
                                    date_range: Dict[str, str], user_id: str = None) -> Dict[str, Any]:
        """Generate a report for clients with disabilities"""
        try:
            if self.azure_openai_endpoint and self.azure_openai_key:
                # Similar implementation but tailored for clients
                system_message = """You are an expert job coach assistant that generates reports for clients with disabilities.
                Use simple, clear language suitable for individuals with intellectual disabilities.
                Focus on achievements, positive feedback, and clear next steps.
                Use short sentences and avoid complex terminology.
                Format your response in a very accessible way with bullet points and simple language."""
                
                # Prepare client data summary for the prompt
                client_summary = f"""
                Name: {client_data['name']}
                Job: {client_data['job_title']} at {client_data['employer']}
                Start Date: {client_data['start_date']}
                Hours: {client_data['work_hours']} hours per week
                Pay: ${client_data['wage']} per hour
                
                Progress Notes:
                {json.dumps(client_data['progress_notes'], indent=2)}
                
                Goals:
                {json.dumps(client_data['goals'], indent=2)}
                """
                
                # Call Azure OpenAI
                response = openai.ChatCompletion.create(
                    engine=self.azure_openai_deployment,
                    messages=[
                        {"role": "system", "content": system_message},
                        {"role": "user", "content": f"Generate a progress report for a client with intellectual disabilities for the period {date_range['start']} to {date_range['end']} using this data: {client_summary}"}
                    ],
                    temperature=0.7,
                    max_tokens=800,
                    top_p=0.95,
                    frequency_penalty=0,
                    presence_penalty=0,
                    user=user_id
                )
                
                # Extract the response
                report_content = response.choices[0].message.content
                
                # Create the report object
                report = {
                    "report_id": f"client-{client_id}-{datetime.now().strftime('%Y%m%d')}",
                    "client_id": client_id,
                    "report_type": "client",
                    "date_range": date_range,
                    "generated_at": datetime.now().isoformat(),
                    "generated_by": user_id,
                    "content": report_content,
                    "metrics": {
                        "achievements": [
                            "Learned to use the cash register",
                            "Completed a full shift independently"
                        ],
                        "next_steps": [
                            "Practice customer service skills",
                            "Learn stock rotation procedures"
                        ]
                    }
                }
                
                return report
            else:
                # Return mock data if no OpenAI connection
                return self._get_mock_report(client_id, "client", date_range)
        except Exception as e:
            logger.error(f"Error generating client report: {str(e)}")
            return self._get_mock_report(client_id, "client", date_range)
    
    async def _generate_summary_report(self, client_id: str, client_data: Dict[str, Any], 
                                     date_range: Dict[str, str], user_id: str = None) -> Dict[str, Any]:
        """Generate a summary report for internal use"""
        try:
            # Calculate metrics
            hours_worked = client_data["work_hours"] * 4  # Approximate for a month
            wage_earned = hours_worked * client_data["wage"]
            goals_completed = sum(1 for goal in client_data["goals"] if goal["status"] == "Completed")
            goals_in_progress = sum(1 for goal in client_data["goals"] if goal["status"] == "In progress")
            
            # Create the report object
            report = {
                "report_id": f"summary-{client_id}-{datetime.now().strftime('%Y%m%d')}",
                "client_id": client_id,
                "client_name": client_data["name"],
                "report_type": "summary",
                "date_range": date_range,
                "generated_at": datetime.now().isoformat(),
                "generated_by": user_id,
                "content": {
                    "employment_status": "Employed",
                    "job_title": client_data["job_title"],
                    "employer": client_data["employer"],
                    "start_date": client_data["start_date"],
                    "work_hours": client_data["work_hours"],
                    "wage": client_data["wage"],
                    "hours_worked": hours_worked,
                    "wage_earned": wage_earned,
                    "accommodations": client_data["accommodations"],
                    "progress_notes": client_data["progress_notes"],
                    "goals": client_data["goals"],
                    "documents": client_data["documents"]
                },
                "metrics": {
                    "hours_worked": hours_worked,
                    "wage_earned": wage_earned,
                    "goals_completed": goals_completed,
                    "goals_in_progress": goals_in_progress,
                    "documents_pending": sum(1 for doc in client_data["documents"] if doc["status"] == "Pending")
                }
            }
            
            return report
        except Exception as e:
            logger.error(f"Error generating summary report: {str(e)}")
            return self._get_mock_report(client_id, "summary", date_range)
    
    def _get_mock_report(self, client_id: str, report_type: str, date_range: Dict[str, str]) -> Dict[str, Any]:
        """Generate mock report data for demonstration purposes"""
        mock_reports = {
            "government": {
                "report_id": f"gov-{client_id}-{datetime.now().strftime('%Y%m%d')}",
                "client_id": client_id,
                "report_type": "government",
                "date_range": date_range,
                "generated_at": datetime.now().isoformat(),
                "generated_by": "mock-user-1",
                "content": """
# EMPLOYMENT SUPPORT SERVICES REPORT
## For Government Agency Use

**Reporting Period:** {start_date} to {end_date}
**Client ID:** {client_id}
**Job Coach:** Job Coach Name

### EMPLOYMENT DETAILS
- **Status:** Employed
- **Position:** Retail Associate
- **Employer:** ABC Retail Store
- **Start Date:** 2023-05-15
- **Hours Worked:** 80 hours
- **Wages Earned:** $1,240.00
- **Funding Source:** Vocational Rehabilitation Services

### ACCOMMODATIONS PROVIDED
- Visual task list
- Job coach presence for first month
- Extended training period

### PROGRESS TOWARD EMPLOYMENT GOALS
1. **Goal:** Learn to operate the cash register independently
   - **Status:** Completed
   - **Evidence:** Supervisor verification on 2023-05-25

2. **Goal:** Interact confidently with customers
   - **Status:** In progress
   - **Evidence:** Successfully greeting customers, still developing product knowledge

3. **Goal:** Manage stock rotation
   - **Status:** Not started
   - **Planned Start:** Next reporting period

### SUPPORT SERVICES PROVIDED
- 12 hours of on-site job coaching
- 2 hours of employer consultation
- 1 hour of benefits counseling

### NEXT STEPS
- Gradually reduce job coaching hours
- Implement customer interaction scripts
- Begin training on stock rotation procedures

This report certifies that all services were provided in accordance with the client's Individual Plan for Employment.
                """.format(
                    start_date=date_range["start"],
                    end_date=date_range["end"],
                    client_id=client_id
                ),
                "metrics": {
                    "hours_worked": 80,
                    "wage_earned": 1240.00,
                    "goals_completed": 1,
                    "goals_in_progress": 1
                }
            },
            "employer": {
                "report_id": f"emp-{client_id}-{datetime.now().strftime('%Y%m%d')}",
                "client_id": client_id,
                "report_type": "employer",
                "date_range": date_range,
                "generated_at": datetime.now().isoformat(),
                "generated_by": "mock-user-1",
                "content": """
# EMPLOYEE PROGRESS REPORT

**Reporting Period:** {start_date} to {end_date}
**Employee:** John Doe
**Position:** Retail Associate

## PERFORMANCE HIGHLIGHTS

John has shown significant progress during this reporting period. Key achievements include:

- Successfully learned to operate the cash register independently
- Demonstrated excellent punctuality with 100% attendance
- Followed multi-step visual instructions accurately
- Began interacting with customers, showing improving confidence

## EFFECTIVE ACCOMMODATIONS

The following accommodations have proven successful:

1. **Visual task list** - John refers to this consistently and it helps him stay on track
2. **Extended training period** - The additional time has allowed for mastery of basic skills
3. **Structured routine** - John performs best when following the established daily workflow

## AREAS FOR DEVELOPMENT

We recommend focusing on the following areas:

1. **Customer interactions** - Continue practicing greeting customers and answering common questions
2. **Product knowledge** - Expand familiarity with product locations and features
3. **Multitasking** - Gradually introduce handling multiple responsibilities

## RECOMMENDATIONS

- Consider incorporating picture-based product guides
- Maintain the visual task list, updating as new responsibilities are added
- Schedule regular check-ins at the beginning of shifts to review daily expectations

John is making excellent progress in his role. His attention to detail and reliability are valuable assets to your team.
                """.format(
                    start_date=date_range["start"],
                    end_date=date_range["end"]
                ),
                "metrics": {
                    "attendance_rate": 100,
                    "productivity_rate": 85,
                    "goals_completed": 1,
                    "goals_in_progress": 1
                }
            },
            "client": {
                "report_id": f"client-{client_id}-{datetime.now().strftime('%Y%m%d')}",
                "client_id": client_id,
                "report_type": "client",
                "date_range": date_range,
                "generated_at": datetime.now().isoformat(),
                "generated_by": "mock-user-1",
                "content": """
# YOUR WORK PROGRESS

**Time Period:** {start_date} to {end_date}

## GREAT JOB!

You have done very well at your job! Here are some things you did:

* ✅ You learned how to use the cash register
* ✅ You came to work on time every day
* ✅ You followed all the steps on your task list
* ✅ You worked a full shift by yourself

## YOUR NEXT GOALS

Here are the next things to learn:

1. Practice talking to customers
   * Say "Hello, how can I help you?"
   * Learn where things are in the store

2. Learn about putting products on shelves
   * Older products go in front
   * Newer products go in back

## YOUR WORK SCHEDULE

* You work 20 hours each week
* You earned $1,240 this month
* You have worked at ABC Store for 1 month

## WHAT'S NEXT

We will meet on Monday to talk about your progress and practice greeting customers.

GREAT WORK! 👍
                """.format(
                    start_date=date_range["start"],
                    end_date=date_range["end"]
                ),
                "metrics": {
                    "achievements": [
                        "Learned to use the cash register",
                        "Completed a full shift independently"
                    ],
                    "next_steps": [
                        "Practice customer service skills",
                        "Learn stock rotation procedures"
                    ]
                }
            },
            "summary": {
                "report_id": f"summary-{client_id}-{datetime.now().strftime('%Y%m%d')}",
                "client_id": client_id,
                "client_name": "John Doe",
                "report_type": "summary",
                "date_range": date_range,
                "generated_at": datetime.now().isoformat(),
                "generated_by": "mock-user-1",
                "content": {
                    "employment_status": "Employed",
                    "job_title": "Retail Associate",
                    "employer": "ABC Retail Store",
                    "start_date": "2023-05-15",
                    "work_hours": 20,
                    "wage": 15.50,
                    "hours_worked": 80,
                    "wage_earned": 1240.00,
                    "accommodations": ["Visual task list", "Job coach presence for first month", "Extended training period"],
                    "progress_notes": [
                        {"date": "2023-05-15", "note": "First day at work. John was nervous but followed instructions well."},
                        {"date": "2023-05-18", "note": "John is learning the cash register system. Needs some additional practice."},
                        {"date": "2023-05-25", "note": "Successfully completed a full shift independently."},
                        {"date": "2023-06-01", "note": "Manager reported John is doing well with customer interactions."}
                    ],
                    "goals": [
                        {"goal": "Learn to operate the cash register independently", "status": "Completed"},
                        {"goal": "Interact confidently with customers", "status": "In progress"},
                        {"goal": "Manage stock rotation", "status": "Not started"}
                    ],
                    "documents": [
                        {"type": "i9", "status": "Completed", "date": "2023-05-10"},
                        {"type": "job_application", "status": "Completed", "date": "2023-04-20"},
                        {"type": "schedule_a", "status": "Pending", "date": "2023-05-05"}
                    ]
                },
                "metrics": {
                    "hours_worked": 80,
                    "wage_earned": 1240.00,
                    "goals_completed": 1,
                    "goals_in_progress": 1,
                    "documents_pending": 1
                }
            }
        }
        
        return mock_reports.get(report_type, mock_reports["summary"]) 