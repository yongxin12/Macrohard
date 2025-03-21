import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home24Regular,
  People24Regular,
  Document24Regular,
  Chat24Regular,
  DocumentPdf24Regular,
  Settings24Regular
} from '@fluentui/react-icons';

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    {
      icon: <Home24Regular />,
      text: 'Dashboard',
      path: '/'
    },
    {
      icon: <People24Regular />,
      text: 'Clients',
      path: '/clients'
    },
    {
      icon: <Document24Regular />,
      text: 'Documents',
      path: '/documents'
    },
    {
      icon: <Chat24Regular />,
      text: 'AI Assistant',
      path: '/assistant'
    },
    {
      icon: <DocumentPdf24Regular />,
      text: 'Reports',
      path: '/reports'
    },
    {
      icon: <Settings24Regular />,
      text: 'Settings',
      path: '/settings'
    }
  ];
  
  return (
    <aside className="sidebar">
      <nav>
        <ul className="sidebar-nav">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link 
                to={item.path} 
                className={`sidebar-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <span className="sidebar-nav-item-icon">{item.icon}</span>
                <span className="sidebar-nav-item-text">{item.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar; 