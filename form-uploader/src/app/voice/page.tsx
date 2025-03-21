'use client';

import { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaStop, FaPaperPlane, FaChevronDown, FaPause, FaPlay } from 'react-icons/fa';
import axios from 'axios';
// We'll use the Microsoft Speech SDK in the browser
import { getTokenOrRefresh } from '@/utils/speechUtils';
import { ResultReason } from 'microsoft-cognitiveservices-speech-sdk';
import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk';
import F1040Suggestions from '../components/form-suggestions/F1040Suggestions';
import I9Suggestions from '../components/form-suggestions/I9Suggestions';
import SF256Suggestions from '../components/form-suggestions/SF256Suggestions';
import FormDisplay from '../components/form-display/FormDisplay';
import { DISABILITY_CODES } from '../components/form-display/FormDisplay';
import type { SF256Data } from '../components/form-display/FormDisplay';
import { convertToApiFormat } from '../components/form-display/FormDisplay';
import { createSF256AnalyzerRequestBody, createI9AnalyzerRequestBody, createF1040AnalyzerRequestBody, 
  extractFormData } from '@/utils/contentUnderstandingUtils';


export default function VoiceInputPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en-US');
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [tokenData, setTokenData] = useState<{ authToken: string; region: string } | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<string>('sf256');
  const [isDocumentDropdownOpen, setIsDocumentDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'form'>('suggestions');
  const [parsedFormData, setParsedFormData] = useState<any>(null);
  
  // References for audio recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recognizerRef = useRef<speechsdk.SpeechRecognizer | null>(null);

  // Get Azure Speech token on component mount
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const tokenResponse = await getTokenOrRefresh();
        if (tokenResponse.authToken) {
          setTokenData({
            authToken: tokenResponse.authToken,
            region: tokenResponse.region
          });
          console.log('Azure Speech token obtained successfully');
        } else {
          console.error('Failed to get Azure Speech token:', tokenResponse.error);
          setError('Speech service unavailable. Please try again later.');
        }
      } catch (err) {
        console.error('Error fetching Azure Speech token:', err);
        setError('Failed to connect to speech service. Please check your connection.');
      }
    };

    fetchToken();
  }, []);

  useEffect(() => {
    // Get available audio input devices
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const audioInputs = devices.filter(device => device.kind === 'audioinput');
          setAudioDevices(audioInputs);
          if (audioInputs.length > 0) {
            setSelectedDeviceId(audioInputs[0].deviceId);
          }
        })
        .catch(err => {
          console.error('Error getting audio devices:', err);
          setError('Unable to get audio input devices list');
        });
    }
    
    return () => {
      // Clean up and stop recognition if component unmounts
      if (recognizerRef.current) {
        recognizerRef.current.stopContinuousRecognitionAsync();
        recognizerRef.current.close();
      }
    };
  }, []);

  const startAzureSpeechRecognition = async () => {
    if (!tokenData || !tokenData.authToken) {
      setError('Speech service token not available. Please refresh the page.');
      return;
    }
    
    try {
      // Reset transcript and error
      setTranscript('');
      setError('');
      
      // Get microphone access
      await navigator.mediaDevices.getUserMedia({
        audio: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : true
      });
      
      // Set up the authentication with the token
      const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(
        tokenData.authToken, 
        tokenData.region
      );
      
      // Set the selected language
      speechConfig.speechRecognitionLanguage = selectedLanguage;
      
      // Create audio config based on the selected microphone
      const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
      if (selectedDeviceId) {
        // Note: In practice, setting specific device requires additional steps
        // that may not be fully supported in the browser
        console.log(`Selected device ID: ${selectedDeviceId}`);
      }
      
      // Create the speech recognizer
      const speechRecognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);
      recognizerRef.current = speechRecognizer;
      
      // Set up event handlers
      speechRecognizer.recognized = (sender, event) => {
        if (event.result.reason === speechsdk.ResultReason.RecognizedSpeech) {
          const newText = event.result.text;
          if (newText) {
            setTranscript(prev => prev + ' ' + newText);
          }
        } else if (event.result.reason === speechsdk.ResultReason.NoMatch) {
          console.log('No speech could be recognized.');
        }
      };
      
      speechRecognizer.canceled = (sender, event) => {
        if (event.reason === speechsdk.CancellationReason.Error) {
          console.error(`Speech recognition error: ${event.errorCode}: ${event.errorDetails}`);
          setError(`Speech recognition error: ${event.errorDetails}`);
        }
        setIsRecording(false);
      };
      
      // Start continuous recognition
      speechRecognizer.startContinuousRecognitionAsync(
        () => {
          console.log('Speech recognition started');
          setIsRecording(true);
        },
        (err) => {
          console.error('Error starting recognition:', err);
          setError('Failed to start speech recognition. Please try again.');
          setIsRecording(false);
        }
      );
    } catch (err) {
      console.error('Error setting up speech recognition:', err);
      setError('Unable to access microphone, please ensure you have granted microphone permissions');
    }
  };

  const pauseRecognition = () => {
    if (recognizerRef.current) {
      recognizerRef.current.stopContinuousRecognitionAsync(
        () => {
          console.log('Speech recognition paused');
          setIsPaused(true);
        },
        (err) => {
          console.error('Error pausing recognition:', err);
        }
      );
    }
  };

  const resumeRecognition = async () => {
    if (recognizerRef.current) {
      recognizerRef.current.startContinuousRecognitionAsync(
        () => {
          console.log('Speech recognition resumed');
          setIsPaused(false);
        },
        (err) => {
          console.error('Error resuming recognition:', err);
          setError('Failed to resume speech recognition. Please try again.');
        }
      );
    }
  };

  const togglePause = async () => {
    if (isPaused) {
      await resumeRecognition();
    } else {
      pauseRecognition();
    }
  };

  const stopAzureSpeechRecognition = () => {
    if (recognizerRef.current) {
      recognizerRef.current.stopContinuousRecognitionAsync(
        () => {
          console.log('Speech recognition stopped');
          setIsRecording(false);
          setIsPaused(false);
        },
        (err) => {
          console.error('Error stopping recognition:', err);
          setIsRecording(false);
          setIsPaused(false);
        }
      );
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      stopAzureSpeechRecognition();
    } else {
      await startAzureSpeechRecognition();
    }
  };

  const handleDeviceChange = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    if (isRecording) {
      stopAzureSpeechRecognition();
    }
    setIsDropdownOpen(false);
  };

  const handleSubmit = async () => {
    if (!transcript.trim()) {
      setError('Please record some information before submitting');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await axios.post('/api/voice', { transcript });
      if(response.status === 200) {
        setSubmitSuccess(true);
        setTranscript('');
      }
    } catch (error) {
      console.error('Error submitting voice data:', error);
      setError('Failed to submit information, please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit form data to the backend
  const submitFormToBackend = async (formData: any) => {
    // Form validation logic moved to FormDisplay component, only handle API calls here
    setIsSubmitting(true);
    setError('');
    
    try {
      // Determine form type
      let form_type = '';
      if (selectedDocument === 'f1040') {
        form_type = 'tax_form';
      } else if (selectedDocument === 'i-9') {
        form_type = 'I-9';
      } else if (selectedDocument === 'sf256') {
        form_type = 'self_identification_of_disability';
      }

      // Handle special format for SF256 form
      let requestData = {};
      if (selectedDocument === 'sf256') {
        const apiData = convertToApiFormat(formData as SF256Data);
        requestData = {
          form_type: form_type,
          ssn: apiData.ssn, // Add SSN at the top level
          form_info: apiData
        };
      } else {
        // Handle other form types
        requestData = {
          form_type: form_type,
          form_info: formData
        };
      }

      // Get API URL from environment variables
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || '/api/info/';
      
      console.log('Submitting form data:', JSON.stringify(requestData, null, 2));
      
      // Send request
      const response = await axios.post(apiUrl, requestData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 200 || response.status === 201) {
        setSubmitSuccess(true);
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Error submitting form data:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setError(`Form validation failed: ${error.response.data.error}`);
      } else {
        setError('Failed to submit the form to the backend. Please try again.');
      }
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleAnalyzeText = async () => {
    if (!transcript.trim()) {
      setError('Please record or enter some information first');
      return;
    }

    try {
      setError('');
      if (selectedDocument === 'sf256') {
        const url = `/api/voice?transcript=${encodeURIComponent(transcript)}&type=sf256`;
        const response = await axios.get(url);
        if (response.status === 200) {
        const extractedData = extractFormData(response.data, 'sf256') as SF256Data;
        setParsedFormData(extractedData);
        }
      } else if (selectedDocument === 'i-9') {
        // For I-9, use demo data for now
        setParsedFormData(demoData['i-9']);
      } else if (selectedDocument === 'f1040') {
        // For 1040, use demo data for now
        setParsedFormData(demoData['f1040']);
      }
      
      setActiveTab('form');
    } catch (error) {
      console.error('Error analyzing text:', error);
      setError('Failed to analyze the text. Please try again.');
    }
  };

  const handleFinalSubmit = async () => {
    try {
      // Prepare the API request data first to display it
      let requestData = {};
      let form_type = '';
      
      if (selectedDocument === 'f1040') {
        form_type = 'tax_form';
      } else if (selectedDocument === 'i-9') {
        form_type = 'I-9';
      } else if (selectedDocument === 'sf256') {
        form_type = 'self_identification_of_disability';
      }
      
      if (selectedDocument === 'sf256') {
        const apiData = convertToApiFormat(parsedFormData as SF256Data);
        requestData = {
          form_type: form_type,
          ssn: apiData.ssn,
          form_info: apiData
        };
      } else {
        requestData = {
          form_type: form_type,
          form_info: parsedFormData
        };
      }
      
      // Format the request data as JSON string
      const formattedJson = JSON.stringify(requestData, null, 2);
      console.log('Form data to submit:', formattedJson);
      
      // Submit the form
      const result = await submitFormToBackend(parsedFormData);
      
      if (result) {
        console.log('Form submitted successfully:', parsedFormData);
        setSubmitSuccess(true);
        setSuccessMessage(`Form submitted successfully!\n\nRequest body:\n${formattedJson}`);
        
        // No longer reset form data
        // Only display success message, automatically clear after 10 seconds
        setTimeout(() => {
          setSubmitSuccess(false);
          setSuccessMessage('');
        }, 10000);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Failed to submit the form. Please try again.');
    }
  };
  
  const handleDisabilityChange = (code: string) => {
    if (selectedDocument !== 'sf256') return;
    
    // Create a deep copy of the form data or create new default data if not exists
    const newFormData = parsedFormData ? { ...parsedFormData } : {
      lastName: '',
      firstName: '',
      middleInitial: '',
      dateOfBirth: '',
      ssn: '',
      selectedDisabilityCode: '',
      targetedDisabilities: {
        developmentalDisability: false,
        traumaticBrainInjury: false,
        deafOrHearingDifficulty: false,
        blindOrVisionDifficulty: false,
        missingExtremities: false,
        mobilityImpairment: false,
        paralysis: false,
        epilepsy: false,
        intellectualDisability: false,
        psychiatricDisorder: false,
        dwarfism: false,
        significantDisfigurement: false
      },
      otherDisabilities: {
        speechImpairment: false,
        spinalAbnormalities: false,
        orthopedicImpairments: false,
        hivAids: false,
        morbidObesity: false,
        nervousSystemDisorder: false,
        cardiovascularDisease: false,
        depressionAnxiety: false,
        bloodDiseases: false,
        diabetes: false,
        arthritis: false,
        respiratoryConditions: false,
        kidneyDysfunction: false,
        cancer: false,
        learningDisability: false,
        gastrointestinalDisorders: false,
        autoimmune: false,
        liverDisease: false,
        substanceAbuseHistory: false,
        endocrineDisorder: false
      }
    };
    
    // Reset all disabilities
    Object.keys(newFormData.targetedDisabilities).forEach(key => {
      newFormData.targetedDisabilities[key] = false;
    });
    
    Object.keys(newFormData.otherDisabilities).forEach(key => {
      newFormData.otherDisabilities[key] = false;
    });
    
    // Update the selected disability code
    newFormData.selectedDisabilityCode = code;
    
    // Get the disability information
    const disabilityInfo = DISABILITY_CODES[code];
    
    // If the code has an associated field, update it
    if (disabilityInfo?.field && disabilityInfo?.type) {
      if (disabilityInfo.type === 'targeted') {
        newFormData.targetedDisabilities[disabilityInfo.field] = true;
      } else if (disabilityInfo.type === 'other') {
        newFormData.otherDisabilities[disabilityInfo.field] = true;
      }
    }
    
    // Update the form data
    setParsedFormData(newFormData);
  };

  const handleFormChange = (newData: SF256Data) => {
    setParsedFormData(newData);
  };

  return (
    <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-6 mt-8">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-blue-600 transition-colors hover:text-blue-700">Voice Input</h1>
        <div className="relative">
          <div 
            className="border border-gray-300 rounded-lg px-4 py-2 flex items-center cursor-pointer bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow"
            onClick={() => setIsDocumentDropdownOpen(!isDocumentDropdownOpen)}
          >
            <span className="block mr-2">
              {selectedDocument === 'sf256' ? 'Form SF-256 - Self-Identification of Disability' :
                  selectedDocument === 'f1040' ? 'Form 1040 - U.S. Individual Income Tax Return' :
                      selectedDocument === 'i-9' ? 'Form I-9 - Employment Eligibility Verification' :
                          'Select Document'}
            </span>
            <FaChevronDown className={`transition-transform ${isDocumentDropdownOpen ? 'rotate-180' : ''}`} />
          </div>
          
          {isDocumentDropdownOpen && (
            <div className="absolute right-0 z-10 mt-1 w-96 bg-white shadow-lg rounded-lg border border-gray-200 py-1 transition-all duration-200 animate-fadeIn">
              <div
                  className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${selectedDocument === 'sf256' ? 'bg-blue-100' : ''}`}
                  onClick={() => {
                    setSelectedDocument('sf256');
                    setIsDocumentDropdownOpen(false);
                  }}
              >
                Form SF-256 - Self-Identification of Disability
              </div>
              <div
                className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${selectedDocument === 'f1040' ? 'bg-blue-100' : ''}`}
                onClick={() => {
                  setSelectedDocument('f1040');
                  setIsDocumentDropdownOpen(false);
                }}
              >
                Form 1040 - U.S. Individual Income Tax Return
              </div>

              <div
                className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${selectedDocument === 'i-9' ? 'bg-blue-100' : ''}`}
                onClick={() => {
                  setSelectedDocument('i-9');
                  setIsDocumentDropdownOpen(false);
                }}
              >
                Form I-9 - Employment Eligibility Verification
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex gap-8">
        {/* Left side - Voice Input Section */}
        <div className="flex-1 bg-white rounded-lg transition-all duration-200">
          <div className="p-4 bg-gray-50 rounded-lg mb-6 shadow-sm">
            <p className="text-gray-600">
              Please speak clearly to provide the required information for the selected form.
            </p>
      </div>
      
      {/* Audio Device Selection Dropdown */}
          <div className="mb-8 p-4 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow transition-shadow duration-200">
        <label htmlFor="device-select" className="block text-sm font-medium text-gray-700 mb-2">
          Select audio input device
        </label>
        <div className="relative">
          <div 
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 flex justify-between items-center cursor-pointer bg-white hover:bg-gray-50"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="block truncate">
              {selectedDeviceId ? audioDevices.find(d => d.deviceId === selectedDeviceId)?.label || 'Default device' : 'Select device'}
            </span>
            <FaChevronDown className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </div>
          
          {isDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg border border-gray-300 py-1 max-h-60 overflow-auto">
              {audioDevices.length > 0 ? (
                audioDevices.map((device) => (
                  <div
                    key={device.deviceId}
                    className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${selectedDeviceId === device.deviceId ? 'bg-blue-100' : ''}`}
                    onClick={() => handleDeviceChange(device.deviceId)}
                  >
                    {device.label || `Device ${device.deviceId.substring(0, 8)}...`}
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-gray-500">No audio devices found</div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Language Selection Dropdown */}
          <div className="mb-8 p-4 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow transition-shadow duration-200">
        <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 mb-2">
          Select recognition language
        </label>
        <div className="relative">
          <div 
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 flex justify-between items-center cursor-pointer bg-white hover:bg-gray-50"
            onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
          >
            <span className="block truncate">
              {selectedLanguage === 'en-US' ? 'English (US)' : 
               selectedLanguage === 'zh-CN' ? 'Chinese (Simplified)' : 
               selectedLanguage}
            </span>
            <FaChevronDown className={`transition-transform ${isLanguageDropdownOpen ? 'rotate-180' : ''}`} />
          </div>
          
          {isLanguageDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg border border-gray-300 py-1 max-h-60 overflow-auto">
              <div
                className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${selectedLanguage === 'en-US' ? 'bg-blue-100' : ''}`}
                onClick={() => {
                  setSelectedLanguage('en-US');
                  setIsLanguageDropdownOpen(false);
                }}
              >
                English (US)
              </div>
              <div
                className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${selectedLanguage === 'zh-CN' ? 'bg-blue-100' : ''}`}
                onClick={() => {
                  setSelectedLanguage('zh-CN');
                  setIsLanguageDropdownOpen(false);
                }}
              >
                Chinese (Simplified)
              </div>
            </div>
          )}
        </div>
      </div>
      
          {/* Recording Controls and Transcript */}
          <div className="mb-8 p-4 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow transition-shadow duration-200">
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={toggleRecording}
          className={`flex items-center justify-center rounded-full w-16 h-16 ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-blue-500 hover:bg-blue-600'
                } text-white transition-all duration-200 transform hover:scale-105 shadow-md`}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
          disabled={!tokenData}
        >
          {isRecording ? <FaStop size={24} /> : <FaMicrophone size={24} />}
        </button>

        {isRecording && (
          <button
            onClick={togglePause}
                  className="flex items-center justify-center rounded-full w-16 h-16 bg-yellow-500 hover:bg-yellow-600 text-white transition-all duration-200 transform hover:scale-105 shadow-md"
            aria-label={isPaused ? 'Resume recording' : 'Pause recording'}
          >
            {isPaused ? <FaPlay size={24} /> : <FaPause size={24} />}
          </button>
        )}
      </div>
      
            <div className="mb-4">
              <div className="flex items-center mb-2 p-2 bg-gray-50 rounded-md">
                <div className={`w-3 h-3 rounded-full mr-2 transition-colors duration-200 ${
                  isRecording 
                    ? (isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse') 
                    : 'bg-gray-300'
                }`}></div>
          <p className="text-sm font-medium text-gray-700">
            {isRecording ? (isPaused ? 'Paused' : 'Recording... Speak now') : 'Not recording'}
          </p>
        </div>
        <textarea
                className="w-full p-4 border border-gray-300 rounded-lg min-h-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 hover:border-blue-300"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Your spoken words will appear here..."
          readOnly={isRecording}
        />
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleAnalyzeText}
                  disabled={!transcript.trim()}
                  className={`flex items-center px-4 py-2 rounded-lg ${
                    !transcript.trim()
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  } transition-all duration-200 shadow-sm hover:shadow`}
                >
                  Analyze Text
                </button>
              </div>
            </div>
      </div>
      
          {/* {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4 shadow-sm animate-fadeIn">
          {error}
        </div>
      )}
          
          {submitSuccess && successMessage && (
            <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-4 shadow-sm animate-fadeIn">
              {successMessage}
            </div>
          )} */}
      
      {!tokenData && !error && (
            <div className="bg-blue-100 text-blue-700 p-4 rounded-lg mb-4 shadow-sm animate-fadeIn">
          Connecting to speech service... Please wait.
        </div>
      )}
      
        
        
        </div>

        {/* Right side - Suggestions and Form Sections */}
        <div className="w-[400px] shrink-0">
          <div className="sticky top-6 transition-all duration-200">
            <div className="flex border-b border-gray-200 mb-4">
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'suggestions'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                } transition-colors duration-200`}
                onClick={() => setActiveTab('suggestions')}
              >
                Required Information
              </button>
        <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'form'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                } transition-colors duration-200`}
                onClick={() => setActiveTab('form')}
              >
                Form Preview
        </button>
            </div>

            {activeTab === 'suggestions' && (
              <>
                <div className="bg-blue-50 p-4 rounded-lg mb-4 shadow-sm">
                  <h2 className="text-lg font-semibold text-blue-700 mb-2">Required Information</h2>
                  <p className="text-sm text-blue-600">Please provide the following details in your recording</p>
                </div>
                <div className="transition-opacity duration-300 ease-in-out">
                  {selectedDocument === 'f1040' && <F1040Suggestions />}
                  {selectedDocument === 'i-9' && <I9Suggestions />}
                  {selectedDocument === 'sf256' && <SF256Suggestions />}
                </div>
              </>
            )}

            {activeTab === 'form' && (
              <>
                {submitSuccess && successMessage && (
                  <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-4 shadow-sm animate-fadeIn">
                    <p className="mb-2">Form submitted successfully!</p>
                    {successMessage.includes('Request body:') && (
                      <>
                        <p className="text-sm font-medium mt-3 mb-1">Request Body:</p>
                        <pre className="bg-white p-3 rounded text-xs overflow-auto max-h-64 text-gray-800 border border-green-200">
                          {successMessage.split('Request body:\n')[1]}
                        </pre>
                      </>
                    )}
                  </div>
                )}
                
                {error && (
                  <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4 shadow-sm animate-fadeIn">
                    {error}
                  </div>
                )}
                
                <FormDisplay
                  formType={selectedDocument as 'f1040' | 'i-9' | 'sf256'}
                  formData={parsedFormData}
                  onSubmit={handleFinalSubmit}
                  onDisabilityChange={handleDisabilityChange}
                  onFormChange={handleFormChange}
                  setError={setError}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 