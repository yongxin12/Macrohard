import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import {
  Button,
  Input,
  Textarea,
  Dropdown,
  Option,
  Spinner,
  Text,
  ToggleButton,
  Card,
  CardHeader,
  makeStyles
} from '@fluentui/react-components';
import {
  Send24Regular,
  Send24Filled,
  Mic24Regular,
  Mic24Filled,
  Delete24Regular,
  People24Regular
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  assistantContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 180px)',
    gap: '16px'
  },
  chatHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  clientSelector: {
    width: '250px'
  },
  chatArea: {
    flex: 1,
    padding: '16px',
    borderRadius: '4px',
    border: '1px solid #edebe9',
    backgroundColor: '#fff',
    overflowY: 'auto'
  },
  message: {
    maxWidth: '80%',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '12px'
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#e1efff',
    borderBottomRightRadius: '0'
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f3f2f1',
    borderBottomLeftRadius: '0'
  },
  inputArea: {
    display: 'flex',
    gap: '8px'
  },
  inputField: {
    flex: 1
  },
  messageTime: {
    fontSize: '12px',
    color: '#605e5c',
    marginTop: '4px',
    textAlign: 'right'
  },
  voiceButton: {
    backgroundColor: '#f3f2f1'
  },
  clearButton: {
    marginLeft: 'auto'
  }
});

const AIAssistant = () => {
  const styles = useStyles();
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const chatEndRef = useRef(null);
  
  // Mock client data - in a real app, this would come from an API call
  useEffect(() => {
    setClients([
      { id: 'client1', name: 'John Doe' },
      { id: 'client2', name: 'Jane Smith' },
      { id: 'client3', name: 'Robert Johnson' }
    ]);
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    const newUserMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setInputText('');
    setIsLoading(true);
    
    try {
      // In a real app, this would call your API with a bearer token
      // const token = await getTokenForAPI(instance, accounts, apiConfig.scopes);
      
      // For demo, we'll just simulate a response
      setTimeout(() => {
        const assistantResponse = {
          id: Date.now() + 1,
          text: getMockResponse(inputText, selectedClient),
          sender: 'assistant',
          timestamp: new Date().toISOString()
        };
        
        setMessages(prevMessages => [...prevMessages, assistantResponse]);
        setIsLoading(false);
      }, 1500);
      
      // In a real implementation, you would call your API like this:
      /*
      const response = await axios.post(
        `${apiConfig.baseUrl}${apiConfig.endpoints.assistant}`,
        {
          query: inputText,
          client_id: selectedClient?.id
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      const assistantResponse = {
        id: Date.now() + 1,
        text: response.data.response,
        sender: 'assistant',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prevMessages => [...prevMessages, assistantResponse]);
      setIsLoading(false);
      */
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm sorry, I encountered an error processing your request. Please try again later.",
        sender: 'assistant',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const toggleVoiceRecording = () => {
    // In a real app, this would use the Web Speech API or Azure Speech Services
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      // Start recording
      console.log('Recording started...');
      // Simulate recording for demo
      setTimeout(() => {
        setInputText('How do I help my client complete the I-9 form?');
        setIsRecording(false);
      }, 2000);
    } else {
      // Stop recording
      console.log('Recording stopped.');
    }
  };
  
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const clearConversation = () => {
    setMessages([]);
  };
  
  // Function to generate mock responses for demo purposes
  const getMockResponse = (query, client) => {
    const clientContext = client ? `for ${client.name}` : '';
    
    if (query.toLowerCase().includes('i-9') || query.toLowerCase().includes('i9')) {
      return `
### I-9 Form Guidance ${clientContext}

The I-9 form verifies employment eligibility in the United States. Here's how to help your client complete it:

1. **Section 1** - Employee Information:
   - Must be completed by the employee on their first day
   - Make sure they provide their full legal name, address, and date of birth
   - They must attest to their citizenship/immigration status by checking the appropriate box
   - Social Security Number is optional for most employees but required if the employer uses E-Verify

2. **Section 2** - Employer Review and Verification:
   - Must be completed by the employer within 3 business days of the employee's start date
   - The employee must present original document(s) from List A, OR a combination from Lists B and C
   - Common documents include:
     - List A: U.S. Passport, Permanent Resident Card, Employment Authorization Document
     - List B: Driver's license, ID card issued by state (must have photo)
     - List C: Social Security card, birth certificate

**Important Tips:**
- Never suggest which documents the employee should provide
- Never accept expired documents
- Make photocopies of documents if that's your company policy (it's optional)
- Be sure to complete the certification, including signature, date, and business information

Need help with a specific part of the form?
      `;
    } else if (query.toLowerCase().includes('schedule a')) {
      return `
### Schedule A Letter Guidance ${clientContext}

Schedule A is a hiring authority that federal agencies can use to hire people with disabilities non-competitively. Here's what you need to know:

1. **What is it?**
   - A certification letter that verifies your client has a qualifying disability
   - Allows them to bypass the typical competitive hiring process for federal jobs

2. **Who can provide this letter?**
   - Licensed medical professional (e.g., physician, psychiatrist)
   - Licensed vocational rehabilitation specialist
   - Any federal or state agency that issues or provides disability benefits

3. **What must the letter include?**
   - Statement that your client has an intellectual disability, severe physical disability, or psychiatric disability
   - Statement that your client is capable of performing the job they're applying for
   - Signature of the certifying official
   - The certifier's title
   - The date of certification

4. **Tips for getting a strong letter:**
   - Focus on abilities, not limitations
   - Make sure it specifies the type of qualifying disability
   - Ensure it's on official letterhead when possible
   - Keep it short and direct (typically one page)

Would you like a sample template for this letter?
      `;
    } else if (query.toLowerCase().includes('tax') || query.toLowerCase().includes('1040')) {
      return `
### Tax Form 1040 Guidance ${clientContext}

For clients with disabilities, there are several important considerations when completing tax forms:

1. **Potential Tax Credits & Deductions:**
   - **Earned Income Tax Credit (EITC)**: May qualify if they have low to moderate income
   - **Credit for the Elderly or Disabled**: Use Schedule R
   - **Medical Expense Deduction**: If expenses exceed 7.5% of adjusted gross income
   - **Child or Dependent Care Credit**: If they pay someone to care for a dependent with disabilities

2. **Form 1040-EZ vs. Standard 1040:**
   - Form 1040-EZ is simpler but doesn't allow for many deductions
   - Standard 1040 is recommended for most clients with disabilities to maximize benefits

3. **Documentation Needed:**
   - W-2 forms from all employers
   - Records of disability benefits received (may be partially taxable)
   - Medical expense receipts
   - Proof of disability (medical certification)

4. **Free Assistance Resources:**
   - Volunteer Income Tax Assistance (VITA): Free help for those who make $57,000 or less
   - Tax Counseling for the Elderly (TCE): Specializes in helping those over 60
   - Accessibility services through IRS

Would you like specific guidance on a particular section of the tax form?
      `;
    } else if (query.toLowerCase().includes('job application')) {
      return `
### Job Application Guidance ${clientContext}

When helping your client complete a job application, consider these strategies:

1. **Preparation:**
   - Review the job description together
   - Make a list of your client's relevant skills and experiences
   - Gather personal information, employment history, and references beforehand
   - Practice answering common application questions

2. **Handling Employment History:**
   - Focus on relevant experience, including volunteer work
   - For gaps in employment, be honest but positive - frame as periods of skill development or managing health needs
   - Emphasize achievements in previous positions

3. **Disability Disclosure:**
   - This is a personal choice - not required unless requesting accommodations
   - If disclosing, focus on abilities and needed accommodations rather than limitations
   - Consider timing: application, interview, after offer, or after starting work

4. **Accommodations:**
   - Help identify reasonable accommodations needed to perform essential job functions
   - Frame as solutions that will help them succeed (e.g., "I work best with written instructions")
   - Be specific but brief when describing accommodation needs

5. **References:**
   - Choose references who can speak positively about work ethic and abilities
   - Ask permission from references in advance
   - Provide references with information about the job being applied for

Would you like a checklist of information typically needed for job applications?
      `;
    } else {
      return `
### Job Coach Guidance ${clientContext}

Your role as a job coach is crucial in supporting clients with disabilities to find and maintain employment. Here are some key strategies:

1. **Building Rapport:**
   - Develop a trusting relationship with your client
   - Take time to understand their specific needs, goals, and challenges
   - Act as a bridge between the client and employer

2. **Job Training Approaches:**
   - Use task analysis to break complex jobs into manageable steps
   - Provide clear, concrete instructions (visual supports often help)
   - Practice consistent routines and gradually introduce variations
   - Use positive reinforcement to build confidence

3. **Workplace Integration:**
   - Help identify natural supports in the workplace (coworkers who can help)
   - Gradually fade your presence as your client gains independence
   - Maintain open communication with supervisors (with client permission)

4. **Communication Tips:**
   - Speak directly to your client, not about them to others
   - Use clear, concrete language
   - Confirm understanding by asking them to explain in their own words
   - Be patient and provide time for processing information

5. **Documentation:**
   - Track progress toward job goals
   - Document effective accommodations and strategies
   - Maintain records of hours worked for reporting requirements

What specific aspect of job coaching would you like more information about?
      `;
    }
  };
  
  return (
    <div className={styles.assistantContainer}>
      <div className={styles.chatHeader}>
        <Text size={800} weight="bold">AI Assistant</Text>
        <div className={styles.clientSelector}>
          <Dropdown
            placeholder="Select a client"
            value={selectedClient}
            onChange={(e, data) => setSelectedClient(data.value)}
          >
            {clients.map((client) => (
              <Option key={client.id} value={client.id}>
                {client.name}
              </Option>
            ))}
          </Dropdown>
        </div>
      </div>
      
      <Card>
        <CardHeader
          header={<Text weight="semibold">Job Coach Assistant</Text>}
          action={
            <Button 
              icon={<Delete24Regular />} 
              appearance="subtle"
              onClick={clearConversation}
              title="Clear conversation"
              aria-label="Clear conversation"
              className={styles.clearButton}
            />
          }
        />
        
        <div className={styles.chatArea}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: '#605e5c', margin: '2rem' }}>
              <People24Regular fontSize={32} />
              <Text as="p" style={{ marginTop: '8px' }}>
                Ask me anything about job coaching, forms, accommodations, or client support!
              </Text>
            </div>
          )}
          
          {messages.map(message => (
            <div 
              key={message.id} 
              className={`${styles.message} ${
                message.sender === 'user' ? styles.userMessage : styles.assistantMessage
              }`}
            >
              <div>
                {message.sender === 'assistant' ? (
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                ) : (
                  message.text
                )}
              </div>
              <div className={styles.messageTime}>
                {formatTimestamp(message.timestamp)}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className={styles.message} style={styles.assistantMessage}>
              <Spinner size="tiny" labelPosition="after" label="Thinking..." />
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>
        
        <div className={styles.inputArea}>
          <ToggleButton
            icon={isRecording ? <Mic24Filled /> : <Mic24Regular />}
            checked={isRecording}
            onClick={toggleVoiceRecording}
            appearance="subtle"
            className={styles.voiceButton}
            title="Use voice input"
            aria-label="Use voice input"
          />
          
          <Textarea
            className={styles.inputField}
            value={inputText}
            onChange={(_, data) => setInputText(data.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your question here..."
            resize="vertical"
            aria-label="Message input"
            disabled={isLoading}
          />
          
          <Button
            icon={<Send24Regular />}
            iconPosition="after"
            appearance="primary"
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            title="Send message"
            aria-label="Send message"
          >
            Send
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AIAssistant; 