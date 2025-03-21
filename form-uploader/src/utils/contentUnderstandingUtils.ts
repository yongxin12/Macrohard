/**
 * Utility functions for Azure AI Content Understanding API
 */


export function createSF256AnalyzerRequestBody() {
  return {
    "description": "SF-256 Self-Identification of Disability analyzer",
    "scenario": "document",
    "config": {
      "returnDetails": true
    },
    "fieldSchema": {
      "fields": {
        "firstName": {
          "type": "string",
          "method": "extract",
          "description": "First name of the person"
        },
        "lastName": {
          "type": "string",
          "method": "extract",
          "description": "Last name of the person"
        },
        "middleInitial": {
          "type": "string",
          "method": "extract", 
          "description": "Middle initial of the person"
        },
        "ssn": {
          "type": "string",
          "method": "extract",
          "description": "Social Security Number (SSN) of nine numbers"
        },
        "dateOfBirth": {
          "type": "string",
          "method": "extract",
          "description": "Date of birth in MM/YYYY format"
        },
        "disabilityCode": {
          "type": "string",
          "method": "extract",
          "description": `Selected disability code number, based on the disability code table: 02- Developmental Disability, for example, autism
spectrum disorder
03- Traumatic Brain Injury
19- Deaf or serious difficulty hearing, benefiting from, for example, American Sign Language, CART, hearing aids, a cochlear implant and/or other supports
20- Blind or serious difficulty seeing even when wearing glasses
31- Missing extremities (arm, leg, hand and/or foot)
40- Significant mobility impairment, benefiting from the utilization of a wheelchair, scooter, walker, leg brace(s) and/or other supports
60- Partial or complete paralysis (any cause)
82- Epilepsy or other seizure disorders
90- Intellectual disability
91- Significant Psychiatric Disorder, for example, bipolar disorder, schizophrenia, PTSD, or major depression
92- Dwarfism
93- Significant disfigurement, for example,
disfigurements caused by burns, wounds, accidents,
or congenital disorders,
01- I do not wish to identify my disability or serious
health condition.
05- I do not have a disability or serious health condition.
06- I have a disability or serious health condition, but it
is not listed on this form.
13- Speech impairment
41- Spinal abnormalities, for example, spina bifida or scoliosis
44- Non-paralytic orthopedic impairments, for example,
chronic pain, stiffness, weakness in bones or joints, some
loss of ability to use part or parts of the body
51- HIV Positive/AIDS
52- Morbid obesity
59- Nervous system disorder for example, migraine
headaches, Parkinson’s disease, or multiple sclerosis
80- Cardiovascular or heart disease
81- Depression, anxiety disorder, or other psychiatric disorder
83- Blood diseases, for example, sickle cell anemia,
hemophilia
84- Diabetes
85- Orthopedic impairments or osteo-arthritis
86- Pulmonary or respiratory conditions, for example,
tuberculosis, asthma, emphysema
87- Kidney dysfunction
88- Cancer (present or past history)
94- Learning disability or attention deficit/hyperactivity
disorder (ADD/ADHD)
95- Gastrointestinal disorders, for example, Crohn's Disease,
irritable bowel syndrome, colitis, celiac disease, dysphexia
96- Autoimmune disorder, for example, lupus, fibromyalgia,
rheumatoid arthritis
97- Liver disease, for example, hepatitis or cirrhosis
98- History of alcoholism or history of drug addiction (but not
currently using illegal drugs)
99- Endocrine disorder, for example, thyroid dysfunction
`
        },
        "disabilityType": {
          "type": "string",
          "method": "extract",
          "description": "Type of disability (e.g., deafness, blindness, psychiatric disorder)"
        }
      }
    }
  };
}

/**
 * Create a request body for the Azure Content Understanding API for I-9 form
 */
export function createI9AnalyzerRequestBody() {
  return {
    "description": "I-9 Employment Eligibility Verification analyzer",
    "scenario": "document",
    "config": {
      "returnDetails": true
    },
    "fieldSchema": {
      "fields": {
        "fullName": {
          "type": "string",
          "method": "extract",
          "description": "Full name of the employee"
        },
        "otherNames": {
          "type": "string",
          "method": "extract",
          "description": "Other names used by employee"
        },
        "address": {
          "type": "string",
          "method": "extract",
          "description": "Employee's address including street, city, state and zip code"
        },
        "dateOfBirth": {
          "type": "string",
          "method": "extract",
          "description": "Date of birth in MM/DD/YYYY format"
        },
        "ssn": {
          "type": "string",
          "method": "extract",
          "description": "Social Security Number (SSN) in format XXX-XX-XXXX"
        },
        "email": {
          "type": "string", 
          "method": "extract",
          "description": "Employee's email address"
        },
        "phone": {
          "type": "string",
          "method": "extract",
          "description": "Employee's telephone number"
        },
        "citizenshipStatus": {
          "type": "string",
          "method": "extract",
          "description": "Citizenship/immigration status (U.S. Citizen, Permanent Resident, etc.)"
        },
        "documentNumbers": {
          "type": "array",
          "method": "extract",
          "items": {
            "type": "string",
            "description": "ID document numbers"
          },
          "description": "Document numbers for identity and employment authorization"
        },
        "documentExpiration": {
          "type": "string",
          "method": "extract",
          "description": "Expiration date of authorization documents"
        }
      }
    }
  };
}

/**
 * Create a request body for the Azure Content Understanding API for Form 1040
 */
export function createF1040AnalyzerRequestBody() {
  return {
    "description": "Form 1040 - U.S. Individual Income Tax Return analyzer",
    "scenario": "document",
    "config": {
      "returnDetails": true
    },
    "fieldSchema": {
      "fields": {
        "fullName": {
          "type": "string",
          "method": "extract",
          "description": "Full name of the taxpayer"
        },
        "ssn": {
          "type": "string",
          "method": "extract",
          "description": "Social Security Number (SSN) in format XXX-XX-XXXX"
        },
        "filingStatus": {
          "type": "string",
          "method": "extract",
          "description": "Filing status (Single, Married filing jointly, etc.)"
        },
        "address": {
          "type": "string",
          "method": "extract",
          "description": "Home address including street, city, state and zip code"
        },
        "dependents": {
          "type": "array",
          "method": "extract",
          "items": {
            "type": "string",
            "description": "Name and relationship of dependent"
          },
          "description": "List of dependents claimed on the tax return"
        },
        "incomeItems": {
          "type": "array",
          "method": "extract",
          "items": {
            "type": "object",
            "properties": {
              "source": {
                "type": "string",
                "method": "extract",
                "description": "Source of income (wages, interest, business, etc.)"
              },
              "amount": {
                "type": "number",
                "method": "extract",
                "description": "Dollar amount of income"
              }
            }
          },
          "description": "Various sources of income reported on the tax return"
        },
        "deductionType": {
          "type": "string",
          "method": "extract",
          "description": "Whether standard or itemized deduction is claimed"
        }
      }
    }
  };
}

/**
 * Function to analyze a file with a specific analyzer
 * @param endpoint Azure Content Understanding API endpoint
 * @param key API subscription key
 * @param analyzerId ID of the analyzer to use
 * @param fileUrl URL of the file to analyze
 * @returns Promise with API response
 */
export async function analyzeFile(endpoint: string, key: string, analyzerId: string, fileUrl: string) {
  try {
    const response = await fetch(`${endpoint}/contentunderstanding/analyzers/${analyzerId}:analyze?api-version=2024-12-01-preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': key
      },
      body: JSON.stringify({ url: fileUrl })
    });

    if (!response.ok) {
      throw new Error(`Failed to analyze file: ${response.status} ${response.statusText}`);
    }

    // Get the operation ID from the Operation-Location header
    const operationLocation = response.headers.get('Operation-Location');
    if (!operationLocation) {
      throw new Error('Operation-Location header not found in response');
    }

    return { operationLocation };
  } catch (error) {
    console.error('Error analyzing file:', error);
    throw error;
  }
}

/**
 * Function to get analysis results
 * @param operationLocation Full operation location URL
 * @param key API subscription key
 * @returns Promise with analysis results
 */
export async function getAnalysisResults(operationLocation: string, key: string) {
  try {
    // Poll the operation until it's complete
    let complete = false;
    let result = null;
    
    while (!complete) {
      const response = await fetch(operationLocation, {
        method: 'GET',
        headers: {
          'Ocp-Apim-Subscription-Key': key
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get analysis results: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.status === 'Succeeded') {
        complete = true;
        result = data.result;
      } else if (data.status === 'Failed') {
        throw new Error(`Analysis failed: ${JSON.stringify(data.error)}`);
      } else {
        // Wait before polling again
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return result;
  } catch (error) {
    console.error('Error getting analysis results:', error);
    throw error;
  }
}

/**
 * Extract form data from analysis results
 * @param results Analysis results from the Content Understanding API
 * @param formType Type of form ('sf256', 'i-9', or 'f1040')
 * @returns Extracted form data in the appropriate format
 */
export function extractFormData(results: any, formType: 'sf256' | 'i-9' | 'f1040') {

  const fields = results;
  switch (formType) {
    case 'sf256':
      return {
        lastName: fields.lastname || '',
        firstName: fields.firstname || '',
        middleInitial: fields.middleInitial || '',
        dateOfBirth: fields.dateofbirth || '',
        ssn: fields.ssn || '',
        selectedDisabilityCode: fields.disabilitycode || '',
        targetedDisabilities: mapDisabilityFromType(fields.disabilityType || ''),
        otherDisabilities: {}
      };
    
    case 'i-9':
      return {
        fullName: fields.fullName?.valueString || '',
        otherNames: fields.otherNames?.valueString || '',
        address: fields.address?.valueString || '',
        dateOfBirth: fields.dateOfBirth?.valueString || '',
        ssn: fields.ssn?.valueString || '',
        email: fields.email?.valueString || '',
        phone: fields.phone?.valueString || '',
        citizenshipStatus: fields.citizenshipStatus?.valueString || '',
        documentNumbers: fields.documentNumbers?.valueArray?.map((item: any) => item.valueString) || [],
        documentExpiration: fields.documentExpiration?.valueString || ''
      };
    
    case 'f1040':
      return {
        fullName: fields.fullName?.valueString || '',
        ssn: fields.ssn?.valueString || '',
        filingStatus: fields.filingStatus?.valueString || '',
        address: fields.address?.valueString || '',
        dependents: fields.dependents?.valueArray?.map((item: any) => item.valueString) || [],
        income: {
          wages: extractIncomeItem(fields.incomeItems, 'wages'),
          interest: extractIncomeItem(fields.incomeItems, 'interest'),
          business: extractIncomeItem(fields.incomeItems, 'business'),
          other: extractIncomeItem(fields.incomeItems, 'other')
        },
        deductions: {
          standard: fields.deductionType?.valueString?.toLowerCase().includes('standard') || true,
          itemized: [],
          credits: []
        }
      };
    
    default:
      return null;
  }
}

// Helper function to extract income item
function extractIncomeItem(incomeItems: any, sourceType: string) {
  if (!incomeItems || !incomeItems.valueArray) return '$0';
  
  const item = incomeItems.valueArray.find((item: any) => 
    item.valueObject?.source?.valueString?.toLowerCase().includes(sourceType)
  );
  
  if (item && item.valueObject && item.valueObject.amount) {
    return `$${item.valueObject.amount.valueNumber.toLocaleString()}`;
  }
  
  return '$0';
}

// Helper function to map disability type to targetedDisabilities object
function mapDisabilityFromType(disabilityType: string) {
  const targetedDisabilities = {
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
  };

  if (!disabilityType) return targetedDisabilities;

  const lowerType = disabilityType.toLowerCase();
  
  if (lowerType.includes('deaf') || lowerType.includes('hearing')) {
    targetedDisabilities.deafOrHearingDifficulty = true;
  }
  if (lowerType.includes('blind') || lowerType.includes('vision')) {
    targetedDisabilities.blindOrVisionDifficulty = true;
  }
  if (lowerType.includes('missing') || lowerType.includes('amputat')) {
    targetedDisabilities.missingExtremities = true;
  }
  if (lowerType.includes('mobil')) {
    targetedDisabilities.mobilityImpairment = true;
  }
  if (lowerType.includes('paraly')) {
    targetedDisabilities.paralysis = true;
  }
  if (lowerType.includes('epilep') || lowerType.includes('seizure')) {
    targetedDisabilities.epilepsy = true;
  }
  if (lowerType.includes('intellectual') || lowerType.includes('cognitive')) {
    targetedDisabilities.intellectualDisability = true;
  }
  if (lowerType.includes('psychiatric') || lowerType.includes('mental')) {
    targetedDisabilities.psychiatricDisorder = true;
  }
  if (lowerType.includes('dwarf')) {
    targetedDisabilities.dwarfism = true;
  }
  if (lowerType.includes('development')) {
    targetedDisabilities.developmentalDisability = true;
  }
  if (lowerType.includes('disfigur')) {
    targetedDisabilities.significantDisfigurement = true;
  }
  if (lowerType.includes('brain') || lowerType.includes('tbi')) {
    targetedDisabilities.traumaticBrainInjury = true;
  }

  return targetedDisabilities;
} 