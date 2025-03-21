/*
 * @Author: Richard yuetingpei888@gmail.com
 * @Date: 2025-03-20 01:11:19
 * @LastEditors: Richard yuetingpei888@gmail.com
 * @LastEditTime: 2025-03-20 01:12:44
 * @FilePath: /Macrohard/disability-job-finder/src/components/Navbar.tsx
 * @Description: 
 * 
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaMicrophone, FaFileUpload } from 'react-icons/fa';

const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="text-xl font-bold mb-4 md:mb-0">
            <Link href="/" className="flex items-center">
              <span className="mr-2">🌟</span>
              <span>Disability Job Finder</span>
            </Link>
          </div>

          <div className="flex space-x-2">
            <Link
              href="/voice"
              className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                pathname === '/voice'
                  ? 'bg-white text-blue-600 font-medium'
                  : 'hover:bg-blue-500'
              }`}
            >
              <FaMicrophone className="mr-2" />
              <span>Voice Input</span>
            </Link>
            <Link
              href="/upload"
              className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                pathname === '/upload'
                  ? 'bg-white text-blue-600 font-medium'
                  : 'hover:bg-blue-500'
              }`}
            >
              <FaFileUpload className="mr-2" />
              <span>Document Upload</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 