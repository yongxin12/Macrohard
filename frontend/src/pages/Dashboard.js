import React from 'react';
import {
  Card,
  Title3,
  Body1,
  Button,
} from '@fluentui/react-components';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <Title3>Welcome to Job Coach AI Assistant</Title3>
      <div style={{ marginTop: '20px', display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <Card>
          <Title3>Quick Actions</Title3>
          <Body1>
            Access commonly used features and recent activities.
          </Body1>
          <div style={{ marginTop: '10px' }}>
            <Button appearance="primary">New Client</Button>
            <Button style={{ marginLeft: '10px' }}>Process Document</Button>
          </div>
        </Card>

        <Card>
          <Title3>Recent Clients</Title3>
          <Body1>
            No recent clients to display.
          </Body1>
        </Card>

        <Card>
          <Title3>Upcoming Tasks</Title3>
          <Body1>
            No upcoming tasks scheduled.
          </Body1>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard; 