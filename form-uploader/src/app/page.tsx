import Link from 'next/link';
import { FaMicrophone, FaFileUpload, FaBriefcase, FaAccessibleIcon } from 'react-icons/fa';

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Find Your Perfect Job
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8">
            We help people with disabilities connect with employers who value diversity and inclusion
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/voice"
              className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium flex items-center justify-center"
            >
              <FaMicrophone className="mr-2" />
              Voice Input
            </Link>
            <Link
              href="/upload"
              className="bg-transparent hover:bg-blue-400 border-2 border-white px-6 py-3 rounded-lg font-medium flex items-center justify-center"
            >
              <FaFileUpload className="mr-2" />
              Upload Documents
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <FaMicrophone size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Voice Input</h3>
              <p className="text-gray-600">
                Simply speak into your device to tell us about your skills, experience, and the accommodations you need. Our system will convert your speech to text and store it securely.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <FaFileUpload size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Document Upload</h3>
              <p className="text-gray-600">
                Upload your resume, CV, or any document containing your professional information. We'll extract the relevant details to help match you with suitable job opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="w-full py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-6">About Our Mission</h2>
              <p className="text-gray-600 mb-4">
                We believe that everyone deserves meaningful employment opportunities. Our platform is specifically designed to bridge the gap between talented individuals with disabilities and employers who value diversity and inclusion.
              </p>
              <p className="text-gray-600 mb-4">
                By leveraging technology, we make it easier for job seekers to showcase their abilities and for employers to find the perfect candidates for their positions.
              </p>
              <div className="flex items-center text-blue-600">
                <FaAccessibleIcon size={24} className="mr-2" />
                <span className="font-medium">Committed to Accessibility</span>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="w-full max-w-md aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                <FaBriefcase size={48} className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
