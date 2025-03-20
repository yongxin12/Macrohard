import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMsal } from '@azure/msal-react';
import { getTokenForAPI, apiConfig } from '../authConfig';
import axios from 'axios';
import {
  Button,
  Dropdown,
  Option,
  Spinner,
  Title,
  Text,
  Card,
  CardHeader,
  makeStyles,
  useId,
  Input,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  Radio,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  TableCellLayout,
  Switch,
  Tooltip
} from '@fluentui/react-components';
import {
  DocumentPdf,
  Upload,
  FileCode,
  DocumentText,
  Edit,
  DocumentPerson,
  DocumentRegular,
  Delete,
  ArrowSync,
  InfoRegular
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dropzone: {
    border: '2px dashed #d2d0ce',
    borderRadius: '4px',
    padding: '32px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: '#f9f9f9',
    '&:hover': {
      borderColor: '#0078d4',
      backgroundColor: '#f0f6ff'
    }
  },
  dropzoneActive: {
    borderColor: '#0078d4',
    backgroundColor: '#f0f6ff'
  },
  uploadIcon: {
    fontSize: '48px',
    color: '#0078d4',
    marginBottom: '16px'
  },
  formSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '16px',
    backgroundColor: '#fff',
    borderRadius: '4px'
  },
  formRow: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start'
  },
  formField: {
    flex: 1
  },
  documentTypesSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
    margin: '16px 0'
  },
  documentTypeCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px',
    border: '1px solid #edebe9',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      borderColor: '#0078d4',
      backgroundColor: '#f0f6ff'
    }
  },
  documentTypeSelected: {
    borderColor: '#0078d4',
    backgroundColor: '#f0f6ff'
  },
  documentTypeIcon: {
    fontSize: '32px',
    color: '#0078d4',
    marginBottom: '8px'
  },
  previewSection: {
    marginTop: '24px'
  },
  resultsSection: {
    marginTop: '24px'
  },
  resultsTable: {
    width: '100%',
    border: '1px solid #edebe9',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  fileInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  actionButtons: {
    display: 'flex',
    gap: '8px'
  },
  emptyState: {
    padding: '32px',
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px'
  },
  dropzoneFilePreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '16px',
    padding: '8px',
    backgroundColor: '#f3f2f1',
    borderRadius: '4px'
  },
  filePreviewIcon: {
    fontSize: '24px',
    color: '#0078d4'
  },
  filePreviewInfo: {
    flex: 1
  },
  extractedFields: {
    marginTop: '16px',
    padding: '16px',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
    maxHeight: '400px',
    overflowY: 'auto'
  },
  fieldGroup: {
    marginBottom: '16px'
  },
  fieldLabel: {
    fontWeight: '600',
    fontSize: '14px',
    color: '#323130',
    marginBottom: '4px'
  },
  fieldValue: {
    padding: '8px',
    backgroundColor: '#fff',
    border: '1px solid #edebe9',
    borderRadius: '2px'
  },
  editButton: {
    marginTop: '4px'
  }
});

const DocumentProcessor = () => {
  const styles = useStyles();
  const { instance, accounts } = useMsal();
  const clientDropdownId = useId('client-dropdown');
  const documentTypeDropdownId = useId('document-type-dropdown');
  
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEditField, setCurrentEditField] = useState({ key: '', value: '' });
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  
  // Document types
  const documentTypes = [
    { id: 'i9', name: 'I-9 Form', icon: <DocumentPerson /> },
    { id: 'schedule_a', name: 'Schedule A', icon: <DocumentText /> },
    { id: 'tax_1040', name: '1040 Tax Form', icon: <DocumentRegular /> },
    { id: 'job_application', name: 'Job Application', icon: <DocumentPdf /> }
  ];
  
  // Mock client data - in a real app, this would come from an API call
  useEffect(() => {
    setClients([
      { id: 'client1', name: 'John Doe' },
      { id: 'client2', name: 'Jane Smith' },
      { id: 'client3', name: 'Robert Johnson' }
    ]);
    
    // Mock recent documents - in a real app, this would come from an API call
    setRecentDocuments([
      { 
        id: 'doc1', 
        client_id: 'client1', 
        client_name: 'John Doe',
        document_type: 'i9', 
        document_type_name: 'I-9 Form',
        original_file_name: 'john_doe_i9.pdf',
        processed_at: '2023-08-15T10:30:00Z',
        status: 'Completed'
      },
      { 
        id: 'doc2', 
        client_id: 'client2', 
        client_name: 'Jane Smith',
        document_type: 'schedule_a', 
        document_type_name: 'Schedule A',
        original_file_name: 'jane_smith_schedule_a.pdf',
        processed_at: '2023-08-10T14:45:00Z',
        status: 'Pending'
      }
    ]);
  }, []);
  
  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1,
    onDrop: acceptedFiles => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
      }
    }
  });
  
  const handleProcessDocument = async () => {
    if (!file || !documentType || !selectedClient) {
      alert('Please select a file, document type, and client before processing.');
      return;
    }
    
    setIsProcessing(true);
    setUploadStatus('uploading');
    
    try {
      // In a real app, this would call your API with a bearer token
      // const token = await getTokenForAPI(instance, accounts, apiConfig.scopes);
      
      // For demo, we'll just simulate API processing
      setTimeout(() => {
        // Mock extracted data based on document type
        const mockData = getMockExtractedData(documentType);
        setExtractedData(mockData);
        
        // Add to recent documents
        const newDocument = {
          id: `doc${Date.now()}`,
          client_id: selectedClient.id,
          client_name: selectedClient.name,
          document_type: documentType,
          document_type_name: documentTypes.find(dt => dt.id === documentType)?.name || documentType,
          original_file_name: file.name,
          processed_at: new Date().toISOString(),
          status: 'Completed'
        };
        
        setRecentDocuments(prev => [newDocument, ...prev]);
        setIsProcessing(false);
        setUploadStatus('success');
        
        // Reset form after short delay
        setTimeout(() => {
          setUploadStatus('idle');
        }, 3000);
      }, 2500);
      
      // In a real implementation, you would call your API like this:
      /*
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', documentType);
      formData.append('client_id', selectedClient.id);
      
      const response = await axios.post(
        `${apiConfig.baseUrl}${apiConfig.endpoints.documents}/process`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setExtractedData(response.data.extracted_fields);
      
      // Add to recent documents
      const newDocument = {
        id: response.data.document_id,
        client_id: selectedClient.id,
        client_name: selectedClient.name,
        document_type: documentType,
        document_type_name: documentTypes.find(dt => dt.id === documentType)?.name || documentType,
        original_file_name: file.name,
        processed_at: new Date().toISOString(),
        status: 'Completed'
      };
      
      setRecentDocuments(prev => [newDocument, ...prev]);
      setIsProcessing(false);
      setUploadStatus('success');
      */
    } catch (error) {
      console.error('Error processing document:', error);
      setIsProcessing(false);
      setUploadStatus('error');
    }
  };
  
  const handleEditField = (key, value) => {
    setCurrentEditField({ key, value });
    setIsEditModalOpen(true);
  };
  
  const saveEditedField = () => {
    if (extractedData && currentEditField.key) {
      setExtractedData({
        ...extractedData,
        [currentEditField.key]: currentEditField.value
      });
    }
    setIsEditModalOpen(false);
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const getDocumentTypeIcon = (documentType) => {
    const docType = documentTypes.find(dt => dt.id === documentType);
    return docType ? docType.icon : <DocumentRegular />;
  };
  
  const getDocumentTypeName = (documentType) => {
    const docType = documentTypes.find(dt => dt.id === documentType);
    return docType ? docType.name : documentType;
  };
  
  const getFileIcon = (fileName) => {
    if (fileName.endsWith('.pdf')) {
      return <DocumentPdf className={styles.filePreviewIcon} />;
    } else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png')) {
      return <FileCode className={styles.filePreviewIcon} />;
    } else {
      return <DocumentRegular className={styles.filePreviewIcon} />;
    }
  };
  
  const clearForm = () => {
    setFile(null);
    setDocumentType('');
    setExtractedData(null);
    setUploadStatus('idle');
  };
  
  // Mock function to get extracted data based on document type
  const getMockExtractedData = (documentType) => {
    switch (documentType) {
      case 'i9':
        return {
          employee_name: 'John Doe',
          address: '123 Main St, Anytown, USA 12345',
          ssn: 'XXX-XX-1234',
          date_of_birth: '01/01/1980',
          citizenship_status: 'U.S. Citizen',
          document_title: 'U.S. Passport',
          document_number: '123456789',
          expiration_date: '01/01/2030'
        };
      case 'schedule_a':
        return {
          applicant_name: 'Jane Smith',
          disability_type: 'Hearing impairment',
          job_title: 'Administrative Assistant',
          reasonable_accommodation: 'Sign language interpreter for meetings',
          certifying_official: 'Dr. Robert Johnson',
          certification_date: '01/15/2023'
        };
      case 'tax_1040':
        return {
          tax_year: '2022',
          taxpayer_name: 'John Doe',
          filing_status: 'Single',
          total_income: '45000',
          adjusted_gross_income: '42500',
          deductions: '12950',
          taxable_income: '29550',
          tax: '3300',
          refund: '1200'
        };
      case 'job_application':
        return {
          applicant_name: 'Jane Smith',
          position: 'Cashier',
          phone_number: '(555) 123-4567',
          email: 'jane.smith@example.com',
          education: 'High School Diploma',
          previous_employer: 'ABC Store',
          work_experience: '2 years retail',
          references: 'John Doe, (555) 987-6543',
          availability: 'Weekdays and weekends'
        };
      default:
        return {
          content: 'Generic document content extracted.',
          metadata: {
            document_type: 'Unknown',
            pages: 3,
            date: new Date().toISOString()
          }
        };
    }
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title as="h1">Document Processor</Title>
      </div>
      
      <Card>
        <CardHeader
          header={<Text weight="semibold">Upload Document</Text>}
        />
        
        <div>
          <div className={styles.formRow}>
            <div className={styles.formField}>
              <label htmlFor={clientDropdownId}>Client</label>
              <Dropdown
                id={clientDropdownId}
                placeholder="Select a client"
                value={selectedClient?.name || ''}
                onOptionSelect={(_, data) => {
                  const client = clients.find(c => c.id === data.optionValue);
                  setSelectedClient(client);
                }}
              >
                {clients.map(client => (
                  <Option key={client.id} value={client.id}>{client.name}</Option>
                ))}
              </Dropdown>
            </div>
            
            <div className={styles.formField}>
              <label htmlFor={documentTypeDropdownId}>Document Type</label>
              <Dropdown
                id={documentTypeDropdownId}
                placeholder="Select document type"
                value={getDocumentTypeName(documentType)}
                onOptionSelect={(_, data) => {
                  setDocumentType(data.optionValue);
                }}
              >
                {documentTypes.map(docType => (
                  <Option key={docType.id} value={docType.id}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {docType.icon}
                      <span>{docType.name}</span>
                    </div>
                  </Option>
                ))}
              </Dropdown>
            </div>
          </div>
          
          <div style={{ marginTop: '24px' }}>
            <div
              {...getRootProps()}
              className={`${styles.dropzone} ${isDragActive ? styles.dropzoneActive : ''}`}
            >
              <input {...getInputProps()} />
              
              {file ? (
                <div>
                  <div className={styles.dropzoneFilePreview}>
                    {getFileIcon(file.name)}
                    <div className={styles.filePreviewInfo}>
                      <div><strong>{file.name}</strong></div>
                      <div>{(file.size / 1024).toFixed(1)} KB</div>
                    </div>
                    <Button
                      icon={<Delete />}
                      appearance="subtle"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                    />
                  </div>
                  <Text as="p" style={{ marginTop: '16px' }}>
                    Click or drag to replace the file
                  </Text>
                </div>
              ) : (
                <div>
                  <Upload className={styles.uploadIcon} />
                  <Title as="h3">Drag & Drop File Here</Title>
                  <Text as="p">
                    or click to browse for PDF, JPG, or PNG files
                  </Text>
                </div>
              )}
            </div>
          </div>
          
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
            <Button
              appearance="secondary"
              onClick={clearForm}
              disabled={isProcessing}
            >
              Clear
            </Button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {uploadStatus === 'success' && (
                <Text style={{ color: '#107c10' }}>
                  Document processed successfully!
                </Text>
              )}
              
              {uploadStatus === 'error' && (
                <Text style={{ color: '#d13438' }}>
                  Error processing document. Please try again.
                </Text>
              )}
              
              <Button
                appearance="primary"
                onClick={handleProcessDocument}
                disabled={!file || !documentType || !selectedClient || isProcessing}
                icon={isProcessing ? <Spinner size="tiny" /> : null}
              >
                {isProcessing ? 'Processing...' : 'Process Document'}
              </Button>
            </div>
          </div>
          
          {extractedData && (
            <div className={styles.extractedFields}>
              <Title as="h3" style={{ marginBottom: '16px' }}>
                Extracted Information
                <Tooltip content="These fields were automatically extracted from the document using Azure AI Document Intelligence. You can edit any field if needed.">
                  <Button icon={<InfoRegular />} appearance="transparent" size="small" />
                </Tooltip>
              </Title>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {Object.entries(extractedData).map(([key, value]) => (
                  <div key={key} className={styles.fieldGroup}>
                    <div className={styles.fieldLabel}>
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                    <div className={styles.fieldValue}>
                      {value}
                    </div>
                    <Button
                      icon={<Edit />}
                      appearance="subtle"
                      size="small"
                      className={styles.editButton}
                      onClick={() => handleEditField(key, value)}
                    >
                      Edit
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
      
      <Card>
        <CardHeader
          header={<Text weight="semibold">Recent Documents</Text>}
        />
        
        {recentDocuments.length === 0 ? (
          <div className={styles.emptyState}>
            <DocumentRegular style={{ fontSize: '32px', color: '#0078d4', marginBottom: '16px' }} />
            <Title as="h3">No Documents Yet</Title>
            <Text as="p">
              Processed documents will appear here
            </Text>
          </div>
        ) : (
          <Table className={styles.resultsTable}>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Document</TableHeaderCell>
                <TableHeaderCell>Client</TableHeaderCell>
                <TableHeaderCell>Type</TableHeaderCell>
                <TableHeaderCell>Processed Date</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentDocuments.map(doc => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <TableCellLayout
                      media={getFileIcon(doc.original_file_name)}
                      truncate
                    >
                      {doc.original_file_name}
                    </TableCellLayout>
                  </TableCell>
                  <TableCell>{doc.client_name}</TableCell>
                  <TableCell>
                    <TableCellLayout
                      media={getDocumentTypeIcon(doc.document_type)}
                      truncate
                    >
                      {doc.document_type_name}
                    </TableCellLayout>
                  </TableCell>
                  <TableCell>{formatDate(doc.processed_at)}</TableCell>
                  <TableCell>
                    <Text style={{
                      color: doc.status === 'Completed' ? '#107c10' : '#797775'
                    }}>
                      {doc.status}
                    </Text>
                  </TableCell>
                  <TableCell>
                    <div className={styles.actionButtons}>
                      <Button
                        icon={<DocumentText />}
                        appearance="subtle"
                        size="small"
                        title="View document"
                      />
                      <Button
                        icon={<Edit />}
                        appearance="subtle"
                        size="small"
                        title="Edit extracted data"
                      />
                      <Button
                        icon={<ArrowSync />}
                        appearance="subtle"
                        size="small"
                        title="Reprocess document"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
      
      {/* Edit Field Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={(_, data) => setIsEditModalOpen(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Edit Field</DialogTitle>
            <DialogContent>
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="edit-field-input">
                  {currentEditField.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </label>
                <Input
                  id="edit-field-input"
                  value={currentEditField.value}
                  onChange={(_, data) => setCurrentEditField({ ...currentEditField, value: data.value })}
                  style={{ width: '100%', marginTop: '8px' }}
                />
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button appearance="primary" onClick={saveEditedField}>
                Save
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};

export default DocumentProcessor; 