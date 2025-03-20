# Job Coach AI Assistant - Demo Guide

This demo guide will help you showcase the key features of the Job Coach AI Assistant during your hackathon presentation.

## Demo Setup

Before starting your demo:

1. Make sure both the backend and frontend are running:
   ```bash
   # Terminal 1 - Backend
   cd backend
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   uvicorn main:app --reload
   
   # Terminal 2 - Frontend
   cd frontend
   npm install
   npm start
   ```

2. Have the following test files ready:
   - Sample I-9 form PDF
   - Sample Schedule A letter PDF
   - Sample job application form PDF
   - Sample 1040 tax form PDF

3. Open the application in your browser at http://localhost:3000

## Demo Script

Here's a suggested script to follow for your presentation:

### 1. Introduction (1-2 minutes)

"Today, we're demonstrating our Job Coach AI Assistant, an innovative solution designed to help job coaches who support people with disabilities. Job coaches face significant challenges including managing extensive paperwork, supporting multiple clients, and creating redundant reports for various stakeholders. Our solution leverages Microsoft Azure AI services to address these challenges."

### 2. System Overview (1 minute)

"The system architecture includes:
- Python FastAPI backend with Azure services integration
- React frontend with an intuitive UI
- Azure AI Document Intelligence for form processing
- Azure OpenAI for intelligent assistance
- Azure Blob Storage and Cosmos DB for data persistence"

### 3. Feature Demonstration (5-7 minutes)

#### Document Processing Demo

1. **Navigate to the Document Processor**
   - "The Document Processor allows job coaches to upload and automatically extract information from various government forms and job applications."

2. **Select a client and document type**
   - "Let's select 'John Doe' as our client and 'I-9 Form' as the document type."

3. **Upload a document**
   - "We can either drag and drop or click to select a document. Let's upload this sample I-9 form."

4. **Process the document**
   - "Now we click 'Process Document' and Azure AI Document Intelligence extracts the relevant information."

5. **Show extracted fields**
   - "As you can see, the system has automatically extracted key fields like employee name, address, SSN, and citizenship status."

6. **Demonstrate field editing**
   - "If any information was incorrectly extracted, the job coach can easily edit fields before saving."

#### AI Assistant Demo

1. **Navigate to the AI Assistant**
   - "The AI Assistant provides job coaches with guidance on form completion, accommodations, and client support strategies."

2. **Select a client (optional)**
   - "We can optionally select a client to personalize the assistance."

3. **Ask about I-9 form assistance**
   - "Let's ask: 'How do I help my client complete the I-9 form?'"
   - (Wait for response)
   - "The AI Assistant provides step-by-step guidance specific to this form."

4. **Ask about Schedule A letter**
   - "Now let's ask: 'What should be included in a Schedule A letter?'"
   - (Wait for response)
   - "The system provides detailed information about Schedule A requirements."

5. **Ask about job coaching strategy**
   - "Let's ask a more general question: 'What strategies can I use to help my client succeed in a retail position?'"
   - (Wait for response)
   - "The AI Assistant draws on best practices in supported employment to provide actionable advice."

6. **Demonstrate voice input (if implemented)**
   - "Job coaches can also use voice input when their hands are busy or they're on-the-go."

#### Report Generation Demo (if time permits)

1. **Navigate to the Reports section**
   - "The report generation feature allows job coaches to create customized reports for different stakeholders."

2. **Select a client and report type**
   - "Let's generate a government report for John Doe."

3. **Show generated report**
   - "The system automatically compiles relevant information and formats it appropriately for the intended audience."

### 4. Highlight Azure Services (1-2 minutes)

"Our solution leverages multiple Azure services:
- Azure AI Document Intelligence for intelligent form processing
- Azure OpenAI for the AI assistant capability
- Azure Speech Services for voice interface
- Azure Cosmos DB for scalable data storage
- Azure Blob Storage for document management
- Azure AD B2C for secure authentication"

### 5. Responsible AI Considerations (1 minute)

"We've built responsible AI principles into our solution:
- Accessibility features ensure the application is usable by people with varying abilities
- Privacy protections for sensitive client information
- Transparency in AI-generated content
- Human-in-the-loop verification for critical data extraction"

### 6. Conclusion & Future Directions (1 minute)

"The Job Coach AI Assistant demonstrates how Microsoft Azure AI services can be combined to create powerful solutions that address real-world challenges. Future enhancements could include:
- Mobile application for on-the-go support
- Integration with job-matching platforms
- Expanded form processing capabilities
- Advanced analytics for program outcomes"

## Demo Tips

1. **Practice the flow** - Rehearse the demo several times to ensure smooth transitions
2. **Prepare for questions** - Be ready to answer questions about your technical choices
3. **Have backup examples** - Prepare multiple examples in case one doesn't work as expected
4. **Focus on impact** - Emphasize how your solution addresses the real challenges job coaches face
5. **Highlight innovation** - Call attention to innovative features that differentiate your solution

## Judging Criteria Alignment

Here's how our demo addresses the judging criteria:

1. **Performance (25%)** - Show the system working in real-time with quick responses
2. **Innovation (25%)** - Highlight the novel combination of document processing and AI guidance
3. **Breadth of Azure services used (25%)** - Demonstrate integration with multiple Azure services
4. **Responsible AI (25%)** - Explain the responsible AI principles incorporated into the design

Good luck with your presentation! 