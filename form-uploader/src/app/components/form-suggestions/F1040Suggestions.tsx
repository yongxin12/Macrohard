import React from 'react';

export const F1040Suggestions = () => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-4">
      <h2 className="font-medium text-gray-700 mb-2">Form 1040 - Required Information:</h2>
      <ul className="list-disc pl-5 text-gray-600 space-y-1">
        <li>Full legal name and Social Security Number</li>
        <li>Filing status (Single, Married filing jointly, etc.)</li>
        <li>Address and contact information</li>
        <li>Dependents information (if any)</li>
        <li>Income details:
          <ul className="list-circle pl-5 mt-1 space-y-1">
            <li>Wages and salaries (W-2 information)</li>
            <li>Interest and dividend income</li>
            <li>Business income or loss</li>
            <li>Other income sources</li>
          </ul>
        </li>
        <li>Deductions and credits:
          <ul className="list-circle pl-5 mt-1 space-y-1">
            <li>Standard or itemized deductions</li>
            <li>Tax credits you're claiming</li>
            <li>Estimated tax payments made</li>
          </ul>
        </li>
      </ul>
    </div>
  );
};

export default F1040Suggestions; 