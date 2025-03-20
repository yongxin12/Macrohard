import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  People,
  Document,
  ChatBot,
  DocumentPdf,
  Settings
} from '@fluentui/react-icons';

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    {
      icon: <Home />,
      text: 'Dashboard',
      path: '/'
    },
    {
      icon: <People />,
      text: 'Clients',
      path: '/clients'
    },
    {
      icon: <Document />,
      text: 'Documents',
      path: '/documents'
    },
    {
      icon: <ChatBot />,
      text: 'AI Assistant',
      path: '/assistant'
    },
    {
      icon: <DocumentPdf />,
      text: 'Reports',
      path: '/reports'
    },
    {
      icon: <Settings />,
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