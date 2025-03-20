import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useMsal, MsalAuthenticationTemplate } from '@azure/msal-react';
import { InteractionType } from '@azure/msal-browser';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';

// Import components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ClientList from './pages/ClientList';
import ClientDetail from './pages/ClientDetail';
import DocumentProcessor from './pages/DocumentProcessor';
import AIAssistant from './pages/AIAssistant';
import ReportGenerator from './pages/ReportGenerator';
import Settings from './pages/Settings';
import LoginPage from './pages/LoginPage';
import ErrorPage from './pages/ErrorPage';

// Import styles
import './App.css';

// Auth configuration
import { loginRequest } from './authConfig';

function App() {
  const { instance, accounts } = useMsal();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    if (accounts.length > 0) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [accounts]);

  // Error component for authentication template
  const ErrorComponent = (error) => {
    return <ErrorPage error={error} />;
  };

  // Loading component for authentication template
  const LoadingComponent = () => {
    return <div className="loading">Loading authentication...</div>;
  };

  // Login component for authentication template
  const LoginComponent = () => {
    return <LoginPage msalInstance={instance} />;
  };

  // Authentication template props
  const authenticationRequest = {
    ...loginRequest,
  };

  return (
    <FluentProvider theme={webLightTheme}>
      <div className="app">
        <Header isAuthenticated={isAuthenticated} msalInstance={instance} />
        
        <div className="app-container">
          {isAuthenticated && <Sidebar />}
          
          <main className="main-content">
            <Routes>
              <Route path="/login" element={<LoginPage msalInstance={instance} />} />
              
              <Route
                path="/"
                element={
                  <MsalAuthenticationTemplate
                    interactionType={InteractionType.Redirect}
                    authenticationRequest={authenticationRequest}
                    errorComponent={ErrorComponent}
                    loadingComponent={LoadingComponent}
                  >
                    <Dashboard />
                  </MsalAuthenticationTemplate>
                }
              />
              
              <Route
                path="/clients"
                element={
                  <MsalAuthenticationTemplate
                    interactionType={InteractionType.Redirect}
                    authenticationRequest={authenticationRequest}
                    errorComponent={ErrorComponent}
                    loadingComponent={LoadingComponent}
                  >
                    <ClientList />
                  </MsalAuthenticationTemplate>
                }
              />
              
              <Route
                path="/clients/:clientId"
                element={
                  <MsalAuthenticationTemplate
                    interactionType={InteractionType.Redirect}
                    authenticationRequest={authenticationRequest}
                    errorComponent={ErrorComponent}
                    loadingComponent={LoadingComponent}
                  >
                    <ClientDetail />
                  </MsalAuthenticationTemplate>
                }
              />
              
              <Route
                path="/documents"
                element={
                  <MsalAuthenticationTemplate
                    interactionType={InteractionType.Redirect}
                    authenticationRequest={authenticationRequest}
                    errorComponent={ErrorComponent}
                    loadingComponent={LoadingComponent}
                  >
                    <DocumentProcessor />
                  </MsalAuthenticationTemplate>
                }
              />
              
              <Route
                path="/assistant"
                element={
                  <MsalAuthenticationTemplate
                    interactionType={InteractionType.Redirect}
                    authenticationRequest={authenticationRequest}
                    errorComponent={ErrorComponent}
                    loadingComponent={LoadingComponent}
                  >
                    <AIAssistant />
                  </MsalAuthenticationTemplate>
                }
              />
              
              <Route
                path="/reports"
                element={
                  <MsalAuthenticationTemplate
                    interactionType={InteractionType.Redirect}
                    authenticationRequest={authenticationRequest}
                    errorComponent={ErrorComponent}
                    loadingComponent={LoadingComponent}
                  >
                    <ReportGenerator />
                  </MsalAuthenticationTemplate>
                }
              />
              
              <Route
                path="/settings"
                element={
                  <MsalAuthenticationTemplate
                    interactionType={InteractionType.Redirect}
                    authenticationRequest={authenticationRequest}
                    errorComponent={ErrorComponent}
                    loadingComponent={LoadingComponent}
                  >
                    <Settings />
                  </MsalAuthenticationTemplate>
                }
              />
              
              <Route path="/error" element={<ErrorPage />} />
              <Route path="*" element={<Navigate to="/error" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </FluentProvider>
  );
}

export default App; 