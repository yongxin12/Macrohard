# Job Coach AI Assistant - Demo Tutorial

This tutorial will guide you through exploring the Job Coach AI Assistant in demo mode, showing how to use each of its major features with the simplified HTML interface.

## Prerequisites

- Backend server running at http://localhost:8000
- Frontend server running at http://localhost:3000
- Web browser

## Step 1: Starting the Application

1. Open your terminal and navigate to the backend directory:
   ```bash
   cd /Users/weijianguo/repositories/Macrohard/backend
   ```

2. Activate the virtual environment:
   ```bash
   # On macOS/Linux:
   source venv/bin/activate
   # On Windows:
   venv\Scripts\activate
   ```

3. Start the backend server:
   ```bash
   python main.py
   ```

4. Open another terminal window and navigate to the frontend directory:
   ```bash
   cd /Users/weijianguo/repositories/Macrohard/frontend
   ```

5. Start the frontend server:
   ```bash
   python -m http.server 3000
   ```

6. Open your web browser and go to:
   ```
   http://localhost:3000/demo.html
   ```

## Step 2: Exploring the Dashboard

1. When you first open the application, you'll see the Dashboard page.
2. Notice the summary statistics showing:
   - 3 active clients
   - 5 documents processed
   - 2 reports generated

## Step 3: Using the AI Assistant

1. Click on "AI Assistant" in the sidebar navigation.
2. In the dropdown, select a client (e.g., "John Doe").
3. Type a question in the input field, such as:
   ```
   How can I help my client fill out an I-9 form?
   ```
4. Click "Send" or press Enter.
5. The assistant will respond with helpful information about I-9 forms.

6. Try asking another question, such as:
   ```
   What reasonable accommodations can I suggest for my client with autism?
   ```
7. The assistant will provide a response with accommodations tailored to the client's needs.

## Step 4: Processing a Document

1. Click on "Document Processor" in the sidebar navigation.
2. Select a client from the dropdown (e.g., "Jane Smith").
3. Select a document type (e.g., "I-9 Form").
4. Click on the dropzone to select a file from your computer.
   - If you don't have a sample document, you can use any PDF file for testing.
5. Click "Process Document".
6. After processing completes, you'll see the extracted information displayed.
   - In demo mode, this shows mock data for demonstration purposes.
7. Notice that the document is added to the "Recent Documents" list.

## Step 5: Generating a Report

1. Click on "Report Generator" in the sidebar navigation.
2. Select a client from the dropdown (e.g., "Bob Johnson").
3. Select a report type (e.g., "Government Report").
4. Click "Generate Report".
5. After the report is generated, you'll see the report content displayed.
   - In demo mode, this shows mock data for demonstration purposes.
6. The report includes:
   - A title
   - Client information
   - Date
   - Content
   - Multiple sections with headings and text

## Step 6: Managing Clients

1. Click on "Clients" in the sidebar navigation.
2. You'll see a list of clients with their information:
   - Name
   - Disability
   - Status
   - Actions
3. Each client has a "View Details" link (not functional in the demo).

## Experimenting with Different Scenarios

### AI Assistant Queries

Try these questions in the AI Assistant:

- "What is a Schedule A letter?"
- "How can I prepare my client for a job interview?"
- "What accommodations should I request for a client with hearing impairment?"
- "How do I help my client with autism succeed in a retail position?"

### Document Types

Try processing different document types:

- I-9 Form
- Schedule A Letter
- Job Application

### Report Types

Try generating different report types:

- Government Report
- Employer Report
- Client Report

## Notes on Demo Mode

- All data shown is mock data for demonstration purposes.
- No actual document processing is performed in demo mode.
- No real Azure services are called in demo mode.
- The backend runs with `DEMO_MODE=true` in the `.env` file.

## Next Steps

After exploring the demo, you can:

1. Review the DEVELOPMENT.md file to learn how to set up the application for development.
2. Configure actual Azure services by updating the `.env` file with your Azure credentials.
3. Extend the application with new features by following the BACKEND_IMPLEMENTATION.md guide. 