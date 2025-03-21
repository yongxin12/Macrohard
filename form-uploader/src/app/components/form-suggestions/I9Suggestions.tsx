import React from 'react';

export const I9Suggestions = () => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-4">
      <h2 className="font-medium text-gray-700 mb-2">Form I-9 - Required Information:</h2>
      <ul className="list-disc pl-5 text-gray-600 space-y-1">
        <li>Employee Information:
          <ul className="list-circle pl-5 mt-1 space-y-1">
            <li>Full legal name (Last, First, Middle Initial)</li>
            <li>Other names used, if any</li>
            <li>Address and contact information</li>
            <li>Date of birth</li>
            <li>Social Security Number</li>
            <li>Email address and phone number</li>
          </ul>
        </li>
        <li>Citizenship/Immigration Status:
          <ul className="list-circle pl-5 mt-1 space-y-1">
            <li>Citizenship status (U.S. Citizen, Permanent Resident, etc.)</li>
            <li>Document numbers (if applicable)</li>
            <li>Expiration dates of documents</li>
          </ul>
        </li>
        <li>Employment Authorization Documents:
          <ul className="list-circle pl-5 mt-1 space-y-1">
            <li>Type of document(s) you'll present</li>
            <li>Document numbers</li>
            <li>Issuing authority</li>
            <li>Expiration dates</li>
          </ul>
        </li>
      </ul>
    </div>
  );
};

export default I9Suggestions; 