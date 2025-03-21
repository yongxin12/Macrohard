import React from 'react';
import {
  Title3,
  Body1,
  Button,
  Card,
} from '@fluentui/react-components';

const LoginPage = ({ msalInstance }) => {
  const handleLogin = async () => {
    try {
      await msalInstance.loginRedirect();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '80vh' 
    }}>
      <Card style={{ 
        padding: '2rem', 
        maxWidth: '400px', 
        width: '100%',
        textAlign: 'center'
      }}>
        <Title3>Welcome to Job Coach AI Assistant</Title3>
        <Body1 style={{ margin: '1rem 0' }}>
          Please sign in with your Microsoft account to continue.
        </Body1>
        <Button appearance="primary" onClick={handleLogin}>
          Sign in with Microsoft
        </Button>
      </Card>
    </div>
  );
};

export default LoginPage; 