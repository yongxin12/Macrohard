import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import JobSeeker from '@/models/JobSeeker';
import clientPromise from '@/lib/mongodb';
import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

// Function to extract information from document text
// In a real application, this would use more sophisticated NLP/OCR
const extractJobSeekerInfo = (text: string) => {
  // This is a simplified version. In production, you would use a proper NLP service
  // like OpenAI's API or specialized OCR/document parsing tools
  const info: any = {
    source: 'document',
    rawText: text,
  };

  // Similar basic extraction logic as in the voice route
  if (text.match(/name:?\s*([^,\n]+)/i)) {
    info.name = text.match(/name:?\s*([^,\n]+)/i)![1].trim();
  }

  if (text.match(/email:?\s*([^,\n]+@[^,\n]+\.[^,\n]+)/i)) {
    info.email = text.match(/email:?\s*([^,\n]+@[^,\n]+\.[^,\n]+)/i)![1].trim();
  }

  if (text.match(/phone:?\s*([0-9-+() ]{10,})/i)) {
    info.phone = text.match(/phone:?\s*([0-9-+() ]{10,})/i)![1].trim();
  }

  if (text.match(/disability:?\s*([^,\n]+)/i)) {
    info.disabilityType = text.match(/disability:?\s*([^,\n]+)/i)![1].trim();
  }

  if (text.match(/accommodation[s]?:?\s*([^.\n]+)/i)) {
    const accommodationsText = text.match(/accommodation[s]?:?\s*([^.\n]+)/i)![1].trim();
    info.accommodations = accommodationsText.split(/(?:,|and)/).map((item: string) => item.trim());
  }

  if (text.match(/skill[s]?:?\s*([^.\n]+)/i)) {
    const skillsText = text.match(/skill[s]?:?\s*([^.\n]+)/i)![1].trim();
    info.skills = skillsText.split(/(?:,|and)/).map((item: string) => item.trim());
  }

  if (text.match(/experience:?\s*([^.\n]+)/i)) {
    info.experience = text.match(/experience:?\s*([^.\n]+)/i)![1].trim();
  }

  if (text.match(/education:?\s*([^.\n]+)/i)) {
    info.education = text.match(/education:?\s*([^.\n]+)/i)![1].trim();
  }

  if (text.match(/preferred job[s]?:?\s*([^.\n]+)/i)) {
    const jobsText = text.match(/preferred job[s]?:?\s*([^.\n]+)/i)![1].trim();
    info.preferredJobs = jobsText.split(/(?:,|and)/).map((item: string) => item.trim());
  }

  if (text.match(/location:?\s*([^,\n]+)/i)) {
    info.location = text.match(/location:?\s*([^,\n]+)/i)![1].trim();
  }

  // Set some defaults if we couldn't extract name or email
  if (!info.name) {
    info.name = 'Document Job Seeker';
  }
  
  if (!info.email) {
    info.email = 'unknown@example.com';
  }

  return info;
};

export async function POST(request: NextRequest) {
  try {
    // In a real app, you would use a proper file handling library
    // This is a simplified implementation
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await clientPromise;
    
    // Make sure the JobSeeker model is initialized
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/disability-job-finder');
    }

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const results = [];

    for (const file of files) {
      // Generate a unique filename
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
      const filePath = join(uploadDir, fileName);
      
      // Write the file to disk
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);
      
      // In a real application, you would use OCR or document parsing here
      // For this example, we'll just use a placeholder text extraction
      // In production, you might use libraries like pdf.js, tesseract.js, or cloud services
      
      // This is a placeholder for document text extraction
      // In a real app, this would extract actual text from PDFs/images
      const extractedText = `
        Name: Document Upload User
        Email: document-upload@example.com
        Disability: Visual impairment
        Accommodations: Screen reader, large text
        Skills: Web development, customer service, data entry
        Experience: 3 years as a customer service representative
        Education: Bachelor's degree in Computer Science
        Preferred Jobs: Web developer, customer service representative
        Location: Remote
      `;
      
      // Extract job seeker information
      const jobSeekerInfo = extractJobSeekerInfo(extractedText);
      jobSeekerInfo.filePath = filePath; // Store file path reference
      
      // Create job seeker record
      const jobSeeker = await JobSeeker.create(jobSeekerInfo);
      results.push(jobSeeker);
    }

    return NextResponse.json(
      { success: true, data: results },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error processing uploaded documents:', error);
    return NextResponse.json(
      { error: 'Failed to process uploaded documents' },
      { status: 500 }
    );
  }
} 