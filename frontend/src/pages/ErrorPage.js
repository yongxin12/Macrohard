import React from 'react';
import {
  Title3,
  Body1,
  Button,
  Card,
} from '@fluentui/react-components';
import { useNavigate } from 'react-router-dom';

const ErrorPage = ({ error }) => {
  const navigate = useNavigate();

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
        <Title3>Oops! Something went wrong</Title3>
        <Body1 style={{ margin: '1rem 0', color: 'var(--colorNeutralForeground3)' }}>
          {error ? error.message : 'An unexpected error occurred.'}
        </Body1>
        <Button appearance="primary" onClick={() => navigate('/')}>
          Return to Dashboard
        </Button>
      </Card>
    </div>
  );
};

export default ErrorPage; 