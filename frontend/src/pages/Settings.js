import React from 'react';
import {
  Title3,
  Body1,
  Card,
} from '@fluentui/react-components';

const Settings = () => {
  return (
    <div className="settings">
      <Title3>Settings</Title3>
      <div style={{ marginTop: '20px', display: 'grid', gap: '20px', maxWidth: '800px' }}>
        <Card>
          <Title3>Profile Settings</Title3>
          <Body1>Manage your profile and preferences.</Body1>
        </Card>

        <Card>
          <Title3>Notification Settings</Title3>
          <Body1>Configure your notification preferences.</Body1>
        </Card>

        <Card>
          <Title3>Account Settings</Title3>
          <Body1>Manage your account and security settings.</Body1>
        </Card>
      </div>
    </div>
  );
};

export default Settings; 