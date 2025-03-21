import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';

// Pages
import Dashboard from './pages/Dashboard';
import ClientList from './pages/ClientList';
import ClientDetail from './pages/ClientDetail';
import AIAssistant from './pages/AIAssistant';
import Documents from './pages/Documents';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

const App = () => {
  return (
    <Router>
      <div className="app">
        <Header />
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<ClientList />} />
            <Route path="/clients/:id" element={<ClientDetail />} />
            <Route path="/assistant" element={<AIAssistant />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App; 