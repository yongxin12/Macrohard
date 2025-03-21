import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DisabilityCodeInfo {
  label: string;
  type: 'targeted' | 'other';
  field: string;
  description?: string;
}

export interface F1040Data {
  fullName: string;
  ssn: string;
  filingStatus: string;
  address: string;
  dependents: string[];
  income: {
    wages: string;
    interest: string;
    business: string;
    other: string;
  };
  deductions: {
    standard: boolean;
    itemized: string[];
    credits: string[];
  };
}

export interface I9Data {
  fullName: string;
  otherNames: string;
  address: string;
  dateOfBirth: string;
  ssn: string;
  email: string;
  phone: string;
  citizenshipStatus: string;
  documentNumbers: string[];
  documentExpiration: string;
}

export interface SF256Data {
  lastName: string;
  firstName: string;
  middleInitial: string;
  dateOfBirth: string;
  ssn: string;
  selectedDisabilityCode: string;
  targetedDisabilities: {
    developmentalDisability: boolean;
    traumaticBrainInjury: boolean;
    deafOrHearingDifficulty: boolean;
    blindOrVisionDifficulty: boolean;
    missingExtremities: boolean;
    mobilityImpairment: boolean;
    paralysis: boolean;
    epilepsy: boolean;
    intellectualDisability: boolean;
    psychiatricDisorder: boolean;
    dwarfism: boolean;
    significantDisfigurement: boolean;
  };
  otherDisabilities: {
    speechImpairment: boolean;
    spinalAbnormalities: boolean;
    orthopedicImpairments: boolean;
    hivAids: boolean;
    morbidObesity: boolean;
    nervousSystemDisorder: boolean;
    cardiovascularDisease: boolean;
    depressionAnxiety: boolean;
    bloodDiseases: boolean;
    diabetes: boolean;
    arthritis: boolean;
    respiratoryConditions: boolean;
    kidneyDysfunction: boolean;
    cancer: boolean;
    learningDisability: boolean;
    gastrointestinalDisorders: boolean;
    autoimmune: boolean;
    liverDisease: boolean;
    substanceAbuseHistory: boolean;
    endocrineDisorder: boolean;
  };
}

// API format SF256 data interface
export interface SF256ApiData {
  name: string;
  ssn: string;
  date_of_birth: string;
  code: string;
}

// Convert frontend form data to API format
export function convertToApiFormat(formData: SF256Data): SF256ApiData {
  // Format date from MM/YYYY to MM-DD-YYYY format

  return {
    name: `${formData.firstName} ${formData.middleInitial ? formData.middleInitial + '.' : ''} ${formData.lastName}`.trim(),
    ssn: formData.ssn,
    date_of_birth: formData.dateOfBirth,
    code: formData.selectedDisabilityCode
  };
}

export const DISABILITY_CODES: Record<string, DisabilityCodeInfo> = {
  // Targeted Disabilities
  '02': { label: 'Developmental Disability', type: 'targeted', field: 'developmentalDisability', description: 'Developmental Disability, for example, autism spectrum disorder' },
  '03': { label: 'Traumatic Brain Injury', type: 'targeted', field: 'traumaticBrainInjury', description: 'Traumatic Brain Injury' },
  '19': { label: 'Deaf or Hearing Difficulty', type: 'targeted', field: 'deafOrHearingDifficulty', description: 'Deaf or serious difficulty hearing, benefiting from, for example, American Sign Language, CART, hearing aids, a cochlear implant and/or other supports' },
  '20': { label: 'Blind or Vision Difficulty', type: 'targeted', field: 'blindOrVisionDifficulty', description: 'Blind or serious difficulty seeing even when wearing glasses' },
  '31': { label: 'Missing Extremities', type: 'targeted', field: 'missingExtremities', description: 'Missing extremities (arm, leg, hand and/or foot)' },
  '40': { label: 'Mobility Impairment', type: 'targeted', field: 'mobilityImpairment', description: 'Significant mobility impairment, benefiting from the utilization of a wheelchair, scooter, walker, leg brace(s) and/or other supports' },
  '60': { label: 'Paralysis', type: 'targeted', field: 'paralysis', description: 'Partial or complete paralysis (any cause)' },
  '82': { label: 'Epilepsy', type: 'targeted', field: 'epilepsy', description: 'Epilepsy or other seizure disorders' },
  '90': { label: 'Intellectual Disability', type: 'targeted', field: 'intellectualDisability', description: 'Intellectual disability' },
  '91': { label: 'Psychiatric Disorder', type: 'targeted', field: 'psychiatricDisorder', description: 'Significant Psychiatric Disorder, for example, bipolar disorder, schizophrenia, PTSD, or major depression' },
  '92': { label: 'Dwarfism', type: 'targeted', field: 'dwarfism', description: 'Dwarfism' },
  '93': { label: 'Significant Disfigurement', type: 'targeted', field: 'significantDisfigurement', description: 'Significant disfigurement, for example, disfigurements caused by burns, wounds, accidents, or congenital disorders' },
  
  // Other Options
  '01': { label: 'Do Not Wish to Identify', type: 'other', field: '', description: 'I do not wish to identify my disability or serious health condition.' },
  '05': { label: 'No Disability', type: 'other', field: '', description: 'I do not have a disability or serious health condition.' },
  '06': { label: 'Not Listed', type: 'other', field: '', description: 'I have a disability or serious health condition, but it is not listed on this form.' },
  
  // Other Disabilities
  '13': { label: 'Speech Impairment', type: 'other', field: 'speechImpairment', description: 'Speech impairment' },
  '41': { label: 'Spinal Abnormalities', type: 'other', field: 'spinalAbnormalities', description: 'Spinal abnormalities, for example, spina bifida or scoliosis' },
  '44': { label: 'Orthopedic Impairments', type: 'other', field: 'orthopedicImpairments', description: 'Non-paralytic orthopedic impairments, for example, chronic pain, stiffness, weakness in bones or joints, some loss of ability to use part or parts of the body' },
  '51': { label: 'HIV/AIDS', type: 'other', field: 'hivAids', description: 'HIV Positive/AIDS' },
  '52': { label: 'Morbid Obesity', type: 'other', field: 'morbidObesity', description: 'Morbid obesity' },
  '59': { label: 'Nervous System Disorder', type: 'other', field: 'nervousSystemDisorder', description: 'Nervous system disorder for example, migraine headaches, Parkinson\'s disease, or multiple sclerosis' },
  '80': { label: 'Cardiovascular Disease', type: 'other', field: 'cardiovascularDisease', description: 'Cardiovascular or heart disease' },
  '81': { label: 'Depression/Anxiety', type: 'other', field: 'depressionAnxiety', description: 'Depression, anxiety disorder, or other psychiatric disorder' },
  '83': { label: 'Blood Diseases', type: 'other', field: 'bloodDiseases', description: 'Blood diseases, for example, sickle cell anemia, hemophilia' },
  '84': { label: 'Diabetes', type: 'other', field: 'diabetes', description: 'Diabetes' },
  '85': { label: 'Arthritis', type: 'other', field: 'arthritis', description: 'Orthopedic impairments or osteo-arthritis' },
  '86': { label: 'Respiratory Conditions', type: 'other', field: 'respiratoryConditions', description: 'Pulmonary or respiratory conditions, for example, tuberculosis, asthma, emphysema' },
  '87': { label: 'Kidney Dysfunction', type: 'other', field: 'kidneyDysfunction', description: 'Kidney dysfunction' },
  '88': { label: 'Cancer', type: 'other', field: 'cancer', description: 'Cancer (present or past history)' },
  '94': { label: 'Learning Disability', type: 'other', field: 'learningDisability', description: 'Learning disability or attention deficit/hyperactivity disorder (ADD/ADHD)' },
  '95': { label: 'Gastrointestinal Disorders', type: 'other', field: 'gastrointestinalDisorders', description: 'Gastrointestinal disorders, for example, Crohn\'s Disease, irritable bowel syndrome, colitis, celiac disease, dysphexia' },
  '96': { label: 'Autoimmune', type: 'other', field: 'autoimmune', description: 'Autoimmune disorder, for example, lupus, fibromyalgia, rheumatoid arthritis' },
  '97': { label: 'Liver Disease', type: 'other', field: 'liverDisease', description: 'Liver disease, for example, hepatitis or cirrhosis' },
  '98': { label: 'Substance Abuse History', type: 'other', field: 'substanceAbuseHistory', description: 'History of alcoholism or history of drug addiction (but not currently using illegal drugs)' },
  '99': { label: 'Endocrine Disorder', type: 'other', field: 'endocrineDisorder', description: 'Endocrine disorder, for example, thyroid dysfunction' }
};

interface FormDisplayProps {
  formType: 'f1040' | 'i-9' | 'sf256';
  formData: F1040Data | I9Data | SF256Data | null;
  onSubmit: () => void;
  onDisabilityChange?: (code: string) => void;
  onFormChange?: (data: SF256Data) => void;
  setError?: (error: string) => void;
}

// Form validation interface
interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  ssn?: string;
  dateOfBirth?: string;
  selectedDisabilityCode?: string;
  general?: string; // For general error messages
}

const FormDisplay: React.FC<FormDisplayProps> = ({ 
  formType, 
  formData, 
  onSubmit, 
  onDisabilityChange, 
  onFormChange, 
  setError 
}) => {
  // Form error state
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (!formData && formType !== 'sf256') {
    return <div className="bg-white shadow rounded-lg p-6">
      <p className="text-amber-600 font-medium">No form data available. Please analyze your text first.</p>
    </div>;
  }

  const handleDisabilityChange = (code: string) => {
    if (onDisabilityChange) {
      onDisabilityChange(code);
    }
  };
  
  // Validate SF-256 form
  const validateSF256Form = (data: SF256Data): ValidationErrors => {
    const newErrors: ValidationErrors = {};
    
    // Validate first name
    if (!data.firstName) {
      newErrors.firstName = 'First name is required';
    }
    
    // Validate last name
    if (!data.lastName) {
      newErrors.lastName = 'Last name is required';
    }
    
    // Validate SSN
    if (!data.ssn) {
      newErrors.ssn = 'SSN is required';
    } else {
      // Validate SSN format (9 digits)
      const ssnClean = data.ssn.replace(/[^0-9]/g, '');
      if (ssnClean.length !== 9) {
        newErrors.ssn = 'SSN must contain exactly 9 digits';
      }
    }
    
    // Validate date of birth
    if (!data.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }
    
    // Validate disability code
    if (!data.selectedDisabilityCode) {
      newErrors.selectedDisabilityCode = 'Please select a disability code';
    }
    
    return newErrors;
  };
  
  // Handle form submission
  const handleSubmit = () => {
    // Verify form data exists
    if (!formData) {
      setErrors({ general: 'No form data to submit. Please complete the form first.' });
      if (setError) {
        setError('No form data to submit. Please complete the form first.');
      }
      return;
    }
    
    if (formType === 'sf256') {
      const sf256Data = formData as SF256Data;
      const validationErrors = validateSF256Form(sf256Data);
      
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        if (setError) {
          setError('Please correct the errors in the form before submitting.');
        }
        return;
      }
      
      // Clear errors and submit
      setErrors({});
      if (setError) {
        setError('');
      }
      setIsSubmitting(true);
      
      try {
        onSubmit();
      } catch (err) {
        if (setError) {
          setError('Failed to submit the form. Please try again.');
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      onSubmit();
    }
  };

  const renderF1040 = () => {
    const data = formData as F1040Data;
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Form 1040</h2>
        {errors.general && (
          <div className="p-3 bg-red-50 text-red-700 rounded-md border border-red-200 mb-4">
            {errors.general}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <p className="mt-1 text-sm text-gray-900">{data.fullName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">SSN</label>
            <p className="mt-1 text-sm text-gray-900">{data.ssn}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Filing Status</label>
            <p className="mt-1 text-sm text-gray-900">{data.filingStatus}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <p className="mt-1 text-sm text-gray-900">{data.address}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Dependents</label>
            <ul className="mt-1 text-sm text-gray-900 list-disc list-inside">
              {data.dependents.map((dependent, index) => (
                <li key={index}>{dependent}</li>
              ))}
            </ul>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Income</label>
            <div className="mt-1 text-sm text-gray-900">
              <p>Wages: {data.income.wages}</p>
              <p>Interest: {data.income.interest}</p>
              <p>Business: {data.income.business}</p>
              <p>Other: {data.income.other}</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Deductions</label>
            <div className="mt-1 text-sm text-gray-900">
              <p>Standard Deduction: {data.deductions.standard ? 'Yes' : 'No'}</p>
              {data.deductions.itemized.length > 0 && (
                <div>
                  <p>Itemized Deductions:</p>
                  <ul className="list-disc list-inside">
                    {data.deductions.itemized.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {data.deductions.credits.length > 0 && (
                <div>
                  <p>Credits:</p>
                  <ul className="list-disc list-inside">
                    {data.deductions.credits.map((credit, index) => (
                      <li key={index}>{credit}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderI9 = () => {
    const data = formData as I9Data;
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Form I-9</h2>
        {errors.general && (
          <div className="p-3 bg-red-50 text-red-700 rounded-md border border-red-200 mb-4">
            {errors.general}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <p className="mt-1 text-sm text-gray-900">{data.fullName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Other Names Used</label>
            <p className="mt-1 text-sm text-gray-900">{data.otherNames}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <p className="mt-1 text-sm text-gray-900">{data.address}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
            <p className="mt-1 text-sm text-gray-900">{data.dateOfBirth}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">SSN</label>
            <p className="mt-1 text-sm text-gray-900">{data.ssn}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-sm text-gray-900">{data.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <p className="mt-1 text-sm text-gray-900">{data.phone}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Citizenship Status</label>
            <p className="mt-1 text-sm text-gray-900">{data.citizenshipStatus}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Document Numbers</label>
            <ul className="mt-1 text-sm text-gray-900 list-disc list-inside">
              {data.documentNumbers.map((number, index) => (
                <li key={index}>{number}</li>
              ))}
            </ul>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Document Expiration</label>
            <p className="mt-1 text-sm text-gray-900">{data.documentExpiration}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderSF256 = () => {
    const data = formData as SF256Data || {
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

    // Parse date string to Date object for DatePicker
    const parseDate = (dateString: string): Date | null => {
      console.log(dateString)

      const parts = dateString.split('-');
      console.log(parts)
      if (parts.length !== 3) return null;
      
      const month = parseInt(parts[1], 10) - 1; // Month starts from 0
      const year = parseInt(parts[2], 10);
      const day = parseInt(parts[0], 10);
      console.log(month,year,day)
      if (isNaN(month) || isNaN(year) || isNaN(day)) return null;
      
      return new Date(year, month, day);
    };
    
    // Format Date object to DD-MM-YYYY string
    const formatDate = (date: Date): string => {
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const day = date.getDate();
      return `${day.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${year}`;
    };

    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Form SF-256</h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={data.lastName}
                onChange={(e) => {
                  const newData = { ...data, lastName: e.target.value };
                  onFormChange?.(newData);
                }}
                className={`mt-1 block w-full px-3 py-2 border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={data.firstName}
                onChange={(e) => {
                  const newData = { ...data, firstName: e.target.value };
                  onFormChange?.(newData);
                }}
                className={`mt-1 block w-full px-3 py-2 border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Middle Initial</label>
              <input
                type="text"
                value={data.middleInitial}
                onChange={(e) => {
                  const newData = { ...data, middleInitial: e.target.value };
                  onFormChange?.(newData);
                }}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                maxLength={1}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth (DD-MM-YYYY) <span className="text-red-500">*</span></label>
              <input
                  type="text"
                  value={data.dateOfBirth}
                  onChange={(e) => {
                    if (e) {
                      const newData = { ...data, dateOfBirth: e.target.value };
                      onFormChange?.(newData);
                    }
                  }}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"

              />
              {errors.dateOfBirth && <p className="mt-1 text-sm text-red-500">{errors.dateOfBirth}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">SSN <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={data.ssn}
                onChange={(e) => {
                  const newData = { ...data, ssn: e.target.value };
                  onFormChange?.(newData);
                }}
                placeholder="XXX-XX-XXXX"
                className={`mt-1 block w-full px-3 py-2 border ${errors.ssn ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.ssn && <p className="mt-1 text-sm text-red-500">{errors.ssn}</p>}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Disability Code <span className="text-red-500">*</span></label>
            <select
              value={data.selectedDisabilityCode}
              onChange={(e) => handleDisabilityChange(e.target.value)}
              className={`mt-1 block w-full pl-3 pr-10 py-2 text-base ${errors.selectedDisabilityCode ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md`}
            >
              <option value="">Select a disability code...</option>
              
              <optgroup label="Targeted Disabilities">
                {['02', '03', '19', '20', '31', '40', '60', '82', '90', '91', '92', '93'].map(code => (
                  <option key={code} value={code}>
                    {code} - {DISABILITY_CODES[code].label}
                  </option>
                ))}
              </optgroup>
              
              <optgroup label="Other Options">
                {['01', '05', '06'].map(code => (
                  <option key={code} value={code}>
                    {code} - {DISABILITY_CODES[code].label}
                  </option>
                ))}
              </optgroup>
              
              <optgroup label="Other Disabilities">
                {['13', '41', '44', '51', '52', '59', '80', '81', '83', '84', '85', '86', '87', '88', '94', '95', '96', '97', '98', '99'].map(code => (
                  <option key={code} value={code}>
                    {code} - {DISABILITY_CODES[code].label}
                  </option>
                ))}
              </optgroup>
            </select>
            {errors.selectedDisabilityCode && <p className="mt-1 text-sm text-red-500">{errors.selectedDisabilityCode}</p>}
          </div>
          
          {data.selectedDisabilityCode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Selected Disability</label>
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="font-medium">{DISABILITY_CODES[data.selectedDisabilityCode]?.label}</p>
                <p className="text-sm text-gray-600 mt-1">{DISABILITY_CODES[data.selectedDisabilityCode]?.description}</p>
              </div>
            </div>
          )}

          {/* Add field validation error summary */}
          {Object.keys(errors).length > 0 && Object.keys(errors).some(key => key !== 'general') && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
              <p className="font-medium">Please correct the following errors:</p>
              <ul className="list-disc list-inside text-sm mt-1">
                {Object.entries(errors)
                  .filter(([key, _]) => key !== 'general')
                  .map(([_, error], index) => (
                    <li key={index}>{error}</li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      {formType === 'f1040' && renderF1040()}
      {formType === 'i-9' && renderI9()}
      {formType === 'sf256' && renderSF256()}
      <div className="mt-6">
        {/* Submission status indicator */}
        {isSubmitting && (
          <div className="mt-3 p-3 bg-blue-50 text-blue-700 rounded-md border border-blue-200 animate-pulse">
            <p className="text-sm">Submitting form, please wait...</p>
          </div>
        )}
        
        <div className="mt-6">
          <button
            onClick={handleSubmit}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Submit Form
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormDisplay;