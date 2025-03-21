'use client';

import { useState, useRef } from 'react';
import { FaFileUpload, FaFilePdf, FaFileImage, FaTrash, FaPaperPlane } from 'react-icons/fa';
import axios from 'axios';

export default function DocumentUploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList: FileList) => {
    const newFiles: File[] = [];
    let hasInvalidFile = false;
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const fileType = file.type;
      
      // Check if the file is a PDF or image
      if (fileType === 'application/pdf' || fileType.startsWith('image/')) {
        newFiles.push(file);
      } else {
        hasInvalidFile = true;
      }
    }
    
    if (hasInvalidFile) {
      setError('Only PDF and image files are accepted.');
    } else {
      setError('');
    }
    
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please add at least one file to upload.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSubmitSuccess(true);
      setFiles([]);
    } catch (error) {
      console.error('Error uploading files:', error);
      setError('Failed to upload your documents. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') {
      return <FaFilePdf size={20} className="text-red-500" />;
    } else if (file.type.startsWith('image/')) {
      return <FaFileImage size={20} className="text-blue-500" />;
    }
    return <FaFileUpload size={20} className="text-gray-500" />;
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 mt-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Document Upload</h1>
      
      <div className="mb-8">
        <p className="text-gray-600 mb-4">
          Upload your resume, CV, or any document containing information about your skills, 
          experience, and the accommodations you need. This will help us match you with 
          suitable job opportunities.
        </p>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="font-medium text-gray-700 mb-2">Accepted File Types:</h2>
          <ul className="flex flex-wrap text-gray-600">
            <li className="flex items-center mr-6 mb-2">
              <FaFilePdf className="mr-2 text-red-500" /> PDF Documents
            </li>
            <li className="flex items-center">
              <FaFileImage className="mr-2 text-blue-500" /> Images (JPG, PNG, etc.)
            </li>
          </ul>
        </div>
      </div>
      
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-400'
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf,image/*"
          multiple
          onChange={handleFileChange}
        />
        
        <FaFileUpload className="mx-auto mb-4 text-blue-500" size={40} />
        <p className="text-lg font-medium mb-2">Drag and drop your files here</p>
        <p className="text-gray-500 mb-4">or</p>
        <button 
          type="button"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Browse Files
        </button>
      </div>
      
      {files.length > 0 && (
        <div className="mb-6">
          <h3 className="font-medium text-gray-700 mb-3">Selected Files:</h3>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li 
                key={`${file.name}-${index}`}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
              >
                <div className="flex items-center">
                  {getFileIcon(file)}
                  <span className="ml-3 truncate max-w-xs">{file.name}</span>
                  <span className="ml-2 text-sm text-gray-500">
                    ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </div>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="text-red-500 hover:text-red-700"
                  aria-label="Remove file"
                >
                  <FaTrash size={16} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      {submitSuccess && (
        <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4">
          Your documents were successfully uploaded! We'll process them and help match you with suitable job opportunities.
        </div>
      )}
      
      <div className="flex justify-end">
        <button
          onClick={handleUpload}
          disabled={isSubmitting || files.length === 0}
          className={`flex items-center px-6 py-3 rounded-lg ${
            isSubmitting || files.length === 0
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          } transition-colors`}
        >
          <FaPaperPlane className="mr-2" />
          {isSubmitting ? 'Uploading...' : 'Upload Documents'}
        </button>
      </div>
    </div>
  );
} 