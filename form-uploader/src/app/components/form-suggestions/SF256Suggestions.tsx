/*
 * @Author: Richard yuetingpei888@gmail.com
 * @Date: 2025-03-20 17:19:27
 * @LastEditors: Richard yuetingpei888@gmail.com
 * @LastEditTime: 2025-03-21 21:07:59
 * @FilePath: /disability-job-finder/src/app/components/form-suggestions/SF256Suggestions.tsx
 * @Description: 
 * 
 */
import React from 'react';

export const SF256Suggestions = () => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-4">
      <h2 className="font-medium text-gray-700 mb-2">Form SF-256 - Self-Identification of Disability:</h2>
      <ul className="list-disc pl-5 text-gray-600 space-y-1">
        <li>Personal Information:
          <ul className="list-circle pl-5 mt-1 space-y-1">
            <li>Full name</li>
            <li>Date of birth</li>
            <li>SSN(Social Security Number)</li>
          </ul>
        </li>
        <li>Disability Status:
          <ul className="list-circle pl-5 mt-1 space-y-1">
            <li>Whether you have a disability</li>
            <li>Type of disability (if comfortable sharing)</li>
          </ul>
        </li>
      </ul>
    </div>
  );
};

export default SF256Suggestions; 