# Disability Job Finder

A web application that helps people with disabilities find suitable job opportunities by processing their information shared through voice input or document uploads.

## Features

- **Voice Input**: Users can speak into their device to share their skills, experience, and the accommodations they need. The application transcribes the speech and extracts relevant information.
- **Document Upload**: Users can upload their resumes, CVs, or other documents containing their professional information.
- **Data Processing**: Both voice input and document uploads are processed to extract structured data about the job seeker.
- **MongoDB Integration**: All the processed information is stored in MongoDB for future job matching.

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS, and React
- **Backend**: Next.js API routes
- **Database**: MongoDB
- **Voice Recognition**: Web Speech API
- **Document Processing**: Basic text extraction with placeholders for OCR/NLP

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- MongoDB (local instance or MongoDB Atlas)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd disability-job-finder
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following content:
   ```
   MONGODB_URI=mongodb://localhost:27017/disability-job-finder
   ```
   Replace with your actual MongoDB connection string if needed.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Docker 
```
docker build -t nextjs-docker .
docker run -p 3001:3001 nextjs-docker .
```

## Usage

1. **Navigate to Voice Input Tab**:
   - Click on the "Voice Input" tab in the navigation bar.
   - Click the microphone button and speak clearly about your skills, experience, and accommodations needed.
   - Review the transcribed text and submit your information.

2. **Navigate to Document Upload Tab**:
   - Click on the "Document Upload" tab in the navigation bar.
   - Drag and drop PDF files or images of your resume/CV, or click to browse files.
   - Select the files you want to upload and submit them.

## Future Improvements

- Integration with advanced NLP services for better information extraction
- Job matching algorithms to connect job seekers with suitable opportunities
- Employer portal for posting accessible job listings
- Notification system for job matches
- Accessibility improvements based on user feedback

## License

This project is licensed under the MIT License - see the LICENSE file for details.
