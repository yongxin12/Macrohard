import React from 'react';
import {
  Title3,
  Body1,
  Button,
} from '@fluentui/react-components';

const ClientList = () => {
  return (
    <div className="client-list">
      <Title3>Client List</Title3>
      <Body1>No clients found. Add a new client to get started.</Body1>
      <Button appearance="primary" style={{ marginTop: '10px' }}>Add New Client</Button>
    </div>
  );
};

export default ClientList; 